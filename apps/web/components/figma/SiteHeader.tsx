'use client';
/* Zaglavlje prema Figma dizajnu (desktop 30:12204, mobilni meni 12:3825). */
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export const NAV: [string, string][] = [
  ['Naslovna', '/'],
  ['Vijesti', '/vijesti'],
  ['O nama', '/o-nama'],
  ['E-Usluge & Registri', '/e-usluge'],
  ['Natječaji & Javne nabavke', '/vijesti?type=JAVNI_POZIV'],
  ['Propisi i Obrasci', '/propisi'],
  ['Turizam & Baština', '/turizam-i-bastina'],
  ['Zaštita Okoliša', '/zastita-okolisa'],
  ['Kontakti', '/o-nama#kontakt'],
];
const REGISTRI = ['/registri', '/e-usluge', '/turisticki-vodici'];

const Icon = ({ n, size = 16, cls = '' }: { n: string; size?: number; cls?: string }) => (
  <span aria-hidden className={`material-symbols-outlined shrink-0 leading-none ${cls}`} style={{ fontSize: size }}>{n}</span>
);

function useActive() {
  const path = usePathname();
  const sp = useSearchParams();
  return (href: string) => {
    const [base, q] = href.split('#')[0].split('?');
    if (href.includes('#')) return false;
    if (base === '/') return path === '/';
    if (base === '/registri/okolisne-dozvole') return REGISTRI.some((r) => path.startsWith(r));
    if (base === '/vijesti') return path.startsWith('/vijesti') && (q ? sp.toString() === q : sp.get('type') !== 'JAVNI_POZIV');
    return path.startsWith(base);
  };
}

function Clock() {
  const [t, setT] = useState('');
  useEffect(() => {
    const f = () => setT(new Date().toLocaleTimeString('bs-BA', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Sarajevo' }));
    f();
    const i = setInterval(f, 30000);
    return () => clearInterval(i);
  }, []);
  return <>{t ? `Mostar, ${t}` : 'Mostar'}</>;
}

function Lang({ small = false }: { small?: boolean }) {
  const cls = `font-space font-bold ${small ? 'text-[11px]' : 'text-[12px]'} text-[#d3e4fe] text-center tracking-[0.96px] leading-[16px] px-[6px] py-[2px] rounded-[2px]`;
  return (
    <div className="flex gap-[4px] items-center" aria-label="Jezik">
      <button type="button" className={`${cls} bg-[#00abeb]`} aria-current="true">BA</button>
      <span className="font-space font-bold text-[#737780] text-[12px]" aria-hidden>|</span>
      <button type="button" className={`${cls} hover:bg-white/10`} title="Hrvatska verzija: Faza 2">HR</button>
      <span className="font-space font-bold text-[#737780] text-[12px]" aria-hidden>|</span>
      <button type="button" className={`${cls} hover:bg-white/10`} title="English version: Faza 2">EN</button>
    </div>
  );
}

const Aqi = ({ small = false }: { small?: boolean }) => (
  <div className="bg-[rgba(0,108,74,0.3)] border-[#85f8c4] border-[0.5px] border-solid flex gap-[4px] items-center px-[8px] py-[2px] rounded-[4px]" title="Primjer podataka: mjerne stanice se povezuju u Fazi 2">
    <Icon n="air" size={14} cls="text-[#85f8c4]" />
    <span className={`font-pub font-medium text-[#85f8c4] ${small ? 'text-[10px]' : 'text-[11px]'} tracking-[0.44px] leading-[14px]`}>AQI Mostar: 32 • Demo</span>
  </div>
);

function Search({ className = '' }: { className?: string }) {
  return (
    <form action="/vijesti" role="search" className={`bg-white border border-[rgba(195,198,208,0.25)] border-solid flex h-[36px] items-center px-[16px] py-[6px] rounded-[8px] gap-2 focus-within:border-[#00abeb] focus-within:ring-2 focus-within:ring-[#00abeb]/25 ${className}`}>
      <Icon n="search" size={18} cls="text-[#737780]" />
      <input name="q" type="search" aria-label="Pretraga portala" placeholder="Pretraga propisa, natječaja..." className="flex-1 min-w-0 bg-transparent border-0 p-0 shadow-none focus:ring-0 font-rob text-[#191c1f] text-[13px] placeholder:text-[#737780] focus:outline-none" />
    </form>
  );
}

export function SiteHeader() {
  const active = useActive();
  const [open, setOpen] = useState(false);
  const path = usePathname();
  useEffect(() => setOpen(false), [path]);
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    const k = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [open]);

  return (
    <>
      {/* Desktop */}
      <header className="hidden lg:flex backdrop-blur-[24px] bg-[rgba(255,255,255,0.95)] flex-col items-start shadow-[0px_1px_8px_0px_rgba(0,0,0,0.04)] w-full relative z-40">
        <div className="bg-[#062343] flex h-[40px] items-center justify-between px-[32px] w-full">
          <div className="backdrop-blur-[4px] bg-[rgba(255,255,255,0.1)] flex gap-[4px] items-center px-[12px] py-[4px] rounded-[2px]">
            <Icon n="verified_user" size={14} cls="text-[#dce9ff]" />
            <span className="font-space font-bold text-[#dce9ff] text-[12px] tracking-[1.2px] uppercase leading-[16px]">Službeni resorni kantonalni portal</span>
          </div>
          <div className="flex gap-[16px] items-center">
            <Aqi />
            <div className="flex gap-[4px] items-center"><Icon n="schedule" size={15} cls="text-[#d3e4fe]" /><span className="font-pub text-[#d3e4fe] text-[12px] leading-[20px]"><Clock /></span></div>
            <Lang />
          </div>
        </div>
        <div className="bg-[#f8fafc] flex items-center justify-between px-[32px] xl:px-[70px] py-[12px] w-full">
          <Link href="/" aria-label="MTTO HNK – naslovna" className="h-[57.824px] w-[161px] shrink-0"><img src="/mtto-logo.svg" alt="Ministarstvo trgovine, turizma i zaštite okoliša HNK" className="h-full w-auto" /></Link>
          <div className="flex gap-[12px] items-center w-[584px] max-w-[60%]">
            <Search className="flex-1" />
            <Link href="/e-usluge/eko-prijava" className="bg-[#006c4a] drop-shadow-[0px_1px_1.5px_rgba(0,0,0,0.08)] flex gap-[4px] items-center px-[16px] py-[8px] rounded-[8px] shrink-0 hover:bg-[#005339] transition-colors">
              <Icon n="notifications_active" size={18} cls="text-white" />
              <span className="font-pub font-semibold text-[12px] text-white tracking-[0.14px] leading-[20px]">Eko-alarm</span>
            </Link>
            <Link href="/admin" title="Prijava u CMS" aria-label="Prijava u CMS" className="bg-[#002042] flex items-center justify-center rounded-[8px] shrink-0 size-[32px] hover:bg-[#062343]"><Icon n="person" size={16} cls="text-white" /></Link>
          </div>
        </div>
        <nav aria-label="Glavna navigacija" className="flex h-[48px] items-center justify-end overflow-x-auto px-[32px] xl:px-[70px] w-full">
          <div className="flex gap-[4px] items-center">
            {NAV.map(([label, href]) => {
              const on = active(href);
              return (
                <Link key={href} href={href} aria-current={on ? 'page' : undefined} className={`px-[16px] py-[6px] rounded-[8px] font-robflex font-semibold text-[14px] tracking-[0.14px] leading-[20px] whitespace-nowrap transition-colors ${on ? 'bg-[#002042] text-white' : 'text-[#43474f] hover:text-[#002042] hover:bg-[#eff4ff]'}`}>{label}</Link>
              );
            })}
          </div>
        </nav>
      </header>

      {/* Mobilni */}
      <header className="lg:hidden sticky top-0 z-40 w-full">
        <div className="bg-[#062343] flex h-[40px] items-center justify-between px-[16px] w-full"><Aqi small /><Lang small /></div>
        <div className="backdrop-blur-[24px] bg-[rgba(248,249,255,0.9)] shadow-[0px_1px_8px_0px_rgba(6,35,67,0.06)] flex items-center justify-between px-[16px] py-[8px] w-full">
          <Link href="/" aria-label="MTTO HNK – naslovna" className="h-[35.915px] w-[100px]"><img src="/mtto-logo.svg" alt="MTTO HNK" className="h-full w-auto" /></Link>
          <button type="button" onClick={() => setOpen(true)} aria-expanded={open} aria-controls="mobilni-meni" aria-label="Otvori meni" className="size-[40px] -mr-2 flex items-center justify-center rounded-[8px] text-[#002042] hover:bg-[#eff4ff]"><Icon n="menu" size={26} /></button>
        </div>
      </header>
      {open && (
        <div id="mobilni-meni" role="dialog" aria-modal="true" aria-label="Glavni meni" className="lg:hidden fixed inset-0 z-50 bg-[#f8f9ff] overflow-y-auto">
          <div className="bg-[#062343] flex h-[40px] items-center justify-between px-[16px] w-full"><Aqi small /><Lang small /></div>
          <div className="flex items-center justify-between px-[16px] py-[8px]">
            <Link href="/" className="h-[35.915px] w-[100px]"><img src="/mtto-logo.svg" alt="MTTO HNK" className="h-full w-auto" /></Link>
            <button type="button" onClick={() => setOpen(false)} aria-label="Zatvori meni" className="size-[40px] -mr-2 flex items-center justify-center rounded-[8px] text-[#1e293b] hover:bg-[#eff4ff]"><Icon n="close" size={28} /></button>
          </div>
          <div className="px-[16px] pt-[16px]"><Search className="h-[36px] w-full" /></div>
          <nav aria-label="Mobilna navigacija" className="flex flex-col items-end gap-[8px] px-[16px] pt-[16px]">
            {NAV.filter(([l]) => l !== 'Vijesti' || true).map(([label, href]) => {
              const on = active(href);
              return <Link key={href} href={href} aria-current={on ? 'page' : undefined} className={`px-[16px] py-[4px] rounded-[8px] font-robflex font-semibold text-[18px] leading-[24px] ${on ? 'bg-[#002042] text-white' : 'text-[#43474f]'}`}>{label}</Link>;
            })}
          </nav>
          <div className="grid grid-cols-2 gap-[8px] px-[16px] py-[24px]">
            <Link href="/e-usluge/eko-prijava" className="bg-[#006c4a] rounded-[8px] h-[36px] flex items-center justify-center gap-1 font-pub font-semibold text-[14px] text-white"><Icon n="notifications_active" size={18} />Eko-alarm</Link>
            <Link href="/admin" className="bg-[#002042] rounded-[8px] h-[36px] flex items-center justify-center gap-1 font-pub font-semibold text-[14px] text-white"><Icon n="person" size={18} />Prijava</Link>
          </div>
        </div>
      )}
    </>
  );
}
