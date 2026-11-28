/**
 * F2-16: javni pozivi i sufinansiranje (U6 turizam, O7 okoliš).
 *
 * - Poziv ima rok (opensAt–closesAt), budžet, uslove, dokumente i vezani elektronski obrazac.
 * - Online prijava ide kroz postojeće obrasce i predmete (F2-05): svaka prijava je predmet s brojem i kodom,
 *   a obrazac prima prijave samo dok je poziv otvoren (provjera u PublicCasesController.submit).
 * - Nakon odluke objavljuje se lista korisnika i iznosa (call_awards), javno i u CSV-u.
 *   Fizička lica se na portalu ne prikazuju imenom (samo „Fizičko lice“ i općina); u CMS-u se vide.
 */
import { BadRequestException, Body, Controller, Delete, Get, NotFoundException, Param, Patch, Post, Put, Query, Req, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { Db, id } from './db';
import { AuthGuard } from './auth';
import { Can, can } from './rbac';
import { AuditService } from './audit';
import { assertScope, inScope } from './sectors';
import { parseCsv } from './registry-core';
import { slugify } from './util';

export type Call = {
  id: string; slug: string; title: string; sector: string | null; summary: string; body: string; eligibility: string;
  budget: string | null; maxAmount: string | null; opensAt: Date; closesAt: Date; formId: string | null; documents: { title: string; url: string }[];
  legalBasis: string; contact: string; published: boolean; resultsPublished: boolean; resultsNote: string; isDemo: boolean; createdAt: Date; updatedAt: Date;
};
export type Award = { id: string; callId: string; beneficiary: string; beneficiaryType: 'PRAVNO' | 'FIZICKO'; municipality: string | null; project: string; amount: string; caseId: string | null; position: number };
export type Phase = 'NACRT' | 'NAJAVLJEN' | 'OTVOREN' | 'ZATVOREN' | 'REZULTATI';

export function phase(c: Pick<Call, 'published' | 'resultsPublished' | 'opensAt' | 'closesAt'>, now = Date.now()): Phase {
  if (!c.published) return 'NACRT';
  if (c.resultsPublished) return 'REZULTATI';
  if (now < new Date(c.opensAt).getTime()) return 'NAJAVLJEN';
  if (now <= new Date(c.closesAt).getTime()) return 'OTVOREN';
  return 'ZATVOREN';
}

const num = (v: string | number | null) => (v == null ? null : Number(v));
/** Javni prikaz korisnika: fizičko lice bez imena. */
export const publicAward = (a: Award) => ({
  beneficiary: a.beneficiaryType === 'FIZICKO' ? 'Fizičko lice' : a.beneficiary, beneficiaryType: a.beneficiaryType,
  municipality: a.municipality, project: a.project, amount: Number(a.amount),
});

function publicCall(c: Call, extra: Record<string, unknown> = {}) {
  return {
    slug: c.slug, title: c.title, sector: c.sector, summary: c.summary, opensAt: c.opensAt, closesAt: c.closesAt,
    budget: num(c.budget), maxAmount: num(c.maxAmount), phase: phase(c), isDemo: c.isDemo, ...extra,
  };
}

const money = (v: unknown, label: string) => {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(String(v).replace(/\s/g, '').replace(/\.(?=\d{3}(\D|$))/g, '').replace(',', '.'));
  if (!Number.isFinite(n) || n < 0 || n > 1e12) throw new BadRequestException(`${label}: neispravan iznos`);
  return Math.round(n * 100) / 100;
};
const csvCell = (v: unknown) => { const s = v == null ? '' : String(v); const safe = /^[=+\-@\t\r]/.test(s) ? `'${s}` : s; return /[";\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe; };

/* ───────── Portal ───────── */

@Controller('calls')
export class PublicCallsController {
  constructor(private db: Db) {}

  @Get()
  async list(@Query('status') status = 'svi', @Query('sector') sector?: string) {
    const rows = await this.db.q<Call & { awards: number; awarded: string | null }>(
      `SELECT c.*, (SELECT count(*)::int FROM call_awards a WHERE a."callId"=c."id") "awards", (SELECT sum(a."amount") FROM call_awards a WHERE a."callId"=c."id") "awarded"
       FROM calls c WHERE c."published" AND ($1::text IS NULL OR c."sector"=$1) ORDER BY c."closesAt" DESC`, [sector || null]);
    const all = rows.map((c) => publicCall(c, c.resultsPublished ? { awards: c.awards, awarded: num(c.awarded) } : {}));
    const f = status === 'otvoreni' ? ['OTVOREN', 'NAJAVLJEN'] : status === 'zatvoreni' ? ['ZATVOREN', 'REZULTATI'] : null;
    return f ? all.filter((c) => f.includes(c.phase)) : all;
  }

  @Get(':slug')
  async one(@Param('slug') slug: string) {
    const c = await this.db.one<Call>(`SELECT * FROM calls WHERE "slug"=$1 AND "published"`, [slug]);
    if (!c) throw new NotFoundException('Javni poziv nije pronađen.');
    const form = c.formId ? await this.db.one<{ slug: string; title: string; attachments: string; attachmentHint: string }>(`SELECT "slug","title","attachments","attachmentHint" FROM forms WHERE "id"=$1 AND "active"`, [c.formId]) : null;
    const awards = c.resultsPublished ? (await this.db.q<Award>(`SELECT * FROM call_awards WHERE "callId"=$1 ORDER BY "position","beneficiary"`, [c.id])).map(publicAward) : [];
    const applications = await this.db.count(`SELECT count(*) n FROM cases WHERE "callId"=$1`, [c.id]);
    return publicCall(c, {
      body: c.body, eligibility: c.eligibility, documents: c.documents, legalBasis: c.legalBasis, contact: c.contact,
      resultsNote: c.resultsPublished ? c.resultsNote : '', form, awards, applications,
      awarded: awards.reduce((t, a) => t + a.amount, 0),
    });
  }

  @Get(':slug/korisnici.csv')
  async csv(@Param('slug') slug: string, @Res() res: Response) {
    const c = await this.db.one<Call>(`SELECT * FROM calls WHERE "slug"=$1 AND "published" AND "resultsPublished"`, [slug]);
    if (!c) throw new NotFoundException('Lista korisnika nije objavljena.');
    const awards = (await this.db.q<Award>(`SELECT * FROM call_awards WHERE "callId"=$1 ORDER BY "position","beneficiary"`, [c.id])).map(publicAward);
    const lines = [['redni_broj', 'korisnik', 'opcina', 'projekat', 'iznos_km'].join(';'), ...awards.map((a, i) => [i + 1, a.beneficiary, a.municipality, a.project, a.amount.toFixed(2)].map(csvCell).join(';'))];
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="korisnici-${c.slug}.csv"`);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.end('﻿' + lines.join('\n'));
  }
}

/* ───────── CMS ───────── */

const TEXT = ['title', 'summary', 'body', 'eligibility', 'legalBasis', 'contact', 'resultsNote', 'sector'] as const;

@Controller('admin/calls')
@UseGuards(AuthGuard)
export class CallsController {
  constructor(private db: Db, private audit: AuditService) {}

  @Get()
  @Can('pozivi', 'read')
  async list() {
    const rows = await this.db.q<Call & { applications: number; awards: number; awarded: string | null; formTitle: string | null }>(
      `SELECT c.*, f."title" "formTitle",
         (SELECT count(*)::int FROM cases k WHERE k."callId"=c."id") "applications",
         (SELECT count(*)::int FROM call_awards a WHERE a."callId"=c."id") "awards",
         (SELECT sum(a."amount") FROM call_awards a WHERE a."callId"=c."id") "awarded"
       FROM calls c LEFT JOIN forms f ON f."id"=c."formId" ORDER BY c."closesAt" DESC`);
    return rows.map((c) => ({ ...c, budget: num(c.budget), maxAmount: num(c.maxAmount), awarded: num(c.awarded), phase: phase(c) }));
  }

  @Get(':id')
  @Can('pozivi', 'read')
  async one(@Param('id') cid: string, @Req() req: any) {
    const c = await this.get(cid);
    const awards = await this.db.q<Award>(`SELECT * FROM call_awards WHERE "callId"=$1 ORDER BY "position","beneficiary"`, [cid]);
    // prijave: identitet iz obrasca sa zaštitom identiteta se ne prikazuje
    const apps = can(req.user?.role, 'predmeti', 'read') ? await this.db.q<any>(
      `SELECT k."id",k."number",k."status",k."receivedAt",k."data",CASE WHEN f."protectIdentity" OR k."anonymous" THEN NULL ELSE k."applicantName" END "applicantName"
       FROM cases k JOIN forms f ON f."id"=k."formId" WHERE k."callId"=$1 ORDER BY k."receivedAt"`, [cid]) : [];
    return {
      ...c, budget: num(c.budget), maxAmount: num(c.maxAmount), phase: phase(c),
      awards: awards.map((a) => ({ ...a, amount: Number(a.amount) })),
      applications: apps.map((a) => ({ id: a.id, number: a.number, status: a.status, receivedAt: a.receivedAt, applicantName: a.applicantName, municipality: a.data?.opcina ?? null, project: a.data?.nazivProjekta ?? null, requested: a.data?.trazeniIznos ?? null })),
    };
  }

  @Post()
  @Can('pozivi', 'write')
  async create(@Body() b: any, @Req() req: any) {
    const d = await this.data(b, req, null);
    if (!d.title) throw new BadRequestException('Naslov je obavezan');
    if (!d.opensAt || !d.closesAt) throw new BadRequestException('Unesite početak i kraj roka za prijave');
    let slug = slugify(b.slug || d.title) || `poziv-${Date.now()}`;
    if (await this.db.one(`SELECT 1 FROM calls WHERE "slug"=$1`, [slug])) slug = `${slug}-${Date.now().toString(36)}`;
    const c = await this.db.insert<Call>('calls', { id: id(), slug, ...d, published: false, resultsPublished: false });
    await this.audit.log(req, { action: 'Kreirao/la javni poziv', entity: 'pozivi', entityId: c.id, target: c.title });
    return c;
  }

  @Patch(':id')
  @Can('pozivi', 'write')
  async update(@Param('id') cid: string, @Body() b: any, @Req() req: any) {
    const before = await this.get(cid);
    assertScope(req.user, before.sector, 'pozive');
    const d = await this.data(b, req, before);
    for (const k of ['published', 'resultsPublished'] as const) {
      if (b[k] === undefined || !!b[k] === before[k]) continue;
      if (!can(req.user?.role, 'pozivi', 'publish')) throw new BadRequestException('Objavu poziva i liste korisnika radi urednik ili administrator.');
      (d as any)[k] = !!b[k];
    }
    if ((d as any).resultsPublished && !(d as any).published && !before.published) throw new BadRequestException('Prvo objavite poziv.');
    const after = await this.db.update<Call>('calls', cid, d, true);
    await this.audit.log(req, { action: b.resultsPublished === true && !before.resultsPublished ? 'Objavio/la listu korisnika javnog poziva' : b.published === true && !before.published ? 'Objavio/la javni poziv' : 'Uredio/la javni poziv', entity: 'pozivi', entityId: cid, target: after!.title, before, after });
    return after;
  }

  @Delete(':id')
  @Can('pozivi', 'delete')
  async remove(@Param('id') cid: string, @Req() req: any) {
    const c = await this.get(cid);
    assertScope(req.user, c.sector, 'pozive');
    if (await this.db.count(`SELECT count(*) n FROM cases WHERE "callId"=$1`, [cid])) throw new BadRequestException('Poziv ima prijave i ne može se obrisati; zatvorite ga ili uklonite s portala.');
    await this.db.q(`DELETE FROM calls WHERE "id"=$1`, [cid]);
    await this.audit.log(req, { action: 'Obrisao/la javni poziv', entity: 'pozivi', entityId: cid, target: c.title, before: c });
    return { ok: true };
  }

  /** Cijela lista korisnika odjednom (iz tabele u CMS-u ili CSV-a). */
  @Put(':id/awards')
  @Can('pozivi', 'write')
  async awards(@Param('id') cid: string, @Body() b: any, @Req() req: any) {
    const c = await this.get(cid);
    assertScope(req.user, c.sector, 'pozive');
    const list: any[] = Array.isArray(b?.awards) ? b.awards : [];
    if (list.length > 2000) throw new BadRequestException('Najviše 2000 korisnika po pozivu.');
    const rows = list.map((a, i) => {
      const beneficiary = String(a.beneficiary ?? '').trim().slice(0, 300);
      if (!beneficiary) throw new BadRequestException(`Red ${i + 1}: korisnik je obavezan`);
      const amount = money(a.amount, `Red ${i + 1}`);
      if (amount == null) throw new BadRequestException(`Red ${i + 1}: iznos je obavezan`);
      return { id: id(), callId: cid, beneficiary, beneficiaryType: a.beneficiaryType === 'FIZICKO' ? 'FIZICKO' : 'PRAVNO', municipality: String(a.municipality ?? '').trim().slice(0, 80) || null, project: String(a.project ?? '').trim().slice(0, 500), amount, caseId: a.caseId || null, position: i + 1 };
    });
    const total = rows.reduce((t, r) => t + r.amount, 0);
    const before = await this.db.q<Award>(`SELECT * FROM call_awards WHERE "callId"=$1`, [cid]);
    await this.db.tx(async (k) => {
      await k.query(`DELETE FROM call_awards WHERE "callId"=$1`, [cid]);
      for (const r of rows) {
        await k.query(`INSERT INTO call_awards ("id","callId","beneficiary","beneficiaryType","municipality","project","amount","caseId","position") VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
          [r.id, r.callId, r.beneficiary, r.beneficiaryType, r.municipality, r.project, r.amount, r.caseId, r.position]);
      }
    });
    await this.audit.log(req, { action: 'Ažurirao/la listu korisnika javnog poziva', entity: 'pozivi', entityId: cid, target: `${c.title}: ${rows.length} korisnika, ${total.toFixed(2)} KM`, before: { count: before.length }, after: { count: rows.length, total } });
    return { count: rows.length, total, overBudget: c.budget != null && total > Number(c.budget) };
  }

  /** CSV → redovi liste (bez upisa), da referent provjeri prije spremanja. */
  @Post(':id/awards/parse')
  @Can('pozivi', 'write')
  async parse(@Param('id') cid: string, @Body() b: any) {
    await this.get(cid);
    const [head = [], ...rows] = parseCsv(String(b?.csv ?? ''));
    const h = head.map((x) => x.toLowerCase().trim());
    const ix = (...n: string[]) => h.findIndex((x) => n.some((k) => x.startsWith(k)));
    const iB = ix('korisnik', 'naziv', 'podnosilac'), iA = ix('iznos'), iM = ix('općina', 'opcina', 'grad'), iP = ix('projekat', 'projekt', 'naziv projekta'), iT = ix('vrsta', 'tip');
    if (iB < 0 || iA < 0) throw new BadRequestException('CSV mora imati kolone „korisnik“ i „iznos“ (opciono: općina, projekat, vrsta).');
    const errors: string[] = [];
    const out = rows.filter((r) => r.some((x) => x.trim())).map((r, k) => {
      let amount: number | null = null;
      try { amount = money(r[iA], `Red ${k + 2}`); } catch (e: any) { errors.push(e.message); }
      if (!r[iB]?.trim()) errors.push(`Red ${k + 2}: nema korisnika`);
      return { beneficiary: r[iB]?.trim() ?? '', amount, municipality: iM >= 0 ? r[iM]?.trim() : '', project: iP >= 0 ? r[iP]?.trim() : '', beneficiaryType: iT >= 0 && /fiz/i.test(r[iT] ?? '') ? 'FIZICKO' : 'PRAVNO' };
    });
    return { awards: out, errors };
  }

  private async get(cid: string) {
    const c = await this.db.one<Call>(`SELECT * FROM calls WHERE "id"=$1`, [cid]);
    if (!c) throw new NotFoundException('Javni poziv nije pronađen');
    return c;
  }

  private async data(b: any, req: any, before: Call | null) {
    const d: Record<string, any> = {};
    for (const k of TEXT) if (b[k] !== undefined) d[k] = b[k] == null ? (k === 'sector' ? null : '') : String(b[k]).slice(0, k === 'body' ? 50_000 : 5000);
    if (d.title !== undefined) d.title = d.title.trim().slice(0, 300);
    if (d.sector !== undefined) {
      if (d.sector && !(await this.db.one(`SELECT 1 FROM sectors WHERE "key"=$1`, [d.sector]))) throw new BadRequestException('Nepoznat sektor');
      if (!inScope(req.user, d.sector)) throw new BadRequestException('Poziv možete otvoriti samo u svom sektoru.');
    } else if (!before && req.user?.sectors?.length && req.user.role !== 'ADMIN') d.sector = req.user.sectors[0];
    for (const k of ['budget', 'maxAmount'] as const) if (b[k] !== undefined) d[k] = money(b[k], k === 'budget' ? 'Budžet' : 'Najveći iznos');
    for (const k of ['opensAt', 'closesAt'] as const) if (b[k] !== undefined) {
      const t = new Date(b[k]);
      if (Number.isNaN(t.getTime())) throw new BadRequestException('Neispravan datum roka');
      d[k] = t;
    }
    const o = d.opensAt ?? before?.opensAt, cl = d.closesAt ?? before?.closesAt;
    if (o && cl && new Date(cl) <= new Date(o)) throw new BadRequestException('Kraj roka mora biti poslije početka.');
    if (b.formId !== undefined) {
      if (b.formId && !(await this.db.one(`SELECT 1 FROM forms WHERE "id"=$1`, [b.formId]))) throw new BadRequestException('Obrazac ne postoji');
      if (b.formId && (await this.db.one(`SELECT 1 FROM calls WHERE "formId"=$1 AND "id"<>$2`, [b.formId, before?.id ?? '']))) throw new BadRequestException('Taj obrazac je već vezan za drugi javni poziv; napravite kopiju obrasca.');
      d.formId = b.formId || null;
    }
    if (b.documents !== undefined) {
      const docs = (Array.isArray(b.documents) ? b.documents : []).map((x: any) => ({ title: String(x?.title ?? '').trim().slice(0, 200), url: String(x?.url ?? '').trim().slice(0, 500) })).filter((x: any) => x.title && x.url);
      if (docs.some((x: any) => !/^(https:\/\/|\/)/.test(x.url))) throw new BadRequestException('Link dokumenta mora počinjati s https:// ili / (dokument na portalu).');
      d.documents = JSON.stringify(docs.slice(0, 30));
    }
    return d;
  }
}
