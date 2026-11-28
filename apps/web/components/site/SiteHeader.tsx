'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const NAV = [
  { href: '/', label: 'Naslovna' },
  { href: '/o-nama', label: 'O nama' },
  { href: '/vijesti', label: 'Vijesti' },
  { href: '/javni-pozivi', label: 'Javni pozivi' },
  { href: '/propisi', label: 'Propisi i obrasci' },
  { href: '/registri/okolisne-dozvole', label: 'Registar dozvola' },
  { href: '/registri/ugostiteljski-objekti', label: 'Ugostiteljski objekti' },
  { href: '/mapa', label: 'Interaktivna mapa' },
  { href: '/o-nama#kontakt', label: 'Kontakt' },
];

export default function SiteHeader() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const active = (href: string) => {
    const base = href.split('?')[0].split('#')[0];
    return base === '/' ? path === '/' : path.startsWith(base) && !href.includes('?') && !href.includes('#');
  };

  return (
    <header className="sticky top-0 z-50 bg-surface-container-lowest/95 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
      <div className="bg-institutional-navy-deep text-surface-container-lowest">
        <div className="max-w-7xl mx-auto px-margin-mobile md:px-margin flex items-center justify-between h-10">
          <div className="flex items-center gap-space-sm min-w-0">
            <div className="w-5 h-5 bg-surface-container-lowest/20 rounded flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[14px] text-surface-container-lowest">account_balance</span>
            </div>
            <span className="font-label-kicker text-label-kicker text-surface-container-high tracking-wider uppercase truncate">
              Vlada Hercegovačko-neretvanskog kantona
            </span>
          </div>
          <div className="flex items-center gap-space-md">
            <a href="tel:+38736551823" className="hidden md:flex items-center gap-space-xs text-surface-variant font-body-sm text-body-sm hover:text-white">
              <span className="material-symbols-outlined text-[15px]">call</span>
              <span>+387 36 551 823</span>
            </a>
            <div className="flex items-center gap-space-xs font-label-kicker text-label-kicker">
              <span className="px-1.5 py-0.5 rounded text-surface-container-lowest bg-surface-container-lowest/20">BA</span>
              <span className="text-outline">|</span>
              <span className="px-1.5 py-0.5 rounded text-surface-variant" title="Višejezičnost: Faza 2">HR</span>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-margin-mobile md:px-margin h-16 flex items-center justify-between gap-space-md">
        <Link href="/" className="flex items-center gap-space-md min-w-0">
          <img src="/mtto-logo.svg" alt="Ministarstvo trgovine, turizma i zaštite okoliša HNK" className="h-11 w-auto shrink-0" />
          <div className="hidden sm:block min-w-0">
            <div className="flex items-center gap-space-xs">
              <span className="font-headline-md text-headline-sm font-bold text-primary tracking-tight">MTTO HNK</span>
              <span className="px-1.5 py-0.5 rounded bg-surface-container-high text-primary font-label-badge text-label-badge uppercase">Službeni portal</span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant truncate">Ministarstvo trgovine, turizma i zaštite okoliša</p>
          </div>
        </Link>
        <div className="flex items-center gap-space-sm">
          <form action="/vijesti" className="hidden xl:flex items-center bg-surface-container-low rounded-lg px-space-md py-1.5 w-72">
            <span className="material-symbols-outlined text-outline text-[18px] mr-2">search</span>
            <input name="q" aria-label="Pretraga" className="bg-transparent w-full border-0 p-0 focus:ring-0 focus:outline-none font-body-sm text-body-sm text-on-surface placeholder:text-outline" placeholder="Pretraga vijesti i poziva..." type="search" />
          </form>
          <Link href="/admin" className="inline-flex items-center gap-space-xs px-space-md py-2 rounded-lg bg-primary-container text-on-primary font-button text-button hover:bg-institutional-navy-deep transition-colors">
            <span className="material-symbols-outlined text-[18px]">lock</span>
            <span className="hidden sm:inline">CMS prijava</span>
          </Link>
          <button type="button" onClick={() => setOpen(!open)} className="lg:hidden w-10 h-10 rounded-lg bg-surface-container-low flex items-center justify-center" aria-label="Meni" aria-expanded={open}>
            <span className="material-symbols-outlined">{open ? 'close' : 'menu'}</span>
          </button>
        </div>
      </div>
      <div className="hidden lg:block border-t border-slate-border/60">
        <nav className="max-w-7xl mx-auto px-margin h-12 flex items-center gap-space-xs overflow-x-auto">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className={`px-space-md py-1.5 font-button text-button whitespace-nowrap transition-colors ${active(n.href) ? 'bg-primary-container text-on-primary font-bold rounded-lg' : 'text-on-surface-variant hover:text-on-surface'}`}>
              {n.label}
            </Link>
          ))}
        </nav>
      </div>
      {open && (
        <nav className="lg:hidden border-t border-slate-border bg-surface-container-lowest px-margin-mobile py-space-sm grid">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} onClick={() => setOpen(false)} className={`px-space-md py-3 rounded-lg font-button text-button ${active(n.href) ? 'bg-primary-container text-on-primary' : 'text-on-surface'}`}>
              {n.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
