'use client';
/* Kostur iz MTTO Figme (top bar + logo/pretraga + navigacijska traka), izveden u Untitled UI stilu. */
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import {
  AlertTriangle, Bell01, Building07, CheckVerified01, ChevronDown, Clock, FileSearch02, Globe02, Image01, Map01, MarkerPin04, Menu02, Phone01,
  Scales02, SearchLg, Sun, Ticket01, Trash03, User01, Users01, Waves, Wind01, XClose, Building02, Mail01,
} from '@untitledui/icons';
import type { Icon } from './index';

type Item = { href: string; label: string; desc?: string; icon?: Icon };
type Nav = { label: string; href?: string; items?: Item[]; match?: string[] };

export const NAV: Nav[] = [
  { label: 'Naslovna', href: '/', match: [] },
  { label: 'Vijesti', href: '/vijesti', match: ['/vijesti'] },
  {
    label: 'O nama', match: ['/o-nama'], items: [
      { href: '/o-nama', label: 'O Ministarstvu', desc: 'Nadležnosti, misija i organizacija.', icon: Building02 },
      { href: '/o-nama#kabinet', label: 'Kabinet ministra', desc: 'Ministar i tajništvo.', icon: Users01 },
      { href: '/o-nama#sektori', label: 'Sektori', desc: 'Trgovina, turizam i zaštita okoliša.', icon: Building07 },
      { href: '/o-nama#upit', label: 'Pristup informacijama', desc: 'Zahtjev po Zakonu o slobodi pristupa informacijama.', icon: Mail01 },
    ],
  },
  {
    label: 'E-usluge i registri', match: ['/e-usluge', '/registri'], items: [
      { href: '/e-usluge', label: 'Centar e-usluga', desc: 'Registri, obrasci i javni uvidi na jednom mjestu.', icon: Globe02 },
      { href: '/registri/okolisne-dozvole', label: 'Okolišne dozvole', desc: 'Javni registar izdatih okolišnih dozvola.', icon: FileSearch02 },
      { href: '/registri/ugostiteljski-objekti', label: 'Ugostiteljski objekti', desc: 'Kategorizirani smještaj, izvoz u CSV.', icon: Building07 },
      { href: '/turisticki-vodici', label: 'Turistički vodiči', desc: 'Stručni ispit i licenciranje vodiča.', icon: Users01 },
      { href: '/registri/upravljanje-otpadom', label: 'Upravljanje otpadom', desc: 'Registar operatera (Faza 2).', icon: Trash03 },
    ],
  },
  { label: 'Natječaji i javne nabavke', href: '/vijesti?type=JAVNI_POZIV', match: [] },
  { label: 'Propisi i obrasci', href: '/propisi', match: ['/propisi'] },
  {
    label: 'Turizam i baština', match: ['/turizam-i-bastina', '/turisticki-vodici', '/foto-albumi'], items: [
      { href: '/turizam-i-bastina', label: 'Turizam i baština', desc: 'Destinacija HNK, UNESCO baština i poticaji.', icon: Sun },
      { href: '/turisticki-vodici', label: 'Turistički vodiči', desc: 'Ispit, licence i registar vodiča.', icon: Users01 },
      { href: '/registri/ugostiteljski-objekti', label: 'Ugostiteljski objekti', desc: 'Kategorizacija smještaja.', icon: Building07 },
      { href: '/foto-albumi/hutovo-blato', label: 'Foto albumi', desc: 'Galerije zaštićenih područja.', icon: Image01 },
    ],
  },
  {
    label: 'Zaštita okoliša', match: ['/zastita-okolisa', '/eko-rizik', '/mapa'], items: [
      { href: '/zastita-okolisa', label: 'Zaštita okoliša', desc: 'Dozvole, javni uvidi i zaštićena područja.', icon: Waves },
      { href: '/eko-rizik', label: 'Eko-rizik HNK', desc: 'Požari, poplave, klizišta i kvalitet zraka.', icon: AlertTriangle },
      { href: '/eko-rizik/prijava', label: 'Prijava incidenta', desc: 'Prijavite deponiju, požar ili zagađenje.', icon: MarkerPin04 },
      { href: '/mapa', label: 'GIS karta', desc: 'Dozvole, objekti i zaštićena područja na karti.', icon: Map01 },
    ],
  },
  { label: 'Kontakt', href: '/o-nama#kontakt', match: [] },
];

export type TopInfo = { aqi: number | null; aqiLabel: string; aqiTone: 'success' | 'warning' | 'error' | 'gray'; level: 1 | 2 | 3 };

function Dropdown({ n, active }: { n: Nav; active: boolean }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const out = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', out); document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('mousedown', out); document.removeEventListener('keydown', esc); };
  }, []);
  return (
    <div ref={ref} className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button type="button" aria-expanded={open} onClick={() => setOpen(!open)}
        className={`flex items-center gap-1 rounded-[6px] px-3 py-2 text-[15px] leading-6 font-semibold whitespace-nowrap ${active ? 'bg-[var(--br-50)] text-[var(--br-700)]' : 'text-[#404040] hover:bg-[#fafafa] hover:text-[#262626]'}`}>
        {n.label}<ChevronDown size={16} className={`transition-transform ${active ? 'text-[var(--br-500)]' : 'text-[#a3a3a3]'} ${open ? 'rotate-180' : ''}`} />
      </button>
      <div className={`absolute left-0 top-full z-50 pt-2 transition-all duration-200 ${open ? 'visible translate-y-0 opacity-100' : 'invisible -translate-y-1 opacity-0'}`}>
        <div className="w-[360px] rounded-[12px] bg-white p-2 ring-1 ring-black/[0.08] shadow-[0_12px_16px_-4px_rgba(10,13,18,0.08),0_4px_6px_-2px_rgba(10,13,18,0.03)]">
          {n.items!.map((i) => (
            <Link key={i.href} href={i.href} onClick={() => setOpen(false)} className="group flex gap-3 rounded-[8px] p-3 hover:bg-[#fafafa]">
              {i.icon && <span className="flex size-10 shrink-0 items-center justify-center rounded-[8px] bg-[var(--br-50)] text-[var(--br-600)] transition-transform group-hover:-translate-y-0.5"><i.icon size={20} /></span>}
              <span><span className="block text-[16px] leading-6 font-semibold text-[#171717]">{i.label}</span>{i.desc && <span className="block text-[14px] leading-5 text-[#525252]">{i.desc}</span>}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function Clock24() {
  const [t, setT] = useState<string | null>(null);
  useEffect(() => {
    const f = () => setT(new Intl.DateTimeFormat('bs-BA', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Europe/Sarajevo' }).format(new Date()));
    f(); const i = setInterval(f, 30000); return () => clearInterval(i);
  }, []);
  return <span className="hidden items-center gap-1.5 text-[12px] lg:flex"><Clock size={14} />Mostar{t ? `, ${t}` : ''}</span>;
}

const AQI_RING = { success: 'bg-[var(--gr-500)]/15 text-[var(--gr-200)] ring-[var(--gr-500)]/40', warning: 'bg-[#f79009]/15 text-[#fedf89] ring-[#f79009]/40', error: 'bg-[#f04438]/15 text-[#fecdca] ring-[#f04438]/40', gray: 'bg-white/10 text-white/70 ring-white/20' };
const LVL = { 1: ['bg-[var(--gr-400)]', 'uobičajeno stanje'], 2: ['bg-[#f79009]', 'pojačan oprez'], 3: ['bg-[#f04438]', 'visok rizik'] } as const;

function Langs() {
  return (
    <span className="flex items-center rounded-[6px] bg-white/10 p-0.5 text-[12px] font-semibold" role="group" aria-label="Jezik">
      <span className="rounded-[4px] bg-white px-2 py-0.5 text-[var(--br-900)]" aria-current="true">BS</span>
      <span className="px-2 py-0.5 text-white/80" title="Hrvatski – Faza 2">HR</span>
      <span className="px-2 py-0.5 text-white/50" title="English – Faza 2">EN</span>
    </span>
  );
}

export default function SiteHeader({ info }: { info?: TopInfo }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const [sub, setSub] = useState<string | null>(null);
  useEffect(() => { setOpen(false); }, [path]);
  useEffect(() => { document.body.style.overflow = open ? 'hidden' : ''; }, [open]);
  const isActive = (n: Nav) => (n.href === '/' ? path === '/' : (n.match ?? []).some((m) => path.startsWith(m)));
  const lv = LVL[info?.level ?? 1];
  const green = `border-2 border-white/10 bg-[var(--gr-600)] text-white hover:bg-[var(--gr-700)] shadow-[0_1px_2px_rgba(10,13,18,0.05),inset_0_-2px_0_rgba(10,13,18,0.05),inset_0_0_0_1px_rgba(10,13,18,0.18)]`;

  return (
    <>
      {/* TOP BAR */}
      <div className="bg-[#062343] text-[var(--br-100)]">
        <div className="mx-auto flex h-10 max-w-[1376px] items-center justify-between gap-3 px-4 md:px-8">
          <span className="hidden items-center gap-2 text-[13px] font-medium sm:flex"><CheckVerified01 size={16} className="text-[var(--gr-400)]" />Službeni portal Ministarstva · Hercegovačko-neretvanski kanton</span>
          <div className="flex w-full items-center justify-between gap-4 sm:w-auto sm:justify-end">
            <Link href="/eko-rizik" className={`flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[12px] font-medium ring-1 ring-inset ${AQI_RING[info?.aqiTone ?? 'gray']}`} title="Europski indeks kvalitete zraka (Copernicus CAMS)">
              <Wind01 size={14} />Zrak Mostar{info?.aqi != null ? `: AQI ${info.aqi} · ${info.aqiLabel.toLowerCase()}` : ''}
            </Link>
            <Link href="/eko-rizik" className="hidden items-center gap-1.5 text-[12px] hover:text-white md:flex"><span className={`size-1.5 rounded-full ${lv[0]}`} />Eko-rizik: {lv[1]}</Link>
            <Clock24 />
            <Langs />
          </div>
        </div>
      </div>

      {/* LOGO + PRETRAGA + AKCIJE */}
      <header className="sticky top-0 z-40 border-b border-[#e5e5e5] bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-[72px] max-w-[1376px] items-center justify-between gap-4 px-4 md:px-8">
          <Link href="/" className="shrink-0" aria-label="MTTO HNK – naslovna"><img src="/mtto-logo.svg" alt="Ministarstvo trgovine, turizma i zaštite okoliša HNK" className="h-10 w-auto md:h-12" /></Link>
          <div className="flex items-center gap-3">
            <form action="/vijesti" role="search" className="hidden h-11 w-[360px] items-center gap-2 rounded-[8px] px-3.5 ring-1 ring-inset ring-[#d4d4d4] shadow-[0_1px_2px_rgba(10,13,18,0.05)] focus-within:ring-2 focus-within:ring-[var(--br-500)] lg:flex xl:w-[420px]">
              <SearchLg size={20} className="text-[#a3a3a3]" />
              <input name="q" aria-label="Pretraga portala" placeholder="Pretraga vijesti, natječaja, propisa" className="min-w-0 flex-1 border-0 bg-transparent p-0 text-[16px] text-[#171717] placeholder:text-[#737373] !shadow-none focus:outline-none focus:ring-0" />
            </form>
            <Link href="/eko-rizik/prijava" className={`hidden h-11 items-center gap-1.5 rounded-[8px] px-4 text-[16px] font-semibold sm:inline-flex ${green}`}><Bell01 size={20} />Eko-alarm</Link>
            <Link href="/admin/prijava" className="hidden size-11 items-center justify-center rounded-[8px] text-[#525252] ring-1 ring-inset ring-[#d4d4d4] shadow-[0_1px_2px_rgba(10,13,18,0.05)] hover:bg-[#fafafa] sm:flex" title="Prijava za službenike" aria-label="Prijava za službenike"><User01 size={20} /></Link>
            <button type="button" className="flex size-11 items-center justify-center rounded-[8px] text-[#404040] hover:bg-[#fafafa] xl:hidden" onClick={() => setOpen(true)} aria-label="Otvori meni" aria-expanded={open}><Menu02 size={24} /></button>
          </div>
        </div>
        <nav aria-label="Glavna navigacija" className="hidden border-t border-[#f5f5f5] xl:block">
          <div className="mx-auto flex h-14 max-w-[1376px] items-center gap-0.5 px-4 md:px-8">
            {NAV.map((n) => n.items ? <Dropdown key={n.label} n={n} active={isActive(n)} /> : (
              <Link key={n.label} href={n.href!} aria-current={isActive(n) ? 'page' : undefined}
                className={`rounded-[6px] px-3 py-2 text-[15px] leading-6 font-semibold whitespace-nowrap ${isActive(n) ? 'bg-[var(--br-50)] text-[var(--br-700)]' : 'text-[#404040] hover:bg-[#fafafa] hover:text-[#262626]'}`}>{n.label}</Link>
            ))}
          </div>
        </nav>
      </header>

      {/* MOBILNI MENI (Untitled "Mobile menu – slideout") */}
      <div className={`fixed inset-0 z-[70] xl:hidden ${open ? '' : 'pointer-events-none'}`} aria-hidden={!open}>
        <div className={`absolute inset-0 bg-[#0a0d12]/60 backdrop-blur-[2px] transition-opacity ${open ? 'opacity-100' : 'opacity-0'}`} onClick={() => setOpen(false)} />
        <div className={`absolute inset-y-0 right-0 flex w-full max-w-[400px] flex-col bg-white shadow-[0_24px_48px_-12px_rgba(10,13,18,0.18)] transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full'}`} role="dialog" aria-label="Meni">
          <div className="flex items-center justify-between border-b border-[#e5e5e5] px-4 py-3">
            <img src="/mtto-logo.svg" alt="" className="h-10" />
            <button type="button" onClick={() => setOpen(false)} className="flex size-10 items-center justify-center rounded-[8px] text-[#737373] hover:bg-[#fafafa]" aria-label="Zatvori meni"><XClose size={24} /></button>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-4">
            <form action="/vijesti" role="search" className="flex h-11 items-center gap-2 rounded-[8px] px-3.5 ring-1 ring-inset ring-[#d4d4d4]"><SearchLg size={20} className="text-[#a3a3a3]" /><input name="q" placeholder="Pretraga propisa, natječaja…" aria-label="Pretraga" className="min-w-0 flex-1 border-0 bg-transparent p-0 text-[16px] !shadow-none focus:outline-none focus:ring-0" /></form>
            <ul className="mt-4 flex flex-col gap-0.5">
              {NAV.map((n) => (
                <li key={n.label}>
                  {n.items ? (
                    <>
                      <button type="button" onClick={() => setSub(sub === n.label ? null : n.label)} aria-expanded={sub === n.label}
                        className={`flex w-full items-center justify-between rounded-[6px] px-3 py-3 text-[16px] font-semibold ${isActive(n) ? 'bg-[var(--br-50)] text-[var(--br-700)]' : 'text-[#262626] hover:bg-[#fafafa]'}`}>
                        {n.label}<ChevronDown size={20} className={`text-[#a3a3a3] transition-transform ${sub === n.label ? 'rotate-180' : ''}`} />
                      </button>
                      <div className={`grid transition-[grid-template-rows] duration-300 ${sub === n.label ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                        <ul className="overflow-hidden">
                          {n.items.map((i) => (
                            <li key={i.href}><Link href={i.href} className="flex items-center gap-3 rounded-[8px] py-2.5 pl-6 pr-3 hover:bg-[#fafafa]">{i.icon && <i.icon size={20} className="text-[var(--br-600)]" />}<span className="text-[15px] font-medium text-[#404040]">{i.label}</span></Link></li>
                          ))}
                        </ul>
                      </div>
                    </>
                  ) : (
                    <Link href={n.href!} className={`flex rounded-[6px] px-3 py-3 text-[16px] font-semibold ${isActive(n) ? 'bg-[var(--br-50)] text-[var(--br-700)]' : 'text-[#262626] hover:bg-[#fafafa]'}`}>{n.label}</Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
          <div className="grid grid-cols-2 gap-3 border-t border-[#e5e5e5] p-4">
            <Link href="/eko-rizik/prijava" className={`flex h-11 items-center justify-center gap-1.5 rounded-[8px] text-[16px] font-semibold ${green}`}><Bell01 size={20} />Eko-alarm</Link>
            <Link href="/admin/prijava" className="flex h-11 items-center justify-center gap-1.5 rounded-[8px] text-[16px] font-semibold text-[#404040] ring-1 ring-inset ring-[#d4d4d4]"><User01 size={20} />Prijava</Link>
            <a href="tel:+38736551823" className="col-span-2 flex items-center justify-center gap-2 text-[14px] font-medium text-[#525252]"><Phone01 size={16} />+387 36 551 823 · info@mtto.gov.ba</a>
          </div>
        </div>
      </div>
    </>
  );
}

