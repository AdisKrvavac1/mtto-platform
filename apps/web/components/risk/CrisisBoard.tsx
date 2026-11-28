'use client';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import RiverChart from './RiverChart';
import { LEVEL, LS_STATUS, WARN_COLOR, fireConfidence, fireTime, fmtTime, type RiskSummary, down } from '@/lib/risk';

const RiskMap = dynamic(() => import('./RiskMap'), { ssr: false, loading: () => <div className="h-full min-h-[420px] bg-white/5 animate-pulse rounded-[8px]" /> });
const REFRESH = 5 * 60_000;
const Icon = ({ n, s = 20, c = '' }: { n: string; s?: number; c?: string }) => <span aria-hidden className={`material-symbols-outlined shrink-0 leading-none ${c}`} style={{ fontSize: s }}>{n}</span>;

/** Krizni prikaz za operativni centar / zidni ekran: tamna tema, automatsko osvježavanje svakih 5 minuta. */
export default function CrisisBoard({ initial }: { initial: RiskSummary }) {
  const [d, setD] = useState(initial);
  const [now, setNow] = useState<Date | null>(null);
  const [stale, setStale] = useState(false);

  useEffect(() => {
    setNow(new Date());
    const clock = setInterval(() => setNow(new Date()), 1000);
    const poll = setInterval(async () => {
      try {
        const r = await fetch('/api/risk/summary', { cache: 'no-store' });
        if (!r.ok) throw new Error(String(r.status));
        setD(await r.json()); setStale(false);
      } catch { setStale(true); }
    }, REFRESH);
    return () => { clearInterval(clock); clearInterval(poll); };
  }, []);

  const lv = LEVEL[d.level] ?? LEVEL[1];
  const active = d.landslides.filter((l) => l.status !== 'SANIRANO');

  return (
    <div className="min-h-screen bg-[#061424] text-white flex flex-col">
      <header className={`flex flex-wrap items-center justify-between gap-[12px] px-[16px] md:px-[24px] py-[12px] ${lv.bg}`}>
        <div className="flex items-center gap-[12px]">
          <Icon n={lv.icon} s={32} />
          <div className="flex flex-col">
            <span className="font-space font-bold text-[12px] tracking-[1.2px] uppercase opacity-90">Eko-rizik HNK · krizni prikaz</span>
            <span className="font-pub font-bold text-[24px] md:text-[28px] leading-[1.1]">{lv.label}</span>
          </div>
        </div>
        <div className="flex items-center gap-[16px]">
          <span className="font-rmono text-[28px] md:text-[34px] tabular-nums" suppressHydrationWarning>{now ? now.toLocaleTimeString('bs-BA', { timeZone: 'Europe/Sarajevo' }) : '--:--:--'}</span>
          <Link href="/eko-rizik" className="bg-black/20 hover:bg-black/30 rounded-[4px] px-[12px] py-[8px] font-pub font-semibold text-[14px] flex items-center gap-[6px]"><Icon n="close_fullscreen" s={18} />Izlaz</Link>
        </div>
      </header>
      {stale && <p className="bg-[#93000a] px-[24px] py-[6px] font-pub text-[13px]">Osvježavanje nije uspjelo – prikazani su zadnji dostupni podaci ({fmtTime(d.generatedAt)}).</p>}

      <div className="flex-1 grid grid-cols-1 xl:grid-cols-12 gap-[16px] p-[16px] md:p-[24px]">
        <div className="xl:col-span-8 flex flex-col gap-[16px]">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-[12px]">
            {[
              ['local_fire_department', 'Žarišta 24 h', down(d.fires) ? '—' : d.fires.last24h, d.fires.last24h ? 'text-[#ff8a73]' : ''],
              ['thunderstorm', 'Upozorenja', down(d.warnings) ? '—' : d.warnings.items.length, d.warnings.items.length ? 'text-[#fadc12]' : ''],
              ['water', 'Rijeke povišeno', d.rivers.items.filter((r) => r.status === 'POVISENO' || r.status === 'VISOKO').length, ''],
              ['landslide', 'Aktivna klizišta', active.length, active.length ? 'text-[#ffb870]' : ''],
            ].map(([i, l, v, c]) => (
              <div key={l as string} className="bg-white/5 rounded-[8px] p-[16px] flex flex-col gap-[4px]">
                <span className="flex items-center gap-[6px] font-pub font-bold text-[12px] tracking-[0.6px] uppercase text-white/70"><Icon n={i as string} s={16} />{l}</span>
                <span className={`font-rob font-extrabold text-[44px] leading-[48px] tabular-nums ${c}`}>{v as any}</span>
              </div>
            ))}
          </div>
          <div className="flex-1 min-h-[420px]"><RiskMap data={d} height={560} dark /></div>
        </div>

        <aside className="xl:col-span-4 flex flex-col gap-[16px]">
          <section className="bg-white/5 rounded-[8px] p-[16px] flex flex-col gap-[8px]">
            <h2 className="font-pub font-bold text-[16px] flex items-center gap-[8px]"><Icon n="thunderstorm" s={18} />Meteo upozorenja</h2>
            {d.warnings.items.length === 0 && <p className="text-white/70 font-pub text-[14px]">{down(d.warnings) ? 'Izvor nedostupan.' : 'Nema aktivnih upozorenja.'}</p>}
            {d.warnings.items.slice(0, 5).map((w, i) => (
              <div key={i} className="border-l-[5px] pl-[10px] py-[2px]" style={{ borderColor: WARN_COLOR[w.color] ?? '#fadc12' }}>
                <p className="font-pub font-semibold text-[14px]">{w.event} · {w.region}</p>
                <p className="font-rob text-[12px] text-white/60">do {fmtTime(w.expires)}</p>
              </div>
            ))}
          </section>
          <section className="bg-white/5 rounded-[8px] p-[16px] flex flex-col gap-[8px]">
            <h2 className="font-pub font-bold text-[16px] flex items-center gap-[8px]"><Icon n="local_fire_department" s={18} />Zadnja žarišta</h2>
            {d.fires.items.length === 0 && <p className="text-white/70 font-pub text-[14px]">{down(d.fires) ? 'Izvor nedostupan.' : 'Nema detekcija u 72 h.'}</p>}
            {d.fires.items.slice(0, 5).map((f, i) => (
              <p key={i} className="font-rob text-[13px] flex justify-between gap-2"><span>{fireTime(f)}</span><span className="text-white/60">{f.lat.toFixed(2)}, {f.lng.toFixed(2)} · {fireConfidence(f.confidence)}</span></p>
            ))}
          </section>
          <section className="flex flex-col gap-[8px]">
            {d.rivers.items.slice(0, 2).map((r) => <RiverChart key={r.key} r={r} dark />)}
          </section>
          <section className="bg-white/5 rounded-[8px] p-[16px] flex flex-col gap-[8px]">
            <h2 className="font-pub font-bold text-[16px] flex items-center gap-[8px]"><Icon n="landslide" s={18} />Klizišta u praćenju</h2>
            {active.length === 0 && <p className="text-white/70 font-pub text-[14px]">Nema aktivnih zapisa.</p>}
            {active.slice(0, 5).map((l) => (
              <p key={l.id} className="font-pub text-[13px] flex justify-between gap-2"><span>{l.name}</span><span style={{ color: LS_STATUS[l.status]?.color }} className="font-bold uppercase text-[11px] brightness-150">{LS_STATUS[l.status]?.label}</span></p>
            ))}
          </section>
          <p className="font-rob text-[12px] text-white/50">Osvježava se svakih 5 minuta · zadnje {fmtTime(d.generatedAt)} · hitno: 121 / 123 / 124</p>
        </aside>
      </div>
    </div>
  );
}
