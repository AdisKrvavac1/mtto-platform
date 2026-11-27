/**
 * F2-22: sektori i opseg uređivanja.
 * Korisnik s dodijeljenim sektorima mijenja, objavljuje i briše samo sadržaj tih sektora; sve ostalo samo čita.
 * Administrator i korisnik bez dodijeljenih sektora rade nad svim sektorima.
 */
import { BadRequestException, Body, Controller, ForbiddenException, Get, NotFoundException, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { Db, id } from './db';
import { AuthGuard } from './auth';
import { AuditService } from './audit';
import { Can } from './rbac';
import { slugify } from './util';

export type Sector = { id: string; key: string; name: string; active: boolean; sort: number };
type U = { role: string; sectors?: string[] };

/** Ima li korisnik pravo na sadržaj sektora (ključ = posts.category). */
export function inScope(u: U, key: string | null | undefined): boolean {
  if (u.role === 'ADMIN' || !u.sectors?.length) return true;
  return !!key && u.sectors.includes(key);
}

export function assertScope(u: U, key: string | null | undefined, what = 'sadržaj') {
  if (!inScope(u, key)) throw new ForbiddenException({ statusCode: 403, code: 'OUT_OF_SECTOR', message: `Možete mijenjati samo ${what} svojih sektora (${(u.sectors ?? []).join(', ')}).` });
}

export async function sectors(db: Db): Promise<Sector[]> {
  return db.q<Sector>(`SELECT "id","key","name","active","sort" FROM sectors ORDER BY "sort","name"`);
}

/** Ključ sektora za naziv iz documents.sector (ili sam ključ). */
export async function keyForName(db: Db, name: string | null | undefined): Promise<string | null> {
  if (!name) return null;
  const r = await db.one<{ key: string }>(`SELECT "key" FROM sectors WHERE "name"=$1 OR "key"=$1 LIMIT 1`, [name]);
  return r?.key ?? name;
}

@Controller('admin/sectors')
@UseGuards(AuthGuard)
export class SectorsController {
  constructor(private db: Db, private audit: AuditService) {}

  @Get()
  @Can('kontrolna', 'read')
  list() { return sectors(this.db); }

  @Post()
  @Can('korisnici', 'write')
  async create(@Body() b: any, @Req() req: any) {
    const name = String(b?.name ?? '').trim();
    if (name.length < 2) throw new BadRequestException('Unesite naziv sektora.');
    const key = String(b?.key ?? '').trim() || name;
    if (await this.db.one(`SELECT 1 FROM sectors WHERE "key"=$1 OR "name"=$2`, [key, name])) throw new BadRequestException('Sektor s tim nazivom već postoji.');
    const max = await this.db.one<{ n: number }>(`SELECT COALESCE(max("sort"),0)+1 n FROM sectors`);
    const s = await this.db.insert('sectors', { id: `${slugify(key) || 'sektor'}-${id().slice(0, 8)}`, key, name, sort: Number(max?.n ?? 1) });
    await this.audit.log(req, { action: 'Dodao/la sektor', entity: 'postavke', entityId: s.id, target: name, after: { key, name } });
    return s;
  }

  /** Mijenja se naziv i aktivnost; ključ ostaje (veže objave i korisnike). */
  @Patch(':id')
  @Can('korisnici', 'write')
  async update(@Param('id') sid: string, @Body() b: any, @Req() req: any) {
    const before = await this.db.one<Sector>(`SELECT * FROM sectors WHERE "id"=$1`, [sid]);
    if (!before) throw new NotFoundException();
    const d: any = {};
    if (b.name !== undefined) { const n = String(b.name).trim(); if (n.length < 2) throw new BadRequestException('Unesite naziv sektora.'); d.name = n; }
    if (b.active !== undefined) d.active = !!b.active;
    if (b.sort !== undefined) d.sort = Number(b.sort) || 0;
    const s = await this.db.update<Sector>('sectors', sid, d);
    if (d.name && d.name !== before.name) await this.db.q(`UPDATE documents SET "sector"=$2 WHERE "sector"=$1`, [before.name, d.name]);
    await this.audit.log(req, { action: 'Uredio/la sektor', entity: 'postavke', entityId: sid, target: s!.name, before, after: s });
    return s;
  }
}
