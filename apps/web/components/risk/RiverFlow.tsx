import type { River } from '@/lib/risk';
import { peakForecast } from '@/lib/risk';
import { CountUp } from '@/components/uui';

const STATUS: Record<River['status'], { label: string; dot: string; water: string }> = {
  NORMALNO: { label: 'Uobičajen protok', dot: '#47cd89', water: '#53b1fd' },
  POVISENO: { label: 'Povišen protok', dot: '#fdb022', water: '#84adff' },
  VISOKO: { label: 'Visok protok', dot: '#f97066', water: '#a4bcfd' },
  NEPOZNATO: { label: 'Nema podataka', dot: '#a4a7ae', water: '#53b1fd' },
};

/**
 * Animirani prikaz protoka: brzina strujnica raste s omjerom današnjeg protoka i višegodišnjeg prosjeka (GloFAS),
 * a ispod je kriva zadnjih 14 dana i prognoze 10 dana koja se iscrta pri učitavanju.
 * Podaci su dnevni model, ne mjerenje u realnom vremenu.
 */
export default function RiverFlow({ r, dark = true }: { r: River; dark?: boolean }) {
  const st = STATUS[r.status] ?? STATUS.NEPOZNATO;
  const today = r.discharge[r.todayIndex];
  const ratio = Math.min(3, Math.max(0.35, r.ratio ?? 1));
  const dur = (5.5 / ratio).toFixed(2);
  // kriva: 14 dana prije + prognoza
  const from = Math.max(0, r.todayIndex - 14);
  const vals = r.discharge.slice(from).map((v) => (v == null ? NaN : v));
  const ok = vals.filter((v) => !isNaN(v));
  const W = 240, H = 48;
  const top = ok.length ? Math.max(...ok) * 1.1 : 1;
  const x = (i: number) => (i / Math.max(1, vals.length - 1)) * W;
  const y = (v: number) => H - 2 - (v / top) * (H - 6);
  const d = vals.map((v, i) => (isNaN(v) ? '' : `${i && !isNaN(vals[i - 1]) ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`)).join(' ');
  const tx = x(r.todayIndex - from);
  const muted = dark ? 'text-[var(--br-200)]' : 'text-[#535862]';
  return (
    <div className={`overflow-hidden rounded-[12px] ${dark ? 'bg-white/[0.07] ring-1 ring-inset ring-white/15' : 'bg-white ring-1 ring-inset ring-[#e9eaeb]'}`}>
      {/* rijeka */}
      <svg viewBox="0 0 240 44" preserveAspectRatio="none" className="block h-11 w-full" aria-hidden>
        <defs><linearGradient id={`w-${r.key}`} x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor={st.water} stopOpacity=".35" /><stop offset="1" stopColor={st.water} stopOpacity=".12" /></linearGradient></defs>
        <path d="M0 14 C60 6 120 24 240 12 V34 C150 40 80 26 0 34 Z" fill={`url(#w-${r.key})`} />
        {[18, 24, 30].map((yy, i) => (
          <path key={yy} className="flow-line" d={`M0 ${yy} C60 ${yy - 6} 120 ${yy + 8} 240 ${yy - 4}`} fill="none" stroke={st.water} strokeOpacity={0.55 + i * 0.15} strokeWidth="1.6" strokeLinecap="round" style={{ animationDuration: `${dur}s`, animationDelay: `-${i * 0.9}s` }} />
        ))}
      </svg>
      <div className="px-4 pb-4 pt-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className={`truncate text-[14px] font-medium ${muted}`}>{r.name}</p>
            <p className={`text-[22px] leading-8 font-semibold ${dark ? 'text-white' : 'text-[#181d27]'}`}>{today != null ? <CountUp value={`${Math.round(today)} m³/s`} /> : '—'}</p>
          </div>
          <span className={`mt-1 inline-flex shrink-0 items-center gap-1.5 rounded-full px-2 py-0.5 text-[12px] font-medium ${dark ? 'bg-white/10 text-white' : 'bg-[#fafafa] text-[#414651] ring-1 ring-inset ring-[#e9eaeb]'}`}><span className="relative flex size-1.5"><span className="absolute inline-flex size-full animate-ping rounded-full opacity-60" style={{ background: st.dot }} /><span className="relative inline-flex size-1.5 rounded-full" style={{ background: st.dot }} /></span>{st.label}</span>
        </div>
        {ok.length > 1 && (
          <svg viewBox={`0 0 ${W} ${H}`} className="mt-2 block h-12 w-full" role="img" aria-label={`${r.name}: zadnjih 14 dana i prognoza 10 dana, vrh ${peakForecast(r)} m³/s`}>
            <line x1={tx} x2={tx} y1="0" y2={H} stroke={dark ? 'rgba(255,255,255,.25)' : '#d5d7da'} strokeDasharray="2 3" />
            <path className="draw-line" d={d} fill="none" stroke={st.water} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" pathLength={1} />
          </svg>
        )}
        <p className={`mt-1 flex justify-between text-[12px] ${muted}`}><span>−14 dana</span><span>danas</span><span>vrh {peakForecast(r)} m³/s</span></p>
      </div>
    </div>
  );
}
