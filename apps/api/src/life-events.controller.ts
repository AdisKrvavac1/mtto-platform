/** F2-08: životne situacije (javno i CMS). Uređuju urednici objava; „provjereno“ potvrđuje urednik ili administrator. */
import { BadRequestException, Body, Controller, Delete, Get, NotFoundException, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { Db, id } from './db';
import { AuthGuard } from './auth';
import { Can, can } from './rbac';
import { AuditService } from './audit';
import { slugify } from './util';

type Link = { label: string; url: string };
type Step = { title: string; text: string; links: Link[] };
export type LifeEvent = {
  id: string; slug: string; audience: 'GRADJANI' | 'PRIVREDA'; title: string; summary: string; icon: string; sector: string | null;
  steps: Step[]; links: Link[]; contact: string; keywords: string; position: number; published: boolean; verified: boolean; updatedAt: Date;
};

const URL_OK = /^(\/[^\s]*|https:\/\/[^\s]+)$/;
function links(v: unknown, where: string): Link[] {
  if (v == null) return [];
  if (!Array.isArray(v) || v.length > 12) throw new BadRequestException(`${where}: najviše 12 linkova`);
  return v.map((l: any) => ({ label: String(l?.label ?? '').trim().slice(0, 120), url: String(l?.url ?? '').trim().slice(0, 500) })).filter((l) => l.label || l.url).map((l) => {
    if (!l.label || !URL_OK.test(l.url)) throw new BadRequestException(`${where}: link „${l.label || l.url}“ treba naziv i adresu koja počinje s / ili https://`);
    return l;
  });
}
export function cleanSteps(v: unknown): Step[] {
  if (!Array.isArray(v) || v.length > 20) throw new BadRequestException('Koraci: najviše 20');
  return v.map((s: any, i) => {
    const title = String(s?.title ?? '').trim().slice(0, 200);
    if (!title) throw new BadRequestException(`Korak ${i + 1}: naslov je obavezan`);
    return { title, text: String(s?.text ?? '').trim().slice(0, 3000), links: links(s?.links, `Korak ${i + 1}`) };
  });
}

@Controller('life-events')
export class PublicLifeEventsController {
  constructor(private db: Db) {}

  @Get()
  async list() {
    return this.db.q(`SELECT "slug","audience","title","summary","icon","sector","verified", jsonb_array_length("steps") "stepCount" FROM life_events WHERE "published" ORDER BY "position","title"`);
  }

  @Get(':slug')
  async one(@Param('slug') slug: string) {
    const e = await this.db.one<LifeEvent>(`SELECT * FROM life_events WHERE "slug"=$1 AND "published"`, [slug]);
    if (!e) throw new NotFoundException('Životna situacija nije pronađena');
    const { id: _id, keywords: _k, position: _p, published: _pb, ...pub } = e;
    const related = await this.db.q(`SELECT "slug","title","icon" FROM life_events WHERE "published" AND "slug"<>$1 AND ("audience"=$2 OR "sector" IS NOT DISTINCT FROM $3) ORDER BY ("sector" IS NOT DISTINCT FROM $3) DESC, "position" LIMIT 3`, [slug, e.audience, e.sector]);
    return { ...pub, steps: (e.steps ?? []).map((s) => ({ ...s, links: s.links ?? [] })), links: e.links ?? [], related };
  }
}

@Controller('admin/life-events')
@UseGuards(AuthGuard)
export class LifeEventsController {
  constructor(private db: Db, private audit: AuditService) {}

  @Get()
  @Can('objave', 'read')
  list() { return this.db.q(`SELECT "id","slug","audience","title","icon","sector","published","verified","position","updatedAt", jsonb_array_length("steps") "stepCount" FROM life_events ORDER BY "position","title"`); }

  @Get(':id')
  @Can('objave', 'read')
  async one(@Param('id') eid: string) { return this.get(eid); }

  @Post()
  @Can('objave', 'write')
  async create(@Body() b: any, @Req() req: any) {
    const d = this.data(b, req, null);
    if (!d.title) throw new BadRequestException('Naslov je obavezan');
    let slug = slugify(b.slug || d.title);
    if (await this.db.one(`SELECT 1 FROM life_events WHERE "slug"=$1`, [slug])) slug = `${slug}-${Date.now().toString(36)}`;
    const pos = await this.db.one<{ n: number }>(`SELECT coalesce(max("position"),0)+1 n FROM life_events`);
    const e = await this.db.insert<LifeEvent>('life_events', { id: id(), slug, position: pos!.n, published: false, verified: false, steps: '[]', links: '[]', ...d });
    await this.audit.log(req, { action: 'Kreirao/la životnu situaciju', entity: 'objave', entityId: e.id, target: e.title });
    return e;
  }

  @Patch(':id')
  @Can('objave', 'write')
  async update(@Param('id') eid: string, @Body() b: any, @Req() req: any) {
    const before = await this.get(eid);
    const d = this.data(b, req, before);
    const after = await this.db.update<LifeEvent>('life_events', eid, d, true);
    await this.audit.log(req, { action: d.verified === true && !before.verified ? 'Potvrdio/la sadržaj životne situacije' : 'Uredio/la životnu situaciju', entity: 'objave', entityId: eid, target: after!.title, before, after });
    return after;
  }

  @Delete(':id')
  @Can('objave', 'delete')
  async remove(@Param('id') eid: string, @Req() req: any) {
    const e = await this.get(eid);
    await this.db.q(`DELETE FROM life_events WHERE "id"=$1`, [eid]);
    await this.audit.log(req, { action: 'Obrisao/la životnu situaciju', entity: 'objave', entityId: eid, target: e.title, before: e });
    return { ok: true };
  }

  private async get(eid: string) {
    const e = await this.db.one<LifeEvent>(`SELECT * FROM life_events WHERE "id"=$1`, [eid]);
    if (!e) throw new NotFoundException('Životna situacija nije pronađena');
    return { ...e, steps: (e.steps ?? []).map((s) => ({ ...s, links: s.links ?? [] })) };
  }

  private data(b: any, req: any, before: LifeEvent | null) {
    const d: Record<string, any> = {};
    for (const k of ['title', 'summary', 'icon', 'contact', 'keywords'] as const) if (b[k] !== undefined) d[k] = String(b[k] ?? '').trim().slice(0, k === 'summary' ? 600 : 300);
    if (b.sector !== undefined) d.sector = b.sector ? String(b.sector) : null;
    if (b.audience !== undefined) { if (!['GRADJANI', 'PRIVREDA'].includes(b.audience)) throw new BadRequestException('Publika: građani ili privreda'); d.audience = b.audience; }
    if (b.position !== undefined) d.position = Math.max(0, Math.min(999, parseInt(b.position, 10) || 0));
    if (b.steps !== undefined) d.steps = JSON.stringify(cleanSteps(b.steps));
    if (b.links !== undefined) d.links = JSON.stringify(links(b.links, 'Povezano'));
    if (b.published !== undefined) d.published = !!b.published;
    if (b.verified !== undefined && !!b.verified !== before?.verified) {
      if (!can(req.user?.role, 'objave', 'publish')) throw new BadRequestException('Sadržaj potvrđuje urednik ili administrator.');
      d.verified = !!b.verified;
    }
    if (d.title !== undefined && !d.title) throw new BadRequestException('Naslov je obavezan');
    return d;
  }
}
