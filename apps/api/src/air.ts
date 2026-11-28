/**
 * F2-17: kvalitet zraka.
 *
 * Dva izvora u istoj tabeli air_readings:
 * - CAMS: Copernicus model (Open-Meteo Air Quality API), za 9 općina HNK, satno; raspored ga osvježava svaki sat
 *   (izvor „air“ u SourceHub-u, F2-18). Uz izmjereno zadnja 3 dana dolazi i prognoza za 4 dana.
 * - AMS: automatske mjerne stanice (Mostar–Kampus, Jablanica). Dok FHMZ ne omogući pristup (P0-15),
 *   satne vrijednosti uvozi referent iz CSV-a u CMS-u.
 *
 * Pragovi: Pravilnik o načinu vršenja monitoringa kvaliteta zraka … (Sl. novine FBiH 1/12, 9/16),
 * kako ih navodi Godišnji izvještaj FHMZ za 2024. Model je procjena, ne službeno mjerenje: tako se i prikazuje.
 */
import { BadRequestException, Body, Controller, Get, Injectable, OnModuleInit, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { Db } from './db';
import { SourceHub, type SourceState } from './sources';
import { AuthGuard } from './auth';
import { Can } from './rbac';
import { AuditService } from './audit';
import { parseCsv } from './registry-core';

const UA = 'MTTO-HNK-portal/1.0 (+https://mtto.gov.ba)';

export const AIR_POINTS = [
  { key: 'mostar', name: 'Mostar', lat: 43.343, lng: 17.808 },
  { key: 'capljina', name: 'Čapljina', lat: 43.121, lng: 17.684 },
  { key: 'citluk', name: 'Čitluk', lat: 43.228, lng: 17.701 },
  { key: 'jablanica', name: 'Jablanica', lat: 43.66, lng: 17.758 },
  { key: 'konjic', name: 'Konjic', lat: 43.652, lng: 17.961 },
  { key: 'neum', name: 'Neum', lat: 42.923, lng: 17.616 },
  { key: 'prozor-rama', name: 'Prozor-Rama', lat: 43.822, lng: 17.609 },
  { key: 'ravno', name: 'Ravno', lat: 42.883, lng: 17.968 },
  { key: 'stolac', name: 'Stolac', lat: 43.084, lng: 17.957 },
];
/** Stanice kojima upravlja Ministarstvo (koordinate približne: provjeriti s Ministarstvom). */
export const AIR_STATIONS = [
  { key: 'ams-mostar-kampus', name: 'AMS Mostar – Kampus', lat: 43.348, lng: 17.797 },
  { key: 'ams-jablanica', name: 'AMS Jablanica', lat: 43.659, lng: 17.762 },
];

export const POLLUTANTS = ['pm10', 'pm25', 'o3', 'no2', 'so2', 'co'] as const;
type Pol = (typeof POLLUTANTS)[number];
export const POL_LABEL: Record<Pol, string> = { pm10: 'PM10', pm25: 'PM2.5', o3: 'Ozon (O₃)', no2: 'Dušikov dioksid (NO₂)', so2: 'Sumpor-dioksid (SO₂)', co: 'Ugljen-monoksid (CO)' };

/** Granične vrijednosti i pragovi (µg/m³; CO u mg/m³), Pravilnik FBiH 1/12. */
export const THRESHOLDS = [
  { pol: 'pm10', period: '24 sata', limit: 50, allowed: '35 dana godišnje' },
  { pol: 'pm10', period: 'godina', limit: 40 },
  { pol: 'pm25', period: 'godina', limit: 25 },
  { pol: 'no2', period: '1 sat', limit: 200, alarm: 400, allowed: '18 sati godišnje' },
  { pol: 'no2', period: 'godina', limit: 40 },
  { pol: 'so2', period: '1 sat', limit: 350, alarm: 500, allowed: '24 sata godišnje' },
  { pol: 'so2', period: '24 sata', limit: 125, allowed: '3 dana godišnje' },
  { pol: 'o3', period: '8 sati', limit: 120, info: 180, alarm: 240, note: 'Ciljna vrijednost; prag upozorenja 180 i prag uzbune 240 odnose se na satne vrijednosti' },
  { pol: 'co', period: '8 sati', limit: 10, unit: 'mg/m³' },
] as const;

/** Evropski indeks kvaliteta zraka (EEA): razredi i preporuke. */
export const BANDS = [
  { max: 20, label: 'Dobar', color: '#50f0e6', advice: 'Kvalitet zraka je dobar. Uživajte u aktivnostima na otvorenom.' },
  { max: 40, label: 'Prihvatljiv', color: '#50ccaa', advice: 'Kvalitet zraka je prihvatljiv za sve.' },
  { max: 60, label: 'Umjeren', color: '#f0e641', advice: 'Osjetljive osobe neka razmisle o smanjenju napornih aktivnosti na otvorenom.' },
  { max: 80, label: 'Loš', color: '#ff5050', advice: 'Osjetljive osobe (djeca, starije osobe, astmatičari, srčani bolesnici) neka smanje boravak napolju.' },
  { max: 100, label: 'Vrlo loš', color: '#960032', advice: 'Svi neka smanje napornu aktivnost napolju; osjetljive osobe neka izbjegavaju boravak napolju.' },
  { max: Infinity, label: 'Izuzetno loš', color: '#7d2181', advice: 'Izbjegavajte boravak napolju. Pratite upute zdravstvenih službi.' },
];
export const band = (aqi: number | null | undefined) => (aqi == null ? null : BANDS.find((b) => aqi <= b.max)!);

/* Satni EAQI iz koncentracija (za stanice; CAMS ga daje sam). Granice razreda kao u Open-Meteo/CAMS. */
const EAQI_BREAKS: Partial<Record<Pol, number[]>> = {
  pm25: [0, 10, 20, 25, 50, 75, 800], pm10: [0, 20, 40, 50, 100, 150, 1200],
  no2: [0, 40, 90, 120, 230, 340, 1000], o3: [0, 50, 100, 130, 240, 380, 800], so2: [0, 100, 200, 350, 500, 750, 1250],
};
export function eaqi(v: Partial<Record<Pol, number | null>>): number | null {
  let best: number | null = null;
  for (const [pol, br] of Object.entries(EAQI_BREAKS) as [Pol, number[]][]) {
    const x = v[pol];
    if (x == null || !Number.isFinite(x)) continue;
    let i = br.findIndex((b, k) => k > 0 && x <= b);
    if (i < 0) i = br.length - 1;
    const lo = br[i - 1], hi = br[i];
    const idx = Math.round((i - 1) * 20 + ((x - lo) / (hi - lo || 1)) * 20);
    best = Math.max(best ?? 0, Math.min(idx, 120));
  }
  return best;
}

export type Hour = { ts: string; aqi: number | null; pm10: number | null; pm25: number | null; o3: number | null; no2: number | null; so2: number | null; co: number | null };
export type Day = { date: string; aqiMax: number | null; pm10Mean: number | null; pm25Mean: number | null; o3Max8h: number | null; no2Max: number | null; so2Max: number | null; forecast: boolean };
export type Alert = { point: string; name: string; date: string; level: 'granicna' | 'upozorenje' | 'uzbuna'; pol: string; text: string; forecast: boolean };

const round = (v: number | null) => (v == null ? null : Math.round(v * 10) / 10);
const mean = (xs: (number | null)[]) => { const v = xs.filter((x): x is number => x != null); return v.length >= 18 ? v.reduce((a, b) => a + b, 0) / v.length : null; };
const max = (xs: (number | null)[]) => { const v = xs.filter((x): x is number => x != null); return v.length ? Math.max(...v) : null; };
/** Najveći klizni 8-satni prosjek u danu (bar 6 od 8 sati). */
function max8h(xs: (number | null)[]) {
  let m: number | null = null;
  for (let i = 0; i + 8 <= xs.length; i++) {
    const w = xs.slice(i, i + 8).filter((x): x is number => x != null);
    if (w.length >= 6) m = Math.max(m ?? 0, w.reduce((a, b) => a + b, 0) / w.length);
  }
  return m;
}
const runOf = (xs: (number | null)[], over: number, n: number) => { let r = 0; for (const x of xs) { r = x != null && x > over ? r + 1 : 0; if (r >= n) return true; } return false; };
const localDate = (ts: string) => new Date(ts).toLocaleDateString('sv-SE', { timeZone: 'Europe/Sarajevo' });

/** Dnevni sažetak i upozorenja iz satnih vrijednosti (po lokalnom datumu). */
export function summarize(key: string, name: string, hours: Hour[], nowMs = Date.now()) {
  const byDay = new Map<string, Hour[]>();
  for (const h of hours) { const d = localDate(h.ts); (byDay.get(d) ?? byDay.set(d, []).get(d)!).push(h); }
  const today = localDate(new Date(nowMs).toISOString());
  const days: Day[] = []; const alerts: Alert[] = [];
  for (const [date, hs] of [...byDay.entries()].sort()) {
    const forecast = date > today;
    const col = (p: keyof Hour) => hs.map((h) => h[p] as number | null);
    const d: Day = { date, aqiMax: max(col('aqi')), pm10Mean: round(mean(col('pm10'))), pm25Mean: round(mean(col('pm25'))), o3Max8h: round(max8h(col('o3'))), no2Max: round(max(col('no2'))), so2Max: round(max(col('so2'))), forecast };
    days.push(d);
    const add = (level: Alert['level'], pol: string, text: string) => alerts.push({ point: key, name, date, level, pol, text, forecast });
    const o3 = max(col('o3'));
    if (runOf(col('so2'), 500, 3)) add('uzbuna', 'so2', 'SO₂ iznad praga uzbune (500 µg/m³) tri sata zaredom');
    else if ((d.so2Max ?? 0) > 350) add('granicna', 'so2', 'SO₂ iznad satne granične vrijednosti (350 µg/m³)');
    if (runOf(col('no2'), 400, 3)) add('uzbuna', 'no2', 'NO₂ iznad praga uzbune (400 µg/m³) tri sata zaredom');
    else if ((d.no2Max ?? 0) > 200) add('granicna', 'no2', 'NO₂ iznad satne granične vrijednosti (200 µg/m³)');
    if ((o3 ?? 0) > 240) add('uzbuna', 'o3', 'Ozon iznad praga uzbune (240 µg/m³)');
    else if ((o3 ?? 0) > 180) add('upozorenje', 'o3', 'Ozon iznad praga upozorenja (180 µg/m³)');
    else if ((d.o3Max8h ?? 0) > 120) add('granicna', 'o3', 'Ozon iznad ciljne 8-satne vrijednosti (120 µg/m³)');
    if ((d.pm10Mean ?? 0) > 50) add('granicna', 'pm10', `PM10 iznad dnevne granične vrijednosti (50 µg/m³): ${Math.round(d.pm10Mean!)} µg/m³`);
    if ((d.aqiMax ?? 0) > 80) add('upozorenje', 'aqi', `Vrlo loš kvalitet zraka (indeks do ${Math.round(d.aqiMax!)})`);
  }
  const past = hours.filter((h) => Date.parse(h.ts) <= nowMs && (h.aqi != null || h.pm10 != null));
  return { now: past.at(-1) ?? null, days, alerts };
}

export type AirData = {
  generatedAt: string;
  points: (typeof AIR_POINTS[number] & ReturnType<typeof summarize> & { hours: Hour[] })[];
};

@Injectable()
export class AirService implements OnModuleInit {
  constructor(private db: Db, private hub: SourceHub) {}

  onModuleInit() {
    this.hub.register<AirData>({ key: 'air', label: 'Copernicus CAMS (kvalitet zraka)', everyMs: 60 * 60_000, staleMs: 12 * 3600_000, fetch: () => this.fetchCams(process.env.RISK_FIXTURE === '1' && process.env.NODE_ENV !== 'production' ? fixtureCams : defaultFetch), fallback: { generatedAt: '', points: [] } });
  }

  state(): Promise<SourceState<AirData>> { return this.hub.get<AirData>('air'); }

  /** Preuzimanje CAMS-a: zadnja 3 dana i prognoza 4 dana; izmjereni sati se trajno čuvaju u air_readings. */
  async fetchCams(fetchJson: (url: string) => Promise<any> = defaultFetch): Promise<AirData> {
    const vars = 'european_aqi,pm10,pm2_5,ozone,nitrogen_dioxide,sulphur_dioxide,carbon_monoxide';
    const url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${AIR_POINTS.map((p) => p.lat).join(',')}&longitude=${AIR_POINTS.map((p) => p.lng).join(',')}&hourly=${vars}&past_days=3&forecast_days=4&timeformat=unixtime&timezone=GMT`;
    const j = await fetchJson(url);
    const arr: any[] = Array.isArray(j) ? j : [j];
    if (arr.length !== AIR_POINTS.length || !arr[0]?.hourly?.time) throw new Error('Neočekivan odgovor CAMS-a');
    const now = Date.now();
    const num = (v: any) => (typeof v === 'number' && Number.isFinite(v) ? Math.round(v * 10) / 10 : null);
    const points = AIR_POINTS.map((p, i) => {
      const h = arr[i].hourly;
      const hours: Hour[] = (h.time as number[]).map((t, k) => ({
        ts: new Date(t * 1000).toISOString(), aqi: num(h.european_aqi?.[k]), pm10: num(h.pm10?.[k]), pm25: num(h.pm2_5?.[k]), o3: num(h.ozone?.[k]),
        no2: num(h.nitrogen_dioxide?.[k]), so2: num(h.sulphur_dioxide?.[k]), co: h.carbon_monoxide?.[k] == null ? null : Math.round(h.carbon_monoxide[k]) / 1000, // µg → mg
      }));
      return { ...p, hours, ...summarize(p.key, p.name, hours, now) };
    });
    // izmjereni (prošli) sati u trajnu historiju
    const rows = points.flatMap((p) => p.hours.filter((h) => Date.parse(h.ts) <= now && h.aqi != null).map((h) => [p.key, h.ts, h.aqi, h.pm25, h.pm10, h.o3, h.no2, h.so2, h.co]));
    await this.saveReadings('CAMS', rows, null);
    await this.db.q(`DELETE FROM air_readings WHERE "source"='CAMS' AND "ts" < now() - interval '5 years'`);
    return { generatedAt: new Date().toISOString(), points };
  }

  async saveReadings(source: 'CAMS' | 'AMS', rows: any[][], by: string | null) {
    for (let i = 0; i < rows.length; i += 500) {
      const chunk = rows.slice(i, i + 500);
      const col = (k: number) => chunk.map((r) => r[k]);
      await this.db.q(
        `INSERT INTO air_readings ("source","point","ts","aqi","pm25","pm10","o3","no2","so2","co","importedBy")
         SELECT $1, * , $11 FROM unnest($2::text[], $3::timestamptz[], $4::real[], $5::real[], $6::real[], $7::real[], $8::real[], $9::real[], $10::real[])
         ON CONFLICT ("source","point","ts") DO UPDATE SET "aqi"=EXCLUDED."aqi","pm25"=EXCLUDED."pm25","pm10"=EXCLUDED."pm10","o3"=EXCLUDED."o3","no2"=EXCLUDED."no2","so2"=EXCLUDED."so2","co"=EXCLUDED."co","importedBy"=EXCLUDED."importedBy"`,
        [source, col(0), col(1), col(2), col(3), col(4), col(5), col(6), col(7), col(8), by],
      );
    }
  }

  async readings(source: string, point: string | null, from: Date, to: Date): Promise<(Hour & { point: string })[]> {
    const rows = await this.db.q<any>(
      `SELECT "point","ts","aqi","pm25","pm10","o3","no2","so2","co" FROM air_readings WHERE "source"=$1 AND ($2::text IS NULL OR "point"=$2) AND "ts" >= $3 AND "ts" <= $4 ORDER BY "point","ts" LIMIT 200000`,
      [source, point, from, to],
    );
    return rows.map((r) => ({ ...r, ts: new Date(r.ts).toISOString() }));
  }

  /** Stanice: zadnjih 7 dana iz uvezenih mjerenja. */
  async stations(nowMs = Date.now()) {
    const from = new Date(nowMs - 7 * 86400_000);
    const all = await this.readings('AMS', null, from, new Date(nowMs));
    return AIR_STATIONS.map((s) => {
      const hours = all.filter((r) => r.point === s.key).map(({ point, ...h }) => h);
      return { ...s, hours, ...summarize(s.key, s.name, hours, nowMs) };
    });
  }

  /** Broj dana s prekoračenjem dnevne granične vrijednosti PM10 u tekućoj godini (dozvoljeno 35). */
  async pm10Exceedances(source: 'CAMS' | 'AMS') {
    const rows = await this.db.q<{ point: string; days: number; measured: number }>(
      `SELECT "point", count(*) FILTER (WHERE m > 50)::int "days", count(*)::int "measured" FROM (
         SELECT "point", ("ts" AT TIME ZONE 'Europe/Sarajevo')::date d, avg("pm10") m, count("pm10") n
         FROM air_readings WHERE "source"=$1 AND "ts" >= date_trunc('year', now() AT TIME ZONE 'Europe/Sarajevo') AT TIME ZONE 'Europe/Sarajevo'
         GROUP BY 1,2 HAVING count("pm10") >= 18) x GROUP BY 1`, [source]);
    return Object.fromEntries(rows.map((r) => [r.point, { days: r.days, measured: r.measured }]));
  }
}

/** Samo za lokalni razvoj (RISK_FIXTURE=1): sintetički odgovor u obliku Open-Meteo, nikad u produkciji. */
async function fixtureCams() {
  const start = Math.floor(Date.now() / 3600_000) * 3600 - 72 * 3600;
  const time = Array.from({ length: 168 }, (_, k) => start + k * 3600);
  return AIR_POINTS.map((p, i) => {
    const w = (k: number, base: number, amp: number) => Math.max(0, base + amp * Math.sin((k + i * 3) / 3.8) + (p.key === 'mostar' && k > 88 && k < 118 ? 46 : 0));
    const pm10 = time.map((_, k) => w(k, 22 + i * 2, 9)), pm25 = pm10.map((v) => v * 0.55), o3 = time.map((_, k) => w(k, 55, 25)), no2 = time.map((_, k) => w(k, 14 + (i === 0 ? 10 : 0), 8));
    const european_aqi = time.map((_, k) => Math.round(Math.max(pm10[k] * 0.85, pm25[k] * 1.4, o3[k] * 0.4)));
    return { hourly: { time, european_aqi, pm10, pm2_5: pm25, ozone: o3, nitrogen_dioxide: no2, sulphur_dioxide: time.map(() => 3), carbon_monoxide: time.map(() => 220) } };
  });
}

async function defaultFetch(url: string) {
  const r = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'application/json' }, signal: AbortSignal.timeout(25_000) });
  if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
  return r.json();
}

/* ───────── uvoz mjerenja stanica (CSV) ───────── */

const NUM = (v: string | undefined) => { if (v == null) return null; const t = v.trim().replace(',', '.'); if (!t || t === '-') return null; const n = Number(t); return Number.isFinite(n) && n >= 0 ? n : NaN; };
/** „2026-11-28 13:00“, „2026-11-28T13:00“, „28.11.2026 13:00“ (lokalno vrijeme Sarajevo) */
export function parseLocalTs(v: string): Date | null {
  const s = v.trim();
  let m = s.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{1,2}):(\d{2})/);
  let y, mo, d, h, mi;
  if (m) [, y, mo, d, h, mi] = m;
  else if ((m = s.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})\.?\s+(\d{1,2}):(\d{2})/))) [, d, mo, y, h, mi] = m;
  else return null;
  const guess = Date.UTC(+y, +mo - 1, +d, +h, +mi);
  // pomak za Europe/Sarajevo na taj datum (CET/CEST)
  const off = (new Date(guess).toLocaleString('en-US', { timeZone: 'Europe/Sarajevo', timeZoneName: 'shortOffset' }).match(/GMT([+-]\d+)/)?.[1]) ?? '+1';
  const ts = new Date(guess - Number(off) * 3600_000);
  return Number.isNaN(ts.getTime()) ? null : ts;
}

export function parseStationCsv(text: string) {
  const [headers = [], ...rows] = parseCsv(text);
  const norm = headers.map((h) => h.toLowerCase().replace(/[^a-z0-9.]/g, ''));
  const ix = (...names: string[]) => norm.findIndex((h) => names.includes(h));
  const iSt = ix('stanica', 'station'), iTs = ix('vrijeme', 'datum', 'time', 'ts', 'datumvrijeme');
  const cols: Record<Pol, number> = { pm10: ix('pm10'), pm25: ix('pm2.5', 'pm25'), o3: ix('o3', 'ozon'), no2: ix('no2'), so2: ix('so2'), co: ix('co') };
  if (iSt < 0 || iTs < 0) throw new BadRequestException('CSV mora imati kolone „stanica“ i „vrijeme“, te bar jednu od: pm10, pm2.5, o3, no2, so2, co.');
  if (Object.values(cols).every((c) => c < 0)) throw new BadRequestException('CSV nema nijednu kolonu zagađujuće materije (pm10, pm2.5, o3, no2, so2, co).');
  const errors: { line: number; message: string }[] = [];
  const out: any[][] = [];
  rows.forEach((r, k) => {
    const line = k + 2;
    const st = AIR_STATIONS.find((s) => s.key === r[iSt]?.trim() || s.name.toLowerCase() === r[iSt]?.trim().toLowerCase());
    if (!st) return errors.push({ line, message: `nepoznata stanica „${r[iSt] ?? ''}“ (${AIR_STATIONS.map((s) => s.key).join(', ')})` });
    const ts = parseLocalTs(r[iTs] ?? '');
    if (!ts) return errors.push({ line, message: `neispravno vrijeme „${r[iTs] ?? ''}“ (npr. 2026-11-28 13:00)` });
    if (ts.getTime() > Date.now() + 3600_000) return errors.push({ line, message: 'vrijeme je u budućnosti' });
    const v: Partial<Record<Pol, number | null>> = {};
    for (const p of POLLUTANTS) {
      const n = cols[p] >= 0 ? NUM(r[cols[p]]) : null;
      if (Number.isNaN(n)) return errors.push({ line, message: `neispravna vrijednost ${POL_LABEL[p]} „${r[cols[p]]}“` });
      v[p] = n;
    }
    out.push([st.key, ts.toISOString(), eaqi(v), v.pm25, v.pm10, v.o3, v.no2, v.so2, v.co]);
  });
  return { rows: out, errors, total: rows.length };
}

const csvCell = (v: unknown) => { const s = v == null ? '' : String(v); return /[";\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };

/* ───────── API ───────── */

@Controller('air')
export class AirController {
  constructor(private air: AirService) {}

  @Get()
  async overview() {
    const st = await this.air.state();
    const [stations, camsEx, amsEx] = await Promise.all([this.air.stations(), this.air.pm10Exceedances('CAMS'), this.air.pm10Exceedances('AMS')]);
    const strip = (p: any) => ({ key: p.key, name: p.name, lat: p.lat, lng: p.lng, now: p.now, band: band(p.now?.aqi), days: p.days, alerts: p.alerts, pm10Year: null as any });
    const points = (st.data?.points ?? []).map((p) => ({ ...strip(p), pm10Year: camsEx[p.key] ?? null }));
    const stationsOut = stations.map((s) => ({ ...strip(s), pm10Year: amsEx[s.key] ?? null, hasData: s.hours.length > 0 }));
    const alerts = [...points, ...stationsOut].flatMap((p) => p.alerts).filter((a) => a.date >= new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Sarajevo' }));
    return {
      source: { okAt: st.okAt, error: st.error, stale: st.stale },
      points, stations: stationsOut, alerts, thresholds: THRESHOLDS, bands: BANDS.map((b) => ({ ...b, max: Number.isFinite(b.max) ? b.max : null })), pollutants: POL_LABEL,
    };
  }

  /** Satne vrijednosti za grafikon: prošlost iz arhive, za CAMS uz prognozu. */
  @Get('hours')
  async hours(@Query('point') point: string, @Query('days') days = '7') {
    const isSt = AIR_STATIONS.some((s) => s.key === point);
    if (!isSt && !AIR_POINTS.some((p) => p.key === point)) throw new BadRequestException('Nepoznata lokacija');
    const n = Math.min(90, Math.max(1, parseInt(days, 10) || 7));
    const past = await this.air.readings(isSt ? 'AMS' : 'CAMS', point, new Date(Date.now() - n * 86400_000), new Date());
    let forecast: Hour[] = [];
    if (!isSt) {
      const st = await this.air.state();
      forecast = (st.data?.points.find((p) => p.key === point)?.hours ?? []).filter((h) => Date.parse(h.ts) > Date.now());
    }
    return { point, source: isSt ? 'AMS' : 'CAMS', past: past.map(({ point: _p, ...h }) => h), forecast };
  }

  @Get('export.csv')
  async csv(@Query() q: any, @Res() res: Response) {
    const source = q.source === 'AMS' ? 'AMS' : 'CAMS';
    const point = q.point ? String(q.point) : null;
    const to = q.to ? new Date(`${q.to}T23:59:59Z`) : new Date();
    const from = q.from ? new Date(`${q.from}T00:00:00Z`) : new Date(to.getTime() - 30 * 86400_000);
    if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime()) || from > to) throw new BadRequestException('Neispravan period (od / do, format GGGG-MM-DD)');
    if (to.getTime() - from.getTime() > 400 * 86400_000) throw new BadRequestException('Najduži period za preuzimanje je 400 dana.');
    const rows = await this.air.readings(source, point, from, to);
    const names = Object.fromEntries([...AIR_POINTS, ...AIR_STATIONS].map((p) => [p.key, p.name]));
    const head = ['lokacija', 'vrijeme_utc', 'indeks_eaqi', 'pm10_ug_m3', 'pm2_5_ug_m3', 'o3_ug_m3', 'no2_ug_m3', 'so2_ug_m3', 'co_mg_m3', 'izvor'];
    const label = source === 'AMS' ? 'Mjerenje AMS (uvoz Ministarstva)' : 'Copernicus CAMS (modelska procjena)';
    const body = rows.map((r) => [names[r.point] ?? r.point, r.ts, r.aqi, r.pm10, r.pm25, r.o3, r.no2, r.so2, r.co, label].map(csvCell).join(';'));
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="kvalitet-zraka-${source.toLowerCase()}-${from.toISOString().slice(0, 10)}-${to.toISOString().slice(0, 10)}.csv"`);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.end('﻿' + [head.join(';'), ...body].join('\n'));
  }
}

@Controller('admin')
@UseGuards(AuthGuard)
export class AdminAirController {
  constructor(private air: AirService, private hub: SourceHub, private audit: AuditService) {}

  /** F2-18: stanje vanjskih izvora (zadnji uspjeh, greška, upozorenje). */
  @Get('sources')
  @Can('eko', 'read')
  async sources() {
    return (await this.hub.all()).map(({ data, ...s }) => ({ ...s, items: Array.isArray(data) ? data.length : Array.isArray((data as any)?.points) ? (data as any).points.length : null }));
  }

  @Post('sources/refresh')
  @Can('eko', 'publish')
  async refresh(@Body() b: any, @Req() req: any) {
    const key = String(b?.key ?? '');
    if (!this.hub.list().some((d) => d.key === key)) throw new BadRequestException('Nepoznat izvor');
    const s = await this.hub.refresh(key);
    await this.audit.log(req, { action: 'Ručno osvježio/la izvor podataka', entity: 'eko', entityId: key, target: `${s.label}: ${s.error ? 'greška' : 'uspješno'}` });
    const { data, ...rest } = s;
    return rest;
  }

  /** Uvoz satnih mjerenja stanica (CSV). dryRun=true samo provjerava. */
  @Post('air/import')
  @Can('eko', 'write')
  async import(@Body() b: any, @Req() req: any) {
    const text = String(b?.csv ?? '');
    if (!text.trim()) throw new BadRequestException('Zalijepite ili učitajte CSV.');
    if (text.length > 5_000_000) throw new BadRequestException('CSV je veći od 5 MB; podijelite ga po mjesecima.');
    const r = parseStationCsv(text);
    const report = { total: r.total, valid: r.rows.length, errors: r.errors.slice(0, 50), errorCount: r.errors.length };
    if (b?.dryRun === true || b?.dryRun === 'true') return { ...report, imported: 0, dryRun: true };
    if (r.errors.length) throw new BadRequestException({ statusCode: 400, message: `CSV ima ${r.errors.length} neispravnih redova; ispravite ih i pokušajte ponovo.`, ...report });
    await this.air.saveReadings('AMS', r.rows, req.user?.email ?? null);
    await this.audit.log(req, { action: 'Uvezao/la mjerenja stanica kvaliteta zraka', entity: 'eko', entityId: 'AMS', target: `${r.rows.length} satnih vrijednosti` });
    return { ...report, imported: r.rows.length, dryRun: false };
  }
}
