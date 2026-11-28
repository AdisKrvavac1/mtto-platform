import { lang, localize } from './i18n';
import { Controller, Get, NotFoundException, Param, Query, Res } from '@nestjs/common';
import type { Response } from 'express';
import { FileStore } from './storage';
import { Db, Where } from './db';
import { toInt } from './util';
import { FACILITIES_SQL } from './registries.controller';

export const DOC_COLS = `"id","title","docType","sector","number","issuedAt","status","description","fileName","mimeType","size","downloads","isDemo","postId","permitId","createdAt","updatedAt","publisher","gazette","validFrom","validUntil","keywords","language","replacedById","version"`;
/** Javno je samo ono što nije interno ni izlučeno (F2-03). */
const PUBLIC_DOC = `"accessLevel"='JAVNO' AND "disposedAt" IS NULL`;
const POST_LIST_COLS = `"id","slug","type","category","title","excerpt","coverImage","publishedAt","deadline","views","authorName","isDemo","translations"`;
const PUBLISHED = `"status" IN ('OBJAVLJENO','ZAKAZANO') AND "publishedAt" <= now() AND ("unpublishAt" IS NULL OR "unpublishAt" > now())`;

@Controller()
export class PublicController {
  constructor(private db: Db, private files: FileStore) {}

  @Get('health')
  async health() {
    await this.db.q('SELECT 1');
    return { status: 'ok' };
  }

  @Get('posts')
  async posts(@Query() q: any) {
    const take = Math.min(toInt(q.limit, 12), 50);
    const page = toInt(q.page, 1);
    const w = new Where().add(PUBLISHED);
    if (q.type) w.add(`"type"=?`, q.type);
    if (q.category) w.add(`"category"=?`, q.category);
    if (q.q) w.add(`("title" ILIKE ? OR "excerpt" ILIKE ?)`, `%${q.q}%`, `%${q.q}%`);
    const l = lang(q.lang);
    const rows = await this.db.q(`SELECT ${POST_LIST_COLS}, (SELECT count(*)::int FROM documents d WHERE d."postId"=posts."id" AND d."accessLevel"='JAVNO' AND d."disposedAt" IS NULL) AS "attachmentCount" FROM posts ${w.sql} ORDER BY "publishedAt" DESC LIMIT ${take} OFFSET ${(page - 1) * take}`, w.params);
    const items = rows.map((r: any) => localize(r, l, ['title', 'excerpt']));
    const total = await this.db.count(`SELECT count(*) n FROM posts ${w.sql}`, w.params);
    return { items, total, page, pages: Math.max(1, Math.ceil(total / take)) };
  }

  @Get('posts/:slug')
  async post(@Param('slug') slug: string, @Query('lang') ql?: string) {
    const raw = await this.db.one(`UPDATE posts SET "views"="views"+1 WHERE "slug"=$1 AND ${PUBLISHED} RETURNING *`, [slug]);
    if (!raw) throw new NotFoundException();
    const post: any = localize(raw, lang(ql), ['title', 'excerpt', 'body']);
    post.available = ['bs', ...Object.keys(raw.translations ?? {}).filter((k) => raw.translations[k]?.title)];
    post.documents = await this.db.q(`SELECT ${DOC_COLS} FROM documents WHERE "postId"=$1 AND ${PUBLIC_DOC} ORDER BY "createdAt"`, [post.id]);
    return post;
  }

  @Get('documents')
  async documents(@Query() q: any) {
    const w = new Where().add(`"postId" IS NULL AND "permitId" IS NULL AND ${PUBLIC_DOC}`);
    if (q.docType) w.add(`"docType"=?`, q.docType);
    if (q.sector) w.add(`"sector"=?`, q.sector);
    if (q.status) w.add(`"status"=?`, q.status);
    if (q.q) w.add(`("title" ILIKE ? OR coalesce("number",'') ILIKE ? OR ? = ANY("keywords"))`, `%${q.q}%`, `%${q.q}%`, String(q.q).toLowerCase());
    return this.db.q(`SELECT ${DOC_COLS} FROM documents ${w.sql} ORDER BY "issuedAt" DESC NULLS LAST, "createdAt" DESC LIMIT 200`, w.params);
  }

  @Get('documents/:id/file')
  async file(@Param('id') docId: string, @Res() res: Response) {
    const doc = await this.db.one(`UPDATE documents SET "downloads"="downloads"+1 WHERE "id"=$1 AND ${PUBLIC_DOC} RETURNING "fileName","mimeType","data","storageKey"`, [docId]);
    if (!doc) throw new NotFoundException();
    res.setHeader('Content-Type', doc.mimeType);
    res.setHeader('Content-Disposition', `inline; filename*=UTF-8''${encodeURIComponent(doc.fileName)}`);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.send(await this.files.read(doc));
  }

  @Get('media/:id')
  async media(@Param('id') mediaId: string, @Res() res: Response) {
    const m = await this.db.one(`SELECT "mimeType","data","storageKey" FROM media WHERE "id"=$1`, [mediaId]);
    if (!m) throw new NotFoundException();
    res.setHeader('Content-Type', m.mimeType);
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.send(await this.files.read(m));
  }

  @Get('permits')
  async permits(@Query() q: any) {
    const w = new Where();
    if (q.activity) w.add(`"activity"=?`, q.activity);
    if (q.municipality) w.add(`"municipality"=?`, q.municipality);
    if (q.status) w.add(`"status"=?`, q.status);
    if (q.q) w.add(`("operator" ILIKE ? OR "registerNumber" ILIKE ? OR "facility" ILIKE ?)`, `%${q.q}%`, `%${q.q}%`, `%${q.q}%`);
    return this.db.q(`SELECT * FROM permits ${w.sql} ORDER BY "issuedAt" DESC`, w.params);
  }

  @Get('permits/:id')
  async permit(@Param('id') permitId: string) {
    const p = await this.db.one(`SELECT * FROM permits WHERE "id"=$1`, [permitId]);
    if (!p) throw new NotFoundException();
    p.documents = await this.db.q(`SELECT ${DOC_COLS} FROM documents WHERE "permitId"=$1 AND ${PUBLIC_DOC} ORDER BY "createdAt"`, [permitId]);
    return p;
  }

  @Get('facilities')
  async facilities(@Query() q: any) {
    const w = new Where();
    if (q.kind) w.add(`"kind"=?`, q.kind);
    if (q.municipality) w.add(`"municipality"=?`, q.municipality);
    if (q.stars) w.add(`"stars"=?`, toInt(q.stars, 0));
    if (q.status) w.add(`"categoryStatus"=?`, q.status);
    if (q.q) w.add(`("name" ILIKE ? OR "address" ILIKE ? OR "decisionNumber" ILIKE ?)`, `%${q.q}%`, `%${q.q}%`, `%${q.q}%`);
    return this.db.q(`SELECT * FROM ${FACILITIES_SQL} ${w.sql} ORDER BY "stars" DESC NULLS LAST, "name"`, w.params);
  }

  @Get('facilities/:id')
  async facility(@Param('id') fid: string) {
    const f = await this.db.one(`SELECT * FROM ${FACILITIES_SQL} WHERE "id"=$1`, [fid]);
    if (!f) throw new NotFoundException();
    return f;
  }

  @Get('map')
  async map() {
    const [locations, permits, facilities] = await Promise.all([
      this.db.q(`SELECT * FROM map_locations`),
      this.db.q(`SELECT "id","operator","facility","lat","lng","status","municipality" FROM permits WHERE "lat" IS NOT NULL AND "lng" IS NOT NULL`),
      this.db.q(`SELECT "id","name","kind","stars","lat","lng","municipality" FROM ${FACILITIES_SQL} WHERE "lat" IS NOT NULL AND "lng" IS NOT NULL`),
    ]);
    return [
      ...locations.map((l: any) => ({ id: l.id, layer: l.layer, name: l.name, description: l.description, lat: l.lat, lng: l.lng, link: l.link })),
      ...permits.map((p: any) => ({ id: p.id, layer: 'DOZVOLA', name: p.operator, description: `${p.facility} · ${p.municipality}`, lat: p.lat, lng: p.lng, link: `/registri/okolisne-dozvole/${p.id}` })),
      ...facilities.map((f: any) => ({ id: f.id, layer: 'TURIZAM', name: f.name, description: `${f.kind}${f.stars ? ` · ${'★'.repeat(f.stars)}` : ''} · ${f.municipality}`, lat: f.lat, lng: f.lng, link: `/registri/ugostiteljski-objekti/${f.id}` })),
    ];
  }

  @Get('stats')
  async stats() {
    const c = (sql: string) => this.db.count(sql);
    const [posts, calls, documents, permits, permitsRenewal, facilities, locations] = await Promise.all([
      c(`SELECT count(*) n FROM posts WHERE ${PUBLISHED}`),
      c(`SELECT count(*) n FROM posts WHERE ${PUBLISHED} AND "type"='JAVNI_POZIV' AND ("deadline" IS NULL OR "deadline" >= now())`),
      c(`SELECT count(*) n FROM documents WHERE "postId" IS NULL AND "permitId" IS NULL AND ${PUBLIC_DOC}`),
      c(`SELECT count(*) n FROM permits`),
      c(`SELECT count(*) n FROM permits WHERE "status"='U_OBNOVI'`),
      c(`SELECT count(*) n FROM ${FACILITIES_SQL}`),
      c(`SELECT count(*) n FROM map_locations`),
    ]);
    return { posts, calls, documents, permits, permitsRenewal, facilities, locations };
  }
}
