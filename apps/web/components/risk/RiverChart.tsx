import type { River } from '@/lib/risk';
import { RIVER_STATUS, peakForecast } from '@/lib/risk';

/** Mali SVG grafikon: zadnjih 60 dana (puna linija) i prognoza 10 dana (isprekidano) s gornjom granicom ansambla. */
export default function RiverChart({ r, dark = false }: { r: River; dark?: boolean }) {
  const W = 320, H = 96, P = 4;
  const vals = r.discharge.map((v) => v ?? NaN);
  const mx = r.max.map((v) => v ?? NaN);
  const all = [...vals, ...mx].filter((v) => !isNaN(v));
  const st = RIVER_STATUS[r.status];
  const today = vals[r.todayIndex];
  if (!all.length) {
    return <div className={`rounded-[8px] p-[16px] ${dark ? 'bg-white/5 text-white/70' : 'bg-[#f8f9ff] text-[#737780]'} font-pub text-[13px]`}>{r.name}: nema podataka modela.</div>;
  }
  const top = Math.max(...all) * 1.08, n = vals.length - 1;
  const x = (i: number) => P + (i / n) * (W - 2 * P);
  const y = (v: number) => H - P - (v / top) * (H - 2 * P);
  const path = (arr: number[], from: number, to: number) => arr.slice(from, to + 1).map((v, k) => (isNaN(v) ? '' : `${k === 0 ? 'M' : 'L'}${x(from + k).toFixed(1)},${y(v).toFixed(1)}`)).join(' ');
  const tx = x(r.todayIndex);
  const line = dark ? '#7dd3fc' : '#0a3663';
  return (
    <figure className={`rounded-[8px] p-[16px] flex flex-col gap-[8px] ${dark ? 'bg-white/5' : 'bg-white shadow-[0px_1px_2px_rgba(0,0,0,0.05)]'}`}>
      <figcaption className="flex items-start justify-between gap-[8px]">
        <span className="flex flex-col">
          <span className={`font-pub font-semibold text-[15px] leading-[22px] ${dark ? 'text-white' : 'text-[#002042]'}`}>{r.name}</span>
          <span className={`font-rob text-[12px] leading-[18px] ${dark ? 'text-white/60' : 'text-[#737780]'}`}>Danas {isNaN(today) ? '—' : `${Math.round(today)} m³/s`}{` · vrh prognoze ${peakForecast(r)} m³/s`}</span>
        </span>
        <span className={`shrink-0 px-[8px] py-[2px] rounded-[2px] font-pub font-bold text-[11px] tracking-[0.44px] uppercase leading-[14px] ${st.cls}`}>{st.label}</span>
      </figcaption>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-[96px]" role="img" aria-label={`Protok ${r.name}: zadnjih 60 dana i prognoza 10 dana`}>
        <rect x={tx} y={0} width={W - tx} height={H} fill={dark ? 'rgba(255,255,255,0.05)' : '#f8f9ff'} />
        <path d={path(mx, r.todayIndex, n)} fill="none" stroke="#eb851c" strokeWidth={1.2} strokeDasharray="3 3" />
        <path d={path(vals, 0, r.todayIndex)} fill="none" stroke={line} strokeWidth={1.8} />
        <path d={path(vals, r.todayIndex, n)} fill="none" stroke={line} strokeWidth={1.8} strokeDasharray="5 3" />
        <line x1={tx} x2={tx} y1={0} y2={H} stroke={dark ? 'rgba(255,255,255,0.35)' : '#c3c6d0'} strokeWidth={1} />
        {!isNaN(today) && <circle cx={tx} cy={y(today)} r={3.5} fill={line} />}
      </svg>
      <div className={`flex justify-between font-rob text-[11px] ${dark ? 'text-white/50' : 'text-[#737780]'}`}><span>−60 dana</span><span>danas</span><span>+10 dana</span></div>
    </figure>
  );
}
