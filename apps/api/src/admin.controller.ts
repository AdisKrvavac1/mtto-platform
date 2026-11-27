import {
  BadRequestException, Body, Controller, Delete, ForbiddenException, Get, NotFoundException, Param, Patch, Post, Query, Req,
  UploadedFile, UseGuards, UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileStore } from './storage';
import { FACILITIES_SQL } from './registries.controller';
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
      // F2-22: urednik vezan za sektore vidi samo svoj red za odobrenje
      req.user.role !== 'ADMIN' && req.user.sectors?.length
        ? this.db.count(`SELECT count(*) n FROM posts WHERE "status"='NA_ODOBRENJU' AND "category" = ANY($1)`, [req.user.sectors])
        : c(`SELECT count(*) n FROM posts WHERE "status"='NA_ODOBRENJU'`),
      c(`SELECT coalesce(sum("views"),0) n FROM posts`),
      c(`SELECT count(*) n FROM documents`),
      c(`SELECT count(*) n FROM permits`),
      c(`SELECT count(*) n FROM ${FACILITIES_SQL}`),
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
  // Ugostiteljski objekti: od F2-13 registar „ugostiteljski-objekti“ u registry builderu (registries.controller.ts).
}
