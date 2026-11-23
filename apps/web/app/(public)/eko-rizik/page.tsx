import Link from 'next/link';
import type { ReactNode } from 'react';
import { apiSafe } from '@/lib/api';
import { EMPTY, LEVEL, LS_STATUS, REPORT_STATUS, WARN_COLOR, fireConfidence, fireTime, fmtTime, peakForecast, type RiskSummary } from '@/lib/risk';
import RiverChart from '@/components/risk/RiverChart';
import RiskStatus from '@/components/risk/RiskStatus';
import RiskMap from '@/components/risk/RiskMapLazy';
import { GRAD, HB1, HB2, Badge, BadgeGroup, Button, Card, Container, FeaturedIcon, Section, SectionHeader } from '@/components/uui';
import { Activity, AlertTriangle, CheckCircle, CloudOff, CloudRaining01, ThermometerWarm, MarkerPin04, LayersThree01, Phone01, RefreshCw01, Waves } from '@untitledui/icons';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Eko-rizik HNK – požari, poplave i klizišta', description: 'Pregled rizika od požara, poplava i klizišta na području Hercegovačko-neretvanskog kantona: satelitska žarišta, meteo upozorenja, protok Neretve i prijave građana.' };

const LV_TONE = { 1: 'success', 2: 'warning', 3: 'error' } as const;

const SourceNote = ({ err, at, src }: { err: string | null; at: string; src: string }) => (
  <p className="flex items-center gap-1.5 text-[14px] leading-5 text-[#737373]">
    {err ? <CloudOff size={16} className="text-[#d92d20]" /> : <RefreshCw01 size={16} className="text-[#079455]" />}
    {err ? `${src}: izvor trenutno nedostupan` : `${src} · osvježeno ${fmtTime(at)}`}
  </p>
);

function Warn({ w }: { w: RiskSummary['warnings']['items'][number] }) {
  return (
    <article className="relative overflow-hidden rounded-[12px] bg-white p-4 pl-5 ring-1 ring-inset ring-[#e5e5e5] shadow-[0_1px_2px_rgba(10,13,18,0.05)]">
      <span aria-hidden className="absolute inset-y-0 left-0 w-1" style={{ background: WARN_COLOR[w.color] ?? '#fadc12' }} />
      <p className="text-[16px] leading-6 font-semibold text-[#171717]">{w.event}</p>
      <p className="mt-0.5 text-[14px] leading-5 text-[#737373]">Regija {w.region} · {fmtTime(w.onset)} – {fmtTime(w.expires)}</p>
      {w.description && <p className="mt-2 text-[14px] leading-5 text-[#525252]">{w.description}</p>}
      {w.instruction && <p className="mt-1 text-[14px] leading-5 text-[var(--br-700)]">{w.instruction}</p>}
    </article>
  );
}

function Kpi({ icon: I, label, value, sub, tone }: { icon: any; label: string; value: string; sub: string; tone: 'gray' | 'warning' | 'error' }) {
  const c = tone === 'error' ? 'text-[#d92d20]' : tone === 'warning' ? 'text-[#dc6803]' : 'text-[#171717]';
  return (
    <Card className="flex min-w-0 flex-col gap-2 p-5 md:p-6">
      <div className="flex items-center justify-between gap-2"><p className="text-[14px] leading-5 font-medium text-[#525252]">{label}</p><I size={20} className="text-[#a3a3a3]" /></div>
      <p className={`text-[30px] leading-[38px] md:text-[36px] md:leading-[44px] font-semibold tracking-[-0.02em] ${c}`}>{value}</p>
      <p className="truncate text-[14px] leading-5 text-[#525252]" title={sub}>{sub}</p>
    </Card>
  );
}

export default async function EkoRizikPage() {
  const d = await apiSafe<RiskSummary>('/risk/summary', EMPTY);
  const lvKey = (d.level in LEVEL ? d.level : 1) as 1 | 2 | 3;
  const lv = LEVEL[lvKey];
  const mostar = d.rivers.items.find((r) => r.key === 'mostar') ?? d.rivers.items[0];
  const activeLs = d.landslides.filter((l) => l.status !== 'SANIRANO').length;
  const warn = d.warnings.items;
  const fires = d.fires.items;

  return (
    <>
      {/* Hero */}
      <section className={`relative isolate overflow-hidden pt-10 pb-14 text-white md:pt-14 md:pb-16 ${GRAD}`}>
        <div aria-hidden className="absolute inset-0 opacity-25 [background-image:radial-gradient(rgba(255,255,255,0.14)_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_70%)]" />
        <Container className="relative">
          <nav aria-label="Putanja" className="mb-8 flex items-center gap-2 text-[14px] font-medium text-[var(--br-200)]"><Link href="/" className="hover:text-white">Naslovna</Link><span className="text-white/30">/</span><span className="font-semibold text-white" aria-current="page">Eko-rizik HNK</span></nav>
          <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-[768px]">
              <BadgeGroup label={lv.short} tone={LV_TONE[lvKey]}>Ažurirano {fmtTime(d.generatedAt)}</BadgeGroup>
              <h1 className="mt-4 text-[36px] leading-[44px] md:text-[60px] md:leading-[72px] font-semibold tracking-[-0.02em] text-white">Eko-rizik HNK</h1>
              <p className="mt-4 md:mt-6 text-[18px] leading-7 md:text-[20px] md:leading-[30px] text-[var(--br-100)]">Požari, poplave i klizišta na jednom mjestu: satelitska žarišta, upozorenja Federalnog hidrometeorološkog zavoda, prognoza protoka Neretve i prijave građana.</p>
              <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row">
                <Link href="/eko-rizik/krizni" className={HB2}><Activity size={20} />Krizni prikaz</Link>
                <Link href="/eko-rizik/prijava" className={HB1}><MarkerPin04 size={20} />Prijavi incident</Link>
              </div>
            </div>
            <RiskStatus d={d} />
          </div>
        </Container>
      </section>

      {/* KPI */}
      <Section tone="gray" className="!py-12 md:!py-16">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Kpi icon={ThermometerWarm} label="Satelitska žarišta (72 h)" value={d.fires.error ? '—' : String(fires.length)} sub={d.fires.error ? 'NASA FIRMS nedostupan' : `${d.fires.last24h} u zadnja 24 sata`} tone={fires.length ? 'error' : 'gray'} />
          <Kpi icon={CloudRaining01} label="Meteo upozorenja" value={d.warnings.error ? '—' : String(warn.length)} sub={warn[0] ? `${warn[0].event} · ${warn[0].region}` : 'Nema aktivnih upozorenja'} tone={warn.some((w) => w.level >= 3) ? 'error' : warn.length ? 'warning' : 'gray'} />
          <Kpi icon={Waves} label="Neretva kod Mostara" value={mostar ? `${Math.round(mostar.discharge[mostar.todayIndex] ?? 0)} m³/s` : '—'} sub={mostar ? `Vrh prognoze ${peakForecast(mostar)} m³/s (10 dana)` : 'Model GloFAS'} tone={mostar?.status === 'VISOKO' ? 'error' : mostar?.status === 'POVISENO' ? 'warning' : 'gray'} />
          <Kpi icon={LayersThree01} label="Klizišta u registru" value={String(d.landslides.length)} sub={`${activeLs} aktivno ili u praćenju`} tone={activeLs ? 'warning' : 'gray'} />
        </div>
      </Section>

      {/* Karta */}
      <Section>
        <SectionHeader eyebrow="Karta rizika" title="Šta se trenutno dešava na terenu">Uključite ili isključite slojeve iznad karte. Satelitska žarišta su toplotne anomalije i ne moraju biti potvrđeni požari.</SectionHeader>
        <div className="mt-10"><RiskMap data={d} /></div>
      </Section>

      {/* Upozorenja + rijeke */}
      <Section tone="gray">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-5">
            <SectionHeader eyebrow="Meteoalarm · FHMZ BiH" title="Meteorološka upozorenja" />
            <div className="mt-8 flex flex-col gap-3">
              {warn.length === 0 && (
                <Card className="flex items-center gap-3 p-4">
                  {d.warnings.error ? <CloudOff size={20} className="text-[#a3a3a3]" /> : <CheckCircle size={20} className="text-[#079455]" />}
                  <p className="text-[14px] text-[#525252]">{d.warnings.error ? 'Upozorenja trenutno nije moguće preuzeti. Provjerite meteoalarm.org.' : 'Za regije Mostar, Livno i Trebinje trenutno nema aktivnih upozorenja.'}</p>
                </Card>
              )}
              {warn.slice(0, 5).map((w, i) => <Warn key={i} w={w} />)}
              {warn.length > 5 && (
                <details>
                  <summary className="cursor-pointer py-1.5 text-[14px] font-semibold text-[var(--br-700)]">Prikaži još {warn.length - 5} upozorenja</summary>
                  <div className="flex flex-col gap-3 pt-2">{warn.slice(5).map((w, i) => <Warn key={i} w={w} />)}</div>
                </details>
              )}
              <SourceNote err={d.warnings.error} at={d.warnings.updatedAt} src="Meteoalarm" />
            </div>
          </div>
          <div className="lg:col-span-7">
            <SectionHeader eyebrow="Copernicus GloFAS · Open-Meteo" title="Protok Neretve i Bune" />
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {d.rivers.items.map((r) => <RiverChart key={r.key} r={r} />)}
              {d.rivers.items.length === 0 && <p className="text-[14px] text-[#525252]">Model protoka trenutno nije dostupan.</p>}
            </div>
            <p className="mt-4 text-[14px] leading-5 text-[#737373]">Vrijednosti su procjena hidrološkog modela GloFAS (rezolucija ~5 km), a ne mjerenja vodomjernih stanica. Status se računa u odnosu na protok iz zadnjih 60 dana. Službene informacije o vodostajima daju FHMZ i Agencija za vodno područje Jadranskog mora.</p>
            <div className="mt-2"><SourceNote err={d.rivers.error} at={d.rivers.updatedAt} src="GloFAS" /></div>
          </div>
        </div>
      </Section>

      {/* Žarišta + klizišta */}
      <Section>
        <div className="grid gap-6 lg:grid-cols-2">
          <ListCard icon={ThermometerWarm} title="Satelitska žarišta" meta="VIIRS 375 m" footer={<SourceNote err={d.fires.error} at={d.fires.updatedAt} src="NASA FIRMS" />}>
            {fires.length === 0 ? (
              <p className="px-6 py-5 text-[14px] text-[#525252]">{d.fires.error ? 'Podaci NASA FIRMS trenutno nisu dostupni.' : 'U posljednja 72 sata sateliti nisu zabilježili toplotne anomalije na području kantona.'}</p>
            ) : (
              <ul className="divide-y divide-[#e5e5e5]">
                {fires.slice(0, 8).map((f, i) => (
                  <li key={i} className="flex items-center justify-between gap-3 px-6 py-3 text-[14px]">
                    <span><b className="block font-medium text-[#171717]">{fireTime(f)}</b><span className="text-[#737373]">{f.lat.toFixed(3)}° N, {f.lng.toFixed(3)}° E</span></span>
                    <span className="text-right text-[#525252]">pouzdanost {fireConfidence(f.confidence)}{f.frp != null && <><br />{f.frp} MW</>}</span>
                  </li>
                ))}
              </ul>
            )}
          </ListCard>
          <ListCard icon={LayersThree01} title="Registar klizišta" meta="CMS · MTTO">
            {d.landslides.length === 0 && <p className="px-6 py-5 text-[14px] text-[#525252]">Registar je prazan.</p>}
            <ul className="divide-y divide-[#e5e5e5]">
              {d.landslides.map((l) => {
                const st = LS_STATUS[l.status] ?? LS_STATUS.PRACENJE;
                const tone = l.status === 'AKTIVNO' ? 'error' : l.status === 'SANIRANO' ? 'success' : 'warning';
                return (
                  <li key={l.id} className="flex items-start justify-between gap-3 px-6 py-3">
                    <span className="min-w-0"><b className="block text-[14px] font-medium text-[#171717]">{l.name}{l.isDemo && <Badge tone="warning" className="ml-2">Demo</Badge>}</b><span className="text-[14px] text-[#737373]">{l.municipality} · rizik {l.risk}/3</span></span>
                    <Badge tone={tone} dot>{st.label}</Badge>
                  </li>
                );
              })}
            </ul>
          </ListCard>
        </div>
      </Section>

      {/* Prijave građana */}
      <Section tone="gray">
        <SectionHeader eyebrow="Građani kao senzori" title="Potvrđene prijave građana" actions={<Button href="/eko-rizik/prijava" size="lg" icon={MarkerPin04}>Nova prijava</Button>}>Prijave se prikazuju nakon što ih službenik Ministarstva provjeri, bez ličnih podataka prijavitelja.</SectionHeader>
        {d.reports.length > 0 && (
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {d.reports.slice(0, 9).map((r) => (
              <Card key={r.id} className="flex flex-col p-5">
                <div className="flex items-center justify-between gap-2"><span className="text-[12px] font-medium text-[#737373]">{r.code}</span><Badge tone="brand">{REPORT_STATUS[r.status] ?? r.status}</Badge></div>
                <p className="mt-3 text-[16px] leading-6 font-semibold text-[#171717]">{r.kindLabel}</p>
                <p className="text-[14px] text-[#737373]">{r.municipality}{r.location ? ` · ${r.location}` : ''} · {fmtTime(r.createdAt)}</p>
                <p className="mt-2 text-[14px] leading-5 text-[#525252] line-clamp-3">{r.description}</p>
              </Card>
            ))}
          </div>
        )}
      </Section>

      {/* Šta raditi */}
      <Section>
        <SectionHeader eyebrow="Priprema i postupanje" title="Šta učiniti u slučaju opasnosti" align="center" />
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {[
            { icon: ThermometerWarm, tone: 'error' as const, t: 'Požar', items: ['Odmah pozovite vatrogasce na 123.', 'Ne palite vatru na otvorenom tokom sušnog perioda.', 'Udaljite se niz vjetar i ne vraćajte se po stvari.'] },
            { icon: Waves, tone: 'brand' as const, t: 'Poplava i bujica', items: ['Pratite upozorenja i ne prelazite preko poplavljenih puteva.', 'Isključite struju i plin ako voda ulazi u objekat.', 'Za pomoć pozovite Civilnu zaštitu na 121.'] },
            { icon: LayersThree01, tone: 'warning' as const, t: 'Klizište i odron', items: ['Uočene pukotine u tlu ili na zidovima prijavite općinskoj službi civilne zaštite.', 'Izbjegavajte kosine i puteve ispod njih nakon jakih kiša.', 'Prijavite lokaciju Ministarstvu putem Eko-prijave.'] },
          ].map((b) => (
            <Card key={b.t} className="p-6 md:p-8">
              <FeaturedIcon icon={b.icon} tone={b.tone} />
              <h3 className="mt-5 text-[20px] leading-[30px] font-semibold text-[#171717]">{b.t}</h3>
              <ul className="mt-4 flex flex-col gap-3">{b.items.map((it) => <li key={it} className="flex gap-3 text-[16px] leading-6 text-[#525252]"><CheckCircle size={20} className="mt-0.5 shrink-0 text-[var(--br-600)]" />{it}</li>)}</ul>
            </Card>
          ))}
        </div>
        <div className="mt-8 flex flex-col gap-4 rounded-[16px] bg-[#fafafa] p-6 ring-1 ring-inset ring-[#e5e5e5] md:flex-row md:items-center md:justify-between md:p-8">
          <p className="flex items-center gap-3 text-[18px] font-semibold text-[#171717]"><Phone01 size={24} className="text-[var(--br-600)]" />Hitni brojevi</p>
          <div className="flex flex-wrap gap-3">
            {[['121', 'Civilna zaštita'], ['123', 'Vatrogasci'], ['124', 'Hitna pomoć'], ['122', 'Policija']].map(([n, l]) => (
              <a key={n} href={`tel:${n}`} className="flex items-baseline gap-2 rounded-[8px] bg-white px-4 py-2.5 ring-1 ring-inset ring-[#d4d4d4] shadow-[0_1px_2px_rgba(10,13,18,0.05)] hover:bg-[#fafafa]"><span className="text-[20px] font-semibold text-[#171717]">{n}</span><span className="text-[14px] text-[#525252]">{l}</span></a>
            ))}
          </div>
        </div>
        <p className="mt-8 max-w-[900px] text-[14px] leading-5 text-[#737373]">Izvori: NASA FIRMS (VIIRS), EFFIS – Copernicus Emergency Management Service, Meteoalarm / Federalni hidrometeorološki zavod, Copernicus GloFAS putem Open-Meteo, registar klizišta i prijave građana MTTO. Stranica služi za informisanje i ne zamjenjuje službena upozorenja nadležnih službi.</p>
      </Section>
    </>
  );
}

function ListCard({ icon: I, title, meta, children, footer }: { icon: any; title: string; meta: string; children: ReactNode; footer?: ReactNode }) {
  return (
    <Card className="flex flex-col overflow-hidden">
      <div className="flex items-center justify-between gap-2 border-b border-[#e5e5e5] px-6 py-5"><h2 className="flex items-center gap-2 text-[18px] leading-7 font-semibold text-[#171717]"><I size={20} className="text-[var(--br-600)]" />{title}</h2><Badge tone="gray">{meta}</Badge></div>
      <div className="flex-1">{children}</div>
      {footer && <div className="border-t border-[#e5e5e5] px-6 py-3">{footer}</div>}
    </Card>
  );
}
