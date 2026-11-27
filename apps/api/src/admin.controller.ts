import {
  BadRequestException, Body, Controller, Delete, ForbiddenException, Get, NotFoundException, Param, Patch, Post, Query, Req,
  UploadedFile, UseGuards, UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileStore } from './storage';
import { Db, Where, id } from './db';
import { AuthGuard } from './auth';
import { DOC_COLS } from './public.controller';
import { slugify, toDate, toFloat, toInt } from './util';
import { MttoImporter } from './importer';
import { AuditService } from './audit';
import { Can, can } from './rbac';

const MAX_DOC = 10 * 1024 * 1024;
const MAX_IMG = 5 * 1024 * 1024;
const DOC_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
const IMG_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

function permitData(b: any) {
  const d: any = {};
  for (const k of ['registerNumber', 'operator', 'facility', 'activity', 'municipality', 'address', 'status', 'description']) {
    if (b[k] !== undefined) d[k] = String(b[k]);
  }
  if (b.issuedAt !== undefined) d.issuedAt = toDate(b.issuedAt);
  if (b.validUntil !== undefined) d.validUntil = toDate(b.validUntil);
  if (b.lat !== undefined) d.lat = toFloat(b.lat);
  if (b.lng !== undefined) d.lng = toFloat(b.lng);
  if (b.isDemo !== undefined) d.isDemo = Boolean(b.isDemo);
  return d;
}

function utf8Name(name: string) {
  try {
    return Buffer.from(name, 'latin1').toString('utf8');
  } catch {
    return name;
  }
}

@Controller('admin')
@UseGuards(AuthGuard)
export class AdminController {
  constructor(private db: Db, private importer: MttoImporter, private files: FileStore, private audit: AuditService) {}

  @Post('import/mtto')
  @Can('uvoz', 'write')
  async importMtto(@Req() req: any) {
    const r = await this.importer.run();
    await this.audit.log(req, { action: 'Uvezao/la vijesti s mtto.gov.ba', entity: 'uvoz', target: `novih ${r.imported}, povezanih ${r.updated}` });
    return r;
  }

  // ---------- Kontrolna ploča ----------
  @Get('dashboard')
  @Can('kontrolna', 'read')
  async dashboard(@Req() req: any) {
    const c = (sql: string) => this.db.count(sql);
    const [published, drafts, scheduled, pending, views, documents, permits, facilities, locations, expiring, recentPosts, audit] = await Promise.all([
      c(`SELECT count(*) n FROM posts WHERE "status"='OBJAVLJENO'`),
      c(`SELECT count(*) n FROM posts WHERE "status"='NACRT'`),
      c(`SELECT count(*) n FROM posts WHERE "status"='ZAKAZANO'`),
      c(`SELECT count(*) n FROM posts WHERE "status"='NA_ODOBRENJU'`),
      c(`SELECT coalesce(sum("views"),0) n FROM posts`),
      c(`SELECT count(*) n FROM documents`),
      c(`SELECT count(*) n FROM permits`),
      c(`SELECT count(*) n FROM facilities`),
      c(`SELECT count(*) n FROM map_locations`),
      this.db.q(`SELECT "id","registerNumber","operator","validUntil","status" FROM permits WHERE "validUntil" BETWEEN now() AND now() + interval '60 days' ORDER BY "validUntil" LIMIT 5`),
      this.db.q(`SELECT "id","title","status","type","category","updatedAt","publishedAt" FROM posts ORDER BY "updatedAt" DESC LIMIT 6`),
      this.db.q(`SELECT * FROM audit_log ORDER BY "createdAt" DESC LIMIT 8`),
    ]);
    const [monthly, topPosts, reports] = await Promise.all([
      this.db.q(`SELECT to_char(date_trunc('month', "publishedAt"), 'YYYY-MM') m, "type", count(*)::int n FROM posts
                 WHERE "status"='OBJAVLJENO' AND "publishedAt" >= date_trunc('month', now()) - interval '11 months' GROUP BY 1,2`),
      this.db.q(`SELECT "id","title","views","type","publishedAt" FROM posts WHERE "status"='OBJAVLJENO' ORDER BY "views" DESC LIMIT 5`),
      this.db.q(`SELECT "status", count(*)::int n FROM eco_reports GROUP BY 1`).catch(() => []),
    ]);
    const showAudit = can(req.user.role, 'dnevnik', 'read');
    return { published, drafts, scheduled, pending, views, documents, permits, facilities, locations, expiring, recentPosts, audit: showAudit ? audit : [], monthly, topPosts, reports };
  }

  // ---------- Objave ----------
  // ---------- Dokumenti ----------
  @Get('documents')
  @Can('dokumenti', 'read')
  documents(@Query() q: any) {
    const w = new Where();
    if (q.docType) w.add(`"docType"=?`, q.docType);
    if (q.q) w.add(`"title" ILIKE ?`, `%${q.q}%`);
    return this.db.q(`SELECT ${DOC_COLS} FROM documents ${w.sql} ORDER BY "createdAt" DESC LIMIT 300`, w.params);
  }

  @Post('documents')
  @Can('dokumenti', 'write')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: MAX_DOC } }))
  async upload(@UploadedFile() file: Express.Multer.File, @Body() b: any, @Req() req: any) {
    if (!file) throw new BadRequestException('Datoteka nije priložena (najviše 10 MB)');
    if (!DOC_TYPES.includes(file.mimetype)) throw new BadRequestException('Dozvoljeni formati: PDF, DOC, DOCX, XLS, XLSX');
    if (file.mimetype === 'application/pdf' && file.buffer.subarray(0, 5).toString() !== '%PDF-') throw new BadRequestException('Datoteka nije ispravan PDF');
    if (!b?.title?.trim()) throw new BadRequestException('Naziv dokumenta je obavezan');
    const stored = await this.files.put('dokumenti', file.buffer, file.mimetype);
    const d = await this.db.insert('documents', {
      id: id(), title: String(b.title).trim(), docType: String(b.docType || 'OSTALO'), sector: String(b.sector || 'Opće'),
      number: b.number || null, issuedAt: toDate(b.issuedAt), status: String(b.status || 'VAZECI'), description: String(b.description || ''),
      fileName: utf8Name(file.originalname), mimeType: file.mimetype, size: file.size, ...stored,
      postId: b.postId || null, permitId: b.permitId || null,
    }, `"id","title","fileName","size","docType"`);
    await this.audit.log(req, { action: 'Učitao/la dokument', entity: 'dokument', entityId: d.id, target: d.title, after: { title: d.title, fileName: d.fileName, size: d.size, docType: d.docType, sha256: stored.sha256 } });
    return d;
  }

  @Patch('documents/:id')
  @Can('dokumenti', 'write')
  async updateDoc(@Param('id') docId: string, @Body() b: any, @Req() req: any) {
    const before = await this.db.one(`SELECT ${DOC_COLS} FROM documents WHERE "id"=$1`, [docId]);
    if (!before) throw new NotFoundException();
    const data: any = {};
    for (const k of ['title', 'docType', 'sector', 'number', 'status', 'description', 'postId', 'permitId']) if (b[k] !== undefined) data[k] = b[k] === '' ? null : b[k];
    if (b.issuedAt !== undefined) data.issuedAt = toDate(b.issuedAt);
    const d = await this.db.update('documents', docId, data, false, DOC_COLS);
    if (!d) throw new NotFoundException();
    await this.audit.log(req, { action: 'Uredio/la dokument', entity: 'dokument', entityId: docId, target: d.title, before, after: d });
    return d;
  }

  @Delete('documents/:id')
  @Can('dokumenti', 'delete')
  async deleteDoc(@Param('id') docId: string, @Req() req: any) {
    const d = await this.db.one(`DELETE FROM documents WHERE "id"=$1 RETURNING "title","storageKey","fileName","sha256","docType","number"`, [docId]);
    if (!d) throw new NotFoundException();
    await this.files.remove(d.storageKey);
    await this.audit.log(req, { action: 'Obrisao/la dokument', entity: 'dokument', entityId: docId, target: d.title, before: d, after: null });
    return { ok: true };
  }

  // ---------- Slike ----------
  @Post('media')
  @Can('mediji', 'write')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: MAX_IMG } }))
  async media(@UploadedFile() file: Express.Multer.File, @Req() req: any) {
    if (!file) throw new BadRequestException('Slika nije priložena (najviše 5 MB)');
    if (!IMG_TYPES.includes(file.mimetype)) throw new BadRequestException('Dozvoljeni formati: JPG, PNG, WEBP');
    const stored = await this.files.put('mediji', file.buffer, file.mimetype);
    const m = await this.db.insert('media', { id: id(), fileName: utf8Name(file.originalname), mimeType: file.mimetype, size: file.size, ...stored }, `"id"`);
    await this.audit.log(req, { action: 'Učitao/la sliku', entity: 'medij', entityId: m.id, target: utf8Name(file.originalname) });
    return { id: m.id, url: `/api/media/${m.id}` };
  }

  // ---------- Registar okolišnih dozvola ----------
  @Get('permits')
  @Can('registri', 'read')
  permits() {
    return this.db.q(`SELECT p.*, (SELECT count(*)::int FROM documents d WHERE d."permitId"=p."id") "documentCount" FROM permits p ORDER BY p."updatedAt" DESC`);
  }

  @Post('permits')
  @Can('registri', 'write')
  async createPermit(@Body() b: any, @Req() req: any) {
    const data = permitData(b);
    for (const k of ['registerNumber', 'operator', 'facility', 'activity', 'municipality']) if (!data[k]) throw new BadRequestException(`Polje "${k}" je obavezno`);
    if (!data.issuedAt || !data.validUntil) throw new BadRequestException('Datum izdavanja i datum važenja su obavezni');
    if (await this.db.one(`SELECT 1 FROM permits WHERE "registerNumber"=$1`, [data.registerNumber])) throw new BadRequestException('Dozvola s tim brojem već postoji');
    const p = await this.db.insert('permits', { id: id(), ...data });
    await this.audit.log(req, { action: 'Dodao/la dozvolu u registar', entity: 'dozvola', entityId: p.id, target: `${p.registerNumber} ${p.operator}`, after: p });
    return p;
  }

  @Patch('permits/:id')
  @Can('registri', 'write')
  async updatePermit(@Param('id') permitId: string, @Body() b: any, @Req() req: any) {
    const before = await this.db.one(`SELECT * FROM permits WHERE "id"=$1`, [permitId]);
    if (!before) throw new NotFoundException();
    const p = await this.db.update('permits', permitId, permitData(b), true);
    if (!p) throw new NotFoundException();
    await this.audit.log(req, { action: 'Ažurirao/la dozvolu', entity: 'dozvola', entityId: permitId, target: `${p.registerNumber} ${p.operator}`, before, after: p });
    return p;
  }

  @Delete('permits/:id')
  @Can('registri', 'delete')
  async deletePermit(@Param('id') permitId: string, @Req() req: any) {
    const p = await this.db.one(`DELETE FROM permits WHERE "id"=$1 RETURNING *`, [permitId]);
    if (!p) throw new NotFoundException();
    await this.audit.log(req, { action: 'Obrisao/la dozvolu', entity: 'dozvola', entityId: permitId, target: p.registerNumber, before: p, after: null });
    return { ok: true };
  }

  // ---------- Lokacije na mapi ----------
  @Get('locations')
  @Can('registri', 'read')
  locations() {
    return this.db.q(`SELECT * FROM map_locations ORDER BY "createdAt" DESC`);
  }

  @Post('locations')
  @Can('registri', 'write')
  async createLocation(@Body() b: any, @Req() req: any) {
    const lat = toFloat(b.lat), lng = toFloat(b.lng);
    if (!b?.name || lat === null || lng === null) throw new BadRequestException('Naziv i koordinate su obavezni');
    const l = await this.db.insert('map_locations', { id: id(), name: String(b.name), layer: String(b.layer || 'TURIZAM'), description: String(b.description || ''), lat, lng, link: b.link || null });
    await this.audit.log(req, { action: 'Dodao/la lokaciju na mapu', entity: 'lokacija', entityId: l.id, target: l.name, after: l });
    return l;
  }

  @Delete('locations/:id')
  @Can('registri', 'delete')
  async deleteLocation(@Param('id') locId: string, @Req() req: any) {
    const l = await this.db.one(`DELETE FROM map_locations WHERE "id"=$1 RETURNING *`, [locId]);
    if (!l) throw new NotFoundException();
    await this.audit.log(req, { action: 'Uklonio/la lokaciju s mape', entity: 'lokacija', entityId: locId, target: l.name, before: l, after: null });
    return { ok: true };
  }

  // ---------- Ugostiteljski objekti ----------
  @Get('facilities')
  @Can('registri', 'read')
  facilities() {
    return this.db.q(`SELECT * FROM facilities ORDER BY "name"`);
  }

  @Post('facilities')
  @Can('registri', 'write')
  async createFacility(@Body() b: any, @Req() req: any) {
    if (!b?.name || !b?.kind || !b?.municipality) throw new BadRequestException('Naziv, vrsta i općina su obavezni');
    const f = await this.db.insert('facilities', {
      id: id(), name: String(b.name), kind: String(b.kind), stars: b.stars ? toInt(b.stars, 0) : null, municipality: String(b.municipality),
      address: String(b.address || ''), rooms: b.rooms ? toInt(b.rooms, 0) : null, beds: b.beds ? toInt(b.beds, 0) : null,
      decisionNumber: b.decisionNumber || null, decisionDate: toDate(b.decisionDate), lat: toFloat(b.lat), lng: toFloat(b.lng),
    });
    await this.audit.log(req, { action: 'Dodao/la ugostiteljski objekt', entity: 'objekt', entityId: f.id, target: f.name, after: f });
    return f;
  }

  @Delete('facilities/:id')
  @Can('registri', 'delete')
  async deleteFacility(@Param('id') facId: string, @Req() req: any) {
    const f = await this.db.one(`DELETE FROM facilities WHERE "id"=$1 RETURNING *`, [facId]);
    if (!f) throw new NotFoundException();
    await this.audit.log(req, { action: 'Obrisao/la ugostiteljski objekt', entity: 'objekt', entityId: facId, target: f.name, before: f, after: null });
    return { ok: true };
  }
}
