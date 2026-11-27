/**
 * F2-03: dokumentacijski centar u CMS-u – metapodaci, verzije datoteke, rokovi čuvanja i izlučivanje.
 *
 * Rok čuvanja: klasa (TRAJNO, 10, 5 ili 2 godine) računa se od datuma prestanka važenja, a ako ga nema od datuma
 * donošenja, odnosno učitavanja. Istekli rok samo stavlja dokument na listu „za pregled“; brisanje datoteke je
 * ručna radnja „izluči“ uz razlog (zapisnik komisije), koja čuva zapis o dokumentu i upisuje se u dnevnik.
 * Klase i rokovi su početni prijedlog – provjeriti s Ministarstvom prema listi kategorija registraturske građe.
 */
import {
  BadRequestException, Body, Controller, Delete, ForbiddenException, Get, NotFoundException, Param, Patch, Post, Query, Req, Res,
  UploadedFile, UseGuards, UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { Db, Where, id } from './db';
import { AuthGuard } from './auth';
import { AuditService } from './audit';
import { Can } from './rbac';
import { FileStore } from './storage';
import { toDate } from './util';
import { assertScope, keyForName } from './sectors';

export const MAX_DOC = 10 * 1024 * 1024;
export const DOC_MIME = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
export const DOC_TYPES = ['ZAKON', 'PRAVILNIK', 'ODLUKA', 'OBRAZAC', 'UPUTSTVO', 'IZVJESTAJ', 'OSTALO'];
export const DOC_STATUS = ['VAZECI', 'STAVLJEN_VAN_SNAGE', 'ZAMIJENJEN', 'ARHIVIRAN'];

export const RETENTION: Record<string, { label: string; years: number | null }> = {
  TRAJNO: { label: 'Trajno', years: null },
  GODINA_10: { label: '10 godina', years: 10 },
  GODINA_5: { label: '5 godina', years: 5 },
  GODINA_2: { label: '2 godine', years: 2 },
};
export const DEFAULT_RETENTION: Record<string, string> = { ZAKON: 'TRAJNO', PRAVILNIK: 'TRAJNO', ODLUKA: 'TRAJNO', IZVJESTAJ: 'GODINA_10', UPUTSTVO: 'GODINA_10', OBRAZAC: 'GODINA_5', OSTALO: 'GODINA_10' };

/** Datum do kojeg se dokument čuva (null = trajno). */
export function retainUntil(cls: string, d: { validUntil?: any; issuedAt?: any; createdAt?: any }): string | null {
  const years = RETENTION[cls]?.years;
  if (!years) return null;
  const base = new Date(d.validUntil ?? d.issuedAt ?? d.createdAt ?? Date.now());
  base.setUTCFullYear(base.getUTCFullYear() + years);
  return base.toISOString().slice(0, 10);
}

export const ADMIN_DOC_COLS = `"id","title","docType","sector","number","issuedAt","status","description","fileName","mimeType","size","downloads","isDemo",
  "postId","permitId","createdAt","updatedAt","publisher","gazette","validFrom","validUntil","keywords","language","accessLevel","replacedById","version",
  "retentionClass","retainUntil","legalHold","disposedAt","disposalNote","sha256","scanStatus"`;

export function utf8Name(name: string) {
  try { return Buffer.from(name, 'latin1').toString('utf8'); } catch { return name; }
}

function checkFile(file?: Express.Multer.File) {
  if (!file) throw new BadRequestException('Datoteka nije priložena (najviše 10 MB)');
  if (!DOC_MIME.includes(file.mimetype)) throw new BadRequestException('Dozvoljeni formati: PDF, DOC, DOCX, XLS, XLSX');
  if (file.mimetype === 'application/pdf' && file.buffer.subarray(0, 5).toString() !== '%PDF-') throw new BadRequestException('Datoteka nije ispravan PDF');
}

/** Metapodaci iz zahtjeva (za upload i izmjenu). */
function meta(b: any) {
  const d: any = {};
  for (const k of ['title', 'docType', 'sector', 'number', 'status', 'description', 'publisher', 'gazette', 'language', 'accessLevel', 'retentionClass', 'postId', 'permitId', 'replacedById']) {
    if (b[k] !== undefined) d[k] = b[k] === '' || b[k] === null ? null : String(b[k]).trim();
  }
  for (const k of ['issuedAt', 'validFrom', 'validUntil']) if (b[k] !== undefined) d[k] = toDate(b[k]);
  if (b.keywords !== undefined) {
    const arr = Array.isArray(b.keywords) ? b.keywords : String(b.keywords).split(',');
    d.keywords = [...new Set(arr.map((x: string) => String(x).trim().toLowerCase()).filter(Boolean))].slice(0, 20);
  }
  if (b.legalHold !== undefined) d.legalHold = b.legalHold === true || b.legalHold === 'true';
  if (d.title !== undefined && !d.title) throw new BadRequestException('Naziv dokumenta je obavezan');
  if (d.docType && !DOC_TYPES.includes(d.docType)) throw new BadRequestException('Nepoznata vrsta dokumenta');
  if (d.status && !DOC_STATUS.includes(d.status)) throw new BadRequestException('Nepoznat status dokumenta');
  if (d.accessLevel && !['JAVNO', 'INTERNO'].includes(d.accessLevel)) throw new BadRequestException('Pristup mora biti JAVNO ili INTERNO');
  if (d.retentionClass && !RETENTION[d.retentionClass]) throw new BadRequestException('Nepoznata klasa čuvanja');
  if (d.validFrom && d.validUntil && d.validUntil < d.validFrom) throw new BadRequestException('Datum prestanka važenja je prije datuma početka');
  return d;
}

@Controller('admin/documents')
@UseGuards(AuthGuard)
export class DocumentsController {
  constructor(private db: Db, private files: FileStore, private audit: AuditService) {}

  private async scope(req: any, sectorName: string | null) {
    assertScope(req.user, await keyForName(this.db, sectorName), 'dokumente');
  }

  @Get()
  @Can('dokumenti', 'read')
  list(@Query() q: any) {
    const w = new Where();
    if (q.docType) w.add(`"docType"=?`, q.docType);
    if (q.status) w.add(`"status"=?`, q.status);
    if (q.access) w.add(`"accessLevel"=?`, q.access);
    if (q.q) w.add(`("title" ILIKE ? OR coalesce("number",'') ILIKE ? OR ? = ANY("keywords"))`, `%${q.q}%`, `%${q.q}%`, String(q.q).toLowerCase());
    if (q.retention === 'due') w.add(`"retainUntil" <= current_date AND "disposedAt" IS NULL AND NOT "legalHold"`);
    if (q.retention === 'disposed') w.add(`"disposedAt" IS NOT NULL`);
    return this.db.q(`SELECT ${ADMIN_DOC_COLS}, (SELECT count(*)::int FROM document_versions v WHERE v."documentId"=documents."id") "versionCount"
      FROM documents ${w.sql} ORDER BY "createdAt" DESC LIMIT 500`, w.params);
  }

  /** Brojevi za karticu „Rokovi čuvanja“. */
  @Get('retention/summary')
  @Can('dokumenti', 'read')
  async retentionSummary() {
    const r = await this.db.one(`SELECT
      count(*) FILTER (WHERE "retainUntil" <= current_date AND "disposedAt" IS NULL AND NOT "legalHold")::int "due",
      count(*) FILTER (WHERE "retainUntil" > current_date AND "retainUntil" <= current_date + 90 AND "disposedAt" IS NULL AND NOT "legalHold")::int "soon",
      count(*) FILTER (WHERE "legalHold")::int "hold",
      count(*) FILTER (WHERE "disposedAt" IS NOT NULL)::int "disposed",
      count(*) FILTER (WHERE "retentionClass"='TRAJNO')::int "permanent"
      FROM documents`);
    return { ...r, classes: Object.entries(RETENTION).map(([value, v]) => ({ value, ...v })), defaults: DEFAULT_RETENTION };
  }

  @Get(':id')
  @Can('dokumenti', 'read')
  async get(@Param('id') docId: string) {
    const d = await this.db.one(`SELECT ${ADMIN_DOC_COLS} FROM documents WHERE "id"=$1`, [docId]);
    if (!d) throw new NotFoundException();
    d.versions = await this.db.q(`SELECT "version","fileName","size","sha256","userName","note","createdAt" FROM document_versions WHERE "documentId"=$1 ORDER BY "version" DESC`, [docId]);
    d.replaces = await this.db.q(`SELECT "id","title","number" FROM documents WHERE "replacedById"=$1`, [docId]);
    return d;
  }

  @Post()
  @Can('dokumenti', 'write')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: MAX_DOC } }))
  async upload(@UploadedFile() file: Express.Multer.File, @Body() b: any, @Req() req: any) {
    checkFile(file);
    if (!b?.title?.trim()) throw new BadRequestException('Naziv dokumenta je obavezan');
    const m = meta(b);
    if (!m.sector && req.user.sectors?.length && req.user.role !== 'ADMIN') m.sector = req.user.sectors[0];
    assertScope(req.user, await keyForName(this.db, m.sector ?? 'Opće'), 'dokumente');
    m.docType = m.docType ?? 'OSTALO';
    m.retentionClass = m.retentionClass ?? DEFAULT_RETENTION[m.docType] ?? 'GODINA_10';
    m.retainUntil = retainUntil(m.retentionClass, { ...m, createdAt: new Date() });
    const stored = await this.files.put('dokumenti', file.buffer, file.mimetype);
    const d = await this.db.insert('documents', {
      id: id(), sector: 'Opće', status: 'VAZECI', description: '', ...m,
      fileName: utf8Name(file.originalname), mimeType: file.mimetype, size: file.size, ...stored,
    }, `"id","title","fileName","size","docType"`);
    await this.audit.log(req, { action: 'Učitao/la dokument', entity: 'dokument', entityId: d.id, target: d.title, after: { ...m, fileName: d.fileName, size: d.size, sha256: stored.sha256 } });
    return d;
  }

  @Patch(':id')
  @Can('dokumenti', 'write')
  async update(@Param('id') docId: string, @Body() b: any, @Req() req: any) {
    const before = await this.db.one<any>(`SELECT ${ADMIN_DOC_COLS} FROM documents WHERE "id"=$1`, [docId]);
    if (!before) throw new NotFoundException();
    if (before.disposedAt) throw new BadRequestException('Dokument je izlučen; zapis se više ne mijenja.');
    await this.scope(req, before.sector);
    const m = meta(b);
    if (m.sector) await this.scope(req, m.sector);
    if (m.legalHold !== undefined && m.legalHold !== before.legalHold && !['ADMIN'].includes(req.user.role)) throw new ForbiddenException('Zabranu izlučivanja postavlja administrator.');
    if (m.replacedById === docId) throw new BadRequestException('Dokument ne može zamijeniti sam sebe.');
    if (m.replacedById) m.status = 'ZAMIJENJEN';
    const next = { ...before, ...m };
    if (['retentionClass', 'validUntil', 'issuedAt'].some((k) => m[k] !== undefined)) m.retainUntil = retainUntil(next.retentionClass, next);
    const d = await this.db.one(`UPDATE documents SET ${Object.keys(m).map((k, i) => `"${k}"=$${i + 2}`).join(',')}, "updatedAt"=now() WHERE "id"=$1 RETURNING ${ADMIN_DOC_COLS}`, [docId, ...Object.values(m)]);
    await this.audit.log(req, { action: 'Uredio/la metapodatke dokumenta', entity: 'dokument', entityId: docId, target: d.title, before, after: d });
    return d;
  }

  /** Nova verzija datoteke: prethodna ide u historiju i ostaje dostupna u CMS-u. */
  @Post(':id/file')
  @Can('dokumenti', 'write')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: MAX_DOC } }))
  async replaceFile(@Param('id') docId: string, @UploadedFile() file: Express.Multer.File, @Body() b: any, @Req() req: any) {
    checkFile(file);
    const cur = await this.db.one<any>(`SELECT * FROM documents WHERE "id"=$1`, [docId]);
    if (!cur) throw new NotFoundException();
    if (cur.disposedAt) throw new BadRequestException('Dokument je izlučen.');
    await this.scope(req, cur.sector);
    const note = String(b?.note ?? '').trim().slice(0, 300) || null;
    const stored = await this.files.put('dokumenti', file.buffer, file.mimetype);
    await this.db.insert('document_versions', {
      id: id(), documentId: docId, version: cur.version, fileName: cur.fileName, mimeType: cur.mimeType, size: cur.size,
      data: cur.data, storageKey: cur.storageKey, sha256: cur.sha256, scanStatus: cur.scanStatus, userName: req.user.name, note,
    }, `"id"`);
    const d = await this.db.one(`UPDATE documents SET "fileName"=$2,"mimeType"=$3,"size"=$4,"data"=$5,"storageKey"=$6,"sha256"=$7,"scanStatus"=$8,"version"="version"+1,"updatedAt"=now()
      WHERE "id"=$1 RETURNING ${ADMIN_DOC_COLS}`, [docId, utf8Name(file.originalname), file.mimetype, file.size, stored.data, stored.storageKey, stored.sha256, stored.scanStatus]);
    await this.audit.log(req, { action: `Učitao/la novu verziju dokumenta (v${d.version})`, entity: 'dokument', entityId: docId, target: d.title,
      before: { fileName: cur.fileName, sha256: cur.sha256 }, after: { fileName: d.fileName, sha256: d.sha256, ...(note ? { napomena: note } : {}) } });
    return d;
  }

  @Get(':id/file')
  @Can('dokumenti', 'read')
  async file(@Param('id') docId: string, @Res() res: Response) {
    const d = await this.db.one<any>(`SELECT "fileName","mimeType","data","storageKey" FROM documents WHERE "id"=$1 AND "disposedAt" IS NULL`, [docId]);
    if (!d) throw new NotFoundException();
    return this.send(res, d);
  }

  @Get(':id/versions/:v/file')
  @Can('dokumenti', 'read')
  async versionFile(@Param('id') docId: string, @Param('v') v: string, @Res() res: Response) {
    const d = await this.db.one<any>(`SELECT "fileName","mimeType","data","storageKey" FROM document_versions WHERE "documentId"=$1 AND "version"=$2`, [docId, Number(v)]);
    if (!d) throw new NotFoundException();
    return this.send(res, d);
  }

  private async send(res: Response, d: any) {
    res.setHeader('Content-Type', d.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(d.fileName)}`);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Cache-Control', 'no-store');
    res.send(await this.files.read(d));
  }

  /**
   * Izlučivanje: briše datoteku (i sve verzije), zapis ostaje sa statusom ARHIVIRAN, oznakom i razlogom.
   * Dozvoljeno tek kad rok čuvanja istekne i ako nije postavljena zabrana izlučivanja.
   */
  @Post(':id/dispose')
  @Can('dokumenti', 'delete')
  async dispose(@Param('id') docId: string, @Body() b: { note?: string }, @Req() req: any) {
    const d = await this.db.one<any>(`SELECT * FROM documents WHERE "id"=$1`, [docId]);
    if (!d) throw new NotFoundException();
    if (d.disposedAt) throw new BadRequestException('Dokument je već izlučen.');
    await this.scope(req, d.sector);
    if (d.legalHold) throw new ForbiddenException('Za dokument važi zabrana izlučivanja.');
    if (!d.retainUntil || String(d.retainUntil) > new Date().toISOString().slice(0, 10)) throw new BadRequestException('Rok čuvanja još nije istekao.');
    const note = String(b?.note ?? '').trim();
    if (note.length < 5) throw new BadRequestException('Navedite osnov izlučivanja (npr. broj zapisnika komisije).');
    const versions = await this.db.q<any>(`SELECT "storageKey" FROM document_versions WHERE "documentId"=$1`, [docId]);
    await this.db.q(`UPDATE documents SET "data"=NULL, "storageKey"=NULL, "status"='ARHIVIRAN', "disposedAt"=now(), "disposalNote"=$2, "updatedAt"=now() WHERE "id"=$1`, [docId, note]);
    await this.db.q(`DELETE FROM document_versions WHERE "documentId"=$1`, [docId]);
    for (const k of [d.storageKey, ...versions.map((v) => v.storageKey)]) await this.files.remove(k);
    await this.audit.log(req, { action: 'Izlučio/la dokument (istekao rok čuvanja)', entity: 'dokument', entityId: docId, target: d.title,
      before: { fileName: d.fileName, sha256: d.sha256, retainUntil: d.retainUntil, verzija: d.version }, after: { status: 'ARHIVIRAN', osnov: note } });
    return { ok: true };
  }

  /** Brisanje zapisa – samo za greške pri unosu (npr. pogrešno učitan fajl); za izlučivanje služi dispose. */
  @Delete(':id')
  @Can('dokumenti', 'delete')
  async remove(@Param('id') docId: string, @Req() req: any) {
    const cur = await this.db.one<any>(`SELECT "sector" FROM documents WHERE "id"=$1`, [docId]);
    if (cur) await this.scope(req, cur.sector);
    const versions = await this.db.q<any>(`SELECT "storageKey" FROM document_versions WHERE "documentId"=$1`, [docId]);
    const d = await this.db.one<any>(`DELETE FROM documents WHERE "id"=$1 RETURNING "title","storageKey","fileName","sha256","docType","number"`, [docId]);
    if (!d) throw new NotFoundException();
    for (const k of [d.storageKey, ...versions.map((v) => v.storageKey)]) await this.files.remove(k);
    await this.audit.log(req, { action: 'Obrisao/la dokument', entity: 'dokument', entityId: docId, target: d.title, before: d, after: null });
    return { ok: true };
  }
}
