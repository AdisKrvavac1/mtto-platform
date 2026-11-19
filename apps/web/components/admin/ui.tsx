'use client';
import { useEffect, useState } from 'react';

export const input = 'w-full px-3 py-2 rounded-lg bg-surface-container-low border-0 text-text-heading font-body-sm text-body-sm focus:bg-surface-container-lowest focus:outline-none focus:ring-1 focus:ring-primary-container';
export const btnPrimary = 'inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-primary-container text-on-primary font-button text-button hover:bg-institutional-navy-deep shadow-sm transition-colors disabled:opacity-50';
export const btnSecondary = 'inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-surface-container-low hover:bg-surface-container text-primary-container font-button text-button transition-colors disabled:opacity-50';
export const btnGreen = 'inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-secondary text-on-secondary font-button text-button hover:brightness-110 shadow-sm disabled:opacity-50';

export function PageTitle({ kicker, title, children, crumbs, badge, id }: { kicker: string; title: string; children?: React.ReactNode; crumbs?: string[]; badge?: React.ReactNode; id?: string }) {
  return (
    <div className="-mx-space-md lg:-mx-space-lg -mt-space-xl mb-space-xl px-space-md lg:px-space-lg py-space-md bg-surface-container-lowest shadow-sm flex flex-col lg:flex-row lg:items-center lg:justify-between gap-space-md">
      <div className="flex flex-col gap-1 min-w-0">
        <nav className="flex items-center gap-2 text-body-sm text-outline flex-wrap">
          <span>Sustav za upravljanje (CMS)</span>
          {(crumbs ?? [kicker]).map((c, i, arr) => (
            <span key={i} className="contents"><span className="material-symbols-outlined text-[14px]">chevron_right</span><span className={i === arr.length - 1 ? 'text-primary font-semibold' : ''}>{c}</span></span>
          ))}
          {id && <span className="font-label-badge text-label-badge px-2 py-0.5 rounded-lg bg-surface-container text-primary font-mono ml-1">ID: {id}</span>}
        </nav>
        <div className="flex items-center gap-3 flex-wrap"><h1 className="font-headline-sm text-headline-sm text-text-heading truncate">{title}</h1>{badge}</div>
      </div>
      {children && <div className="flex flex-wrap items-center gap-space-sm">{children}</div>}
    </div>
  );
}

export const F2Badge = () => (
  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-surface-container-high text-primary border border-slate-border font-label-badge text-label-badge uppercase align-middle" title="Funkcionalnost iz Faze 2: prikazan dizajn"><span className="material-symbols-outlined text-[13px]">schedule</span>Faza 2</span>
);

export function Field({ label, hint, children, required }: { label: string; hint?: string; children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block space-y-1">
      <span className="flex items-center justify-between font-label-kicker text-label-kicker uppercase tracking-wider text-outline">
        <span>{label}{required && <span className="text-error"> *</span>}</span>
        {hint && <span className="normal-case tracking-normal text-outline">{hint}</span>}
      </span>
      {children}
    </label>
  );
}

export function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`bg-surface-container-lowest rounded-xl shadow-sm ${className}`}>{children}</div>;
}

export function StatusChip({ status }: { status: string }) {
  const map: Record<string, string> = {
    OBJAVLJENO: 'bg-eko-green-light text-eko-green border-eko-green-border',
    NACRT: 'bg-surface-container-high text-on-surface-variant border-slate-border',
    ZAKAZANO: 'bg-herzeg-gold-soft text-[#786000] border-herzeg-gold',
  };
  const label: Record<string, string> = { OBJAVLJENO: 'Objavljeno', NACRT: 'Nacrt', ZAKAZANO: 'Zakazano' };
  return <span className={`inline-flex px-2.5 py-0.5 rounded-full border font-label-badge text-label-badge font-bold ${map[status] ?? map.NACRT}`}>{label[status] ?? status}</span>;
}

export function Toast({ msg, kind = 'ok', onDone }: { msg: string | null; kind?: 'ok' | 'err'; onDone: () => void }) {
  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(onDone, 3500);
    return () => clearTimeout(t);
  }, [msg, onDone]);
  if (!msg) return null;
  return (
    <div role="status" className={`fixed bottom-6 right-6 z-[60] flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg font-button text-button text-white ${kind === 'ok' ? 'bg-eko-green' : 'bg-error'}`}>
      <span className="material-symbols-outlined text-[20px]">{kind === 'ok' ? 'check_circle' : 'error'}</span>{msg}
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
