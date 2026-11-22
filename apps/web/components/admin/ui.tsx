'use client';
import { useEffect, useState } from 'react';

// Untitled UI PRO (v8) – kontrole forme i dugmad (sm/md: 40 px visina, radius 8, skeuomorfna sjena)
export const input = 'w-full h-10 px-3 py-2 rounded-[8px] bg-white border border-[#d4d4d4] text-[#171717] text-[14px] leading-5 placeholder:text-[#737373] shadow-[0_1px_2px_rgba(10,13,18,0.05)] focus:outline-none focus:border-[#d6bbfb] focus:ring-4 focus:ring-[#9e77ed]/25 disabled:bg-[#fafafa] disabled:text-[#737373] [&:is(textarea)]:h-auto';
const btnBase = 'inline-flex items-center justify-center gap-1.5 h-10 px-[14px] rounded-[8px] text-[14px] leading-5 font-semibold whitespace-nowrap transition-colors disabled:opacity-50 disabled:cursor-not-allowed [&_.material-symbols-outlined]:text-[20px]';
const skeu = 'shadow-[0_1px_2px_rgba(10,13,18,0.05),inset_0_-2px_0_rgba(10,13,18,0.05),inset_0_0_0_1px_rgba(10,13,18,0.18)]';
export const btnPrimary = `${btnBase} ${skeu} bg-[#7f56d9] text-white hover:bg-[#6941c6]`;
export const btnSecondary = `${btnBase} bg-white text-[#404040] border border-[#d4d4d4] shadow-[0_1px_2px_rgba(10,13,18,0.05)] hover:bg-[#fafafa] hover:text-[#262626] [&_.material-symbols-outlined]:text-[#a3a3a3]`;
export const btnGreen = btnPrimary; // Untitled UI: glavna akcija je uvijek brand boja
export const btnDanger = `${btnBase} ${skeu} bg-[#d92d20] text-white hover:bg-[#b42318]`;

/** Zaglavlje stranice – Untitled UI "Page header": naslov (display-xs/sm), podnaslov, akcije desno, putanja iznad. */
export function PageTitle({ kicker, title, children, crumbs, badge, id }: { kicker: string; title: string; children?: React.ReactNode; crumbs?: string[]; badge?: React.ReactNode; id?: string }) {
  return (
    <div className="mb-8 flex flex-col gap-5">
      <nav aria-label="Putanja" className="flex items-center gap-2 text-[14px] leading-5 font-medium text-[#525252] flex-wrap">
        <a href="/admin" className="text-[#a3a3a3] hover:text-[#525252]" aria-label="Kontrolna ploča"><span className="material-symbols-outlined text-[20px] align-middle">home</span></a>
        {(crumbs ?? [kicker]).map((c, i, arr) => (
          <span key={i} className="contents"><span className="material-symbols-outlined text-[16px] text-[#d4d4d4]">chevron_right</span><span className={i === arr.length - 1 ? 'text-[#7f56d9] font-semibold' : ''}>{c}</span></span>
        ))}
        {id && <span className="ml-1 text-[12px] leading-[18px] font-medium px-2 py-[2px] rounded-[6px] border border-[#d4d4d4] text-[#404040] font-mono">ID: {id}</span>}
      </nav>
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 pb-5 border-b border-[#e5e5e5]">
        <div className="flex flex-col gap-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap"><h1 className="text-[24px] leading-8 lg:text-[30px] lg:leading-[38px] font-semibold text-[#171717] truncate">{title}</h1>{badge}</div>
          {crumbs && kicker && <p className="text-[16px] leading-6 text-[#525252]">{kicker}</p>}
        </div>
        {children && <div className="flex flex-wrap items-center gap-3">{children}</div>}
      </div>
    </div>
  );
}

export const F2Badge = () => (
  <span className="inline-flex items-center gap-1 pl-1.5 pr-2 py-[2px] rounded-full bg-[#fafafa] text-[#404040] border border-[#e5e5e5] text-[12px] leading-[18px] font-medium align-middle" title="Funkcionalnost iz Faze 2: prikazan dizajn"><span className="material-symbols-outlined text-[12px] text-[#a3a3a3]">schedule</span>Faza 2</span>
);

export function Field({ label, hint, children, required }: { label: string; hint?: string; children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block space-y-1.5">
      <span className="flex items-center justify-between gap-2 text-[14px] leading-5 font-medium text-[#404040]">
        <span>{label}{required && <span className="text-[#7f56d9]">*</span>}</span>
        {hint && <span className="font-normal text-[#737373] text-[13px]">{hint}</span>}
      </span>
      {children}
    </label>
  );
}

export function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`bg-white rounded-[12px] border border-[#e5e5e5] shadow-[0_1px_2px_rgba(10,13,18,0.05)] ${className}`}>{children}</div>;
}

export function StatusChip({ status }: { status: string }) {
  // Untitled UI "Badge" s tačkom (pill, xs medium)
  const map: Record<string, [string, string]> = {
    OBJAVLJENO: ['bg-[#ecfdf3] text-[#067647] border-[#abefc6]', 'bg-[#17b26a]'],
    NACRT: ['bg-[#fafafa] text-[#404040] border-[#e5e5e5]', 'bg-[#a3a3a3]'],
    ZAKAZANO: ['bg-[#fffaeb] text-[#b54708] border-[#fedf89]', 'bg-[#f79009]'],
  };
  const label: Record<string, string> = { OBJAVLJENO: 'Objavljeno', NACRT: 'Nacrt', ZAKAZANO: 'Zakazano' };
  const [cls, dot] = map[status] ?? map.NACRT;
  return <span className={`inline-flex items-center gap-1.5 pl-1.5 pr-2 py-[2px] rounded-full border text-[12px] leading-[18px] font-medium whitespace-nowrap ${cls}`}><span className={`size-1.5 rounded-full ${dot}`} />{label[status] ?? status}</span>;
}

export function Toast({ msg, kind = 'ok', onDone }: { msg: string | null; kind?: 'ok' | 'err'; onDone: () => void }) {
  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(onDone, 3500);
    return () => clearTimeout(t);
  }, [msg, onDone]);
  if (!msg) return null;
  return (
    <div role="status" className="fixed bottom-6 right-6 z-[60] flex items-start gap-3 p-4 pr-5 rounded-[12px] bg-white border border-[#d4d4d4] shadow-[0_12px_16px_-4px_rgba(10,13,18,0.08),0_4px_6px_-2px_rgba(10,13,18,0.03)] max-w-[400px]">
      <span className={`flex items-center justify-center size-8 rounded-full ring-[6px] ${kind === 'ok' ? 'bg-[#dcfae6] text-[#079455] ring-[#ecfdf3]' : 'bg-[#fee4e2] text-[#d92d20] ring-[#fef3f2]'}`}><span className="material-symbols-outlined text-[18px]">{kind === 'ok' ? 'check_circle' : 'error'}</span></span>
      <span className="pt-1.5 text-[14px] leading-5 font-semibold text-[#171717]">{msg}</span>
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
