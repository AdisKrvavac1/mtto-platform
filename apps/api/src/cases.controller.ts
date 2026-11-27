/**
 * F2-05: elektronski obrasci i predmeti v1.
 *
 * Građanin popunjava obrazac na portalu (bez prijave, uz ALTCHA) i dobija broj predmeta i kod za praćenje.
 * Predmet ide u e-pisarnicu sektora obrasca: dodjela referentu, statusi, interne bilješke, prilozi, rok.
 * Javni koraci (prijem, dopuna, rješenje) vidljivi su podnosiocu pri provjeri statusa brojem i kodom.
 * Kod za praćenje se čuva samo kao sha256 (kao lozinka); izgubljen kod se ne može obnoviti preko portala.
 */
import {
  BadRequestException, Body, Controller, ForbiddenException, Get, NotFoundException, Param, Patch, Post, Query, Req, Res,
  UploadedFiles, UseGuards, UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Throttle } from '@nestjs/throttler';
import type { Response } from 'express';
import { createHash, randomInt } from 'crypto';
import { Db, Where, id } from './db';
import { AuthGuard } from './auth';
import { AuditService } from './audit';
import { Can } from './rbac';
import { FileStore, type Stored } from './storage';
import { assertScope, inScope } from './sectors';
import { THROTTLE_PUBLIC_FORM, verifyAltcha } from './security';
import { sniffImage } from './risk';
import { slugify, toInt } from './util';
import { Field, SchemaError, normalizeFields, validateEntry } from './registry-core';

export const CASE_STATUS: Record<string, string> = {
  ZAPRIMLJEN: 'Zaprimljen', U_OBRADI: 'U obradi', DOPUNA: 'Čeka dopunu', RIJESEN: 'Riješen', ODBIJEN: 'Odbijen',
};
const OPEN = ['ZAPRIMLJEN', 'U_OBRADI', 'DOPUNA'];
/** Dozvoljeni prelazi. Zatvoren predmet se ponovo otvara samo uz obrazloženje. */
const NEXT: Record<string, string[]> = {
  ZAPRIMLJEN: ['U_OBRADI', 'DOPUNA', 'RIJESEN', 'ODBIJEN'],
  U_OBRADI: ['DOPUNA', 'RIJESEN', 'ODBIJEN'],
  DOPUNA: ['U_OBRADI', 'RIJESEN', 'ODBIJEN'],
  RIJESEN: ['U_OBRADI'],
  ODBIJEN: ['U_OBRADI'],
};
/** Prelaz za koji podnosilac mora dobiti poruku (šta dopuniti, ishod, razlog). */
const NEEDS_MESSAGE = ['DOPUNA', 'RIJESEN', 'ODBIJEN'];

const MAX_FILE = 5 * 1024 * 1024;
const MAX_FILES = 5;
const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // bez 0/O, 1/I
export const hashCode = (c: string) => createHash('sha256').update(`mtto-case:${c.replace(/[\s-]/g, '').toUpperCase()}`).digest('hex');
export function newTrackingCode() {
  let s = '';
  for (let i = 0; i < 8; i++) s += CODE_ALPHABET[randomInt(CODE_ALPHABET.length)];
  return `${s.slice(0, 4)}-${s.slice(4)}`;
}

/** PDF ili slika, po potpisu datoteke (ne po imenu ni mimetype-u). */
export function sniffAttachment(b: Buffer): string | null {
  if (b.subarray(0, 5).toString() === '%PDF-') return 'application/pdf';
  return sniffImage(b);
}

export type Form = {
  id: string; slug: string; title: string; description: string; sector: string | null; fields: Field[]; slaDays: number;
  attachments: 'NE' | 'OPCIONO' | 'OBAVEZNO'; attachmentHint: string; legalBasis: string; active: boolean; isDemo: boolean; updatedAt: string;
};
type Case = {
  id: string; number: string; formId: string; sector: string | null; status: string; data: Record<string, any>; applicantName: string;
  applicantEmail: string | null; applicantPhone: string | null; trackingHash: string; assigneeId: string | null; receivedAt: string; dueAt: string;
  closedAt: string | null; isDemo: boolean; updatedAt: string;
};

const publicForm = (f: Form) => ({
  slug: f.slug, title: f.title, description: f.description, sector: f.sector, fields: f.fields, slaDays: f.slaDays,
  attachments: f.attachments, attachmentHint: f.attachmentHint, legalBasis: f.legalBasis, isDemo: f.isDemo,
});

/** Prijem predmeta: broj, rok, prvi događaj i prilozi u jednoj transakciji. */
export async function receiveCase(db: Db, files: FileStore, form: Form, input: {
  data: Record<string, any>; applicantName: string; applicantEmail?: string | null; applicantPhone?: string | null; attachments?: { buf: Buffer; name: string; type: string }[]; isDemo?: boolean;
}) {
  const code = newTrackingCode();
  const stored: { a: { buf: Buffer; name: string; type: string }; s: Stored }[] = [];
  for (const a of input.attachments ?? []) stored.push({ a, s: await files.put('predmeti', a.buf, a.type) });
  const year = new Date().getFullYear();
  return db.tx(async (c) => {
    const n = (await c.query(
      `INSERT INTO case_counters ("year","n") VALUES ($1,1) ON CONFLICT ("tenantId","year") DO UPDATE SET "n"=case_counters."n"+1 RETURNING "n"`, [year],
    )).rows[0].n as number;
    const tenant = (await c.query(`SELECT current_setting('app.tenant', true) t`)).rows[0].t as string;
    const number = `${(tenant && tenant !== '*' ? tenant : 'mtto').toUpperCase()}-${year}-${String(n).padStart(5, '0')}`;
    const cid = id();
    const due = new Date(Date.now() + form.slaDays * 86400_000);
    await c.query(
      `INSERT INTO cases ("id","number","formId","sector","data","applicantName","applicantEmail","applicantPhone","trackingHash","dueAt","isDemo") VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
      [cid, number, form.id, form.sector, JSON.stringify(input.data), input.applicantName, input.applicantEmail || null, input.applicantPhone || null, hashCode(code), due, !!input.isDemo],
    );
    await c.query(
      `INSERT INTO case_events ("id","caseId","kind","toStatus","note","public","actorName") VALUES ($1,$2,'PRIJEM','ZAPRIMLJEN',$3,true,'Portal')`,
      [id(), cid, `Zahtjev zaprimljen elektronski. Rok za rješavanje: ${form.slaDays} dana.`],
    );
    for (const { a, s } of stored) {
      await c.query(
        `INSERT INTO case_files ("id","caseId","fileName","mimeType","size","data","storageKey","sha256","scanStatus","source") VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'PODNOSILAC')`,
        [id(), cid, a.name, a.type, a.buf.length, s.data, s.storageKey, s.sha256, s.scanStatus],
      );
    }
    return { id: cid, number, code, dueAt: due.toISOString() };
  });
}

function checkUploads(list: Express.Multer.File[] = []) {
  if (list.length > MAX_FILES) throw new BadRequestException(`Najviše ${MAX_FILES} priloga.`);
  return list.map((f) => {
    const type = sniffAttachment(f.buffer);
    if (!type) throw new BadRequestException(`Prilog „${f.originalname}“ nije PDF, JPG, PNG ni WEBP.`);
    return { buf: f.buffer, name: Buffer.from(f.originalname, 'latin1').toString('utf8').replace(/[^\p{L}\p{N}._ -]/gu, '_').slice(0, 120) || 'prilog', type };
  });
}

/* ───────── Portal ───────── */

@Controller()
export class PublicCasesController {
  constructor(private db: Db, private files: FileStore) {}

  @Get('forms')
  async forms() {
    return (await this.db.q<Form>(`SELECT * FROM forms WHERE "active" ORDER BY "title"`)).map(publicForm);
  }

  @Get('forms/:slug')
  async form(@Param('slug') slug: string) {
    const f = await this.db.one<Form>(`SELECT * FROM forms WHERE "slug"=$1 AND "active"`, [slug]);
    if (!f) throw new NotFoundException('Obrazac nije pronađen.');
    return publicForm(f);
  }

  @Post('forms/:slug/submit')
  @Throttle(THROTTLE_PUBLIC_FORM)
  @UseInterceptors(FilesInterceptor('files', MAX_FILES, { limits: { fileSize: MAX_FILE, files: MAX_FILES } }))
  async submit(@Param('slug') slug: string, @Body() b: any, @UploadedFiles() up: Express.Multer.File[] = []) {
    if (b?.website) return { number: 'MTTO-0000', code: '0000-0000' }; // honeypot
    if (!(await verifyAltcha(b?.altcha))) throw new BadRequestException('Provjera da niste robot nije uspjela. Osvježite stranicu i pokušajte ponovo.');
    const form = await this.db.one<Form>(`SELECT * FROM forms WHERE "slug"=$1 AND "active"`, [slug]);
    if (!form) throw new NotFoundException('Obrazac nije pronađen ili više nije aktivan.');
    let raw: Record<string, any> = {};
    try { raw = typeof b?.data === 'string' ? JSON.parse(b.data) : b?.data ?? {}; } catch { throw new BadRequestException('Neispravni podaci obrasca.'); }
    const { data, errors } = validateEntry(form.fields, raw);
    const name = String(b?.applicantName ?? '').trim();
    const email = String(b?.applicantEmail ?? '').trim().toLowerCase();
    const phone = String(b?.applicantPhone ?? '').trim();
    if (name.length < 3) errors.push({ field: 'applicantName', label: 'Ime i prezime / naziv', message: 'obavezno polje' });
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push({ field: 'applicantEmail', label: 'E-mail', message: 'neispravan e-mail' });
    if (!email && !phone) errors.push({ field: 'applicantEmail', label: 'Kontakt', message: 'unesite e-mail ili telefon' });
    if (b?.consent !== 'true' && b?.consent !== true) errors.push({ field: 'consent', label: 'Saglasnost', message: 'potrebna je saglasnost za obradu podataka' });
    if (errors.length) throw new BadRequestException({ statusCode: 400, code: 'INVALID_FORM', message: errors.map((e) => `${e.label}: ${e.message}`).join('; '), errors });
    if (form.attachments === 'NE' && up.length) throw new BadRequestException('Ovaj obrazac ne prima priloge.');
    if (form.attachments === 'OBAVEZNO' && !up.length) throw new BadRequestException(`Priložite dokumente: ${form.attachmentHint || 'prilog je obavezan'}.`);
    const r = await receiveCase(this.db, this.files, form, {
      data, applicantName: name.slice(0, 160), applicantEmail: email.slice(0, 200) || null, applicantPhone: phone.slice(0, 40) || null, attachments: checkUploads(up),
    });
    return { number: r.number, code: r.code, dueAt: r.dueAt, form: form.title };
  }

  private async find(number: unknown, code: unknown) {
    const n = String(number ?? '').trim().toUpperCase();
    const c = String(code ?? '').trim();
    if (!n || !c) throw new BadRequestException('Unesite broj predmeta i kod za praćenje.');
    const k = await this.db.one<Case & { formTitle: string }>(`SELECT c.*, f."title" "formTitle" FROM cases c JOIN forms f ON f."id"=c."formId" WHERE c."number"=$1`, [n]);
    // isti odgovor za nepostojeći broj i pogrešan kod
    if (!k || k.trackingHash !== hashCode(c)) throw new NotFoundException('Predmet s tim brojem i kodom nije pronađen. Provjerite potvrdu o prijemu.');
    return k;
  }

  @Post('cases/status')
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  async status(@Body() b: any) {
    const k = await this.find(b?.number, b?.code);
    const events = await this.db.q(`SELECT "kind","toStatus","note","createdAt" FROM case_events WHERE "caseId"=$1 AND "public" ORDER BY "createdAt"`, [k.id]);
    return {
      number: k.number, form: k.formTitle, status: k.status, statusLabel: CASE_STATUS[k.status], receivedAt: k.receivedAt, dueAt: k.dueAt, closedAt: k.closedAt,
      canSupplement: k.status === 'DOPUNA', events: events.map((e: any) => ({ ...e, statusLabel: e.toStatus ? CASE_STATUS[e.toStatus] : null })),
    };
  }

  /** Dopuna podnosioca (samo dok predmet čeka dopunu): poruka i prilozi, bez promjene statusa. */
  @Post('cases/supplement')
  @Throttle(THROTTLE_PUBLIC_FORM)
  @UseInterceptors(FilesInterceptor('files', MAX_FILES, { limits: { fileSize: MAX_FILE, files: MAX_FILES } }))
  async supplement(@Body() b: any, @UploadedFiles() up: Express.Multer.File[] = []) {
    if (!(await verifyAltcha(b?.altcha))) throw new BadRequestException('Provjera da niste robot nije uspjela. Osvježite stranicu i pokušajte ponovo.');
    const k = await this.find(b?.number, b?.code);
    if (k.status !== 'DOPUNA') throw new BadRequestException('Predmet trenutno ne čeka dopunu.');
    const note = String(b?.note ?? '').trim().slice(0, 2000);
    const att = checkUploads(up);
    if (!note && !att.length) throw new BadRequestException('Napišite poruku ili priložite dokument.');
    for (const a of att) {
      const s = await this.files.put('predmeti', a.buf, a.type);
      await this.db.insert('case_files', { id: id(), caseId: k.id, fileName: a.name, mimeType: a.type, size: a.buf.length, ...s, source: 'PODNOSILAC' }, `"id"`);
    }
    await this.db.insert('case_events', { id: id(), caseId: k.id, kind: 'DOPUNA_PODNOSIOCA', note: note || `Dostavljeno priloga: ${att.length}`, public: true, actorName: 'Podnosilac' }, `"id"`);
    await this.db.q(`UPDATE cases SET "updatedAt"=now() WHERE "id"=$1`, [k.id]);
    return { ok: true, files: att.length };
  }
}

/* ───────── E-pisarnica (CMS) ───────── */

@Controller('admin')
@UseGuards(AuthGuard)
export class CasesController {
  constructor(private db: Db, private files: FileStore, private audit: AuditService) {}

  /* obrasci */

  @Get('forms')
  @Can('predmeti', 'read')
  listForms() {
    return this.db.q(`SELECT f.*, (SELECT count(*)::int FROM cases c WHERE c."formId"=f."id") "caseCount",
      (SELECT count(*)::int FROM cases c WHERE c."formId"=f."id" AND c."status" = ANY($1)) "openCount" FROM forms f ORDER BY f."title"`, [OPEN]);
  }

  @Get('forms/:id')
  @Can('predmeti', 'read')
  async getForm(@Param('id') fid: string) {
    const f = await this.db.one<Form>(`SELECT * FROM forms WHERE "id"=$1`, [fid]);
    if (!f) throw new NotFoundException();
    return f;
  }

  private formData(b: any, isNew: boolean) {
    const d: any = {};
    if (b.title !== undefined || isNew) { const t = String(b.title ?? '').trim(); if (t.length < 3) throw new BadRequestException('Unesite naziv obrasca.'); d.title = t.slice(0, 160); }
    if (b.description !== undefined) d.description = String(b.description).slice(0, 2000);
    if (b.legalBasis !== undefined) d.legalBasis = String(b.legalBasis).slice(0, 500);
    if (b.attachmentHint !== undefined) d.attachmentHint = String(b.attachmentHint).slice(0, 500);
    if (b.sector !== undefined) d.sector = b.sector ? String(b.sector) : null;
    if (b.active !== undefined) d.active = !!b.active;
    if (b.slaDays !== undefined) { const n = toInt(b.slaDays, 0); if (n < 1 || n > 365) throw new BadRequestException('Rok mora biti od 1 do 365 dana.'); d.slaDays = n; }
    if (b.attachments !== undefined) { if (!['NE', 'OPCIONO', 'OBAVEZNO'].includes(b.attachments)) throw new BadRequestException('Neispravna postavka priloga.'); d.attachments = b.attachments; }
    if (b.fields !== undefined || isNew) {
      try { d.fields = JSON.stringify(normalizeFields(b.fields)); } catch (e) { if (e instanceof SchemaError) throw new BadRequestException(e.message); throw e; }
    }
    return d;
  }

  @Post('forms')
  @Can('predmeti', 'publish')
  async createForm(@Body() b: any, @Req() req: any) {
    const d = this.formData(b ?? {}, true);
    const slug = slugify(String(b?.slug ?? '') || d.title);
    if (await this.db.one(`SELECT 1 FROM forms WHERE "slug"=$1`, [slug])) throw new BadRequestException(`Obrazac s adresom „${slug}“ već postoji.`);
    const f = await this.db.insert<Form>('forms', { id: id(), slug, ...d });
    await this.audit.log(req, { action: 'Kreirao/la obrazac', entity: 'predmeti', entityId: f.id, target: f.title, after: f });
    return f;
  }

  @Patch('forms/:id')
  @Can('predmeti', 'publish')
  async updateForm(@Param('id') fid: string, @Body() b: any, @Req() req: any) {
    const before = await this.getForm(fid);
    const f = await this.db.update<Form>('forms', fid, this.formData(b ?? {}, false), true);
    await this.audit.log(req, { action: 'Uredio/la obrazac', entity: 'predmeti', entityId: fid, target: f!.title, before, after: f });
    return f;
  }

  /* predmeti */

  @Get('cases')
  @Can('predmeti', 'read')
  async cases(@Query() q: any, @Req() req: any) {
    const w = new Where();
    if (q.status === 'OTVORENI' || !q.status) w.add(`c."status" = ANY(?)`, OPEN);
    else if (q.status !== 'SVI') w.add(`c."status"=?`, String(q.status));
    if (q.form) w.add(`c."formId"=?`, String(q.form));
    if (q.mine === '1') w.add(`c."assigneeId"=?`, req.user.sub);
    if (q.overdue === '1') w.add(`c."dueAt" < now() AND c."status" = ANY(?)`, OPEN);
    if (q.sectors === '1' && req.user.role !== 'ADMIN' && req.user.sectors?.length) w.add(`(c."sector" IS NULL OR c."sector" = ANY(?))`, req.user.sectors);
    if (q.q) { const s = `%${String(q.q).slice(0, 100)}%`; w.add(`(c."number" ILIKE ? OR c."applicantName" ILIKE ? OR c."data"::text ILIKE ?)`, s, s, s); }
    const limit = Math.min(toInt(q.limit, 50), 200), page = toInt(q.page, 1);
    const [items, total, counts] = await Promise.all([
      this.db.q(`SELECT c."id",c."number",c."status",c."sector",c."applicantName",c."receivedAt",c."dueAt",c."closedAt",c."assigneeId",c."isDemo",c."updatedAt",
          f."title" "formTitle", u."name" "assigneeName",
          (SELECT max(e."createdAt") FROM case_events e WHERE e."caseId"=c."id" AND e."kind"='DOPUNA_PODNOSIOCA') "lastSupplementAt"
        FROM cases c JOIN forms f ON f."id"=c."formId" LEFT JOIN users u ON u."id"=c."assigneeId" ${w.sql}
        ORDER BY (c."status" = ANY('{ZAPRIMLJEN,U_OBRADI,DOPUNA}')) DESC, c."dueAt" ASC LIMIT ${limit} OFFSET ${(page - 1) * limit}`, w.params),
      this.db.count(`SELECT count(*) n FROM cases c ${w.sql}`, w.params),
      this.db.q<{ status: string; n: number }>(`SELECT "status", count(*)::int n FROM cases GROUP BY 1`),
    ]);
    const overdue = await this.db.count(`SELECT count(*) n FROM cases WHERE "dueAt" < now() AND "status" = ANY($1)`, [OPEN]);
    return { items, total, page, limit, counts: Object.fromEntries(counts.map((c) => [c.status, c.n])), overdue };
  }

  private async load(cid: string) {
    const k = await this.db.one<Case>(`SELECT * FROM cases WHERE "id"=$1`, [cid]);
    if (!k) throw new NotFoundException('Predmet nije pronađen.');
    return k;
  }

  @Get('cases/:id')
  @Can('predmeti', 'read')
  async get(@Param('id') cid: string) {
    const k = await this.load(cid);
    const { trackingHash, ...rest } = k;
    const [form, events, files, assignee] = await Promise.all([
      this.db.one<Form>(`SELECT * FROM forms WHERE "id"=$1`, [k.formId]),
      this.db.q(`SELECT * FROM case_events WHERE "caseId"=$1 ORDER BY "createdAt"`, [cid]),
      this.db.q(`SELECT "id","fileName","mimeType","size","scanStatus","source","createdAt" FROM case_files WHERE "caseId"=$1 ORDER BY "createdAt"`, [cid]),
      k.assigneeId ? this.db.one(`SELECT "id","name" FROM users WHERE "id"=$1`, [k.assigneeId]) : null,
    ]);
    return { ...rest, form, events, files, assignee };
  }

  /** Referenti koji mogu preuzeti predmet (pravo predmeti:write, aktivni). */
  @Get('cases-assignees')
  @Can('predmeti', 'read')
  assignees() {
    return this.db.q(`SELECT "id","name","role","sectors" FROM users WHERE "active" AND "role" IN ('ADMIN','REFERENT') ORDER BY "name"`);
  }

  private async event(k: Case, req: any, e: { kind: string; fromStatus?: string; toStatus?: string; note?: string; public?: boolean }) {
    await this.db.insert('case_events', { id: id(), caseId: k.id, kind: e.kind, fromStatus: e.fromStatus ?? null, toStatus: e.toStatus ?? null, note: e.note ?? '', public: !!e.public, actorId: req.user.sub, actorName: req.user.name }, `"id"`);
  }

  /** Promjena statusa. Dopuna, rješenje i odbijanje traže poruku podnosiocu; vrijeme čekanja na dopunu produžava rok. */
  @Post('cases/:id/status')
  @Can('predmeti', 'write')
  async setStatus(@Param('id') cid: string, @Body() b: any, @Req() req: any) {
    const k = await this.load(cid);
    assertScope(req.user, k.sector, 'predmete');
    const to = String(b?.status ?? '');
    if (!NEXT[k.status]?.includes(to)) throw new BadRequestException(`Predmet u statusu „${CASE_STATUS[k.status]}“ ne može preći u „${CASE_STATUS[to] ?? to}“.`);
    const message = String(b?.message ?? '').trim();
    if (NEEDS_MESSAGE.includes(to) && message.length < 5) throw new BadRequestException(to === 'DOPUNA' ? 'Navedite šta podnosilac treba dopuniti.' : 'Upišite obavještenje podnosiocu (ishod i obrazloženje).');
    if (!OPEN.includes(k.status) && message.length < 5) throw new BadRequestException('Za ponovno otvaranje navedite razlog.');
    const d: any = { status: to };
    if (k.status === 'DOPUNA' && to !== 'DOPUNA') {
      // rok miruje dok se čeka dopuna
      const since = await this.db.one<{ at: string }>(`SELECT max("createdAt") "at" FROM case_events WHERE "caseId"=$1 AND "toStatus"='DOPUNA'`, [cid]);
      if (since?.at) d.dueAt = new Date(new Date(k.dueAt).getTime() + (Date.now() - new Date(since.at).getTime()));
    }
    if (['RIJESEN', 'ODBIJEN'].includes(to)) d.closedAt = new Date();
    if (OPEN.includes(to)) d.closedAt = null;
    if (!k.assigneeId && to === 'U_OBRADI') d.assigneeId = req.user.sub;
    const updated = await this.db.update<Case>('cases', cid, d, true);
    await this.event(k, req, { kind: 'STATUS', fromStatus: k.status, toStatus: to, note: message || (to === 'U_OBRADI' ? 'Predmet je u obradi.' : ''), public: true });
    await this.audit.log(req, { action: `Predmet: ${CASE_STATUS[k.status]} → ${CASE_STATUS[to]}`, entity: 'predmeti', entityId: cid, target: k.number, before: { status: k.status, dueAt: k.dueAt }, after: { status: to, dueAt: updated!.dueAt } });
    return this.get(cid);
  }

  @Post('cases/:id/assign')
  @Can('predmeti', 'write')
  async assign(@Param('id') cid: string, @Body() b: any, @Req() req: any) {
    const k = await this.load(cid);
    assertScope(req.user, k.sector, 'predmete');
    const uid = b?.assigneeId ? String(b.assigneeId) : null;
    let name = '—';
    if (uid) {
      const u = await this.db.one<{ name: string; role: string; sectors: string[] }>(`SELECT "name","role","sectors" FROM users WHERE "id"=$1 AND "active"`, [uid]);
      if (!u || !['ADMIN', 'REFERENT'].includes(u.role)) throw new BadRequestException('Predmet se dodjeljuje referentu ili administratoru.');
      if (!inScope(u, k.sector)) throw new ForbiddenException(`${u.name} nije u sektoru ovog predmeta.`);
      name = u.name;
    }
    await this.db.update('cases', cid, { assigneeId: uid }, true);
    await this.event(k, req, { kind: 'DODJELA', note: uid ? `Dodijeljeno: ${name}` : 'Dodjela uklonjena' });
    await this.audit.log(req, { action: 'Dodijelio/la predmet', entity: 'predmeti', entityId: cid, target: `${k.number} → ${name}` });
    return this.get(cid);
  }

  /** Interna bilješka (podnosilac je ne vidi). */
  @Post('cases/:id/note')
  @Can('predmeti', 'write')
  async note(@Param('id') cid: string, @Body() b: any, @Req() req: any) {
    const k = await this.load(cid);
    assertScope(req.user, k.sector, 'predmete');
    const note = String(b?.note ?? '').trim().slice(0, 4000);
    if (!note) throw new BadRequestException('Bilješka je prazna.');
    await this.event(k, req, { kind: 'BILJESKA', note });
    await this.db.q(`UPDATE cases SET "updatedAt"=now() WHERE "id"=$1`, [cid]);
    return this.get(cid);
  }

  @Post('cases/:id/files')
  @Can('predmeti', 'write')
  @UseInterceptors(FilesInterceptor('files', MAX_FILES, { limits: { fileSize: 10 * 1024 * 1024, files: MAX_FILES } }))
  async upload(@Param('id') cid: string, @UploadedFiles() up: Express.Multer.File[] = [], @Req() req: any) {
    const k = await this.load(cid);
    assertScope(req.user, k.sector, 'predmete');
    const att = checkUploads(up);
    if (!att.length) throw new BadRequestException('Odaberite datoteku.');
    for (const a of att) {
      const s = await this.files.put('predmeti', a.buf, a.type);
      await this.db.insert('case_files', { id: id(), caseId: cid, fileName: a.name, mimeType: a.type, size: a.buf.length, ...s, source: 'SLUZBENIK', uploadedBy: req.user.sub }, `"id"`);
    }
    await this.event(k, req, { kind: 'PRILOG', note: att.map((a) => a.name).join(', ') });
    return this.get(cid);
  }

  @Get('cases/:id/files/:fid')
  @Can('predmeti', 'read')
  async file(@Param('id') cid: string, @Param('fid') fid: string, @Req() req: any, @Res() res: Response) {
    const f = await this.db.one<any>(`SELECT * FROM case_files WHERE "id"=$1 AND "caseId"=$2`, [fid, cid]);
    if (!f) throw new NotFoundException();
    const k = await this.load(cid);
    await this.audit.log(req, { action: 'Otvorio/la prilog predmeta', entity: 'predmeti', entityId: cid, target: `${k.number}: ${f.fileName}` });
    res.setHeader('Content-Type', f.mimeType);
    res.setHeader('Content-Disposition', `inline; filename*=UTF-8''${encodeURIComponent(f.fileName)}`);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Cache-Control', 'private, no-store');
    res.send(await this.files.read(f));
  }
}
