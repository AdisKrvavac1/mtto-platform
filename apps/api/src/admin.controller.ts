import {
  BadRequestException, Body, Controller, Delete, Get, NotFoundException, Param, Patch, Post, Query, Req,
  UploadedFile, UseGuards, UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Db, Where, id } from './db';
import { AuthGuard } from './auth';
import { DOC_COLS } from './public.controller';
import { slugify, toDate, toFloat, toInt } from './util';
import { MttoImporter } from './importer';

const MAX_DOC = 10 * 1024 * 1024;
const MAX_IMG = 5 * 1024 * 1024;
const DOC_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
const IMG_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const POST_STATUS = ['NACRT', 'OBJAVLJENO', 'ZAKAZANO'];
const POST_TYPES = ['VIJEST', 'JAVNI_POZIV', 'SAOPCENJE'];

function postData(b: any) {
  const d: any = {};
  for (const k of ['type', 'category', 'title', 'excerpt', 'body', 'coverImage', 'status', 'formUrl', 'authorName']) {
    if (b[k] !== undefined) d[k] = b[k] === '' && (k === 'coverImage' || k === 'formUrl') ? null : String(b[k]);
  }
  if (d.status && !POST_STATUS.includes(d.status)) throw new BadRequestException('Nepoznat status');
  if (d.type && !POST_TYPES.includes(d.type)) throw new BadRequestException('Nepoznata vrsta objave');
  if (d.formUrl && !/^https:\/\//.test(d.formUrl)) throw new BadRequestException('Link na formu mora počinjati s https://');
  if (b.publishedAt !== undefined) d.publishedAt = toDate(b.publishedAt);
  if (b.deadline !== undefined) d.deadline = toDate(b.deadline);
  return d;
}

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
  constructor(private db: Db, private importer: MttoImporter) {}

  private log(req: any, action: string, target: string) {
    return this.db.insert('audit_log', { id: id(), userName: req.user?.name ?? 'Nepoznat', action, target: String(target).slice(0, 200) });
  }

  // ---------- Uvoz s mtto.gov.ba ----------
  @Post('import/mtto')
  async importMtto(@Req() req: any) {
    const r = await this.importer.run();
    await this.log(req, 'Uvezao/la vijesti s mtto.gov.ba', `novih ${r.imported}, povezanih ${r.updated}`);
    return r;
  }

  // ---------- Kontrolna ploča ----------
  @Get('dashboard')
  async dashboard() {
    const c = (sql: string) => this.db.count(sql);
    const [published, drafts, scheduled, views, documents, permits, facilities, locations, expiring, recentPosts, audit] = await Promise.all([
      c(`SELECT count(*) n FROM posts WHERE "status"='OBJAVLJENO'`),
      c(`SELECT count(*) n FROM posts WHERE "status"='NACRT'`),
      c(`SELECT count(*) n FROM posts WHERE "status"='ZAKAZANO'`),
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
    return { published, drafts, scheduled, views, documents, permits, facilities, locations, expiring, recentPosts, audit, monthly, topPosts, reports };
  }

  // ---------- Objave ----------
  @Get('posts')
  posts(@Query() q: any) {
    const w = new Where();
    if (q.status) w.add(`"status"=?`, q.status);
    if (q.type) w.add(`"type"=?`, q.type);
    if (q.q) w.add(`"title" ILIKE ?`, `%${q.q}%`);
    return this.db.q(`SELECT "id","slug","title","excerpt","status","type","category","publishedAt","updatedAt","views","authorName","coverImage","isDemo" FROM posts ${w.sql} ORDER BY "updatedAt" DESC LIMIT 200`, w.params);
  }

  @Get('posts/:id')
  async post(@Param('id') postId: string) {
    const p = await this.db.one(`SELECT * FROM posts WHERE "id"=$1`, [postId]);
    if (!p) throw new NotFoundException();
    p.documents = await this.db.q(`SELECT "id","title","fileName","size","docType" FROM documents WHERE "postId"=$1 ORDER BY "createdAt"`, [postId]);
    return p;
  }

  @Post('posts')
  async createPost(@Body() b: any, @Req() req: any) {
    if (!b?.title?.trim()) throw new BadRequestException('Naslov je obavezan');
    const data = postData(b);
    if (data.status === 'OBJAVLJENO' && !data.publishedAt) data.publishedAt = new Date();
    let slug = slugify(b.slug || b.title) || `objava-${Date.now()}`;
    if (await this.db.one(`SELECT 1 FROM posts WHERE "slug"=$1`, [slug])) slug = `${slug}-${Date.now().toString(36)}`;
    const p = await this.db.insert('posts', { id: id(), ...data, slug, authorName: data.authorName ?? req.user?.name ?? 'Uredništvo MTTO' });
    await this.log(req, p.status === 'OBJAVLJENO' ? 'Objavio/la objavu' : 'Kreirao/la nacrt', p.title);
    return p;
  }

  @Patch('posts/:id')
  async updatePost(@Param('id') postId: string, @Body() b: any, @Req() req: any) {
    const before = await this.db.one(`SELECT * FROM posts WHERE "id"=$1`, [postId]);
    if (!before) throw new NotFoundException();
    const data = postData(b);
    if (data.status === 'OBJAVLJENO' && !before.publishedAt && !data.publishedAt) data.publishedAt = new Date();
    const p = await this.db.update('posts', postId, data, true);
    await this.log(req, before.status !== 'OBJAVLJENO' && p.status === 'OBJAVLJENO' ? 'Objavio/la objavu' : 'Uredio/la objavu', p.title);
    return p;
  }

  @Delete('posts/:id')
  async deletePost(@Param('id') postId: string, @Req() req: any) {
    const p = await this.db.one(`DELETE FROM posts WHERE "id"=$1 RETURNING "title"`, [postId]);
    if (!p) throw new NotFoundException();
    await this.log(req, 'Obrisao/la objavu', p.title);
    return { ok: true };
  }

  // ---------- Dokumenti ----------
  @Get('documents')
  documents(@Query() q: any) {
    const w = new Where();
    if (q.docType) w.add(`"docType"=?`, q.docType);
    if (q.q) w.add(`"title" ILIKE ?`, `%${q.q}%`);
    return this.db.q(`SELECT ${DOC_COLS} FROM documents ${w.sql} ORDER BY "createdAt" DESC LIMIT 300`, w.params);
  }

  @Post('documents')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: MAX_DOC } }))
  async upload(@UploadedFile() file: Express.Multer.File, @Body() b: any, @Req() req: any) {
    if (!file) throw new BadRequestException('Datoteka nije priložena (najviše 10 MB)');
    if (!DOC_TYPES.includes(file.mimetype)) throw new BadRequestException('Dozvoljeni formati: PDF, DOC, DOCX, XLS, XLSX');
    if (file.mimetype === 'application/pdf' && file.buffer.subarray(0, 5).toString() !== '%PDF-') throw new BadRequestException('Datoteka nije ispravan PDF');
    if (!b?.title?.trim()) throw new BadRequestException('Naziv dokumenta je obavezan');
    const d = await this.db.insert('documents', {
      id: id(), title: String(b.title).trim(), docType: String(b.docType || 'OSTALO'), sector: String(b.sector || 'Opće'),
      number: b.number || null, issuedAt: toDate(b.issuedAt), status: String(b.status || 'VAZECI'), description: String(b.description || ''),
      fileName: utf8Name(file.originalname), mimeType: file.mimetype, size: file.size, data: file.buffer,
      postId: b.postId || null, permitId: b.permitId || null,
    }, `"id","title","fileName","size","docType"`);
    await this.log(req, 'Učitao/la dokument', d.title);
    return d;
  }

  @Patch('documents/:id')
  async updateDoc(@Param('id') docId: string, @Body() b: any, @Req() req: any) {
    const data: any = {};
    for (const k of ['title', 'docType', 'sector', 'number', 'status', 'description', 'postId', 'permitId']) if (b[k] !== undefined) data[k] = b[k] === '' ? null : b[k];
    if (b.issuedAt !== undefined) data.issuedAt = toDate(b.issuedAt);
    const d = await this.db.update('documents', docId, data, false, `"id","title"`);
    if (!d) throw new NotFoundException();
    await this.log(req, 'Uredio/la dokument', d.title);
    return d;
  }

  @Delete('documents/:id')
  async deleteDoc(@Param('id') docId: string, @Req() req: any) {
    const d = await this.db.one(`DELETE FROM documents WHERE "id"=$1 RETURNING "title"`, [docId]);
    if (!d) throw new NotFoundException();
    await this.log(req, 'Obrisao/la dokument', d.title);
    return { ok: true };
  }

  // ---------- Slike ----------
  @Post('media')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: MAX_IMG } }))
  async media(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('Slika nije priložena (najviše 5 MB)');
    if (!IMG_TYPES.includes(file.mimetype)) throw new BadRequestException('Dozvoljeni formati: JPG, PNG, WEBP');
    const m = await this.db.insert('media', { id: id(), fileName: utf8Name(file.originalname), mimeType: file.mimetype, size: file.size, data: file.buffer }, `"id"`);
    return { id: m.id, url: `/api/media/${m.id}` };
  }

  // ---------- Registar okolišnih dozvola ----------
  @Get('permits')
  permits() {
    return this.db.q(`SELECT p.*, (SELECT count(*)::int FROM documents d WHERE d."permitId"=p."id") "documentCount" FROM permits p ORDER BY p."updatedAt" DESC`);
  }

  @Post('permits')
  async createPermit(@Body() b: any, @Req() req: any) {
    const data = permitData(b);
    for (const k of ['registerNumber', 'operator', 'facility', 'activity', 'municipality']) if (!data[k]) throw new BadRequestException(`Polje "${k}" je obavezno`);
    if (!data.issuedAt || !data.validUntil) throw new BadRequestException('Datum izdavanja i datum važenja su obavezni');
    if (await this.db.one(`SELECT 1 FROM permits WHERE "registerNumber"=$1`, [data.registerNumber])) throw new BadRequestException('Dozvola s tim brojem već postoji');
    const p = await this.db.insert('permits', { id: id(), ...data });
    await this.log(req, 'Dodao/la dozvolu u registar', `${p.registerNumber} ${p.operator}`);
    return p;
  }

  @Patch('permits/:id')
  async updatePermit(@Param('id') permitId: string, @Body() b: any, @Req() req: any) {
    const p = await this.db.update('permits', permitId, permitData(b), true);
    if (!p) throw new NotFoundException();
    await this.log(req, 'Ažurirao/la dozvolu', `${p.registerNumber} ${p.operator}`);
    return p;
  }

  @Delete('permits/:id')
  async deletePermit(@Param('id') permitId: string, @Req() req: any) {
    const p = await this.db.one(`DELETE FROM permits WHERE "id"=$1 RETURNING "registerNumber"`, [permitId]);
    if (!p) throw new NotFoundException();
    await this.log(req, 'Obrisao/la dozvolu', p.registerNumber);
    return { ok: true };
  }

  // ---------- Lokacije na mapi ----------
  @Get('locations')
  locations() {
    return this.db.q(`SELECT * FROM map_locations ORDER BY "createdAt" DESC`);
  }

  @Post('locations')
  async createLocation(@Body() b: any, @Req() req: any) {
    const lat = toFloat(b.lat), lng = toFloat(b.lng);
    if (!b?.name || lat === null || lng === null) throw new BadRequestException('Naziv i koordinate su obavezni');
    const l = await this.db.insert('map_locations', { id: id(), name: String(b.name), layer: String(b.layer || 'TURIZAM'), description: String(b.description || ''), lat, lng, link: b.link || null });
    await this.log(req, 'Dodao/la lokaciju na mapu', l.name);
    return l;
  }

  @Delete('locations/:id')
  async deleteLocation(@Param('id') locId: string, @Req() req: any) {
    const l = await this.db.one(`DELETE FROM map_locations WHERE "id"=$1 RETURNING "name"`, [locId]);
    if (!l) throw new NotFoundException();
    await this.log(req, 'Uklonio/la lokaciju s mape', l.name);
    return { ok: true };
  }

  // ---------- Ugostiteljski objekti ----------
  @Get('facilities')
  facilities() {
    return this.db.q(`SELECT * FROM facilities ORDER BY "name"`);
  }

  @Post('facilities')
  async createFacility(@Body() b: any, @Req() req: any) {
    if (!b?.name || !b?.kind || !b?.municipality) throw new BadRequestException('Naziv, vrsta i općina su obavezni');
    const f = await this.db.insert('facilities', {
      id: id(), name: String(b.name), kind: String(b.kind), stars: b.stars ? toInt(b.stars, 0) : null, municipality: String(b.municipality),
      address: String(b.address || ''), rooms: b.rooms ? toInt(b.rooms, 0) : null, beds: b.beds ? toInt(b.beds, 0) : null,
      decisionNumber: b.decisionNumber || null, decisionDate: toDate(b.decisionDate), lat: toFloat(b.lat), lng: toFloat(b.lng),
    });
    await this.log(req, 'Dodao/la ugostiteljski objekt', f.name);
    return f;
  }

  @Delete('facilities/:id')
  async deleteFacility(@Param('id') facId: string, @Req() req: any) {
    const f = await this.db.one(`DELETE FROM facilities WHERE "id"=$1 RETURNING "name"`, [facId]);
    if (!f) throw new NotFoundException();
    await this.log(req, 'Obrisao/la ugostiteljski objekt', f.name);
    return { ok: true };
  }
}
