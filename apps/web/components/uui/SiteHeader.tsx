'use client';
/* Untitled UI "Dropdown header navigation" – plutajuća traka (rounded-2xl), padajući meniji s ikonama i opisima. */
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import {
  AlertTriangle, Building07, ChevronDown, FileSearch02, Globe02, Menu02, Phone01, SearchLg, Sun, Users01, Waves, XClose, Ticket01, Scales02,
} from '@untitledui/icons';
import type { Icon } from './index';

type Item = { href: string; label: string; desc?: string; icon?: Icon };
type Nav = { label: string; href?: string; items?: Item[]; match?: string[] };

export const NAV: Nav[] = [
  { label: 'Vijesti', href: '/vijesti', match: ['/vijesti'] },
  {
    label: 'E-usluge', match: ['/e-usluge', '/registri', '/turisticki-vodici', '/propisi'], items: [
      { href: '/e-usluge', label: 'Centar e-usluga', desc: 'Svi registri, obrasci i javni uvidi na jednom mjestu.', icon: Globe02 },
      { href: '/registri/okolisne-dozvole', label: 'Okolišne dozvole', desc: 'Javni registar izdatih okolišnih dozvola.', icon: FileSearch02 },
      { href: '/registri/ugostiteljski-objekti', label: 'Ugostiteljski objekti', desc: 'Kategorizirani smještaj i preuzimanje CSV-a.', icon: Building07 },
      { href: '/turisticki-vodici', label: 'Turistički vodiči', desc: 'Stručni ispit i licenciranje vodiča.', icon: Users01 },
      { href: '/propisi', label: 'Propisi i obrasci', desc: 'Zakoni, pravilnici i obrasci za preuzimanje.', icon: Scales02 },
    ],
  },
  {
    label: 'Resori', match: ['/turizam-i-bastina', '/zastita-okolisa', '/eko-rizik'], items: [
      { href: '/turizam-i-bastina', label: 'Turizam i baština', desc: 'Destinacija HNK, UNESCO baština i poticaji.', icon: Sun },
      { href: '/zastita-okolisa', label: 'Zaštita okoliša', desc: 'Dozvole, javni uvidi i zaštićena područja.', icon: Waves },
      { href: '/eko-rizik', label: 'Eko-rizik HNK', desc: 'Požari, poplave i klizišta u stvarnom vremenu.', icon: AlertTriangle },
      { href: '/vijesti?type=JAVNI_POZIV', label: 'Javni pozivi', desc: 'Otvoreni pozivi i natječaji Ministarstva.', icon: Ticket01 },
    ],
  },
  { label: 'O nama', href: '/o-nama', match: ['/o-nama'] },
  { label: 'Kontakt', href: '/o-nama#kontakt' },
];

function Dropdown({ n, active, dark }: { n: Nav; active: boolean; dark?: boolean }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const off = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', off); document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('mousedown', off); document.removeEventListener('keydown', esc); };
  }, []);
  return (
    <div ref={ref} className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button type="button" aria-expanded={open} onClick={() => setOpen((o) => !o)} className={`flex items-center gap-0.5 rounded-[8px] px-1.5 py-1 text-[14px] leading-5 font-semibold transition-colors ${dark ? (active ? 'text-white' : 'text-white/85 hover:text-white') : active ? 'text-[var(--br-700)]' : 'text-[#404040] hover:text-[#262626]'}`}>
        <span className="px-0.5">{n.label}</span><ChevronDown size={16} className={`${dark ? 'text-white/60' : 'text-[#a3a3a3]'} transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute left-1/2 top-full z-50 -translate-x-1/2 pt-3">
          <div className="w-[400px] rounded-[12px] bg-white p-2 ring-1 ring-black/10 shadow-[0_12px_16px_-4px_rgba(10,13,18,0.08),0_4px_6px_-2px_rgba(10,13,18,0.03)]">
            {n.items!.map((i) => {
              const I = i.icon!;
              return (
                <Link key={i.href} href={i.href} onClick={() => setOpen(false)} className="flex gap-4 rounded-[8px] p-3 hover:bg-[#fafafa]">
                  <span className="text-[var(--br-600)] mt-0.5"><I size={24} /></span>
                  <span className="flex flex-col gap-1"><span className="text-[16px] leading-6 font-semibold text-[#171717]">{i.label}</span><span className="text-[14px] leading-5 text-[#525252]">{i.desc}</span></span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default function SiteHeader() {
  const path = usePathname();
  const [mobile, setMobile] = useState(false);
  useEffect(() => { setMobile(false); }, [path]);
  useEffect(() => { document.body.style.overflow = mobile ? 'hidden' : ''; }, [mobile]);
  const isActive = (n: Nav) => (n.match ?? []).some((m) => path.startsWith(m));
  // Na naslovnoj traka lebdi preko hero slidera (staklena, bijeli tekst) dok se ne skrola.
  const [top, setTop] = useState(true);
  useEffect(() => {
    const on = () => setTop(window.scrollY < 120);
    on(); window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);
  const home = path === '/';
  const dark = home && top;
  const green = 'bg-[var(--gr-600)] hover:bg-[var(--gr-700)]';

  return (
    <header className={`sticky top-0 z-40 pt-3 pb-1 transition-colors duration-300 ${home ? '-mb-[76px]' : ''} ${dark ? 'bg-transparent' : 'bg-gradient-to-b from-white via-white/95 to-white/0'}`}>
      <div className="mx-auto w-full max-w-[1280px] px-4 md:px-8">
        <div className={`flex items-center gap-4 rounded-[16px] py-2.5 pl-4 pr-3 transition-colors duration-300 ${dark ? 'bg-white/10 ring-1 ring-white/20 backdrop-blur-md' : 'bg-white ring-1 ring-black/10 shadow-[0_1px_2px_rgba(10,13,18,0.05)]'}`}>
          <div className="flex flex-1 items-center gap-5 min-w-0">
            <Link href="/" aria-label="MTTO HNK – naslovna" className={`shrink-0 rounded-[8px] transition-colors ${dark ? 'bg-white px-2 py-1' : ''}`}><img src="/mtto-logo.svg" alt="Ministarstvo trgovine, turizma i zaštite okoliša HNK" className={dark ? 'h-8 w-auto' : 'h-9 w-auto'} /></Link>
            <nav aria-label="Glavna navigacija" className="hidden lg:flex items-center gap-0.5">
              {NAV.map((n) => n.items ? <Dropdown key={n.label} n={n} active={isActive(n)} dark={dark} /> : (
                <Link key={n.label} href={n.href!} aria-current={isActive(n) ? 'page' : undefined} className={`rounded-[8px] px-2 py-1 text-[14px] leading-5 font-semibold transition-colors ${dark ? 'text-white/85 hover:text-white' : isActive(n) ? 'text-[var(--br-700)]' : 'text-[#404040] hover:text-[#262626]'}`}>{n.label}</Link>
              ))}
            </nav>
          </div>
          <div className="hidden lg:flex items-center gap-3">
            <form action="/vijesti" role="search" className={`hidden xl:flex items-center gap-2 h-10 w-[220px] rounded-[8px] px-3 ring-1 ring-inset focus-within:ring-2 focus-within:ring-[var(--br-500)] ${dark ? 'bg-white/10 ring-white/25' : 'ring-[#d4d4d4] shadow-[0_1px_2px_rgba(10,13,18,0.05)]'}`}>
              <SearchLg size={16} className={dark ? 'text-white/70' : 'text-[#a3a3a3]'} /><input name="q" aria-label="Pretraga portala" placeholder="Pretraga" className={`min-w-0 flex-1 border-0 p-0 bg-transparent text-[14px] leading-5 ${dark ? 'text-white placeholder:text-white/70' : 'text-[#171717] placeholder:text-[#737373]'} shadow-none focus:outline-none focus:ring-0 focus:!shadow-none`} />
            </form>
            <Link href="/eko-rizik/prijava" className={`${dark ? 'hidden' : 'inline-flex'} h-10 items-center gap-1 rounded-[8px] bg-white px-[14px] text-[14px] font-semibold text-[#404040] hover:bg-[#fafafa] shadow-[0_1px_2px_rgba(10,13,18,0.05),inset_0_-2px_0_rgba(10,13,18,0.05),inset_0_0_0_1px_rgba(10,13,18,0.18)]`}>Prijavi incident</Link>
            <Link href="/e-usluge" className={`inline-flex h-10 items-center gap-1 rounded-[8px] ${green} border-2 border-white/10 px-[14px] text-[14px] font-semibold text-white shadow-[0_1px_2px_rgba(10,13,18,0.05),inset_0_-2px_0_rgba(10,13,18,0.05),inset_0_0_0_1px_rgba(10,13,18,0.18)]`}>E-usluge</Link>
          </div>
          <button type="button" className={`lg:hidden rounded-[8px] p-2 ${dark ? 'text-white hover:bg-white/10' : 'text-[#525252] hover:bg-[#fafafa]'}`} aria-label="Otvori meni" aria-expanded={mobile} onClick={() => setMobile(true)}><Menu02 size={24} /></button>
        </div>
      </div>

      {mobile && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Meni">
          <div className="absolute inset-0 bg-[#0a0d12]/60 backdrop-blur-[2px]" onClick={() => setMobile(false)} />
          <div className="absolute inset-x-0 top-0 max-h-full overflow-y-auto bg-white shadow-[0_20px_24px_-4px_rgba(10,13,18,0.08)]">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#e5e5e5]">
              <Link href="/"><img src="/mtto-logo.svg" alt="MTTO HNK" className="h-9 w-auto" /></Link>
              <button type="button" onClick={() => setMobile(false)} className="rounded-[8px] p-2 text-[#525252] hover:bg-[#fafafa]" aria-label="Zatvori meni"><XClose size={24} /></button>
            </div>
            <nav className="flex flex-col gap-1 px-4 py-6">
              <Link href="/" className="rounded-[6px] px-3 py-3 text-[16px] font-semibold text-[#171717] hover:bg-[#fafafa]">Naslovna</Link>
              {NAV.map((n) => n.items ? (
                <details key={n.label} className="group" open={isActive(n)}>
                  <summary className="flex cursor-pointer list-none items-center justify-between rounded-[6px] px-3 py-3 text-[16px] font-semibold text-[#171717] hover:bg-[#fafafa] [&::-webkit-details-marker]:hidden">{n.label}<ChevronDown size={20} className="text-[#a3a3a3] group-open:rotate-180 transition-transform" /></summary>
                  <div className="flex flex-col pb-2">
                    {n.items.map((i) => { const I = i.icon!; return <Link key={i.href} href={i.href} className="flex items-center gap-3 rounded-[6px] px-3 py-2.5 text-[16px] font-medium text-[#404040] hover:bg-[#fafafa]"><I size={20} className="text-[var(--br-600)]" />{i.label}</Link>; })}
                  </div>
                </details>
              ) : <Link key={n.label} href={n.href!} className="rounded-[6px] px-3 py-3 text-[16px] font-semibold text-[#171717] hover:bg-[#fafafa]">{n.label}</Link>)}
            </nav>
            <div className="flex flex-col gap-3 border-t border-[#e5e5e5] px-4 py-6">
              <Link href="/e-usluge" className="flex h-11 items-center justify-center rounded-[8px] bg-[var(--gr-600)] text-[16px] font-semibold text-white">E-usluge</Link>
              <Link href="/eko-rizik/prijava" className="flex h-11 items-center justify-center rounded-[8px] ring-1 ring-inset ring-[#d4d4d4] text-[16px] font-semibold text-[#404040]">Prijavi incident</Link>
              <a href="tel:+38736551823" className="flex items-center justify-center gap-2 py-2 text-[14px] font-semibold text-[#525252]"><Phone01 size={18} />+387 36 551 823</a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

