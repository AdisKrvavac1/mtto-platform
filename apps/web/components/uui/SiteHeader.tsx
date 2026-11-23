'use client';
/* Kostur iz MTTO Figme (top bar + logo/pretraga + navigacijska traka), izveden u Untitled UI stilu. */
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import {
  AlertTriangle, ArrowRight, ChevronRight, File06, Building07, CheckVerified01, ChevronDown, Clock, FileSearch02, Globe02, Image01, Map01, MarkerPin04, Menu02, Phone01,
  Scales02, SearchLg, ShoppingCart01, Calendar, LineChartUp01, Sun, Ticket01, Trash03, User01, Users01, Waves, Wind01, XClose, Building02, Mail01,
} from '@untitledui/icons';
import type { Icon } from './index';

type Item = { href: string; label: string; desc?: string; icon?: Icon; badge?: string };
type Group = { title: string; items: Item[] };
type Feature = { title: string; more?: { href: string; label: string }; cards: { img: string; title: string; text: string; href: string; cta: string }[] };
type Nav = { label: string; href?: string; groups?: Group[]; feature?: Feature; match?: string[] };

export const NAV: Nav[] = [
  { label: 'Naslovna', href: '/', match: [] },
  { label: 'Vijesti', href: '/vijesti', match: ['/vijesti'] },
  { label: 'O nama', href: '/o-nama', match: ['/o-nama'] },
  {
    label: 'E-usluge i registri', match: ['/e-usluge', '/registri'],
    groups: [
      { title: 'E-usluge', items: [
        { href: '/e-usluge', label: 'Centar e-usluga', desc: 'Registri, obrasci i javni uvidi na jednom mjestu.', icon: Globe02 },
        { href: '/vijesti?type=JAVNI_POZIV', label: 'Javni pozivi', desc: 'Otvoreni pozivi, rokovi i online prijava.', icon: Ticket01 },
        { href: '/propisi', label: 'Propisi i obrasci', desc: 'Zakoni, pravilnici i obrasci zahtjeva.', icon: File06 },
      ] },
      { title: 'Registri', items: [
        { href: '/registri/okolisne-dozvole', label: 'Okolišne dozvole', desc: 'Javni registar izdatih dozvola.', icon: FileSearch02 },
        { href: '/registri/ugostiteljski-objekti', label: 'Ugostiteljski objekti', desc: 'Kategorizirani smještaj, izvoz u CSV.', icon: Building07 },
        { href: '/turisticki-vodici', label: 'Turistički vodiči', desc: 'Stručni ispit i licenciranje.', icon: Users01 },
        { href: '/registri/upravljanje-otpadom', label: 'Upravljanje otpadom', desc: 'Registar operatera otpada.', icon: Trash03, badge: 'Faza 2' },
      ] },
    ],
    feature: { title: 'Brzi pristup', cards: [
      { img: '/hero/neretva-m.jpg', title: 'Prijava ekološkog incidenta', text: 'Deponija, požar ili zagađenje vode: pošaljite lokaciju i fotografiju.', href: '/eko-rizik/prijava', cta: 'Prijavi incident' },
      { img: '/hero/mostar-m.jpg', title: 'Interaktivna GIS karta', text: 'Dozvole, objekti i zaštićena područja na jednoj karti.', href: '/mapa', cta: 'Otvori kartu' },
    ] },
  },
  { label: 'Natječaji', href: '/vijesti?type=JAVNI_POZIV', match: [] },
  { label: 'Propisi i obrasci', href: '/propisi', match: ['/propisi'] },
  { label: 'Trgovina', href: '/trgovina', match: ['/trgovina'] },
  {
    label: 'Turizam i baština', match: ['/turizam-i-bastina', '/turisticki-vodici', '/foto-albumi'],
    groups: [
      { title: 'Turizam', items: [
        { href: '/turizam-i-bastina', label: 'Turizam i baština', desc: 'Destinacija HNK, UNESCO baština i poticaji.', icon: Sun },
        { href: '/turisticki-vodici', label: 'Turistički vodiči', desc: 'Ispit, licence i registar vodiča.', icon: Users01 },
        { href: '/registri/ugostiteljski-objekti', label: 'Ugostiteljski objekti', desc: 'Kategorizacija smještaja.', icon: Building07 },
      ] },
      { title: 'Baština i priroda', items: [
        { href: '/foto-albumi/hutovo-blato', label: 'Foto albumi', desc: 'Galerije zaštićenih područja.', icon: Image01 },
        { href: '/zastita-okolisa#podrucja', label: 'Zaštićena područja', desc: 'Blidinje, Hutovo blato, Kanjon Neretve.', icon: Waves },
        { href: '/mapa', label: 'GIS karta', desc: 'Turističke lokacije na karti.', icon: Map01 },
      ] },
    ],
    feature: { title: 'Destinacije', more: { href: '/turizam-i-bastina', label: 'Sve destinacije' }, cards: [
      { img: '/hero/mostar-m.jpg', title: 'Stari most, Mostar', text: 'UNESCO svjetska baština u srcu kantona.', href: '/turizam-i-bastina', cta: 'Saznaj više' },
      { img: '/hero/pocitelj-m.jpg', title: 'Počitelj', text: 'Kulturno-historijska cjelina na Neretvi.', href: '/turizam-i-bastina', cta: 'Saznaj više' },
    ] },
  },
  {
    label: 'Zaštita okoliša', match: ['/zastita-okolisa', '/eko-rizik', '/mapa'],
    groups: [
      { title: 'Okoliš', items: [
        { href: '/zastita-okolisa', label: 'Zaštita okoliša', desc: 'Dozvole, javni uvidi i zaštićena područja.', icon: Waves },
        { href: '/registri/okolisne-dozvole', label: 'Okolišne dozvole', desc: 'Registar s rokovima i dosjeima.', icon: FileSearch02 },
        { href: '/registri/upravljanje-otpadom', label: 'Upravljanje otpadom', desc: 'Registar operatera otpada.', icon: Trash03, badge: 'Faza 2' },
      ] },
      { title: 'Rizici', items: [
        { href: '/eko-rizik', label: 'Eko-rizik HNK', desc: 'Požari, poplave, klizišta i kvalitet zraka.', icon: AlertTriangle },
        { href: '/eko-rizik/prijava', label: 'Prijava incidenta', desc: 'Prijavite deponiju, požar ili zagađenje.', icon: MarkerPin04 },
        { href: '/mapa', label: 'GIS karta', desc: 'Dozvole i zaštićena područja na karti.', icon: Map01 },
      ] },
    ],
    feature: { title: 'Uživo', more: { href: '/eko-rizik/krizni', label: 'Krizni prikaz' }, cards: [
      { img: '/hero/neretva-m.jpg', title: 'Protok Neretve i rizici', text: 'Satelitska žarišta, meteo upozorenja i GloFAS prognoza.', href: '/eko-rizik', cta: 'Otvori Eko-rizik' },
      { img: '/fig/tile-hutovo.jpg', title: 'Hutovo blato', text: 'Ramsarsko stanište uz donji tok Neretve.', href: '/foto-albumi/hutovo-blato', cta: 'Foto album' },
    ] },
  },
  { label: 'Kontakt', href: '/o-nama#kontakt', match: [] },
];

export type TopInfo = { aqi: number | null; aqiLabel: string; aqiTone: 'success' | 'warning' | 'error' | 'gray'; level: 1 | 2 | 3 };

function Trigger({ n, active, open, onOpen }: { n: Nav; active: boolean; open: boolean; onOpen: (v: boolean) => void }) {
  return (
    <button type="button" aria-expanded={open} aria-haspopup="true" onClick={() => onOpen(!open)} onMouseEnter={() => onOpen(true)}
      className={`flex items-center gap-1 rounded-[6px] px-3 py-2 text-[15px] leading-6 font-semibold whitespace-nowrap ${active || open ? 'bg-[var(--br-50)] text-[var(--br-700)]' : 'text-[#404040] hover:bg-[#fafafa] hover:text-[#262626]'}`}>
      {n.label}<ChevronDown size={16} className={`transition-transform duration-200 ${active || open ? 'text-[var(--br-500)]' : 'text-[#a3a3a3]'} ${open ? 'rotate-180' : ''}`} />
    </button>
  );
}

/** Untitled "Header navigation – mega menu": grupe s naslovom u boji brenda, stavke s ikonom i opisom, desno sivi panel s istaknutim sadržajem. */
function MegaPanel({ n, onClose }: { n: Nav; onClose: () => void }) {
  return (
    <div className="mx-auto grid max-w-[1376px] gap-8 px-4 py-8 md:px-8 lg:grid-cols-[1fr_minmax(0,520px)]">
      <div className={`grid gap-8 ${n.groups!.length > 1 ? 'sm:grid-cols-2' : ''}`}>
        {n.groups!.map((g) => (
          <div key={g.title}>
            <p className="px-3 text-[14px] leading-5 font-semibold text-[var(--br-700)]">{g.title}</p>
            <ul className="mt-3 flex flex-col gap-1">
              {g.items.map((i) => (
                <li key={i.href + i.label}>
                  <Link href={i.href} onClick={onClose} className="group flex gap-4 rounded-[8px] p-3 hover:bg-[#fafafa]">
                    {i.icon && <i.icon size={24} className="mt-0.5 shrink-0 text-[var(--br-600)]" />}
                    <span>
                      <span className="flex items-center gap-2 text-[16px] leading-6 font-semibold text-[#181d27]">{i.label}{i.badge && <span className="rounded-full bg-[#fafafa] px-2 py-0.5 text-[12px] leading-[18px] font-medium text-[#414651] ring-1 ring-inset ring-[#e9eaeb]">{i.badge}</span>}</span>
                      {i.desc && <span className="mt-0.5 block text-[14px] leading-5 text-[#535862]">{i.desc}</span>}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      {n.feature && (
        <div className="hidden rounded-[12px] bg-[#fafafa] p-5 lg:block">
          <div className="flex items-center justify-between"><p className="text-[14px] leading-5 font-semibold text-[var(--br-700)]">{n.feature.title}</p>{n.feature.more && <Link href={n.feature.more.href} onClick={onClose} className="flex items-center gap-1 text-[14px] font-semibold text-[var(--br-700)] hover:text-[var(--br-800)]">{n.feature.more.label}<ChevronRight size={16} /></Link>}</div>
          <ul className="mt-4 flex flex-col gap-4">
            {n.feature.cards.map((c) => (
              <li key={c.title}>
                <Link href={c.href} onClick={onClose} className="group flex gap-5">
                  <span className="block h-[104px] w-[160px] shrink-0 overflow-hidden rounded-[8px] bg-[#e9eaeb]"><img src={c.img} alt="" className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.05]" /></span>
                  <span className="min-w-0">
                    <span className="block text-[16px] leading-6 font-semibold text-[#181d27]">{c.title}</span>
                    <span className="mt-1 block text-[14px] leading-5 text-[#535862] line-clamp-2">{c.text}</span>
                    <span className="mt-2 inline-flex items-center gap-1.5 text-[14px] font-semibold text-[var(--br-700)]">{c.cta}<ArrowRight size={16} /></span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
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
  const [mega, setMega] = useState<string | null>(null);
  const [menuTop, setMenuTop] = useState(112);
  const toggleMenu = () => { setMenuTop(Math.max(0, Math.round(headerRef.current?.getBoundingClientRect().bottom ?? 112))); setOpen((o) => !o); };
  const headerRef = useRef<HTMLElement>(null);
  useEffect(() => { setOpen(false); setMega(null); }, [path]);
  useEffect(() => { document.body.style.overflow = open ? 'hidden' : ''; }, [open]);
  useEffect(() => {
    const out = (e: MouseEvent) => { if (!headerRef.current?.contains(e.target as Node)) setMega(null); };
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') { setMega(null); setOpen(false); } };
    document.addEventListener('mousedown', out); document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('mousedown', out); document.removeEventListener('keydown', esc); };
  }, []);
  const isActive = (n: Nav) => (n.href === '/' ? path === '/' : (n.match ?? []).some((m) => path.startsWith(m)));
  const lv = LVL[info?.level ?? 1];
  const alarm = 'bg-white text-[#414651] ring-1 ring-inset ring-[#d5d7da] shadow-[0_1px_2px_rgba(10,13,18,0.05),inset_0_-2px_0_rgba(10,13,18,0.05)] hover:bg-[#fafafa] hover:text-[#252b37] transition-colors';
  const primary = 'bg-[var(--br-600)] text-white shadow-[0_1px_2px_rgba(10,13,18,0.05),inset_0_-2px_0_rgba(10,13,18,0.05),inset_0_0_0_1px_rgba(10,13,18,0.18)] ring-2 ring-inset ring-white/10 hover:bg-[var(--br-700)] transition-colors';
  const megaNav = NAV.find((n) => n.label === mega && n.groups);

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

      {/* LOGO + PRETRAGA + AKCIJE + NAVIGACIJA */}
      <header ref={headerRef} className="sticky top-0 z-40 border-b border-[#e9eaeb] bg-white/95 backdrop-blur" onMouseLeave={() => setMega(null)}>
        <div className="mx-auto flex h-[72px] max-w-[1376px] items-center justify-between gap-4 px-4 md:px-8">
          <Link href="/" className="shrink-0" aria-label="MTTO HNK – naslovna"><img src="/mtto-logo.svg" alt="Ministarstvo trgovine, turizma i zaštite okoliša HNK" className="h-10 w-auto md:h-12" /></Link>
          <div className="flex items-center gap-3">
            <form action="/vijesti" role="search" className="hidden h-11 w-[360px] items-center gap-2 rounded-[8px] px-3.5 ring-1 ring-inset ring-[#d5d7da] shadow-[0_1px_2px_rgba(10,13,18,0.05)] focus-within:ring-2 focus-within:ring-[var(--br-500)] lg:flex xl:w-[420px]">
              <SearchLg size={20} className="text-[#a4a7ae]" />
              <input name="q" aria-label="Pretraga portala" placeholder="Pretraga vijesti, natječaja, propisa" className="min-w-0 flex-1 border-0 bg-transparent p-0 text-[16px] text-[#181d27] placeholder:text-[#717680] !shadow-none focus:outline-none focus:ring-0" />
            </form>
            <Link href="/eko-rizik/prijava" className={`hidden h-11 items-center gap-2 rounded-[8px] px-4 text-[16px] font-semibold sm:inline-flex ${alarm}`}><span aria-hidden className="relative flex size-2.5"><span className="absolute inline-flex size-full animate-ping rounded-full bg-[#f04438] opacity-60" /><span className="relative inline-flex size-2.5 rounded-full bg-[#f04438]" /></span>Eko-alarm</Link>
            <Link href="/admin/prijava" className="hidden size-11 items-center justify-center rounded-[8px] text-[#535862] ring-1 ring-inset ring-[#d5d7da] shadow-[0_1px_2px_rgba(10,13,18,0.05)] hover:bg-[#fafafa] sm:flex" title="Prijava za službenike" aria-label="Prijava za službenike"><User01 size={20} /></Link>
            <button type="button" className="flex size-11 items-center justify-center rounded-[8px] text-[#414651] hover:bg-[#fafafa] xl:hidden" onClick={toggleMenu} aria-label={open ? 'Zatvori meni' : 'Otvori meni'} aria-expanded={open}>{open ? <XClose size={24} /> : <Menu02 size={24} />}</button>
          </div>
        </div>
        <nav aria-label="Glavna navigacija" className="hidden border-t border-[#f5f5f5] xl:block">
          <div className="mx-auto flex h-14 max-w-[1376px] items-center gap-0.5 px-4 md:px-8">
            {NAV.map((n) => n.groups ? <Trigger key={n.label} n={n} active={isActive(n)} open={mega === n.label} onOpen={(v) => setMega(v ? n.label : null)} /> : (
              <Link key={n.label} href={n.href!} aria-current={isActive(n) ? 'page' : undefined} onMouseEnter={() => setMega(null)}
                className={`rounded-[6px] px-3 py-2 text-[15px] leading-6 font-semibold whitespace-nowrap ${isActive(n) ? 'bg-[var(--br-50)] text-[var(--br-700)]' : 'text-[#414651] hover:bg-[#fafafa] hover:text-[#181d27]'}`}>{n.label}</Link>
            ))}
          </div>
        </nav>
        {/* MEGA MENI (desktop) */}
        <div className={`absolute inset-x-0 top-full hidden border-b border-[#e9eaeb] bg-white shadow-[0_20px_24px_-4px_rgba(10,13,18,0.08),0_8px_8px_-4px_rgba(10,13,18,0.03)] transition-all duration-200 xl:block ${megaNav ? 'visible translate-y-0 opacity-100' : 'invisible -translate-y-1 opacity-0'}`}>
          {megaNav && <MegaPanel n={megaNav} onClose={() => setMega(null)} />}
        </div>

      </header>

      {/* MOBILNI MENI (Untitled "Header navigation – mobile": padajući panel ispod zaglavlja) */}
      <div style={{ top: menuTop }} className={`fixed inset-x-0 bottom-0 z-[70] xl:hidden ${open ? '' : 'pointer-events-none'}`} aria-hidden={!open}>
        <div className={`absolute inset-0 bg-[#0a0d12]/50 backdrop-blur-[2px] transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0'}`} onClick={() => setOpen(false)} />
        <div role="dialog" aria-label="Meni" className={`relative flex max-h-full flex-col overflow-y-auto bg-white shadow-[0_20px_24px_-4px_rgba(10,13,18,0.08)] transition-all duration-300 ${open ? 'translate-y-0 opacity-100' : '-translate-y-3 opacity-0'}`}>
          <div className="px-4 pt-4">
            <form action="/vijesti" role="search" className="flex h-11 items-center gap-2 rounded-[8px] px-3.5 ring-1 ring-inset ring-[#d5d7da] shadow-[0_1px_2px_rgba(10,13,18,0.05)]"><SearchLg size={20} className="text-[#a4a7ae]" /><input name="q" placeholder="Pretraga vijesti, natječaja, propisa" aria-label="Pretraga" className="min-w-0 flex-1 border-0 bg-transparent p-0 text-[16px] !shadow-none focus:outline-none focus:ring-0" /></form>
          </div>
          <ul className="flex flex-col px-2 py-3">
            {NAV.filter((n) => n.label !== 'Kontakt').map((n) => (
              <li key={n.label}>
                {n.groups ? (
                  <>
                    <button type="button" onClick={() => setSub(sub === n.label ? null : n.label)} aria-expanded={sub === n.label}
                      className={`flex w-full items-center justify-between rounded-[6px] px-3 py-3 text-[16px] leading-6 font-semibold ${isActive(n) ? 'text-[var(--br-700)]' : 'text-[#181d27]'} hover:bg-[#fafafa]`}>
                      {n.label}<ChevronDown size={20} className={`text-[#a4a7ae] transition-transform duration-200 ${sub === n.label ? 'rotate-180' : ''}`} />
                    </button>
                    <div className={`grid transition-[grid-template-rows] duration-300 ${sub === n.label ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                      <div className="overflow-hidden">
                        {n.groups.map((g) => (
                          <div key={g.title} className="px-3 pb-2 pt-3">
                            <p className="text-[14px] leading-5 font-semibold text-[var(--br-700)]">{g.title}</p>
                            <ul className="mt-1">
                              {g.items.map((i) => (
                                <li key={i.href + i.label}><Link href={i.href} className="flex items-center gap-3 rounded-[6px] py-2.5 hover:bg-[#fafafa]">{i.icon && <i.icon size={20} className="text-[#717680]" />}<span className="text-[16px] leading-6 font-semibold text-[#414651]">{i.label}</span>{i.badge && <span className="rounded-full bg-[#fafafa] px-2 py-0.5 text-[12px] font-medium text-[#414651] ring-1 ring-inset ring-[#e9eaeb]">{i.badge}</span>}</Link></li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <Link href={n.href!} aria-current={isActive(n) ? 'page' : undefined} className={`flex rounded-[6px] px-3 py-3 text-[16px] leading-6 font-semibold ${isActive(n) ? 'text-[var(--br-700)]' : 'text-[#181d27]'} hover:bg-[#fafafa]`}>{n.label}</Link>
                )}
              </li>
            ))}
          </ul>
          <div className="border-t border-[#e9eaeb] px-5 py-6">
            <ul className="grid grid-cols-2 gap-x-4 gap-y-3 text-[16px] leading-6 font-semibold text-[#535862]">
              {[['Kontakt', '/o-nama#kontakt'], ['Eko-rizik uživo', '/eko-rizik'], ['GIS karta', '/mapa'], ['Pristup informacijama', '/o-nama#upit'], ['Natječaji', '/vijesti?type=JAVNI_POZIV'], ['Krizni prikaz', '/eko-rizik/krizni']].map(([l, h]) => <li key={l}><Link href={h} className="hover:text-[#181d27]">{l}</Link></li>)}
            </ul>
            <div className="mt-6 flex flex-col gap-3">
              <Link href="/eko-rizik/prijava" className={`flex h-11 items-center justify-center gap-2 rounded-[8px] text-[16px] font-semibold ${primary}`}><MarkerPin04 size={20} />Prijavi ekološki incident</Link>
              <Link href="/admin/prijava" className={`flex h-11 items-center justify-center gap-2 rounded-[8px] text-[16px] font-semibold ${alarm}`}><User01 size={20} />Prijava za službenike</Link>
            </div>
            <a href="tel:+38736551823" className="mt-5 flex items-center justify-center gap-2 text-[14px] font-medium text-[#535862]"><Phone01 size={16} />+387 36 551 823 · info@mtto.gov.ba</a>
          </div>
        </div>
      </div>
    </>
  );
}
