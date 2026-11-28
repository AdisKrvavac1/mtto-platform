'use client';
// F2-07: polje pretrage s prijedlozima dok korisnik kuca (ARIA combobox). Enter bez odabira otvara /pretraga.
import { useRouter } from 'next/navigation';
import { useEffect, useId, useRef, useState } from 'react';
import { SearchLg } from '@untitledui/icons';

type Sug = { kind: string; kindLabel: string; title: string; url: string; meta: string | null };

export function SearchBox({ initial = '', size = 'md', placeholder = 'Pretraga vijesti, propisa, registara, usluga', onNavigate }: { initial?: string; size?: 'md' | 'lg'; placeholder?: string; onNavigate?: () => void }) {
  const router = useRouter();
  const id = useId();
  const [q, setQ] = useState(initial);
  const [items, setItems] = useState<Sug[]>([]);
  const [open, setOpen] = useState(false);
  const [act, setAct] = useState(-1);
  const box = useRef<HTMLDivElement>(null);
  const seq = useRef(0);

  useEffect(() => { setQ(initial); }, [initial]);
  useEffect(() => {
    const t = q.trim();
    if (t.length < 2) { setItems([]); return; }
    const n = ++seq.current;
    const h = window.setTimeout(async () => {
      try {
        const r = await fetch(`/api/search/suggest?q=${encodeURIComponent(t)}`, { cache: 'no-store' });
        if (n === seq.current && r.ok) { setItems(await r.json()); setAct(-1); }
      } catch { /* prijedlozi nisu obavezni */ }
    }, 180);
    return () => window.clearTimeout(h);
  }, [q]);
  useEffect(() => {
    const off = (e: MouseEvent) => { if (!box.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', off);
    return () => document.removeEventListener('mousedown', off);
  }, []);

  const go = (url: string) => { setOpen(false); onNavigate?.(); router.push(url); };
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (act >= 0 && items[act]) return go(items[act].url);
    if (q.trim()) go(`/pretraga?q=${encodeURIComponent(q.trim())}`);
  };
  const key = (e: React.KeyboardEvent) => {
    if (!open || !items.length) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setAct((a) => (a + 1 >= items.length ? -1 : a + 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setAct((a) => (a <= 0 ? items.length - 1 : a - 1)); }
    else if (e.key === 'Escape') { setOpen(false); setAct(-1); }
  };
  const lg = size === 'lg';
  const show = open && items.length > 0;

  return (
    <div ref={box} className="relative w-full">
      <form action="/pretraga" role="search" onSubmit={submit}
        className={`flex items-center gap-2 rounded-[8px] bg-white px-3.5 ring-1 ring-inset ring-[#d5d7da] shadow-[0_1px_2px_rgba(10,13,18,0.05)] focus-within:ring-2 focus-within:ring-[var(--br-500)] ${lg ? 'h-14' : 'h-11'}`}>
        <SearchLg size={lg ? 22 : 20} className="shrink-0 text-[#a4a7ae]" />
        <input name="q" value={q} onChange={(e) => { setQ(e.target.value); setOpen(true); }} onFocus={() => setOpen(true)} onKeyDown={key}
          role="combobox" aria-expanded={show} aria-controls={`${id}-list`} aria-autocomplete="list" aria-activedescendant={act >= 0 ? `${id}-${act}` : undefined}
          aria-label="Pretraga portala" placeholder={placeholder} autoComplete="off" enterKeyHint="search"
          className={`min-w-0 flex-1 border-0 bg-transparent p-0 text-[#181d27] placeholder:text-[#717680] !shadow-none focus:outline-none focus:ring-0 ${lg ? 'text-[18px]' : 'text-[16px]'}`} />
        {lg && <button type="submit" className="h-10 shrink-0 rounded-[6px] bg-[var(--br-600)] px-4 text-[15px] font-semibold text-white hover:bg-[var(--br-700)]">Traži</button>}
      </form>
      {show && (
        <ul id={`${id}-list`} role="listbox" aria-label="Prijedlozi" className="absolute inset-x-0 top-full z-50 mt-1.5 overflow-hidden rounded-[8px] bg-white py-1 shadow-[0_12px_16px_-4px_rgba(10,13,18,0.08),0_4px_6px_-2px_rgba(10,13,18,0.03)] ring-1 ring-[#e9eaeb]">
          {items.map((s, i) => (
            <li key={s.url} id={`${id}-${i}`} role="option" aria-selected={i === act}
              onMouseDown={(e) => { e.preventDefault(); go(s.url); }} onMouseEnter={() => setAct(i)}
              className={`cursor-pointer px-3.5 py-2 ${i === act ? 'bg-[#fafafa]' : ''}`}>
              <span className="block truncate text-[15px] font-medium text-[#181d27]">{s.title}</span>
              <span className="block truncate text-[12px] text-[#717680]">{s.kindLabel}{s.meta && s.meta !== s.kindLabel ? ` · ${s.meta}` : ''}</span>
            </li>
          ))}
          <li role="option" aria-selected={false} onMouseDown={(e) => { e.preventDefault(); go(`/pretraga?q=${encodeURIComponent(q.trim())}`); }}
            className="cursor-pointer border-t border-[#f0f0f0] px-3.5 py-2 text-[14px] font-semibold text-[var(--br-700)] hover:bg-[#fafafa]">Svi rezultati za „{q.trim()}“</li>
        </ul>
      )}
    </div>
  );
}
