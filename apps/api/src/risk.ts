import { BadRequestException, Body, Controller, Delete, Get, Injectable, Logger, NotFoundException, OnModuleInit, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { Db, id } from './db';
import { AuthGuard } from './auth';
import { toFloat } from './util';

/* ───────────── Vanjski izvori (s keširanjem) ───────────── */

// HNK + rubna zona (zapad, jug, istok, sjever)
const BBOX = { w: 16.95, s: 42.85, e: 18.55, n: 44.0 };
const UA = 'MTTO-HNK-portal/1.0 (+https://mtto.gov.ba)';
export const MUNICIPALITIES = ['Čapljina', 'Čitluk', 'Jablanica', 'Konjic', 'Mostar', 'Neum', 'Prozor-Rama', 'Ravno', 'Stolac'];

const STATIONS = [
  { key: 'konjic', name: 'Neretva – Konjic', lat: 43.652, lng: 17.962 },
  { key: 'mostar', name: 'Neretva – Mostar', lat: 43.337, lng: 17.812 },
  { key: 'capljina', name: 'Neretva – Čapljina', lat: 43.115, lng: 17.704 },
  { key: 'buna', name: 'Buna – Blagaj', lat: 43.257, lng: 17.885 },
];
// Meteoalarm regije relevantne za HNK (EMMA_ID): Mostar, Livno (Prozor-Rama/Jablanica), Trebinje (Neum/Ravno)
const MA_REGIONS: Record<string, string> = { BA008: 'Mostar', BA005: 'Livno', BA010: 'Trebinje' };

type Cache<T> = { at: number; data: T; error?: string };

async function getJson(url: string, timeout = 15000): Promise<any> {
  const r = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'application/json' }, signal: AbortSignal.timeout(timeout) });
  if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
  return r.json();
}
async function getText(url: string, timeout = 20000): Promise<string> {
  const r = await fetch(url, { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(timeout) });
  if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
  return r.text();
}

export type Fire = { lat: number; lng: number; date: string; time: string; confidence: string; frp: number | null; satellite: string; daynight: string };
export type Warning = { region: string; event: string; level: number; color: string; type: string; onset: string; expires: string; headline: string; description: string; instruction: string };
export type River = { key: string; name: string; lat: number; lng: number; days: string[]; discharge: (number | null)[]; max: (number | null)[]; todayIndex: number; status: 'NORMALNO' | 'POVISENO' | 'VISOKO' | 'NEPOZNATO'; ratio: number | null };

@Injectable()
export class RiskService implements OnModuleInit {
  private log = new Logger('Eko-rizik');
  private cache: Record<string, Cache<any>> = {};
  constructor(private db: Db) {}

  /** Prazan registar klizišta dobija nekoliko jasno označenih primjera (demo), da se modul može prikazati. */
  async onModuleInit() {
    try {
      if ((await this.db.count(`SELECT count(*) n FROM landslides`)) > 0) return;
      const demo: [string, string, number, number, string, number, string][] = [
        ['Klizište uz regionalnu cestu (primjer)', 'Konjic', 43.668, 17.905, 'AKTIVNO', 3, 'Primjer zapisa: pomak tla uz kolovoz nakon obilnih padavina. Zapis služi za prikaz modula.'],
        ['Odron kamenja iznad naselja (primjer)', 'Jablanica', 43.662, 17.738, 'PRACENJE', 3, 'Primjer zapisa: nestabilna kosina, praćenje nakon kišnih epizoda.'],
        ['Klizište na lokalnom putu (primjer)', 'Prozor-Rama', 43.79, 17.62, 'PRACENJE', 2, 'Primjer zapisa: lokalno oštećenje puta, postavljena signalizacija.'],
        ['Sanirana kosina (primjer)', 'Mostar', 43.39, 17.84, 'SANIRANO', 1, 'Primjer zapisa: sanacija potpornim zidom završena.'],
      ];
      for (const [name, municipality, lat, lng, status, risk, description] of demo) {
        await this.db.insert('landslides', { id: id(), name, municipality, lat, lng, status, risk, description, source: 'Demo zapis', isDemo: true });
      }
    } catch (e: any) { this.log.warn(`seed klizišta: ${e?.message ?? e}`); }
  }

  private async cached<T>(key: string, ttlMs: number, fn: () => Promise<T>, fallback: T): Promise<Cache<T>> {
    if (process.env.RISK_FIXTURE === '1' && process.env.NODE_ENV !== 'production') return { at: Date.now(), data: fixture(key) as T };
    const c = this.cache[key];
    if (c && Date.now() - c.at < ttlMs) return c;
    try {
      const data = await fn();
      this.cache[key] = { at: Date.now(), data };
    } catch (e: any) {
      this.log.warn(`${key}: ${e?.message ?? e}`);
      // zadrži zadnje uspješne podatke, uz oznaku greške
      this.cache[key] = { at: Date.now() - ttlMs + 120_000, data: c?.data ?? fallback, error: String(e?.message ?? e) };
    }
    return this.cache[key];
  }

  /** NASA FIRMS – aktivna žarišta (VIIRS S-NPP + NOAA-20 + NOAA-21), zadnjih 3 dana */
  fires() {
    return this.cached<Fire[]>('fires', 15 * 60_000, async () => {
      const key = process.env.FIRMS_MAP_KEY;
      if (!key) throw new Error('FIRMS_MAP_KEY nije postavljen');
      const area = `${BBOX.w},${BBOX.s},${BBOX.e},${BBOX.n}`;
      const sources = ['VIIRS_SNPP_NRT', 'VIIRS_NOAA20_NRT', 'VIIRS_NOAA21_NRT'];
      const out: Fire[] = [];
      const errors: string[] = [];
      await Promise.all(sources.map(async (src) => {
        try {
          const csv = await getText(`https://firms.modaps.eosdis.nasa.gov/api/area/csv/${key}/${src}/${area}/3`);
          if (/invalid|error/i.test(csv.slice(0, 200)) && !csv.startsWith('latitude')) throw new Error(csv.slice(0, 120));
          const [head, ...lines] = csv.trim().split(/\r?\n/);
          const h = head.split(',');
          const ix = (n: string) => h.indexOf(n);
          for (const l of lines) {
            const c = l.split(',');
            if (c.length < h.length) continue;
            out.push({
              lat: +c[ix('latitude')], lng: +c[ix('longitude')], date: c[ix('acq_date')], time: c[ix('acq_time')],
              confidence: c[ix('confidence')] ?? '', frp: ix('frp') >= 0 ? toFloat(c[ix('frp')]) : null,
              satellite: c[ix('satellite')] ?? src, daynight: c[ix('daynight')] ?? '',
            });
          }
        } catch (e: any) { errors.push(`${src}: ${e?.message ?? e}`); }
      }));
      if (errors.length === sources.length) throw new Error(errors.join(' | '));
      return out.sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time));
    }, []);
  }

  /** Meteoalarm – upozorenja FHMZ za regije koje pokrivaju HNK */
  warnings() {
    return this.cached<Warning[]>('warnings', 15 * 60_000, async () => {
      const j = await getJson('https://feeds.meteoalarm.org/api/v1/warnings/feeds-bosnia-herzegovina');
      const now = Date.now();
      const out: Warning[] = [];
      for (const w of j?.warnings ?? []) {
        const infos: any[] = w?.alert?.info ?? [];
        const info = infos.find((i) => /^bs/i.test(i.language)) ?? infos.find((i) => /^en/i.test(i.language)) ?? infos[0];
        if (!info) continue;
        if (info.expires && Date.parse(info.expires) < now) continue;
        const regions = (info.area ?? []).flatMap((a: any) => (a.geocode ?? []).map((g: any) => MA_REGIONS[g.value]).filter(Boolean));
        if (!regions.length) continue;
        const p = (name: string) => (info.parameter ?? []).find((x: any) => x.valueName === name)?.value ?? '';
        const lvl = p('awareness_level'); // "2; yellow; Moderate"
        const [n, color] = lvl.split(';').map((x: string) => x.trim());
        const type = p('awareness_type').split(';').map((x: string) => x.trim())[1] ?? '';
        for (const region of [...new Set<string>(regions)]) {
          out.push({ region, event: info.event ?? '', level: Number(n) || 1, color: color || 'green', type, onset: info.onset ?? info.effective ?? '', expires: info.expires ?? '', headline: info.headline ?? '', description: info.description ?? '', instruction: info.instruction ?? '' });
        }
      }
      return out.sort((a, b) => b.level - a.level || a.onset.localeCompare(b.onset));
    }, []);
  }

  /** Open-Meteo Flood API (Copernicus GloFAS) – protok Neretve i Bune */
  rivers() {
    return this.cached<River[]>('rivers', 60 * 60_000, async () => {
      const lat = STATIONS.map((s) => s.lat).join(','), lng = STATIONS.map((s) => s.lng).join(',');
      const j = await getJson(`https://flood-api.open-meteo.com/v1/flood?latitude=${lat}&longitude=${lng}&daily=river_discharge,river_discharge_max&past_days=60&forecast_days=10`);
      const arr = Array.isArray(j) ? j : [j];
      const today = new Date().toISOString().slice(0, 10);
      return STATIONS.map((s, i) => {
        const d = arr[i]?.daily ?? {};
        const days: string[] = d.time ?? [];
        const q: (number | null)[] = d.river_discharge ?? [];
        const mx: (number | null)[] = d.river_discharge_max ?? [];
        const ti = Math.max(0, days.indexOf(today));
        const past = q.slice(0, ti).filter((v): v is number => v != null).sort((a, b) => a - b);
        const median = past.length ? past[Math.floor(past.length / 2)] : null;
        const peak = Math.max(...q.slice(ti).map((v) => v ?? 0), ...mx.slice(ti).map((v) => v ?? 0));
        const ratio = median && peak ? Math.round((peak / median) * 10) / 10 : null;
        const status: River['status'] = ratio == null ? 'NEPOZNATO' : ratio >= 3 ? 'VISOKO' : ratio >= 1.8 ? 'POVISENO' : 'NORMALNO';
        return { ...s, days, discharge: q, max: mx, todayIndex: ti, status, ratio };
      });
    }, []);
  }
}

/** Samo za lokalni razvoj (RISK_FIXTURE=1) – nikad u produkciji. */
function fixture(key: string): any {
  const d = (o: number) => new Date(Date.now() + o * 86400000).toISOString().slice(0, 10);
  if (key === 'fires') return [
    { lat: 43.21, lng: 17.95, date: d(0), time: '1142', confidence: 'h', frp: 18.4, satellite: 'N', daynight: 'D' },
    { lat: 43.215, lng: 17.957, date: d(0), time: '1142', confidence: 'n', frp: 6.1, satellite: 'N', daynight: 'D' },
    { lat: 43.05, lng: 17.62, date: d(-1), time: '0118', confidence: 'n', frp: 3.2, satellite: 'J1', daynight: 'N' },
  ];
  if (key === 'warnings') return [
    { region: 'Mostar', event: 'Vjetar žuto upozorenje', level: 2, color: 'yellow', type: 'Wind', onset: new Date().toISOString(), expires: new Date(Date.now() + 86400000).toISOString(), headline: 'Umjereno upozorenje: vjetar', description: 'Udari bure do 70 km/h.', instruction: '' },
  ];
  if (key === 'rivers') return STATIONS.map((s, i) => {
    const days = Array.from({ length: 70 }, (_, k) => d(k - 60));
    const discharge = days.map((_, k) => Math.round((120 + 60 * Math.sin(k / 6) + (k > 60 ? (k - 60) * 25 * (i + 1) / 2 : 0)) * 10) / 10 / (i === 3 ? 4 : 1));
    return { ...s, days, discharge, max: discharge.map((v) => Math.round(v * 1.3)), todayIndex: 60, status: i === 1 ? 'POVISENO' : 'NORMALNO', ratio: i === 1 ? 2.1 : 1.2 };
  });
  return [];
}

/* ───────────── Javni API ───────────── */

const REPORT_KINDS: Record<string, string> = {
  POZAR: 'Požar ili dim', DEPONIJA: 'Divlja deponija', VODA: 'Zagađenje vode', ZRAK: 'Zagađenje zraka / neugodni mirisi',
  KLIZISTE: 'Klizište / odron', POPLAVA: 'Poplava / bujica', SJECA: 'Nelegalna sječa', OSTALO: 'Ostalo',
};
const hits = new Map<string, number[]>();

function publicReport(r: any) {
  return { id: r.id, code: r.code, kind: r.kind, kindLabel: REPORT_KINDS[r.kind] ?? r.kind, municipality: r.municipality, location: r.location, lat: r.lat, lng: r.lng, description: r.description, status: r.status, createdAt: r.createdAt };
}

@Controller()
export class RiskController {
  constructor(private db: Db, private risk: RiskService) {}

  @Get('risk/summary')
  async summary() {
    const [f, w, r, landslides, reports] = await Promise.all([
      this.risk.fires(), this.risk.warnings(), this.risk.rivers(),
      this.db.q(`SELECT * FROM landslides ORDER BY "risk" DESC, "updatedAt" DESC`),
      this.db.q(`SELECT * FROM eco_reports WHERE "isPublic" AND "createdAt" > now() - interval '60 days' ORDER BY "createdAt" DESC LIMIT 100`),
    ]);
    const today = new Date().toISOString().slice(0, 10);
    const fires24 = f.data.filter((x: Fire) => x.date >= new Date(Date.now() - 86400000).toISOString().slice(0, 10)).length;
    const maxWarn = w.data.reduce((m: number, x: Warning) => Math.max(m, x.level), 0);
    const worstRiver = (r.data as River[]).reduce<River | null>((m, x) => (!m || (x.ratio ?? 0) > (m.ratio ?? 0) ? x : m), null);
    const level = Math.max(maxWarn >= 3 ? 3 : maxWarn >= 2 ? 2 : 1, fires24 >= 5 ? 3 : fires24 > 0 ? 2 : 1, worstRiver?.status === 'VISOKO' ? 3 : worstRiver?.status === 'POVISENO' ? 2 : 1);
    return {
      generatedAt: new Date().toISOString(), today, level,
      fires: { items: f.data, updatedAt: new Date(f.at).toISOString(), error: f.error ?? null, last24h: fires24 },
      warnings: { items: w.data, updatedAt: new Date(w.at).toISOString(), error: w.error ?? null },
      rivers: { items: r.data, updatedAt: new Date(r.at).toISOString(), error: r.error ?? null },
      landslides,
      reports: reports.map(publicReport),
      reportKinds: REPORT_KINDS,
    };
  }

  @Post('eco-reports')
  async report(@Body() b: any, @Req() req: any) {
    if (b?.website) return { ok: true, code: 'EKO-0000' }; // honeypot
    const ip = String(req.headers['x-forwarded-for'] ?? req.ip ?? '').split(',')[0].trim();
    const now = Date.now();
    const list = (hits.get(ip) ?? []).filter((t) => now - t < 3600_000);
    if (list.length >= 5) throw new BadRequestException('Previše prijava s iste adrese. Pokušajte kasnije ili nazovite +387 36 551 823.');
    const kind = String(b?.kind ?? '');
    const municipality = String(b?.municipality ?? '');
    const description = String(b?.description ?? '').trim();
    if (!REPORT_KINDS[kind]) throw new BadRequestException('Odaberite vrstu incidenta');
    if (!MUNICIPALITIES.includes(municipality)) throw new BadRequestException('Odaberite općinu');
    if (description.length < 15) throw new BadRequestException('Opis mora imati najmanje 15 znakova');
    const lat = toFloat(b?.lat), lng = toFloat(b?.lng);
    const inArea = lat != null && lng != null && lat > BBOX.s && lat < BBOX.n && lng > BBOX.w && lng < BBOX.e;
    const email = String(b?.contactEmail ?? '').trim();
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new BadRequestException('Neispravna e-mail adresa');
    const n = await this.db.count(`SELECT count(*) n FROM eco_reports`);
    const code = `EKO-${new Date().getFullYear()}-${String(n + 1).padStart(4, '0')}`;
    await this.db.insert('eco_reports', {
      id: id(), code, kind, municipality, location: String(b?.location ?? '').slice(0, 200), lat: inArea ? lat : null, lng: inArea ? lng : null,
      description: description.slice(0, 2000), contactName: String(b?.contactName ?? '').slice(0, 120) || null, contactEmail: email || null,
    });
    list.push(now); hits.set(ip, list);
    return { ok: true, code };
  }
}

/* ───────────── CMS ───────────── */

const LS_STATUS = ['AKTIVNO', 'PRACENJE', 'SANIRANO'];
const RP_STATUS = ['NOVO', 'U_OBRADI', 'RIJESENO', 'ODBACENO'];

function landslideData(b: any) {
  const d: any = {};
  for (const k of ['name', 'municipality', 'description', 'source', 'status']) if (b[k] !== undefined) d[k] = String(b[k]);
  if (d.status && !LS_STATUS.includes(d.status)) throw new BadRequestException('Nepoznat status');
  if (d.municipality && !MUNICIPALITIES.includes(d.municipality)) throw new BadRequestException('Nepoznata općina');
  if (b.risk !== undefined) d.risk = Math.min(3, Math.max(1, parseInt(String(b.risk), 10) || 2));
  if (b.lat !== undefined) d.lat = toFloat(b.lat);
  if (b.lng !== undefined) d.lng = toFloat(b.lng);
  return d;
}

@Controller('admin')
@UseGuards(AuthGuard)
export class AdminRiskController {
  constructor(private db: Db) {}
  private log(req: any, action: string, target: string) {
    return this.db.insert('audit_log', { id: id(), userName: req.user?.name ?? 'Nepoznat', action, target });
  }

  @Get('landslides')
  list() { return this.db.q(`SELECT * FROM landslides ORDER BY "updatedAt" DESC`); }

  @Post('landslides')
  async create(@Body() b: any, @Req() req: any) {
    const d = landslideData(b);
    if (!d.name || !d.municipality || d.lat == null || d.lng == null) throw new BadRequestException('Naziv, općina i lokacija su obavezni');
    const l = await this.db.insert('landslides', { id: id(), ...d });
    await this.log(req, 'Dodao/la klizište u registar', l.name);
    return l;
  }

  @Patch('landslides/:id')
  async update(@Param('id') lid: string, @Body() b: any, @Req() req: any) {
    const l = await this.db.update<any>('landslides', lid, landslideData(b), true);
    if (!l) throw new NotFoundException();
    await this.log(req, 'Ažurirao/la klizište', l.name);
    return l;
  }

  @Delete('landslides/:id')
  async remove(@Param('id') lid: string, @Req() req: any) {
    const l = await this.db.one<any>(`DELETE FROM landslides WHERE "id"=$1 RETURNING "name"`, [lid]);
    if (!l) throw new NotFoundException();
    await this.log(req, 'Uklonio/la klizište iz registra', l.name);
    return { ok: true };
  }

  @Get('eco-reports')
  reports() { return this.db.q(`SELECT * FROM eco_reports ORDER BY "createdAt" DESC LIMIT 500`); }

  @Patch('eco-reports/:id')
  async updateReport(@Param('id') rid: string, @Body() b: any, @Req() req: any) {
    const d: any = {};
    if (b.status !== undefined) { if (!RP_STATUS.includes(b.status)) throw new BadRequestException('Nepoznat status'); d.status = b.status; }
    if (b.isPublic !== undefined) d.isPublic = !!b.isPublic;
    if (b.note !== undefined) d.note = String(b.note).slice(0, 2000);
    const r = await this.db.update<any>('eco_reports', rid, d, true);
    if (!r) throw new NotFoundException();
    await this.log(req, `Ažurirao/la eko-prijavu (${r.status}${r.isPublic ? ', javno' : ''})`, r.code);
    return r;
  }
}
