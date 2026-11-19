'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { clearSession, getToken, getUser, type CmsUser } from '@/lib/adminApi';

const NAV = [
  { group: 'Pregled sistema', items: [{ href: '/admin', label: 'Kontrolna ploča', icon: 'dashboard' }] },
  {
    group: 'Sadržaj',
    items: [
      { href: '/admin/objave', label: 'Objave i vijesti', icon: 'article' },
      { href: '/admin/dokumenti', label: 'Dokumenti i propisi', icon: 'folder_open' },
    ],
  },
  {
    group: 'Registri i mapa',
    items: [
      { href: '/admin/registri', label: 'Registar okolišnih dozvola', icon: 'eco' },
      { href: '/admin/mapa', label: 'Lokacije na mapi', icon: 'map' },
    ],
  },
];

export default function CmsShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<CmsUser | null>(null);
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);
  const isLogin = path === '/admin/prijava';

  useEffect(() => {
    if (isLogin) { setReady(true); return; }
    if (!getToken()) { router.replace('/admin/prijava'); return; }
    setUser(getUser());
    setReady(true);
  }, [isLogin, router, path]);

  if (isLogin) return <>{children}</>;
  if (!ready) return <div className="min-h-screen flex items-center justify-center text-on-surface-variant">Učitavanje…</div>;

  const active = (href: string) => (href === '/admin' ? path === '/admin' : path.startsWith(href));

  return (
    <div className="min-h-screen bg-slate-surface">
      <aside className={`fixed inset-y-0 left-0 w-72 z-50 flex flex-col text-white transition-transform lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`} style={{ background: 'linear-gradient(180deg, #1a1e5c 0%, #234696 100%)' }}>
        <div className="h-16 flex items-center gap-space-sm px-space-lg border-b border-white/10">
          <span className="w-9 h-9 rounded-lg bg-white flex items-center justify-center"><span className="material-symbols-outlined text-mtto-primary">account_balance</span></span>
          <div className="leading-tight">
            <p className="font-label-badge text-label-badge uppercase tracking-wider text-white/70">MTTO HNK</p>
            <p className="font-title-md text-[15px] font-bold">Back-Office CMS</p>
          </div>
          <span className="ml-auto px-1.5 py-0.5 rounded bg-eko-green text-white font-label-badge text-[10px]">MVP</span>
        </div>
        <nav className="flex-1 overflow-y-auto px-space-md py-space-md space-y-space-lg">
          {NAV.map((g) => (
            <div key={g.group}>
              <p className="px-space-sm mb-space-xs font-label-kicker text-label-kicker uppercase tracking-wider text-white/50">{g.group}</p>
              {g.items.map((i) => (
                <Link key={i.href} href={i.href} onClick={() => setOpen(false)} className={`flex items-center gap-space-sm px-space-sm py-2.5 rounded-lg font-button text-button transition-colors ${active(i.href) ? 'bg-white/15 text-white font-bold' : 'text-white/80 hover:bg-white/10 hover:text-white'}`}>
                  <span className="material-symbols-outlined text-[20px]">{i.icon}</span>{i.label}
                </Link>
              ))}
            </div>
          ))}
          <div>
            <p className="px-space-sm mb-space-xs font-label-kicker text-label-kicker uppercase tracking-wider text-white/50">Javni portal</p>
            <a href="/" target="_blank" rel="noopener" className="flex items-center gap-space-sm px-space-sm py-2.5 rounded-lg font-button text-button text-white/80 hover:bg-white/10"><span className="material-symbols-outlined text-[20px]">open_in_new</span>Otvori portal</a>
          </div>
        </nav>
        <div className="px-space-lg py-space-md border-t border-white/10 flex items-center gap-space-xs font-label-badge text-label-badge text-white/70">
          <span className="w-2 h-2 rounded-full bg-secondary-fixed" />Povezano s bazom
        </div>
      </aside>
      {open && <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setOpen(false)} />}

      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 h-16 flex items-center justify-between px-space-md md:px-space-lg text-white" style={{ background: 'linear-gradient(90deg, #234696 0%, #1e2570 100%)' }}>
          <div className="flex items-center gap-space-sm">
            <button type="button" className="lg:hidden w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center" onClick={() => setOpen(true)} aria-label="Meni"><span className="material-symbols-outlined">menu</span></button>
            <span className="hidden md:inline-flex items-center gap-space-xs px-2.5 py-1 rounded-lg bg-white/10 border border-white/20 font-label-badge text-label-badge uppercase tracking-wider"><span className="w-2 h-2 rounded-full bg-secondary-fixed" />Staging · radni prototip</span>
          </div>
          <div className="flex items-center gap-space-md">
            <div className="text-right leading-tight">
              <p className="font-button text-button font-bold">{user?.name ?? 'Urednik'}</p>
              <p className="text-[12px] text-white/70">{user?.role === 'ADMIN' ? 'Administrator' : 'Urednik'}</p>
            </div>
            <button type="button" onClick={() => { clearSession(); router.replace('/admin/prijava'); }} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 font-button text-button" title="Odjava">
              <span className="material-symbols-outlined text-[18px]">logout</span><span className="hidden sm:inline">Odjava</span>
            </button>
          </div>
        </header>
        <main className="p-space-md md:p-space-lg max-w-[1400px] mx-auto">{children}</main>
      </div>
    </div>
  );
}
