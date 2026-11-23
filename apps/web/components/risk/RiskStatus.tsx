import type { RiskSummary } from '@/lib/risk';
import { LEVEL, fmtTime } from '@/lib/risk';

/** Vrsta vremena koja najviše utiče na procjenu – bira animaciju. */
export type WeatherKind = 'wind' | 'rain' | 'storm' | 'snow' | 'heat' | 'fire' | 'flood' | 'calm';
type Reason = { kind: WeatherKind; text: string; sub?: string };

const MATCH: [RegExp, WeatherKind][] = [
  [/thunder|grmlj|oluj/i, 'storm'], [/flood|poplav|bujic/i, 'flood'], [/rain|kiš|padavin/i, 'rain'],
  [/snow|ice|snijeg|led|polede/i, 'snow'], [/wind|vjet|bura/i, 'wind'], [/high.?temp|toplin|vruć|heat/i, 'heat'], [/forest.?fire|požar/i, 'fire'],
];
const kindOf = (s: string): WeatherKind => MATCH.find(([re]) => re.test(s))?.[1] ?? 'calm';

/** Razlozi za procjenu, istim pravilima kao API (upozorenja ≥ 2, žarišta u 24 h, protok rijeka). */
export function riskReasons(d: RiskSummary): Reason[] {
  const out: Reason[] = [];
  for (const w of d.warnings.items.filter((x) => x.level >= 2).slice(0, 2)) {
    out.push({ kind: kindOf(`${w.type} ${w.event}`), text: w.event || 'Meteo upozorenje', sub: `${w.region} · do ${fmtTime(w.expires)}` });
  }
  if (d.fires.last24h > 0) out.push({ kind: 'fire', text: `${d.fires.last24h} satelitsk${d.fires.last24h === 1 ? 'o žarište' : 'a žarišta'} u 24 h`, sub: 'NASA FIRMS · nije potvrđen požar' });
  const river = d.rivers.items.find((r) => r.status === 'VISOKO') ?? d.rivers.items.find((r) => r.status === 'POVISENO');
  if (river) out.push({ kind: 'flood', text: `${river.status === 'VISOKO' ? 'Visok' : 'Povišen'} protok: ${river.name}`, sub: 'Prognoza GloFAS' });
  return out;
}

const TONE = {
  1: { dot: '#47cd89', text: '#abefc6', label: 'text-white' },
  2: { dot: '#fdb022', text: '#fedf89', label: 'text-white' },
  3: { dot: '#f97066', text: '#fecdca', label: 'text-white' },
} as const;

/** Mala animirana ilustracija vremena (CSS animacije u cms-theme.css, gase se uz "smanjeno kretanje"). */
export function WeatherGlyph({ kind, size = 72 }: { kind: WeatherKind; size?: number }) {
  const cloud = <path d="M22 44h26a10 10 0 0 0 0-20 14 14 0 0 0-27-3 11 11 0 0 0 1 23Z" fill="rgba(255,255,255,.92)" />;
  return (
    <svg viewBox="0 0 72 72" width={size} height={size} aria-hidden className={`wx wx-${kind}`}>
      {(kind === 'heat' || kind === 'fire' || kind === 'calm') && (
        <g className="wx-sun"><circle cx="36" cy="36" r="11" fill="#fdb022" />{Array.from({ length: 8 }, (_, i) => <rect key={i} x="35" y="12" width="2.5" height="7" rx="1.25" fill="#fdb022" transform={`rotate(${i * 45} 36 36)`} />)}</g>
      )}
      {kind === 'fire' && <path className="wx-flame" d="M36 58c-7 0-11-5-11-10 0-6 6-9 7-15 4 3 5 7 4 10 2-1 3-3 3-5 4 3 8 7 8 11 0 5-4 9-11 9Z" fill="#f97066" />}
      {kind === 'wind' && (
        <g className="wx-wind" stroke="rgba(255,255,255,.9)" strokeWidth="3" strokeLinecap="round" fill="none">
          <path d="M10 26h34a7 7 0 1 0-7-7" /><path d="M6 38h48a7 7 0 1 1-7 7" /><path d="M14 50h22" />
        </g>
      )}
      {(kind === 'rain' || kind === 'storm' || kind === 'snow' || kind === 'flood') && <g transform="translate(0 -6)">{cloud}</g>}
      {(kind === 'rain' || kind === 'flood') && (
        <g className="wx-rain" stroke="#84adff" strokeWidth="2.5" strokeLinecap="round">{[24, 33, 42, 51].map((x, i) => <line key={x} x1={x} y1={44} x2={x - 3} y2={52} style={{ animationDelay: `${i * 0.18}s` }} />)}</g>
      )}
      {kind === 'flood' && <path className="wx-wave" d="M8 62c5-4 9-4 14 0s9 4 14 0 9-4 14 0 9 4 14 0" stroke="#84adff" strokeWidth="2.5" fill="none" strokeLinecap="round" />}
      {kind === 'storm' && <path className="wx-bolt" d="M38 40l-8 13h7l-4 11 11-15h-7l4-9Z" fill="#fdb022" />}
      {kind === 'snow' && <g className="wx-snow" fill="#fff">{[24, 34, 44, 52].map((x, i) => <circle key={x} cx={x} cy={48} r="2.2" style={{ animationDelay: `${i * 0.35}s` }} />)}</g>}
    </svg>
  );
}

export default function RiskStatus({ d }: { d: RiskSummary }) {
  const lvKey = (d.level in LEVEL ? d.level : 1) as 1 | 2 | 3;
  const reasons = riskReasons(d);
  const main = reasons[0]?.kind ?? (lvKey === 1 ? 'calm' : 'wind');
  const t = TONE[lvKey];
  return (
    <div role="status" aria-live="polite" className="w-full rounded-[16px] bg-white/[0.08] p-5 ring-1 ring-inset ring-white/15 backdrop-blur-md lg:w-[420px]">
      <div className="flex items-center gap-4">
        <span className="flex size-[72px] shrink-0 items-center justify-center rounded-[14px] bg-white/[0.06] ring-1 ring-inset ring-white/10"><WeatherGlyph kind={main} size={60} /></span>
        <div className="min-w-0">
          <p className="text-[14px] font-medium text-[var(--br-200)]">Procjena stanja</p>
          <p className="mt-0.5 flex items-center gap-2 text-[22px] leading-8 font-semibold text-white">
            <span className="relative flex size-2.5"><span className="absolute inline-flex size-full animate-ping rounded-full opacity-60" style={{ background: t.dot }} /><span className="relative inline-flex size-2.5 rounded-full" style={{ background: t.dot }} /></span>
            {LEVEL[lvKey].label}
          </p>
          <p className="text-[12px] text-[var(--br-200)]">Ažurirano {fmtTime(d.generatedAt)}</p>
        </div>
      </div>
      <div className="mt-4 border-t border-white/10 pt-4">
        <p className="text-[12px] font-semibold uppercase tracking-[0.06em]" style={{ color: t.text }}>{reasons.length ? 'Zašto' : 'Stanje'}</p>
        {reasons.length ? (
          <ul className="mt-2 flex flex-col gap-2.5">
            {reasons.slice(0, 3).map((r) => (
              <li key={r.text} className="wx-row flex items-start gap-3">
                <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-[8px] bg-white/[0.06]"><WeatherGlyph kind={r.kind} size={24} /></span>
                <span className="min-w-0 text-[14px] leading-5"><b className="block font-semibold text-white">{r.text}</b>{r.sub && <span className="text-[var(--br-200)]">{r.sub}</span>}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-[14px] leading-5 text-[var(--br-100)]">Nema aktivnih upozorenja, žarišta ni povišenog protoka rijeka.</p>
        )}
      </div>
    </div>
  );
}
