// F2-17: kvalitet zraka po općinama HNK. Model Copernicus CAMS (satno, uz prognozu 4 dana) i mjerne stanice
// Ministarstva (AMS Mostar – Kampus, AMS Jablanica) kad su mjerenja uvezena. Pragovi: Pravilnik FBiH 1/12.
import Link from 'next/link';
import { apiSafe } from '@/lib/api';
import { fmtTime } from '@/lib/risk';
import { Badge, Card, Container, HB1, HB2, Head, PageHero } from '@/components/uui';
import { AlertTriangle, CheckCircle, CloudOff, Code02, Download01, Wind01 } from '@untitledui/icons';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Kvalitet zraka', description: 'Indeks kvaliteta zraka, koncentracije čestica i ozona, prognoza i prekoračenja pragova po općinama HNK.' };

type Band = { max: number | null; label: string; color: string; advice: string };
type Hour = { ts: string; aqi: number | null; pm10: number | null; pm25: number | null; o3: number | null; no2: number | null; so2: number | null; co: number | null };
type Day = { date: string; aqiMax: number | null; pm10Mean: number | null; pm25Mean: number | null; o3Max8h: number | null; no2Max: number | null; forecast: boolean };
type Alert = { point: string; name: string; date: string; level: 'granicna' | 'upozorenje' | 'uzbuna'; pol: string; text: string; forecast: boolean };
type Loc = { key: string; name: string; now: Hour | null; band: Band | null; days: Day[]; alerts: Alert[]; pm10Year: { days: number; measured: number } | null; hasData?: boolean };
type Overview = {
  source: { okAt: string | null; error: string | null; stale: boolean };
  points: Loc[]; stations: Loc[]; alerts: Alert[]; bands: Band[];
  thresholds: { pol: string; period: string; limit: number; info?: number; alarm?: number; allowed?: string; unit?: string; note?: string }[];
  pollutants: Record<string, string>;
};
const EMPTY: Overview = { source: { okAt: null, error: 'nedostupno', stale: true }, points: [], stations: [], alerts: [], bands: [], thresholds: [], pollutants: {} };
type Hours = { point: string; source: string; past: Hour[]; forecast: Hour[] };

const POL = { pm10: { l: 'PM10', limit: 50, note: 'dnevna granična vrijednost 50 µg/m³' }, pm25: { l: 'PM2.5', limit: 25, note: 'godišnja granična vrijednost 25 µg/m³' }, o3: { l: 'Ozon', limit: 180, note: 'prag upozorenja 180 µg/m³ (satno)' }, no2: { l: 'NO₂', limit: 200, note: 'satna granična vrijednost 200 µg/m³' } } as const;
type PolKey = keyof typeof POL;
const LEVEL = { uzbuna: ['Prag uzbune', 'error'], upozorenje: ['Upozorenje', 'warning'], granicna: ['Granična vrijednost', 'warning'] } as const;
const day = (d: string) => new Intl.DateTimeFormat('bs-BA', { weekday: 'short', day: 'numeric', month: 'numeric', timeZone: 'UTC' }).format(new Date(`${d}T12:00:00Z`));
const nf = (v: number | null | undefined, d = 0) => (v == null ? '—' : v.toLocaleString('bs-BA', { maximumFractionDigits: d }));

/** Kvadratić u boji razreda indeksa. Boja nikad nije jedini nosilac informacije: uz nju ide i naziv razreda. */
const Swatch = ({ b, size = 12 }: { b: Band | null; size?: number }) => <span aria-hidden className="inline-block shrink-0 rounded-[3px] ring-1 ring-inset ring-black/10" style={{ width: size, height: size, background: b?.color ?? '#e5e5e5' }} />;
const bandOf = (bands: Band[], v: number | null) => (v == null ? null : bands.find((b) => b.max == null || v <= b.max) ?? null);

function Chart({ h, pol }: { h: Hours; pol: PolKey }) {
  const all = [...h.past, ...h.forecast];
  if (all.length < 2) return <p className="py-10 text-center text-[14px] text-[#525252]">Za ovu lokaciju još nema satnih podataka.</p>;
  const W = 1000, H = 260, P = { l: 44, r: 16, t: 16, b: 34 };
  const t0 = Date.parse(all[0].ts), t1 = Date.parse(all.at(-1)!.ts);
  const vals = all.map((x) => x[pol]).filter((v): v is number => v != null);
  const max = Math.max(POL[pol].limit * 1.15, ...vals) * 1.05;
  const x = (ts: string) => P.l + ((Date.parse(ts) - t0) / (t1 - t0 || 1)) * (W - P.l - P.r);
  const y = (v: number) => H - P.b - (v / max) * (H - P.t - P.b);
  const line = (xs: Hour[]) => xs.filter((p) => p[pol] != null).map((p, i) => `${i ? 'L' : 'M'}${x(p.ts).toFixed(1)},${y(p[pol]!).toFixed(1)}`).join('');
  const nowX = h.forecast.length && h.past.length ? x(h.past.at(-1)!.ts) : null;
  const days: string[] = [];
  for (let t = Math.ceil(t0 / 86400_000) * 86400_000; t <= t1; t += 86400_000) days.push(new Date(t).toISOString());
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => Math.round((max * f) / 5) * 5);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={`${POL[pol].l}: satne vrijednosti zadnjih dana i prognoza; ${POL[pol].note}.`}>
      {ticks.map((v) => <g key={v}><line x1={P.l} x2={W - P.r} y1={y(v)} y2={y(v)} stroke="#f0f0f0" /><text x={P.l - 8} y={y(v) + 4} textAnchor="end" fontSize="11" fill="#737373">{v}</text></g>)}
      {days.map((d) => <g key={d}><line x1={x(d)} x2={x(d)} y1={P.t} y2={H - P.b} stroke="#f5f5f5" /><text x={x(d) + 4} y={H - 12} fontSize="11" fill="#737373">{day(d.slice(0, 10))}</text></g>)}
      {nowX != null && <rect x={nowX} y={P.t} width={W - P.r - nowX} height={H - P.t - P.b} fill="var(--br-25, #f5faff)" />}
      <line x1={P.l} x2={W - P.r} y1={y(POL[pol].limit)} y2={y(POL[pol].limit)} stroke="#d92d20" strokeDasharray="6 4" />
      <text x={W - P.r - 4} y={y(POL[pol].limit) - 6} textAnchor="end" fontSize="11" fill="#b42318">{POL[pol].limit} µg/m³</text>
      <path d={line(h.past)} fill="none" stroke="var(--br-600)" strokeWidth="2" />
      {h.forecast.length > 0 && <path d={line([...(h.past.length ? [h.past.at(-1)!] : []), ...h.forecast])} fill="none" stroke="var(--br-600)" strokeWidth="2" strokeDasharray="4 4" />}
      {nowX != null && <text x={nowX + 6} y={P.t + 14} fontSize="11" fontWeight="600" fill="var(--br-700)">Prognoza</text>}
    </svg>
  );
}

function LocCard({ l, bands, active, station }: { l: Loc; bands: Band[]; active: boolean; station?: boolean }) {
  const b = l.band;
  return (
    <Link href={`?lokacija=${l.key}#graf`} scroll={false} aria-current={active ? 'true' : undefined}
      className={`group flex flex-col rounded-[12px] bg-white p-4 sm:p-5 ring-1 ring-inset transition-shadow hover:shadow-[0_4px_8px_-2px_rgba(10,13,18,0.1)] ${active ? 'ring-2 ring-[var(--br-600)]' : 'ring-[#e5e5e5]'}`}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-[16px] font-semibold text-[#171717]">{l.name}</p>
        {l.alerts.some((a) => !a.forecast) && <AlertTriangle size={18} className="text-[#dc6803]" aria-label="Danas prekoračenje praga" />}
      </div>
      {station && !l.hasData ? <p className="mt-3 text-[14px] text-[#525252]">Mjerenja još nisu objavljena.</p> : (
        <>
          <p className="mt-3 flex flex-wrap items-baseline gap-x-2 gap-y-1"><span className="text-[30px] sm:text-[36px] font-semibold leading-none tabular-nums text-[#171717]">{nf(l.now?.aqi)}</span><span className="flex items-center gap-1.5 text-[14px] font-medium text-[#404040]"><Swatch b={b} />{b?.label ?? 'Nema podataka'}</span></p>
          <dl className="mt-4 grid grid-cols-3 gap-2 text-[12px] text-[#737373]">
            {([['PM10', l.now?.pm10], ['PM2.5', l.now?.pm25], ['O₃', l.now?.o3]] as const).map(([k, v]) => <div key={k}><dt>{k}</dt><dd className="text-[14px] font-semibold tabular-nums text-[#404040]">{nf(v)}</dd></div>)}
          </dl>
          {!station && (
            <ol className="mt-4 flex gap-1" aria-label="Najlošiji indeks po danima">
              {l.days.slice(-5).map((d) => { const db = bandOf(bands, d.aqiMax); return (
                <li key={d.date} className="flex-1 text-center" title={`${day(d.date)}: ${db?.label ?? '—'}${d.forecast ? ' (prognoza)' : ''}`}>
                  <span className="block h-1.5 rounded-full" style={{ background: db?.color ?? '#e5e5e5', opacity: d.forecast ? 0.6 : 1 }} />
                  <span className="mt-1 block text-[11px] text-[#737373]">{new Intl.DateTimeFormat('bs-BA', { weekday: 'short', timeZone: 'UTC' }).format(new Date(`${d.date}T12:00:00Z`)).replace(/[.,]/g, '')}</span>
                </li>); })}
            </ol>
          )}
        </>
      )}
      {l.now?.ts && <p className="mt-3 text-[12px] text-[#a3a3a3]">{station ? 'Izmjereno' : 'Procjena za'} {fmtTime(l.now.ts)}</p>}
    </Link>
  );
}

export default async function AirPage({ searchParams }: { searchParams: Promise<{ lokacija?: string; zagadjivac?: string }> }) {
  const sp = await searchParams;
  const d = await apiSafe<Overview>('/air', EMPTY);
  const all = [...d.points, ...d.stations];
  const sel = all.find((p) => p.key === sp.lokacija) ?? d.points[0];
  const pol: PolKey = (sp.zagadjivac && sp.zagadjivac in POL ? sp.zagadjivac : 'pm10') as PolKey;
  const hours = sel ? await apiSafe<Hours>(`/air/hours?point=${sel.key}&days=5`, { point: sel.key, source: '', past: [], forecast: [] }) : null;
  const worst = d.points.filter((p) => p.now?.aqi != null).sort((a, b) => b.now!.aqi! - a.now!.aqi!)[0];
  const mostar = d.points.find((p) => p.key === 'mostar');
  const year = new Date().getFullYear();
  const today = d.alerts.filter((a) => !a.forecast), ahead = d.alerts.filter((a) => a.forecast);
  const csvTo = new Date().toISOString().slice(0, 10), csvFrom = new Date(Date.now() - 30 * 86400_000).toISOString().slice(0, 10);

  return (
    <>
      <PageHero
        crumbs={[{ label: 'Naslovna', href: '/' }, { label: 'Zaštita okoliša', href: '/zastita-okolisa' }, { label: 'Kvalitet zraka' }]}
        eyebrow="Zaštita okoliša" title="Kvalitet zraka"
        stats={[
          { label: 'Indeks u Mostaru', value: mostar?.now?.aqi != null ? `${nf(mostar.now.aqi)} · ${mostar.band?.label.toLowerCase()}` : '—' },
          { label: 'Najlošije trenutno', value: worst ? `${worst.name}, ${nf(worst.now!.aqi)}` : '—' },
          { label: 'Prekoračenja danas', value: String(today.length) },
          { label: 'U prognozi (4 dana)', value: String(ahead.length) },
        ]}
        actions={<><a href={`/api/air/export.csv?from=${csvFrom}&to=${csvTo}`} className={HB1}><Download01 size={20} />Preuzmi CSV (30 dana)</a><Link href="/eko-rizik/prijava?vrsta=ZRAK" className={HB2}><Wind01 size={20} />Prijavi zagađenje zraka</Link></>}
      >
        Evropski indeks kvaliteta zraka i koncentracije čestica, ozona i dušikovog dioksida za svaku općinu kantona, sat po sat, s prognozom za naredna četiri dana.
      </PageHero>

      <section className="bg-white py-16 md:py-20">
        <Container>
          {(d.source.error || d.source.stale) && (
            <p className="mb-8 flex items-start gap-2 rounded-[12px] bg-[#fffcf5] p-4 text-[14px] text-[#b54708] ring-1 ring-inset ring-[#fedf89]"><CloudOff size={20} className="shrink-0" />
              {d.source.okAt ? `Model trenutno ne odgovara. Prikazani su zadnji podaci od ${fmtTime(d.source.okAt)}.` : 'Podaci o kvalitetu zraka trenutno nisu dostupni. Pokušajte kasnije.'}</p>
          )}
          <Head k={`Osvježeno ${d.source.okAt ? fmtTime(d.source.okAt) : '—'}`} t="Stanje po općinama" s="Odaberite općinu za satni grafikon i prognozu." />
          <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-5">
            {d.points.map((p) => <LocCard key={p.key} l={p} bands={d.bands} active={sel?.key === p.key} />)}
          </div>

          {d.alerts.length > 0 ? (
            <div className="mt-10">
              <h2 className="text-[20px] font-semibold text-[#171717]">Prekoračenja pragova</h2>
              <ul className="mt-4 divide-y divide-[#e5e5e5] rounded-[12px] ring-1 ring-inset ring-[#e5e5e5]">
                {d.alerts.map((a, i) => (
                  <li key={i} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-5 py-3 text-[14px]">
                    <Badge tone={LEVEL[a.level][1]} dot>{LEVEL[a.level][0]}</Badge>
                    <span className="font-medium text-[#171717]">{a.name}</span><span className="text-[#525252]">{a.text}</span>
                    <span className="ml-auto text-[#737373]">{day(a.date)}{a.forecast ? ' · prognoza' : ''}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : d.points.length > 0 && (
            <p className="mt-10 flex items-center gap-2 text-[16px] text-[#067647]"><CheckCircle size={20} />Ni danas ni u prognozi za naredna četiri dana nema prekoračenja propisanih pragova.</p>
          )}

          {sel && hours && (
            <Card className="mt-10 scroll-mt-24 p-6" >
              <div id="graf" className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-[20px] font-semibold text-[#171717]">{sel.name}: {POL[pol].l}, satno</h2>
                  <p className="mt-1 text-[14px] text-[#525252]">Crvena linija: {POL[pol].note}. {hours.forecast.length ? 'Isprekidano i osjenčano: prognoza.' : ''}</p>
                </div>
                <nav aria-label="Zagađujuća materija" className="flex gap-1 rounded-[8px] bg-[#fafafa] p-1 ring-1 ring-inset ring-[#e5e5e5]">
                  {(Object.keys(POL) as PolKey[]).map((k) => <Link key={k} href={`?lokacija=${sel.key}&zagadjivac=${k}#graf`} scroll={false} aria-current={k === pol ? 'true' : undefined} className={`rounded-[6px] px-3 py-1.5 text-[14px] font-semibold ${k === pol ? 'bg-white text-[#171717] shadow-[0_1px_2px_rgba(10,13,18,0.08)]' : 'text-[#525252] hover:text-[#171717]'}`}>{POL[k].l}</Link>)}
                </nav>
              </div>
              <div className="mt-6"><Chart h={hours} pol={pol} /></div>
              <div className="mt-6 overflow-x-auto">
                <table className="w-full min-w-[640px] text-left text-[14px]">
                  <caption className="sr-only">Dnevni sažetak za {sel.name}</caption>
                  <thead className="text-[12px] font-medium text-[#525252]"><tr className="border-b border-[#e5e5e5]"><th className="py-2 pr-4">Dan</th><th className="py-2 pr-4">Najlošiji indeks</th><th className="py-2 pr-4 text-right">PM10, prosjek</th><th className="py-2 pr-4 text-right">PM2.5, prosjek</th><th className="py-2 pr-4 text-right">O₃, maks. 8 h</th><th className="py-2 text-right">NO₂, maks. 1 h</th></tr></thead>
                  <tbody className="divide-y divide-[#f0f0f0]">
                    {sel.days.slice(-7).map((x) => { const b = bandOf(d.bands, x.aqiMax); return (
                      <tr key={x.date}>
                        <td className="py-2 pr-4 text-[#404040]">{day(x.date)}{x.forecast && <span className="ml-2 text-[12px] text-[#737373]">prognoza</span>}</td>
                        <td className="py-2 pr-4"><span className="flex items-center gap-2"><Swatch b={b} />{nf(x.aqiMax)} {b ? `· ${b.label.toLowerCase()}` : ''}</span></td>
                        <td className={`py-2 pr-4 text-right tabular-nums ${(x.pm10Mean ?? 0) > 50 ? 'font-semibold text-[#b42318]' : ''}`}>{nf(x.pm10Mean, 1)}</td>
                        <td className="py-2 pr-4 text-right tabular-nums">{nf(x.pm25Mean, 1)}</td>
                        <td className={`py-2 pr-4 text-right tabular-nums ${(x.o3Max8h ?? 0) > 120 ? 'font-semibold text-[#b54708]' : ''}`}>{nf(x.o3Max8h)}</td>
                        <td className="py-2 text-right tabular-nums">{nf(x.no2Max)}</td>
                      </tr>); })}
                  </tbody>
                </table>
              </div>
              <p className="mt-4 text-[12px] text-[#737373]">Vrijednosti u µg/m³. {hours.source === 'AMS' ? 'Izmjereno na stanici Ministarstva.' : 'Procjena modela Copernicus CAMS (prostorna rezolucija oko 10 km), nije službeno mjerenje.'} {sel.pm10Year && `Dana s PM10 iznad 50 µg/m³ u ${year}.: ${sel.pm10Year.days} od ${sel.pm10Year.measured} dana s podacima (dozvoljeno 35 godišnje).`}</p>
            </Card>
          )}
        </Container>
      </section>

      <section className="bg-[#fafafa] py-16 md:py-20">
        <Container>
          <Head k="Mreža Ministarstva" t="Mjerne stanice" s="Automatske mjerne stanice kojima upravlja Ministarstvo. Mjerenja se objavljuju nakon provjere." />
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {d.stations.map((s) => <LocCard key={s.key} l={s} bands={d.bands} active={sel?.key === s.key} station />)}
          </div>
          {d.stations.every((s) => !s.hasData) && <p className="mt-4 text-[14px] text-[#525252]">Dok se ne uspostavi automatsko preuzimanje s Federalnog hidrometeorološkog zavoda, satna mjerenja stanica objavljuju se ručno. Do tada su prikazane procjene modela za općine.</p>}
        </Container>
      </section>

      <section className="bg-white py-16 md:py-20">
        <Container>
          <div className="grid gap-12 lg:grid-cols-2">
            <div>
              <Head k="Indeks kvaliteta zraka" t="Šta znači indeks" s="Evropski indeks (EEA) od 0 naviše; računa se prema najlošijoj zagađujućoj materiji u tom satu." />
              <ul className="mt-8 divide-y divide-[#e5e5e5] rounded-[12px] ring-1 ring-inset ring-[#e5e5e5]">
                {d.bands.map((b, i) => (
                  <li key={b.label} className="flex gap-4 px-5 py-4">
                    <Swatch b={b} size={16} />
                    <div><p className="text-[14px] font-semibold text-[#171717]">{b.label} <span className="font-normal text-[#737373]">{i === 0 ? `0–${b.max}` : b.max == null ? `više od ${d.bands[i - 1].max}` : `${d.bands[i - 1].max}–${b.max}`}</span></p><p className="mt-0.5 text-[14px] text-[#525252]">{b.advice}</p></div>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <Head k="Propisi" t="Granične vrijednosti i pragovi" s="Pravilnik o načinu vršenja monitoringa kvaliteta zraka (Službene novine FBiH 1/12, 9/16)." />
              <div className="mt-8 overflow-x-auto rounded-[12px] ring-1 ring-inset ring-[#e5e5e5]">
                <table className="w-full min-w-[520px] text-left text-[14px]">
                  <thead className="bg-[#fafafa] text-[12px] font-medium text-[#525252]"><tr><th className="px-4 py-3">Materija</th><th className="px-4 py-3">Period</th><th className="px-4 py-3 text-right">Granična</th><th className="px-4 py-3 text-right">Upozorenje / uzbuna</th><th className="px-4 py-3">Dozvoljeno prekoračenja</th></tr></thead>
                  <tbody className="divide-y divide-[#e5e5e5]">
                    {d.thresholds.map((t, i) => (
                      <tr key={i}><td className="px-4 py-3 font-medium text-[#171717]">{d.pollutants[t.pol] ?? t.pol}</td><td className="px-4 py-3 text-[#525252]">{t.period}</td>
                        <td className="px-4 py-3 text-right tabular-nums">{t.limit} {t.unit ?? 'µg/m³'}</td>
                        <td className="px-4 py-3 text-right tabular-nums">{t.info || t.alarm ? [t.info, t.alarm].filter(Boolean).join(' / ') : '—'}</td>
                        <td className="px-4 py-3 text-[#525252]">{t.allowed ?? '—'}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-3 text-[12px] text-[#737373]">Prag uzbune za SO₂ i NO₂ važi kad je prekoračen tri sata zaredom. Za ozon je 120 µg/m³ ciljna 8-satna vrijednost.</p>
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-[#fafafa] py-12">
        <Container>
          <div className="flex flex-col gap-4 rounded-[16px] bg-white p-6 ring-1 ring-inset ring-[#e5e5e5] md:flex-row md:items-center md:justify-between">
            <div><p className="flex items-center gap-2 text-[16px] font-semibold text-[#171717]"><Code02 size={20} className="text-[#737373]" />Otvoreni podaci</p>
              <p className="mt-1 text-[14px] text-[#525252]">Satne vrijednosti od početka arhive, u CSV-u i JSON-u, bez prijave. Do 400 dana po preuzimanju.</p></div>
            <div className="flex flex-wrap gap-3">
              <a href={`/api/air/export.csv?from=${csvFrom}&to=${csvTo}`} className="inline-flex h-10 items-center gap-1.5 rounded-[8px] px-4 text-[14px] font-semibold text-[#404040] ring-1 ring-inset ring-[#d4d4d4] hover:bg-[#fafafa]"><Download01 size={18} />Model CAMS</a>
              <a href={`/api/air/export.csv?source=AMS&from=${csvFrom}&to=${csvTo}`} className="inline-flex h-10 items-center gap-1.5 rounded-[8px] px-4 text-[14px] font-semibold text-[#404040] ring-1 ring-inset ring-[#d4d4d4] hover:bg-[#fafafa]"><Download01 size={18} />Mjerne stanice</a>
              <a href="/api/air" className="inline-flex h-10 items-center rounded-[8px] px-4 text-[14px] font-semibold text-[#404040] ring-1 ring-inset ring-[#d4d4d4] hover:bg-[#fafafa]">JSON</a>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
