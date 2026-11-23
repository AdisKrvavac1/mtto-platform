/* Sekcija "Eko-monitoring uživo" iz MTTO Figme: kvalitet zraka, protok Neretve i građanski eko-alarm. */
import Link from 'next/link';
import type { ReactNode } from 'react';
import { aqiClass, type RiskSummary } from '@/lib/risk';
import { KINDS } from '@/lib/reportKinds';
import { ArrowRight, Bell01, Send01, Waves, Wind01 } from '@untitledui/icons';
import { Badge, Container, CountUp, FeaturedIcon, GRAD, Head } from './index';
import RiverFlow from '@/components/risk/RiverFlow';

const btn = 'inline-flex items-center justify-center gap-1.5 rounded-[8px] font-semibold whitespace-nowrap transition-colors';
const green = `${btn} border-2 border-white/10 shadow-[0_1px_2px_rgba(10,13,18,0.05),inset_0_-2px_0_rgba(10,13,18,0.05),inset_0_0_0_1px_rgba(10,13,18,0.18)] bg-[var(--br-600)] text-white hover:bg-[var(--br-700)]`;
const glass = `${btn} bg-white/10 text-white ring-1 ring-inset ring-white/25 backdrop-blur-md hover:bg-white/15`;

export default function EkoMonitoring({ risk, title = 'Eko-monitoring uživo', intro }: { risk: RiskSummary; title?: string; intro?: ReactNode }) {
  const air = risk.air?.items ?? [];
  const rivers = risk.rivers.items.slice(0, 4);
  return (
      
      <section id="eko-monitoring" className={`py-16 md:py-24 ${GRAD}`}>
        <Container>
          <Head dark k="Mreža mjernih podataka" t={title} s={intro ?? 'Kvalitet zraka (Copernicus CAMS), meteo upozorenja (Meteoalarm) i protok rijeka (GloFAS) za područje kantona.'} action={<Link href="/eko-rizik" className={`${glass} h-11 px-4 text-[16px]`}>Karta rizika<ArrowRight size={20} /></Link>} />
          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_440px] lg:items-stretch">
          <div>
            <div className="grid gap-4 sm:grid-cols-3">
              {(air.length ? air : [{ key: 'm', name: 'Mostar', aqi: null, pm25: null, pm10: null, o3: null, time: null }]).map((a) => {
                const c = aqiClass(a.aqi);
                return (
                  <div key={a.key} className="rounded-[12px] bg-white/10 p-5 ring-1 ring-inset ring-white/15 backdrop-blur-md">
                    <p className="flex items-center justify-between gap-2 text-[18px] font-semibold text-white">{a.name}<span className={`rounded-full px-2 py-0.5 text-[12px] font-medium ${c.tone === 'success' ? 'bg-[var(--gr-50)] text-[var(--gr-700)]' : c.tone === 'warning' ? 'bg-[#fffaeb] text-[#b54708]' : c.tone === 'error' ? 'bg-[#fef3f2] text-[#b42318]' : 'bg-white/15 text-white'}`}>AQI {a.aqi != null ? <CountUp value={a.aqi} /> : '—'}</span></p>
                    <p className="flex items-center gap-1.5 text-[14px] text-[var(--gr-300)]"><Wind01 size={14} />Kvalitet: {c.label.toLowerCase()}</p>
                    <dl className="mt-4 space-y-1.5 text-[14px] text-[var(--br-100)]">{([['PM2.5', a.pm25], ['PM10', a.pm10], ['O₃', a.o3]] as const).map(([l, v]) => <div key={l} className="flex justify-between"><dt>{l}</dt><dd className="font-semibold text-white">{v != null ? `${v} µg/m³` : '—'}</dd></div>)}</dl>
                  </div>
                );
              })}
            </div>
            <div className="mt-6 flex items-center justify-between gap-2"><p className="flex items-center gap-2 text-[18px] font-semibold text-white"><Waves size={20} className="text-[var(--br-300)]" />Protok Neretve i Bune</p><span className="text-[12px] font-medium text-[var(--br-200)]">Model GloFAS · dnevna prognoza</span></div>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              {rivers.map((r) => <RiverFlow key={r.key} r={r} />)}
              {rivers.length === 0 && <p className="text-[14px] text-[var(--br-200)]">Model protoka trenutno nije dostupan.</p>}
            </div>
            {risk.air?.error && <p className="mt-3 text-[12px] text-[var(--br-200)]">Podaci o zraku trenutno nisu dostupni.</p>}
          </div>
          <div className="flex flex-col rounded-[16px] bg-white p-5 shadow-[0_24px_48px_-12px_rgba(10,13,18,0.25)] md:p-6">
            <div className="flex items-center justify-between gap-3"><span className="flex items-center gap-3"><FeaturedIcon icon={Bell01} tone="success" size="md" /><span className="text-[18px] font-semibold text-[#171717]">Građanski eko-alarm</span></span><Badge tone="success">Prijava 24/7</Badge></div>
            <p className="mt-4 text-[14px] leading-5 text-[#525252]">Uočili ste divlju deponiju, požar, zagađenje vode ili klizište? Odaberite vrstu incidenta i prijavite ga direktno Ministarstvu, s lokacijom i fotografijom.</p>
            <div className="mt-5 grid flex-1 grid-cols-2 content-start gap-2">
              {KINDS.map(([k, l, I]) => (
                <Link key={k} href={`/eko-rizik/prijava?vrsta=${k}`} className="group flex items-center gap-2 rounded-[8px] px-3 py-2.5 text-[14px] font-medium text-[#404040] ring-1 ring-inset ring-[#e5e5e5] transition-colors hover:bg-[var(--br-25)] hover:ring-[var(--br-300)]">
                  <I size={18} className="shrink-0 text-[var(--br-600)] transition-transform group-hover:scale-110" /><span className="truncate">{l}</span>
                </Link>
              ))}
            </div>
            <Link href="/eko-rizik/prijava" className={`${green} mt-5 h-11 w-full text-[16px]`}><Send01 size={20} />Prijavi incident</Link>
            <p className="mt-4 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[12px] text-[#737373]"><span>Hitno:</span>{[['123', 'vatrogasci'], ['121', 'civilna zaštita'], ['124', 'hitna']].map(([n, l]) => <a key={n} href={`tel:${n}`} className="font-semibold text-[#404040] hover:text-[var(--br-700)]">{n} <span className="font-normal text-[#737373]">{l}</span></a>)}</p>
          </div>
          </div>
        </Container>
      </section>

  );
}
