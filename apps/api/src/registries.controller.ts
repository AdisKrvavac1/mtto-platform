/**
 * F2-04: registry builder – registri, zapisi, CSV uvoz/izvoz i javni API.
 *
 * Prava: shemu registra (polja, javnost) mijenja korisnik s pravom registri:publish (administrator);
 * zapise unosi registri:write (referent), briše registri:delete. Zapisi registra vezanog za sektor
 * mijenjaju se samo u opsegu tog sektora (F2-22). Svaka promjena ide u dnevnik.
 */
import {
  BadRequestException, Body, Controller, Delete, Get, Header, NotFoundException, Param, Patch, Post, Query, Req, Res,
  UploadedFile, UseGuards, UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Throttle } from '@nestjs/throttler';
import type { Response } from 'express';
import { Db, Where, id } from './db';
import { AuthGuard } from './auth';
import { AuditService } from './audit';
import { Can } from './rbac';
import { assertScope } from './sectors';
import { slugify, toInt } from './util';
import {
  Field, FieldError, MAX_IMPORT_ROWS, SchemaError, mapHeader, normalizeFields, parseCoord, parseCsv, publicData, publicFields,
  searchText, toCsv, validateEntry,
} from './registry-core';

export type Registry = {
  id: string; slug: string; name: string; description: string; sector: string | null; fields: Field[]; titleField: string | null;
  geo: boolean; public: boolean; legalBasis: string; isDemo: boolean; createdAt: string; updatedAt: string;
};
type Entry = { id: string; registryId: string; data: Record<string, any>; lat: number | null; lng: number | null; status: string; isDemo: boolean; createdAt: string; updatedAt: string };

/**
 * F2-13: registar smještaja u starom obliku „facilities“ (za postojeće stranice, kartu i statistiku).
 * Samo aktivni zapisi javnog registra „ugostiteljski-objekti“.
 */
const int = (k: string) => `CASE WHEN e."data"->>'${k}' ~ '^[0-9]+$' THEN (e."data"->>'${k}')::int END`;
export const FACILITIES_SQL = `(SELECT e."id", e."data"->>'naziv' "name", e."data"->>'vrsta' "kind", ${int('kategorija')} "stars",
  e."data"->>'opcina' "municipality", COALESCE(e."data"->>'adresa','') "address", ${int('jedinice')} "rooms", ${int('lezaji')} "beds",
  e."data"->>'rjesenje' "decisionNumber", e."data"->>'datumRjesenja' "decisionDate", e."data"->>'vrijediDo' "validUntil",
  e."data"->>'status' "categoryStatus", e."lat", e."lng", e."isDemo", e."createdAt", e."updatedAt"
  FROM registry_entries e JOIN registries r ON r."id"=e."registryId"
  WHERE r."slug"='ugostiteljski-objekti' AND r."public" AND e."status"='AKTIVAN') f`;

const RESERVED_SLUGS = new Set(['okolisne-dozvole', 'upravljanje-otpadom']);
const MAX_CSV = 2 * 1024 * 1024;

function badSchema(e: unknown): never {
  if (e instanceof SchemaError) throw new BadRequestException(e.message);
  throw e;
}

/** Greške zapisa kao odgovor 400 s listom po polju (sučelje ih prikazuje uz polja). */
function invalid(errors: FieldError[]): never {
  throw new BadRequestException({ statusCode: 400, code: 'INVALID_ENTRY', message: errors.map((e) => `${e.label}: ${e.message}`).join('; '), errors });
}

function coords(reg: Registry, b: any): { lat: number | null; lng: number | null } | undefined {
  if (!reg.geo || (b.lat === undefined && b.lng === undefined)) return undefined;
  const lat = parseCoord(b.lat, 90), lng = parseCoord(b.lng, 180);
  if (lat === 'error' || lng === 'error') throw new BadRequestException('Koordinate nisu ispravne.');
  if ((lat === null) !== (lng === null)) throw new BadRequestException('Unesite obje koordinate ili nijednu.');
  return { lat, lng };
}

export class RegistryRepo {
  constructor(private db: Db) {}

  async bySlug(slug: string) { return this.db.one<Registry>(`SELECT * FROM registries WHERE "slug"=$1`, [slug]); }
  async byId(rid: string) {
    const r = await this.db.one<Registry>(`SELECT * FROM registries WHERE "id"=$1`, [rid]);
    if (!r) throw new NotFoundException('Registar nije pronađen.');
    return r;
  }

  /** Ponavlja li se jedinstvena vrijednost u drugom zapisu istog registra. */
  async duplicates(reg: Registry, data: Record<string, any>, exceptId?: string): Promise<FieldError[]> {
    const out: FieldError[] = [];
    for (const f of reg.fields.filter((x) => x.unique && data[x.key] !== undefined)) {
      const hit = await this.db.one(
        `SELECT 1 FROM registry_entries WHERE "registryId"=$1 AND lower("data"->>$2)=lower($3) AND "id"<>$4 LIMIT 1`,
        [reg.id, f.key, String(data[f.key]), exceptId ?? ''],
      );
      if (hit) out.push({ field: f.key, label: f.label, message: `vrijednost „${data[f.key]}“ već postoji u registru` });
    }
    return out;
  }

  /** Lista zapisa s pretragom, filterima po poljima i stranicama. */
  async entries(reg: Registry, q: any, opts: { publicOnly: boolean; max?: number }) {
    const w = new Where();
    w.add(`"registryId"=?`, reg.id);
    if (opts.publicOnly) w.add(`"status"='AKTIVAN'`);
    else if (q.status) w.add(`"status"=?`, String(q.status));
    if (q.q) w.add(`"searchText" LIKE ?`, `%${String(q.q).toLowerCase().slice(0, 100)}%`);
    const fields = opts.publicOnly ? publicFields(reg.fields) : reg.fields;
    for (const f of fields) {
      const v = q[`f.${f.key}`];
      if (v === undefined || v === '' || !(f.filter || !opts.publicOnly)) continue;
      if (!['select', 'boolean', 'integer', 'text'].includes(f.type)) continue;
      const val = f.type === 'boolean' ? ['da', 'true', '1'].includes(String(v).toLowerCase()) : f.type === 'integer' ? Number(v) : String(v);
      w.add(`"data" @> ?::jsonb`, JSON.stringify({ [f.key]: val }));
    }
    const limit = Math.min(toInt(q.limit, 50), opts.max ?? (opts.publicOnly ? 500 : 200));
    const page = toInt(q.page, 1);
    const sortField = fields.find((f) => f.key === q.sort) ?? fields.find((f) => f.key === reg.titleField);
    const dir = q.dir === 'desc' ? 'DESC' : 'ASC';
    const numeric = sortField && ['number', 'integer'].includes(sortField.type);
    const order = sortField
      ? `${numeric ? `("data"->>'${sortField.key}')::numeric` : `lower("data"->>'${sortField.key}')`} ${dir} NULLS LAST, "createdAt" DESC`
      : `"createdAt" DESC`;
    const [rows, total] = await Promise.all([
      this.db.q<Entry>(`SELECT * FROM registry_entries ${w.sql} ORDER BY ${order} LIMIT ${limit} OFFSET ${(page - 1) * limit}`, w.params),
      this.db.count(`SELECT count(*) n FROM registry_entries ${w.sql}`, w.params),
    ]);
    return { rows, total, page, limit };
  }
}

const shapePublic = (reg: Registry, e: Entry) => ({
  id: e.id, data: publicData(reg.fields, e.data), ...(reg.geo ? { lat: e.lat, lng: e.lng } : {}), isDemo: e.isDemo, updatedAt: e.updatedAt,
});
const metaPublic = (reg: Registry, count?: number) => ({
  slug: reg.slug, name: reg.name, description: reg.description, sector: reg.sector, legalBasis: reg.legalBasis, geo: reg.geo,
  titleField: reg.titleField, fields: publicFields(reg.fields), isDemo: reg.isDemo, updatedAt: reg.updatedAt, ...(count !== undefined ? { count } : {}),
});

/* ───────── CMS ───────── */

@Controller('admin/registries')
@UseGuards(AuthGuard)
export class RegistriesController {
  private repo: RegistryRepo;
  constructor(private db: Db, private audit: AuditService) { this.repo = new RegistryRepo(db); }

  @Get()
  @Can('registri', 'read')
  list() {
    return this.db.q(`SELECT r.*, (SELECT count(*)::int FROM registry_entries e WHERE e."registryId"=r."id" AND e."status"='AKTIVAN') "count",
      (SELECT max(e."updatedAt") FROM registry_entries e WHERE e."registryId"=r."id") "lastEntryAt"
      FROM registries r ORDER BY r."name"`);
  }

  @Get(':id')
  @Can('registri', 'read')
  get(@Param('id') rid: string) { return this.repo.byId(rid); }

  private async settings(b: any, before?: Registry) {
    const d: any = {};
    if (b.name !== undefined || !before) {
      const n = String(b.name ?? '').trim();
      if (n.length < 3) throw new BadRequestException('Unesite naziv registra.');
      d.name = n.slice(0, 160);
    }
    if (!before) {
      const slug = slugify(String(b.slug ?? '') || d.name);
      if (!slug || RESERVED_SLUGS.has(slug)) throw new BadRequestException('Adresa registra nije dostupna.');
      if (await this.repo.bySlug(slug)) throw new BadRequestException(`Registar s adresom „${slug}“ već postoji.`);
      d.slug = slug;
    }
    if (b.description !== undefined) d.description = String(b.description).slice(0, 1000);
    if (b.legalBasis !== undefined) d.legalBasis = String(b.legalBasis).slice(0, 500);
    if (b.sector !== undefined) d.sector = b.sector ? String(b.sector) : null;
    if (b.geo !== undefined) d.geo = !!b.geo;
    if (b.public !== undefined) d.public = !!b.public;
    if (b.fields !== undefined || !before) {
      let fields: Field[];
      try { fields = normalizeFields(b.fields); } catch (e) { badSchema(e); }
      if (!fields.some((f) => f.public) && (d.public ?? before?.public)) throw new BadRequestException('Javni registar mora imati barem jedno javno polje.');
      d.fields = JSON.stringify(fields);
      const title = String(b.titleField ?? before?.titleField ?? '');
      d.titleField = fields.find((f) => f.key === title)?.key ?? fields.find((f) => f.type === 'text')?.key ?? fields[0].key;
    } else if (b.titleField !== undefined) {
      if (!before!.fields.some((f) => f.key === b.titleField)) throw new BadRequestException('Naslovno polje ne postoji.');
      d.titleField = b.titleField;
    }
    return d;
  }

  @Post()
  @Can('registri', 'publish')
  async create(@Body() b: any, @Req() req: any) {
    const d = await this.settings(b ?? {});
    const r = await this.db.insert<Registry>('registries', { id: id(), ...d });
    await this.audit.log(req, { action: 'Kreirao/la registar', entity: 'registri', entityId: r.id, target: r.name, after: { ...d, fields: JSON.parse(d.fields) } });
    return r;
  }

  @Patch(':id')
  @Can('registri', 'publish')
  async update(@Param('id') rid: string, @Body() b: any, @Req() req: any) {
    const before = await this.repo.byId(rid);
    const d = await this.settings(b ?? {}, before);
    const r = await this.db.update<Registry>('registries', rid, d, true);
    // polje koje je postalo dio pretrage ili jedinstveno: osvježi indeks pretrage
    if (d.fields) {
      const rows = await this.db.q<Entry>(`SELECT "id","data" FROM registry_entries WHERE "registryId"=$1`, [rid]);
      for (const e of rows) await this.db.q(`UPDATE registry_entries SET "searchText"=$2 WHERE "id"=$1`, [e.id, searchText(r!.fields, e.data, r!.titleField)]);
    }
    await this.audit.log(req, { action: 'Uredio/la registar', entity: 'registri', entityId: rid, target: r!.name, before, after: r });
    return r;
  }

  @Delete(':id')
  @Can('registri', 'publish')
  async remove(@Param('id') rid: string, @Req() req: any) {
    const reg = await this.repo.byId(rid);
    const n = await this.db.count(`SELECT count(*) n FROM registry_entries WHERE "registryId"=$1`, [rid]);
    if (n > 0) throw new BadRequestException(`Registar ima ${n} zapisa. Prvo ih obrišite ili registar sakrijte s portala.`);
    await this.db.q(`DELETE FROM registries WHERE "id"=$1`, [rid]);
    await this.audit.log(req, { action: 'Obrisao/la registar', entity: 'registri', entityId: rid, target: reg.name, before: reg });
    return { ok: true };
  }

  /* ── zapisi ── */

  @Get(':id/entries')
  @Can('registri', 'read')
  async entries(@Param('id') rid: string, @Query() q: any) {
    const reg = await this.repo.byId(rid);
    const r = await this.repo.entries(reg, q, { publicOnly: false });
    return { items: r.rows, total: r.total, page: r.page, limit: r.limit };
  }

  @Post(':id/entries')
  @Can('registri', 'write')
  async createEntry(@Param('id') rid: string, @Body() b: any, @Req() req: any) {
    const reg = await this.repo.byId(rid);
    assertScope(req.user, reg.sector, 'registre');
    const { data, errors } = validateEntry(reg.fields, b?.data ?? {});
    errors.push(...(await this.repo.duplicates(reg, data)));
    if (errors.length) invalid(errors);
    const c = coords(reg, b ?? {}) ?? { lat: null, lng: null };
    const e = await this.db.insert<Entry>('registry_entries', {
      id: id(), registryId: rid, data: JSON.stringify(data), searchText: searchText(reg.fields, data, reg.titleField), ...c,
      status: b?.status === 'ARHIVIRAN' ? 'ARHIVIRAN' : 'AKTIVAN', createdBy: req.user?.sub,
    });
    await this.db.q(`UPDATE registries SET "updatedAt"=now() WHERE "id"=$1`, [rid]);
    await this.audit.log(req, { action: 'Dodao/la zapis u registar', entity: 'registri', entityId: e.id, target: `${reg.name}: ${data[reg.titleField ?? ''] ?? e.id}`, after: { ...data, ...c } });
    return e;
  }

  @Patch(':id/entries/:eid')
  @Can('registri', 'write')
  async updateEntry(@Param('id') rid: string, @Param('eid') eid: string, @Body() b: any, @Req() req: any) {
    const reg = await this.repo.byId(rid);
    assertScope(req.user, reg.sector, 'registre');
    const before = await this.db.one<Entry>(`SELECT * FROM registry_entries WHERE "id"=$1 AND "registryId"=$2`, [eid, rid]);
    if (!before) throw new NotFoundException('Zapis nije pronađen.');
    const { data, errors } = validateEntry(reg.fields, b?.data ?? {}, { partial: true, previous: before.data });
    errors.push(...(await this.repo.duplicates(reg, data, eid)));
    if (errors.length) invalid(errors);
    const c = coords(reg, b ?? {});
    const status = b?.status === undefined ? undefined : b.status === 'ARHIVIRAN' ? 'ARHIVIRAN' : 'AKTIVAN';
    const e = await this.db.update<Entry>('registry_entries', eid, {
      data: JSON.stringify(data), searchText: searchText(reg.fields, data, reg.titleField), ...(c ?? {}), status,
    }, true);
    await this.db.q(`UPDATE registries SET "updatedAt"=now() WHERE "id"=$1`, [rid]);
    await this.audit.log(req, {
      action: status && status !== before.status ? (status === 'ARHIVIRAN' ? 'Arhivirao/la zapis registra' : 'Vratio/la zapis registra') : 'Uredio/la zapis registra',
      entity: 'registri', entityId: eid, target: `${reg.name}: ${data[reg.titleField ?? ''] ?? eid}`,
      before: { ...before.data, lat: before.lat, lng: before.lng, status: before.status }, after: { ...data, lat: e!.lat, lng: e!.lng, status: e!.status },
    });
    return e;
  }

  @Delete(':id/entries/:eid')
  @Can('registri', 'delete')
  async deleteEntry(@Param('id') rid: string, @Param('eid') eid: string, @Req() req: any) {
    const reg = await this.repo.byId(rid);
    assertScope(req.user, reg.sector, 'registre');
    const before = await this.db.one<Entry>(`SELECT * FROM registry_entries WHERE "id"=$1 AND "registryId"=$2`, [eid, rid]);
    if (!before) throw new NotFoundException('Zapis nije pronađen.');
    await this.db.q(`DELETE FROM registry_entries WHERE "id"=$1`, [eid]);
    await this.audit.log(req, { action: 'Obrisao/la zapis registra', entity: 'registri', entityId: eid, target: `${reg.name}: ${before.data[reg.titleField ?? ''] ?? eid}`, before: before.data });
    return { ok: true };
  }

  /* ── CSV ── */

  /**
   * Uvoz CSV-a. Bez commit=1 samo provjerava i vraća izvještaj (redovi, greške po redu i polju).
   * mode=upsert: red s istom vrijednošću jedinstvenog polja (ili kolonom id) ažurira postojeći zapis.
   * Sa commit=1 upisuje se sve u jednoj transakciji; ako ima grešaka, upisuje se samo uz skipInvalid=1.
   */
  @Post(':id/import')
  @Can('registri', 'write')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: MAX_CSV } }))
  async import(@Param('id') rid: string, @UploadedFile() file: Express.Multer.File, @Body() b: any, @Req() req: any) {
    const reg = await this.repo.byId(rid);
    assertScope(req.user, reg.sector, 'registre');
    const text = file?.buffer ? file.buffer.toString('utf8') : String(b?.csv ?? '');
    if (!text.trim()) throw new BadRequestException('Odaberite CSV datoteku.');
    if (text.includes('�')) throw new BadRequestException('Datoteka nije u UTF-8 kodiranju. U Excelu je sačuvajte kao „CSV UTF-8“.');
    const rows = parseCsv(text);
    if (rows.length < 2) throw new BadRequestException('Datoteka nema redova s podacima (prvi red su nazivi kolona).');
    if (rows.length - 1 > MAX_IMPORT_ROWS) throw new BadRequestException(`Najviše ${MAX_IMPORT_ROWS} redova po uvozu.`);
    const { map, unknown, missingRequired } = mapHeader(reg.fields, rows[0]);
    if (!map.some((k) => k && k !== 'lat' && k !== 'lng' && k !== 'id')) throw new BadRequestException('Nijedna kolona ne odgovara poljima registra. Preuzmite predložak.');
    const mode = b?.mode === 'upsert' ? 'upsert' : 'append';
    const uniq = reg.fields.find((f) => f.unique);
    const commit = ['1', 'true'].includes(String(b?.commit));
    const skipInvalid = ['1', 'true'].includes(String(b?.skipInvalid));

    const existing = new Map<string, string>(); // vrijednost jedinstvenog polja / id → id zapisa
    if (uniq || mode === 'upsert') {
      for (const e of await this.db.q<{ id: string; v: string | null }>(`SELECT "id", lower("data"->>$2) v FROM registry_entries WHERE "registryId"=$1`, [rid, uniq?.key ?? ''])) {
        existing.set(`id:${e.id}`, e.id);
        if (e.v) existing.set(`u:${e.v}`, e.id);
      }
    }
    const seen = new Set<string>();
    const errors: { row: number; field?: string; label?: string; message: string }[] = [];
    const plan: { row: number; targetId: string | null; data: Record<string, any>; lat: number | null; lng: number | null }[] = [];
    rows.slice(1).forEach((cells, i) => {
      const rowNo = i + 2;
      const input: Record<string, any> = {};
      map.forEach((k, j) => { if (k) input[k] = cells[j]; });
      const targetId = mode === 'upsert'
        ? (input.id && existing.get(`id:${input.id}`)) || (uniq && input[uniq.key] ? existing.get(`u:${String(input[uniq.key]).trim().toLowerCase()}`) : undefined) || null
        : null;
      const { data, errors: errs } = validateEntry(reg.fields, input, targetId ? { partial: true } : {});
      for (const e of errs) errors.push({ row: rowNo, ...e });
      let lat: number | null = null, lng: number | null = null;
      if (reg.geo) {
        const la = parseCoord(input.lat, 90), ln = parseCoord(input.lng, 180);
        if (la === 'error' || ln === 'error' || (la === null) !== (ln === null)) errors.push({ row: rowNo, field: 'lat', label: 'Koordinate', message: 'neispravne ili nepotpune koordinate' });
        else { lat = la; lng = ln; }
      }
      if (uniq && data[uniq.key] !== undefined) {
        const v = String(data[uniq.key]).toLowerCase();
        if (seen.has(v)) errors.push({ row: rowNo, field: uniq.key, label: uniq.label, message: `„${data[uniq.key]}“ se ponavlja u datoteci` });
        else if (!targetId && existing.has(`u:${v}`)) errors.push({ row: rowNo, field: uniq.key, label: uniq.label, message: `„${data[uniq.key]}“ već postoji u registru${mode === 'append' ? ' (za ažuriranje odaberite „Dodaj i ažuriraj“)' : ''}` });
        seen.add(v);
      }
      if (!errs.length) plan.push({ row: rowNo, targetId, data, lat, lng });
    });
    const badRows = new Set(errors.map((e) => e.row));
    const ok = plan.filter((p) => !badRows.has(p.row));
    const report = {
      total: rows.length - 1, valid: ok.length, invalid: badRows.size,
      toCreate: ok.filter((p) => !p.targetId).length, toUpdate: ok.filter((p) => p.targetId).length,
      unknownColumns: unknown, missingRequired, errors: errors.slice(0, 200), errorCount: errors.length, mode,
      preview: ok.slice(0, 5).map((p) => ({ row: p.row, update: !!p.targetId, data: p.data })), committed: false,
    };
    if (!commit) return report;
    if (badRows.size && !skipInvalid) throw new BadRequestException({ statusCode: 400, code: 'IMPORT_INVALID', message: `${badRows.size} redova ima greške. Ispravite ih ili uvezite samo ispravne.`, report });
    if (!ok.length) throw new BadRequestException('Nema ispravnih redova za uvoz.');

    await this.db.tx(async (c) => {
      for (const p of ok) {
        if (p.targetId) {
          const prev = await c.query(`SELECT "data" FROM registry_entries WHERE "id"=$1`, [p.targetId]);
          const data = { ...(prev.rows[0]?.data ?? {}), ...p.data };
          await c.query(
            `UPDATE registry_entries SET "data"=$2, "searchText"=$3, "lat"=COALESCE($4,"lat"), "lng"=COALESCE($5,"lng"), "updatedAt"=now() WHERE "id"=$1`,
            [p.targetId, JSON.stringify(data), searchText(reg.fields, data, reg.titleField), p.lat, p.lng],
          );
        } else {
          await c.query(
            `INSERT INTO registry_entries ("id","registryId","data","searchText","lat","lng","createdBy") VALUES ($1,$2,$3,$4,$5,$6,$7)`,
            [id(), rid, JSON.stringify(p.data), searchText(reg.fields, p.data, reg.titleField), p.lat, p.lng, req.user?.sub ?? null],
          );
        }
      }
      await c.query(`UPDATE registries SET "updatedAt"=now() WHERE "id"=$1`, [rid]);
    });
    await this.audit.log(req, {
      action: 'Uvezao/la CSV u registar', entity: 'registri', entityId: rid,
      target: `${reg.name}: ${report.toCreate} novih, ${report.toUpdate} ažuriranih${badRows.size ? `, ${badRows.size} preskočenih` : ''}`,
      after: { fileName: file?.originalname ?? null, rows: report.total, created: report.toCreate, updated: report.toUpdate, skipped: badRows.size, mode },
    });
    return { ...report, committed: true };
  }

  @Get(':id/export.csv')
  @Can('registri', 'read')
  async export(@Param('id') rid: string, @Query('status') status: string | undefined, @Res() res: Response) {
    const reg = await this.repo.byId(rid);
    const rows = await this.db.q<Entry>(`SELECT * FROM registry_entries WHERE "registryId"=$1 ${status ? `AND "status"=$2` : ''} ORDER BY "createdAt"`, status ? [rid, status] : [rid]);
    sendCsv(res, `${reg.slug}-interni.csv`, toCsv(reg.fields, rows, { geo: reg.geo, withId: true }));
  }

  @Get(':id/template.csv')
  @Can('registri', 'read')
  async template(@Param('id') rid: string, @Res() res: Response) {
    const reg = await this.repo.byId(rid);
    sendCsv(res, `${reg.slug}-predlozak.csv`, toCsv(reg.fields, [], { geo: reg.geo }));
  }
}

function sendCsv(res: Response, name: string, body: string) {
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${name.replace(/[^a-z0-9.-]/gi, '-')}"`);
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.send(body);
}

/* ───────── Javni API (otvoreni podaci) ───────── */

@Controller('registries')
@Throttle({ default: { ttl: 60_000, limit: 120 } })
export class PublicRegistriesController {
  private repo: RegistryRepo;
  constructor(private db: Db) { this.repo = new RegistryRepo(db); }

  private async reg(slug: string) {
    const r = await this.repo.bySlug(slug);
    if (!r || !r.public) throw new NotFoundException('Registar nije pronađen.');
    return r;
  }

  @Get()
  @Header('Access-Control-Allow-Origin', '*')
  async list() {
    const regs = await this.db.q<Registry & { count: number }>(`SELECT r.*, (SELECT count(*)::int FROM registry_entries e WHERE e."registryId"=r."id" AND e."status"='AKTIVAN') "count" FROM registries r WHERE r."public" ORDER BY r."name"`);
    return regs.map((r) => metaPublic(r, r.count));
  }

  @Get(':slug')
  @Header('Access-Control-Allow-Origin', '*')
  async meta(@Param('slug') slug: string) {
    const r = await this.reg(slug);
    const count = await this.db.count(`SELECT count(*) n FROM registry_entries WHERE "registryId"=$1 AND "status"='AKTIVAN'`, [r.id]);
    // vrijednosti za filtere s brojem zapisa (za padajuće liste)
    const facets: Record<string, { value: string; count: number }[]> = {};
    for (const f of publicFields(r.fields).filter((x) => x.filter)) {
      facets[f.key] = await this.db.q(`SELECT "data"->>$2 "value", count(*)::int "count" FROM registry_entries WHERE "registryId"=$1 AND "status"='AKTIVAN' AND "data" ? $2 GROUP BY 1 ORDER BY 1`, [r.id, f.key]);
    }
    return { ...metaPublic(r, count), facets };
  }

  @Get(':slug/entries')
  @Header('Access-Control-Allow-Origin', '*')
  async entries(@Param('slug') slug: string, @Query() q: any) {
    const reg = await this.reg(slug);
    const r = await this.repo.entries(reg, q, { publicOnly: true });
    return { items: r.rows.map((e) => shapePublic(reg, e)), total: r.total, page: r.page, limit: r.limit };
  }

  @Get(':slug/entries/:id')
  @Header('Access-Control-Allow-Origin', '*')
  async entry(@Param('slug') slug: string, @Param('id') eid: string) {
    const reg = await this.reg(slug);
    const e = await this.db.one<Entry>(`SELECT * FROM registry_entries WHERE "id"=$1 AND "registryId"=$2 AND "status"='AKTIVAN'`, [eid, reg.id]);
    if (!e) throw new NotFoundException('Zapis nije pronađen.');
    return shapePublic(reg, e);
  }

  @Get(':slug/export.csv')
  @Header('Access-Control-Allow-Origin', '*')
  async export(@Param('slug') slug: string, @Query() q: any, @Res() res: Response) {
    const reg = await this.reg(slug);
    const r = await this.repo.entries(reg, { ...q, limit: MAX_IMPORT_ROWS, page: 1 }, { publicOnly: true, max: MAX_IMPORT_ROWS });
    sendCsv(res, `${reg.slug}.csv`, toCsv(publicFields(reg.fields), r.rows, { geo: reg.geo }));
  }
}
