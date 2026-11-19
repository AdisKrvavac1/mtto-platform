'use client';
import { useEffect, useState } from 'react';

export const input = 'w-full h-10 rounded border border-[#cbd5e1] bg-white px-3 font-body-sm text-body-sm text-on-surface focus:border-mtto-primary focus:ring-[3px] focus:ring-[rgba(0,171,235,0.25)] focus:outline-none';
export const btnPrimary = 'inline-flex items-center justify-center gap-1.5 h-10 px-4 rounded bg-mtto-primary text-white font-button text-button hover:bg-mtto-navy disabled:opacity-50';
export const btnSecondary = 'inline-flex items-center justify-center gap-1.5 h-10 px-4 rounded border-[1.5px] border-mtto-primary text-mtto-primary font-button text-button hover:bg-slate-surface disabled:opacity-50';
export const btnGreen = 'inline-flex items-center justify-center gap-1.5 h-10 px-4 rounded bg-eko-green text-white font-button text-button hover:brightness-110 disabled:opacity-50';

export function PageTitle({ kicker, title, children }: { kicker: string; title: string; children?: React.ReactNode }) {
  return (
    <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-slate-border p-space-md md:p-space-lg mb-space-lg flex flex-col md:flex-row md:items-end justify-between gap-space-md">
      <div>
        <p className="font-label-kicker text-label-kicker uppercase tracking-wider text-on-surface-variant">{kicker}</p>
        <h1 className="font-headline-md text-headline-md font-bold text-text-heading">{title}</h1>
      </div>
      {children && <div className="flex flex-wrap gap-space-sm">{children}</div>}
    </div>
  );
}

export function Field({ label, hint, children, required }: { label: string; hint?: string; children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block space-y-1">
      <span className="flex items-center justify-between font-label-badge text-label-badge uppercase tracking-wider text-on-surface-variant">
        <span>{label}{required && <span className="text-error"> *</span>}</span>
        {hint && <span className="normal-case tracking-normal text-outline">{hint}</span>}
      </span>
      {children}
    </label>
  );
}

export function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`bg-surface-container-lowest rounded-xl shadow-sm border border-slate-border ${className}`}>{children}</div>;
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
