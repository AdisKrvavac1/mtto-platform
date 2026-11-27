/**
 * F2-01: objave u CMS-u – urednički tok, verzije, zakazivanje i povlačenje.
 *
 *  NACRT ──submit──▶ NA_ODOBRENJU ──return──▶ VRACENO ──submit──▶ …
 *    │                    │
 *    └──publish/schedule──┴──▶ OBJAVLJENO / ZAKAZANO ──withdraw──▶ POVUCENO ──publish──▶ …
 *
 * Sadržaj se mijenja kroz PATCH (svaka izmjena = nova verzija); status samo kroz POST :id/workflow.
 * Saradnik piše i šalje na odobrenje; urednik i administrator objavljuju. Uz tenants.settings.fourEyes
 * urednik ne može sam odobriti objavu koju je napisao ili poslao na odobrenje (administrator može, uz upis u dnevnik).
 */
import { BadRequestException, Body, Controller, Delete, ForbiddenException, Get, Injectable, NotFoundException, OnModuleInit, Param, Patch, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Throttle } from '@nestjs/throttler';
import type { Response } from 'express';
import { Db, Where, currentTenant, id } from './db';
import { AuthGuard } from './auth';
import { AuditService } from './audit';
import { Can, can } from './rbac';
import { slugify, toDate } from './util';
import { logJson } from './observability';

export const POST_STATUS = ['NACRT', 'NA_ODOBRENJU', 'VRACENO', 'ZAKAZANO', 'OBJAVLJENO', 'POVUCENO'] as const;
const POST_TYPES = ['VIJEST', 'JAVNI_POZIV', 'SAOPCENJE'];
/** Polja koja čine sadržaj objave i ulaze u verziju. */
export const CONTENT_FIELDS = ['type', 'category', 'title', 'excerpt', 'body', 'coverImage', 'publishedAt', 'deadline', 'formUrl', 'unpublishAt'] as const;
const LIVE = ['OBJAVLJENO', 'ZAKAZANO'];

function postData(b: any) {
  const d: any = {};
  for (const k of ['type', 'category', 'title', 'excerpt', 'body', 'coverImage', 'formUrl', 'authorName']) {
    if (b[k] === undefined) continue;
    const nullable = k === 'coverImage' || k === 'formUrl';
    d[k] = b[k] === null || b[k] === '' ? (nullable ? null : '') : String(b[k]);
  }
  if (d.type && !POST_TYPES.includes(d.type)) throw new BadRequestException('Nepoznata vrsta objave');
  if (d.title !== undefined && !d.title.trim()) throw new BadRequestException('Naslov je obavezan');
  if (d.formUrl && !/^https:\/\//.test(d.formUrl)) throw new BadRequestException('Link na formu mora počinjati s https://');
  for (const k of ['publishedAt', 'deadline', 'unpublishAt']) if (b[k] !== undefined) d[k] = toDate(b[k]);
  return d;
}

const iso = (v: unknown) => (v instanceof Date ? v.toISOString() : v ?? null);
export function snapshotOf(p: any) {
  return Object.fromEntries(CONTENT_FIELDS.map((k) => [k, iso(p[k])]));
}
function sameContent(a: any, b: any) {
  return JSON.stringify(snapshotOf(a)) === JSON.stringify(snapshotOf(b));
}

type Action = 'submit' | 'return' | 'publish' | 'schedule' | 'withdraw' | 'draft';

@Controller('admin/posts')
@UseGuards(AuthGuard)
export class PostsController {
  constructor(private db: Db, private audit: AuditService, private jwt: JwtService) {}

  private async fourEyes(): Promise<boolean> {
    const t = await this.db.one<{ settings: any }>(`SELECT "settings" FROM tenants WHERE "id"=$1`, [currentTenant()]);
    return !!t?.settings?.fourEyes;
  }

  private async addVersion(p: any, req: any, note?: string) {
    const v = await this.db.one<{ n: number }>(`SELECT COALESCE(max("version"),0)+1 n FROM post_versions WHERE "postId"=$1`, [p.id]);
    const n = Number(v?.n ?? 1);
    await this.db.insert('post_versions', { id: id(), postId: p.id, version: n, status: p.status, snapshot: JSON.stringify(snapshotOf(p)), userId: req.user?.sub ?? null, userName: req.user?.name ?? 'Sistem', note: note ?? null }, `"id"`);
    await this.db.q(`UPDATE posts SET "version"=$2 WHERE "id"=$1`, [p.id, n]);
    return n;
  }

  @Get()
  @Can('objave', 'read')
  list(@Query() q: any) {
    const w = new Where();
    if (q.status) w.add(`"status"=?`, q.status);
    if (q.type) w.add(`"type"=?`, q.type);
    if (q.q) w.add(`"title" ILIKE ?`, `%${q.q}%`);
    return this.db.q(`SELECT "id","slug","title","excerpt","status","type","category","publishedAt","unpublishAt","updatedAt","views","authorName","coverImage","isDemo","version" FROM posts ${w.sql} ORDER BY "updatedAt" DESC LIMIT 200`, w.params);
  }

  @Get(':id')
  @Can('objave', 'read')
  async get(@Param('id') postId: string) {
    const p = await this.db.one(`SELECT * FROM posts WHERE "id"=$1`, [postId]);
    if (!p) throw new NotFoundException();
    p.documents = await this.db.q(`SELECT "id","title","fileName","size","docType" FROM documents WHERE "postId"=$1 ORDER BY "createdAt"`, [postId]);
    p.fourEyes = await this.fourEyes();
    return p;
  }

  /** Nova objava je uvijek nacrt; objavljuje se radnjom publish. */
  @Post()
  @Can('objave', 'write')
  async create(@Body() b: any, @Req() req: any) {
    if (!b?.title?.trim()) throw new BadRequestException('Naslov je obavezan');
    const data = postData(b);
    let slug = slugify(b.slug || b.title) || `objava-${Date.now()}`;
    if (await this.db.one(`SELECT 1 FROM posts WHERE "slug"=$1`, [slug])) slug = `${slug}-${Date.now().toString(36)}`;
    const p = await this.db.insert('posts', { id: id(), ...data, status: 'NACRT', slug, createdBy: req.user.sub, authorName: data.authorName ?? req.user?.name ?? 'Uredništvo MTTO' });
    p.version = await this.addVersion(p, req, 'Kreiran nacrt');
    await this.audit.log(req, { action: 'Kreirao/la nacrt', entity: 'objava', entityId: p.id, target: p.title, after: snapshotOf(p) });
    return p;
  }

  /** Izmjena sadržaja. Objavljenu ili zakazanu objavu mijenja samo urednik; objava na odobrenju je zaključana za autora. */
  @Patch(':id')
  @Can('objave', 'write')
  async update(@Param('id') postId: string, @Body() b: any, @Req() req: any) {
    if (b?.status !== undefined) throw new BadRequestException('Status se mijenja radnjama (pošalji na odobrenje, objavi, povuci…).');
    const before = await this.db.one(`SELECT * FROM posts WHERE "id"=$1`, [postId]);
    if (!before) throw new NotFoundException();
    const publisher = can(req.user.role, 'objave', 'publish');
    if ((LIVE.includes(before.status) || before.status === 'POVUCENO') && !publisher) throw new ForbiddenException('Objavljenu objavu mijenja urednik.');
    if (before.status === 'NA_ODOBRENJU' && !publisher) throw new ForbiddenException('Objava čeka odobrenje i ne može se mijenjati. Urednik je može vratiti na doradu.');
    const p = await this.db.update('posts', postId, postData(b), true);
    if (!sameContent(before, p)) {
      p.version = await this.addVersion(p, req, b?.versionNote ? String(b.versionNote).slice(0, 200) : undefined);
      await this.audit.log(req, { action: LIVE.includes(p.status) ? 'Uredio/la objavljenu objavu' : 'Uredio/la nacrt', entity: 'objava', entityId: postId, target: p.title, before: snapshotOf(before), after: snapshotOf(p) });
    }
    return p;
  }

  /** Promjena statusa. */
  @Post(':id/workflow')
  @Can('objave', 'write')
  async workflow(@Param('id') postId: string, @Body() b: { action?: Action; note?: string; publishedAt?: string }, @Req() req: any) {
    const p = await this.db.one<any>(`SELECT * FROM posts WHERE "id"=$1`, [postId]);
    if (!p) throw new NotFoundException();
    const action = b?.action;
    const note = String(b?.note ?? '').trim().slice(0, 1000);
    const publisher = can(req.user.role, 'objave', 'publish');
    const needPublisher = () => { if (!publisher) throw new ForbiddenException('Ovu radnju može uraditi urednik.'); };
    const from = (...s: string[]) => { if (!s.includes(p.status)) throw new BadRequestException(`Radnja nije moguća iz statusa ${p.status}.`); };
    let set: Record<string, any> = {};
    let label = '';

    switch (action) {
      case 'submit':
        from('NACRT', 'VRACENO');
        set = { status: 'NA_ODOBRENJU', submittedBy: req.user.sub, submittedAt: new Date(), reviewNote: null };
        label = 'Poslao/la objavu na odobrenje';
        break;
      case 'return':
        needPublisher(); from('NA_ODOBRENJU');
        if (note.length < 3) throw new BadRequestException('Napišite autoru šta treba doraditi.');
        set = { status: 'VRACENO', reviewNote: note };
        label = 'Vratio/la objavu na doradu';
        break;
      case 'draft':
        from('VRACENO', 'POVUCENO', 'ZAKAZANO');
        if (p.status !== 'VRACENO') needPublisher();
        set = { status: 'NACRT' };
        label = 'Vratio/la objavu u nacrt';
        break;
      case 'publish':
      case 'schedule': {
        needPublisher(); from('NACRT', 'NA_ODOBRENJU', 'VRACENO', 'ZAKAZANO', 'POVUCENO');
        const author = [p.createdBy, p.submittedBy].includes(req.user.sub);
        if (author && req.user.role !== 'ADMIN' && (await this.fourEyes())) {
          throw new ForbiddenException('Pravilo četiri oka: objavu koju ste napisali ili poslali na odobrenje mora odobriti drugi urednik.');
        }
        const when = b?.publishedAt ? toDate(b.publishedAt) : action === 'schedule' ? p.publishedAt : null;
        if (action === 'schedule') {
          if (!when || when <= new Date()) throw new BadRequestException('Za zakazivanje odaberite budući datum i sat objave.');
          set = { status: 'ZAKAZANO', publishedAt: when };
          label = `Zakazao/la objavu za ${when.toISOString().slice(0, 16).replace('T', ' ')} UTC`;
        } else {
          set = { status: 'OBJAVLJENO', publishedAt: p.publishedAt && new Date(p.publishedAt) <= new Date() ? p.publishedAt : new Date() };
          label = p.status === 'POVUCENO' ? 'Ponovo objavio/la povučenu objavu' : 'Objavio/la objavu';
        }
        if (p.unpublishAt && new Date(p.unpublishAt) <= new Date(set.publishedAt)) throw new BadRequestException('Datum automatskog povlačenja mora biti poslije datuma objave.');
        Object.assign(set, { approvedBy: req.user.sub, approvedAt: new Date(), reviewNote: null, withdrawnReason: null });
        if (author && req.user.role === 'ADMIN' && (await this.fourEyes())) label += ' (administrator, bez drugog odobrenja)';
        break;
      }
      case 'withdraw':
        needPublisher(); from('OBJAVLJENO', 'ZAKAZANO');
        if (note.length < 3) throw new BadRequestException('Navedite razlog povlačenja (upisuje se u dnevnik).');
        set = { status: 'POVUCENO', withdrawnReason: note };
        label = 'Povukao/la objavu s portala';
        break;
      default:
        throw new BadRequestException('Nepoznata radnja.');
    }

    const cols = Object.keys(set);
    const u = await this.db.one(`UPDATE posts SET ${cols.map((k, i) => `"${k}"=$${i + 2}`).join(',')}, "updatedAt"=now() WHERE "id"=$1 RETURNING *`, [postId, ...Object.values(set)]);
    u.version = await this.addVersion(u, req, note ? `${label}: ${note}` : label);
    await this.audit.log(req, { action: label, entity: 'objava', entityId: postId, target: u.title, before: { status: p.status }, after: { status: u.status, ...(note ? { napomena: note } : {}) } });
    return u;
  }

  @Get(':id/versions')
  @Can('objave', 'read')
  versions(@Param('id') postId: string) {
    return this.db.q(`SELECT "version","status","userName","note","createdAt" FROM post_versions WHERE "postId"=$1 ORDER BY "version" DESC LIMIT 200`, [postId]);
  }

  @Get(':id/versions/:v')
  @Can('objave', 'read')
  async version(@Param('id') postId: string, @Param('v') v: string) {
    const r = await this.db.one(`SELECT "version","status","userName","note","createdAt","snapshot" FROM post_versions WHERE "postId"=$1 AND "version"=$2`, [postId, Number(v)]);
    if (!r) throw new NotFoundException();
    return r;
  }

  /** Vraća sadržaj iz stare verzije (status se ne mijenja; nastaje nova verzija). */
  @Post(':id/versions/:v/restore')
  @Can('objave', 'write')
  async restore(@Param('id') postId: string, @Param('v') v: string, @Req() req: any) {
    const old = await this.version(postId, v);
    const r = await this.update(postId, { ...old.snapshot, versionNote: `Vraćen sadržaj iz verzije ${old.version}` }, req);
    return r;
  }

  /**
   * F2-02: link za pregled prije objave. Važi 72 sata, prikazuje trenutni sadržaj bez obzira na status,
   * stranica ima noindex. Može se proslijediti nekome bez naloga (npr. šefu sektora) na provjeru.
   */
  @Post(':id/preview-link')
  @Can('objave', 'read')
  async previewLink(@Param('id') postId: string, @Req() req: any) {
    const p = await this.db.one<any>(`SELECT "id","title" FROM posts WHERE "id"=$1`, [postId]);
    if (!p) throw new NotFoundException();
    const hours = 72;
    const token = await this.jwt.signAsync({ purpose: 'preview', pid: p.id, tid: currentTenant() }, { expiresIn: `${hours}h` });
    await this.audit.log(req, { action: 'Napravio/la link za pregled prije objave', entity: 'objava', entityId: p.id, target: p.title });
    const base = (process.env.PUBLIC_URL || '').replace(/\/$/, '');
    return { url: `${base}/pregled/${token}`, expiresAt: new Date(Date.now() + hours * 3600_000).toISOString() };
  }

  @Delete(':id')
  @Can('objave', 'delete')
  async remove(@Param('id') postId: string, @Req() req: any) {
    const p = await this.db.one(`DELETE FROM posts WHERE "id"=$1 RETURNING *`, [postId]);
    if (!p) throw new NotFoundException();
    await this.audit.log(req, { action: 'Obrisao/la objavu', entity: 'objava', entityId: postId, target: p.title, before: snapshotOf(p), after: null });
    return { ok: true };
  }
}

/**
 * Svake minute: zakazane objave kojima je došlo vrijeme postaju OBJAVLJENO, a objavljene kojima je istekao
 * datum automatskog povlačenja postaju POVUCENO. Portal ih ionako prikazuje/skriva po datumima; ovo drži
 * statuse tačnim u CMS-u i upisuje promjenu u dnevnik institucije.
 */
@Injectable()
export class PostScheduler implements OnModuleInit {
  constructor(private db: Db, private audit: AuditService) {}
  onModuleInit() {
    if (process.env.NODE_ENV === 'test') return;
    setInterval(() => this.tick().catch((e) => logJson('error', 'Raspored objava nije uspio', { error: e?.message })), 60_000).unref();
  }
  async tick() {
    await this.db.system(() => this.db.withLock(727004, async () => {
      const pub = await this.db.q(`UPDATE posts SET "status"='OBJAVLJENO', "updatedAt"=now() WHERE "status"='ZAKAZANO' AND "publishedAt" <= now() RETURNING "id","title","tenantId"`);
      const wd = await this.db.q(`UPDATE posts SET "status"='POVUCENO', "withdrawnReason"='Automatsko povlačenje (zadani datum)', "updatedAt"=now() WHERE "status"='OBJAVLJENO' AND "unpublishAt" IS NOT NULL AND "unpublishAt" <= now() RETURNING "id","title","tenantId"`);
      for (const [rows, action] of [[pub, 'Zakazana objava je objavljena'], [wd, 'Objava je automatski povučena']] as const) {
        for (const r of rows) await this.audit.log(null, { action, entity: 'objava', entityId: r.id, target: r.title, tenantId: r.tenantId }, { name: 'Sistem (raspored)' });
      }
    }));
  }
}

/** Javni pregled objave preko potpisanog linka (bez prijave). */
@Controller('preview')
export class PreviewController {
  constructor(private db: Db, private jwt: JwtService) {}

  @Get(':token')
  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  async preview(@Param('token') token: string, @Res({ passthrough: true }) res: Response) {
    let t: { purpose?: string; pid?: string; tid?: string; exp?: number };
    try { t = await this.jwt.verifyAsync(token); } catch { throw new NotFoundException('Link za pregled nije ispravan ili je istekao.'); }
    if (t.purpose !== 'preview' || !t.pid || t.tid !== currentTenant()) throw new NotFoundException('Link za pregled nije ispravan ili je istekao.');
    const post = await this.db.one<any>(`SELECT * FROM posts WHERE "id"=$1`, [t.pid]);
    if (!post) throw new NotFoundException('Objava više ne postoji.');
    post.documents = await this.db.q(`SELECT "id","title","docType","sector","number","issuedAt","status","description","fileName","mimeType","size","downloads","isDemo","postId","permitId","createdAt" FROM documents WHERE "postId"=$1 AND "disposedAt" IS NULL ORDER BY "createdAt"`, [post.id]);
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Robots-Tag', 'noindex, nofollow');
    for (const k of ['createdBy', 'submittedBy', 'approvedBy', 'reviewNote']) delete post[k];
    return { ...post, previewExpiresAt: t.exp ? new Date(t.exp * 1000).toISOString() : null };
  }
}
