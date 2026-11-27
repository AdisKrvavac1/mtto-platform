'use client';
import Link from 'next/link';
import { useEffect, useState, type ReactNode } from 'react';
import { AlertCircle, ArrowDown, ArrowUp, CheckCircle, ChevronRight, Clock, DotsVertical, HomeLine } from '@untitledui/icons';
import { Badge, CountUp, FeaturedIcon } from './portal';

export { Badge, FeaturedIcon };
type Icon = React.FC<React.SVGProps<SVGSVGElement> & { size?: number }>;

/* ───────── Untitled UI PRO v8 – osnovne klase ───────── */
export const input = 'w-full h-10 px-3 py-2 rounded-[8px] bg-white border border-[#d4d4d4] text-[#171717] text-[16px] leading-6 placeholder:text-[#737373] shadow-[0_1px_2px_rgba(10,13,18,0.05)] focus:outline-none focus:border-[#d6bbfb] focus:ring-4 focus:ring-[#9e77ed]/25 disabled:bg-[#fafafa] disabled:text-[#737373] [&:is(textarea)]:h-auto';
const btnBase = 'inline-flex items-center justify-center gap-1.5 h-10 px-[14px] rounded-[8px] text-[14px] leading-5 font-semibold whitespace-nowrap transition-colors disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:size-5 [&_svg]:shrink-0';
const skeu = 'shadow-[0_1px_2px_rgba(10,13,18,0.05),inset_0_-2px_0_rgba(10,13,18,0.05),inset_0_0_0_1px_rgba(10,13,18,0.18)] border-2 border-white/10';
export const btnPrimary = `${btnBase} ${skeu} bg-[#7f56d9] text-white hover:bg-[#6941c6]`;
export const btnSecondary = `${btnBase} bg-white text-[#404040] ring-1 ring-inset ring-[#d4d4d4] shadow-[0_1px_2px_rgba(10,13,18,0.05)] hover:bg-[#fafafa] hover:text-[#262626] [&_svg]:text-[#a3a3a3]`;
export const btnTertiary = `${btnBase} text-[#525252] hover:bg-[#fafafa] hover:text-[#404040] [&_svg]:text-[#a3a3a3]`;
export const btnGreen = btnPrimary;
export const btnDanger = `${btnBase} ${skeu} bg-[#d92d20] text-white hover:bg-[#b42318]`;
export const iconBtn = 'inline-flex size-9 items-center justify-center rounded-[8px] text-[#a3a3a3] hover:bg-[#fafafa] hover:text-[#525252] [&_svg]:size-5';

export const th = 'px-6 py-3 text-left text-[12px] leading-[18px] font-semibold text-[#525252] bg-[#fafafa] border-b border-[#e5e5e5] whitespace-nowrap';
export const td = 'px-6 py-4 text-[14px] leading-5 text-[#525252] border-b border-[#e5e5e5] align-middle';
export const tr = 'hover:bg-[#fafafa] transition-colors [&:last-child>td]:border-b-0';

/* ───────── Page header (Untitled "Page header – simple") ───────── */
export function PageTitle({ kicker, title, children, crumbs, badge, id }: { kicker: string; title: string; children?: ReactNode; crumbs?: string[]; badge?: ReactNode; id?: string }) {
  return (
    <div className="mb-8 flex flex-col gap-5">
      <nav aria-label="Putanja" className="flex flex-wrap items-center gap-1.5 text-[14px] leading-5 font-semibold text-[#525252]">
        <Link href="/admin" className="rounded-[6px] p-1 text-[#a3a3a3] hover:bg-[#fafafa] hover:text-[#525252]" aria-label="Kontrolna ploča"><HomeLine size={20} /></Link>
        {(crumbs ?? [kicker]).map((c, i, arr) => (
          <span key={i} className="contents"><ChevronRight size={16} className="text-[#d4d4d4]" /><span className={i === arr.length - 1 ? 'rounded-[6px] bg-[#fafafa] px-2 py-1 text-[#404040]' : 'px-2 py-1'}>{c}</span></span>
        ))}
        {id && <Badge tone="gray" className="ml-1">ID {id}</Badge>}
      </nav>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3"><h1 className="text-[24px] leading-8 lg:text-[30px] lg:leading-[38px] font-semibold text-[#171717]">{title}</h1>{badge}</div>
          {crumbs && kicker && <p className="mt-1 text-[16px] leading-6 text-[#525252]">{kicker}</p>}
        </div>
        {children && <div className="flex flex-wrap items-center gap-3">{children}</div>}
      </div>
    </div>
  );
}

/** Uvodno zaglavlje kontrolne ploče ("Welcome back, …"). */
export function WelcomeHeader({ title, sub, actions }: { title: string; sub?: string; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
      <div><h1 className="text-[24px] leading-8 lg:text-[30px] lg:leading-[38px] font-semibold text-[#171717]">{title}</h1>{sub && <p className="mt-1 text-[16px] leading-6 text-[#525252]">{sub}</p>}</div>
      {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
    </div>
  );
}

/* ───────── Kartice ───────── */
export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`bg-white rounded-[12px] ring-1 ring-inset ring-[#e5e5e5] shadow-[0_1px_2px_rgba(10,13,18,0.05)] ${className}`}>{children}</div>;
}

/** Zaglavlje kartice: naslov + bedž + opis, akcije desno, donja linija. */
export function CardHeader({ title, badge, description, actions, menu = false }: { title: ReactNode; badge?: ReactNode; description?: ReactNode; actions?: ReactNode; menu?: boolean }) {
  return (
    <div className="flex flex-col gap-4 border-b border-[#e5e5e5] px-4 py-5 md:flex-row md:items-start md:justify-between md:px-6">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2"><h2 className="text-[18px] leading-7 font-semibold text-[#171717]">{title}</h2>{badge}</div>
        {description && <p className="mt-1 text-[14px] leading-5 text-[#525252]">{description}</p>}
      </div>
      {(actions || menu) && <div className="flex shrink-0 flex-wrap items-center gap-3">{actions}{menu && <button type="button" className={iconBtn} aria-label="Više opcija"><DotsVertical /></button>}</div>}
    </div>
  );
}

/** Metrička kartica (Untitled "Metric item" s trendom i sparkline grafom). */
export function MetricCard({ title, value, trend, trendLabel = 'prošli mjesec', spark, href, icon, footer }: { title: string; value: ReactNode; trend?: number | null; trendLabel?: string; spark?: number[]; href?: string; icon?: Icon; footer?: ReactNode }) {
  const up = (trend ?? 0) >= 0;
  const body = (
    <>
      <div className="flex items-start justify-between gap-2">
        {icon ? <FeaturedIcon icon={icon} size="md" /> : <h3 className="text-[16px] leading-6 font-semibold text-[#171717]">{title}</h3>}
        <span className={iconBtn + ' -mr-2 -mt-2'} aria-hidden><DotsVertical /></span>
      </div>
      {icon && <h3 className="mt-4 text-[14px] leading-5 font-medium text-[#525252]">{title}</h3>}
      <div className={`${icon ? 'mt-2' : 'mt-5'} flex items-end justify-between gap-4`}>
        <div className="min-w-0">
          <p className="text-[30px] leading-[38px] lg:text-[36px] lg:leading-[44px] font-semibold tracking-[-0.02em] text-[#171717]">{typeof value === 'string' || typeof value === 'number' ? <CountUp value={value} /> : value}</p>
          {trend != null && (
            <p className="mt-2 flex items-center gap-2 text-[14px] leading-5 font-medium text-[#525252]">
              <span className={`flex items-center gap-0.5 ${up ? 'text-[#067647]' : 'text-[#d92d20]'}`}>{up ? <ArrowUp size={16} /> : <ArrowDown size={16} />}{Math.abs(trend)}%</span>vs {trendLabel}
            </p>
          )}
          {footer && <div className="mt-2 text-[14px] leading-5 text-[#525252]">{footer}</div>}
        </div>
        {spark && spark.length > 1 && <Sparkline data={spark} up={up} />}
      </div>
    </>
  );
  const cls = 'flex flex-col rounded-[12px] bg-white p-5 ring-1 ring-inset ring-[#e5e5e5] shadow-[0_1px_2px_rgba(10,13,18,0.05)] md:p-6';
  return href ? <Link href={href} className={`${cls} uui-lift hover:ring-[#d4d4d4]`}>{body}</Link> : <div className={cls}>{body}</div>;
}

export function Sparkline({ data, up = true, w = 112, h = 56 }: { data: number[]; up?: boolean; w?: number; h?: number }) {
  const max = Math.max(...data), min = Math.min(...data), r = max - min || 1;
  const pts = data.map((v, i) => [(i / (data.length - 1)) * w, h - 4 - ((v - min) / r) * (h - 8)]);
  const d = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  const c = up ? '#17b26a' : '#f04438';
  const id = `sp${up ? 'u' : 'd'}${data.length}${Math.round(data[0] * 10)}`;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="shrink-0" aria-hidden>
      <defs><linearGradient id={id} x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor={c} stopOpacity=".18" /><stop offset="1" stopColor={c} stopOpacity="0" /></linearGradient></defs>
      <path d={`${d} L${w},${h} L0,${h} Z`} fill={`url(#${id})`} />
      <path d={d} fill="none" stroke={c} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

/** Stupčasti graf (Untitled "Bar chart" – brand nijanse, naslagani stupci). */
export function BarChart({ labels, series, height = 220 }: { labels: string[]; series: { name: string; data: number[]; color: string }[]; height?: number }) {
  const totals = labels.map((_, i) => series.reduce((s, x) => s + (x.data[i] || 0), 0));
  const max = Math.max(1, ...totals);
  const ticks = [1, 0.75, 0.5, 0.25, 0].map((t) => Math.round(max * t));
  return (
    <div>
      <div className="flex gap-3">
        <div className="flex flex-col justify-between pb-6 text-right text-[12px] leading-[18px] text-[#525252]" style={{ height }}>{ticks.map((t, i) => <span key={i}>{t}</span>)}</div>
        <div className="relative min-w-0 flex-1">
          <div className="absolute inset-x-0 top-0 flex flex-col justify-between" style={{ height: height - 24 }}>{ticks.map((_, i) => <span key={i} className="h-px bg-[#f5f5f5]" />)}</div>
          <div className="relative flex items-end justify-between gap-1 sm:gap-2" style={{ height: height - 24 }}>
            {labels.map((l, i) => (
              <div key={l} className="group relative flex h-full flex-1 flex-col-reverse items-center" title={`${l}: ${totals[i]}`}>
                {series.map((s) => <span key={s.name} className="w-full max-w-[32px] first:rounded-b-[2px] last:rounded-t-[6px]" style={{ height: `${((s.data[i] || 0) / max) * 100}%`, background: s.color }} />)}
              </div>
            ))}
          </div>
          <div className="mt-2 flex justify-between gap-1 sm:gap-2">{labels.map((l, i) => <span key={l} className={`min-w-0 flex-1 truncate text-center text-[12px] leading-[18px] text-[#525252] ${labels.length > 6 && i % 2 ? "max-sm:invisible" : ""}`}>{l}</span>)}</div>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-4">{series.map((s) => <span key={s.name} className="flex items-center gap-2 text-[14px] text-[#525252]"><span className="size-2 rounded-full" style={{ background: s.color }} />{s.name}</span>)}</div>
    </div>
  );
}

/** Untitled "Button group" (segmentirani filter). */
export function ButtonGroup<T extends string>({ items, value, onChange }: { items: { value: T; label: ReactNode }[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="inline-flex max-w-full overflow-x-auto rounded-[8px] shadow-[0_1px_2px_rgba(10,13,18,0.05)] ring-1 ring-inset ring-[#d4d4d4] [scrollbar-width:none]" role="group">
      {items.map((it, i) => (
        <button key={it.value} type="button" onClick={() => onChange(it.value)} aria-pressed={value === it.value}
          className={`flex h-10 items-center gap-2 whitespace-nowrap px-4 text-[14px] leading-5 font-semibold ${i ? 'border-l border-[#d4d4d4]' : ''} ${i === 0 ? 'rounded-l-[8px]' : ''} ${i === items.length - 1 ? 'rounded-r-[8px]' : ''} ${value === it.value ? 'bg-[#fafafa] text-[#262626]' : 'bg-white text-[#404040] hover:bg-[#fafafa]'}`}>
          {it.label}
        </button>
      ))}
    </div>
  );
}

/** Untitled "Tabs – underline". */
export function Tabs<T extends string>({ items, value, onChange }: { items: { value: T; label: ReactNode; count?: number }[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="flex gap-3 overflow-x-auto border-b border-[#e5e5e5] [scrollbar-width:none]" role="tablist">
      {items.map((it) => (
        <button key={it.value} role="tab" type="button" aria-selected={value === it.value} onClick={() => onChange(it.value)}
          className={`-mb-px flex items-center gap-2 whitespace-nowrap border-b-2 px-1 pb-3 text-[14px] leading-5 font-semibold ${value === it.value ? 'border-[#7f56d9] text-[#6941c6]' : 'border-transparent text-[#737373] hover:text-[#404040]'}`}>
          {it.label}{it.count != null && <span className={`rounded-full px-2 text-[12px] leading-[18px] font-medium ring-1 ring-inset ${value === it.value ? 'bg-[#f9f5ff] text-[#6941c6] ring-[#e9d7fe]' : 'bg-[#fafafa] text-[#404040] ring-[#e5e5e5]'}`}>{it.count}</span>}
        </button>
      ))}
    </div>
  );
}

/** Untitled "Empty state". */
export function EmptyState({ icon, title, children, action }: { icon: Icon; title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center px-6 py-12 text-center">
      <FeaturedIcon icon={icon} size="lg" />
      <p className="mt-4 text-[16px] leading-6 font-semibold text-[#171717]">{title}</p>
      {children && <p className="mt-1 max-w-[352px] text-[14px] leading-5 text-[#525252]">{children}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function Avatar({ name, size = 40, online }: { name: string; size?: number; online?: boolean }) {
  const ini = name.split(/\s+/).map((w) => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();
  return (
    <span className="relative inline-flex shrink-0 items-center justify-center rounded-full bg-[#f5f5f5] font-semibold text-[#525252] ring-1 ring-inset ring-black/10" style={{ width: size, height: size, fontSize: size * 0.4 }}>
      {ini}{online && <span className="absolute bottom-0 right-0 size-2.5 rounded-full bg-[#17b26a] ring-[1.5px] ring-white" />}
    </span>
  );
}

export function ProgressBar({ value, color = '#7f56d9' }: { value: number; color?: string }) {
  return <div className="h-2 w-full overflow-hidden rounded-full bg-[#e5e5e5]"><div className="h-full rounded-full" style={{ width: `${Math.max(0, Math.min(100, value))}%`, background: color }} /></div>;
}

export const F2Badge = () => <Badge tone="gray"><Clock size={12} className="mr-0.5 text-[#a3a3a3]" />Faza 2</Badge>;

export function Field({ label, hint, children, required }: { label: string; hint?: string; children: ReactNode; required?: boolean }) {
  return (
    <label className="block space-y-1.5">
      <span className="flex items-center justify-between gap-2 text-[14px] leading-5 font-medium text-[#404040]">
        <span>{label}{required && <span className="text-[#7f56d9]">*</span>}</span>
        {hint && <span className="font-normal text-[#737373]">{hint}</span>}
      </span>
      {children}
    </label>
  );
}

export function StatusChip({ status }: { status: string }) {
  const map: Record<string, ['success' | 'gray' | 'warning' | 'error' | 'brand', string]> = {
    OBJAVLJENO: ['success', 'Objavljeno'], NACRT: ['gray', 'Nacrt'], ZAKAZANO: ['brand', 'Zakazano'],
    NA_ODOBRENJU: ['warning', 'Na odobrenju'], VRACENO: ['error', 'Vraćeno na doradu'], POVUCENO: ['gray', 'Povučeno'],
    VAZECA: ['success', 'Važeća'], U_OBNOVI: ['warning', 'U obnovi'], ISTEKLA: ['error', 'Istekla'], VAZECI: ['success', 'Važeći'], ARHIVIRAN: ['gray', 'Arhiviran'], STAVLJEN_VAN_SNAGE: ['warning', 'Van snage'], ZAMIJENJEN: ['gray', 'Zamijenjen'],
  };
  const [tone, label] = map[status] ?? ['gray', status];
  return <Badge tone={tone} dot>{label}</Badge>;
}

export function Toast({ msg, kind = 'ok', onDone }: { msg: string | null; kind?: 'ok' | 'err'; onDone: () => void }) {
  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(onDone, 3500);
    return () => clearTimeout(t);
  }, [msg, onDone]);
  if (!msg) return null;
  return (
    <div role="status" className="fixed bottom-6 right-6 z-[60] flex max-w-[400px] items-start gap-4 rounded-[12px] bg-white p-4 pr-5 ring-1 ring-inset ring-[#d4d4d4] shadow-[0_12px_16px_-4px_rgba(10,13,18,0.08),0_4px_6px_-2px_rgba(10,13,18,0.03)]">
      <FeaturedIcon icon={kind === 'ok' ? CheckCircle : AlertCircle} tone={kind === 'ok' ? 'success' : 'error'} size="md" />
      <span className="pt-2 text-[14px] leading-5 font-semibold text-[#171717]">{msg}</span>
    </div>
  );
}

export function useToast() {
  const [state, setState] = useState<{ msg: string | null; kind: 'ok' | 'err' }>({ msg: null, kind: 'ok' });
  return {
    ok: (msg: string) => setState({ msg, kind: 'ok' }),
    err: (msg: string) => setState({ msg, kind: 'err' }),
    node: <Toast msg={state.msg} kind={state.kind} onDone={() => setState((s) => ({ ...s, msg: null }))} />,
  };
}
