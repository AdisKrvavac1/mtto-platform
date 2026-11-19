'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { clearSession, getToken, getUser, type CmsUser } from '@/lib/adminApi';

const NAV: { group: string; items: { href: string; label: string; icon: string; f2?: boolean }[] }[] = [
  { group: 'Pregled sustava', items: [{ href: '/admin', label: 'Kontrolna ploča', icon: 'dashboard' }] },
  {
    group: 'Sadržaj portala',
    items: [
      { href: '/admin/objave', label: 'Objave i vijesti', icon: 'article' },
      { href: '/admin/dokumenti', label: 'Dokumenti i propisi', icon: 'folder_open' },
      { href: '/admin/multimedija', label: 'Multimedija i galerije', icon: 'photo_library', f2: true },
      { href: '/admin/mapa', label: 'Lokacije na mapi', icon: 'map' },
    ],
  },
  {
    group: 'Administracija i registri',
    items: [
      { href: '/admin/registri', label: 'Registar okolišnih dozvola', icon: 'nature_people' },
      { href: '/admin/resorni-odjeli', label: 'Resorni odjeli i struktura', icon: 'corporate_fare', f2: true },
      { href: '/admin/korisnici', label: 'Korisnici i permisije', icon: 'manage_accounts', f2: true },
    ],
  },
  {
    group: 'Protokol i nadzor',
    items: [{ href: '/admin/predmeti', label: 'E-pisarnica i protokol', icon: 'folder_managed', f2: true }],
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
    <div className="min-h-screen bg-surface">
      <aside className={`fixed left-0 top-0 h-full w-72 bg-institutional-navy-deep z-50 flex flex-col text-on-primary shadow-[0_1px_8px_rgba(0,0,0,0.04)] transition-transform lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-16 px-space-md flex items-center justify-between bg-primary shrink-0">
          <div className="flex items-center gap-space-sm">
            <div className="w-8 h-8 rounded-lg bg-surface-container-lowest flex items-center justify-center p-1"><img src="/mtto-logo.svg" alt="" className="w-full h-full" /></div>
            <div className="flex flex-col"><span className="font-label-kicker text-label-kicker uppercase tracking-wider text-surface-variant">Vlada HNK</span><span className="font-button text-button font-bold leading-tight text-on-primary truncate max-w-[155px]">MTTO Back-Office</span></div>
          </div>
          <span className="font-label-badge text-label-badge px-space-xs py-0.5 rounded-lg bg-secondary text-on-secondary">MVP</span>
        </div>
        <div className="px-space-md py-space-sm bg-primary/40 border-b border-primary-container/40">
          <span className="font-label-kicker text-[10px] uppercase tracking-wider text-on-primary-container block mb-1">Upravno tijelo</span>
          <div className="flex items-center justify-between"><span className="font-body-sm text-body-sm text-surface-container-highest truncate">Ministarstvo trgovine, turizma i zaštite okoliša</span><span className="material-symbols-outlined text-[16px] text-on-primary-container">verified</span></div>
        </div>
        <nav className="flex-1 overflow-y-auto px-space-sm py-space-md space-y-1">
          {NAV.map((g, gi) => (
            <div key={g.group} className="space-y-1">
              <div className={`${gi ? 'pt-space-sm ' : ''}px-space-sm py-space-xs font-label-kicker text-label-kicker uppercase tracking-widest text-on-primary-container`}>{g.group}</div>
              {g.items.map((i) => (
                <Link key={i.href} href={i.href} onClick={() => setOpen(false)} aria-current={active(i.href) ? 'page' : undefined} className={`flex items-center gap-space-sm px-space-sm py-2 rounded-lg transition-colors ${active(i.href) ? 'bg-primary-container text-on-primary font-button shadow-sm' : 'text-surface-variant hover:bg-primary-container hover:text-on-primary'}`}>
                  <span className="material-symbols-outlined text-[20px]">{i.icon}</span><span className="font-button text-button flex-1">{i.label}</span>
                  {i.f2 && <span className="font-label-badge text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-surface-variant uppercase">Faza 2</span>}
                </Link>
              ))}
            </div>
          ))}
          <div className="pt-space-sm px-space-sm py-space-xs font-label-kicker text-label-kicker uppercase tracking-widest text-on-primary-container">Javni portal</div>
          <a href="/" target="_blank" rel="noopener" className="flex items-center gap-space-sm px-space-sm py-2 rounded-lg text-surface-variant hover:bg-primary-container hover:text-on-primary transition-colors"><span className="material-symbols-outlined text-[20px]">open_in_new</span><span className="font-button text-button">Otvori portal</span></a>
        </nav>
        <div className="p-space-sm bg-primary/70 shrink-0">
          <div className="flex items-center gap-space-sm p-space-xs rounded-lg bg-institutional-navy-deep">
            <div className="w-2 h-2 rounded-full bg-secondary-fixed animate-pulse ml-1" />
            <div className="flex flex-col"><span className="font-label-badge text-[10px] text-surface-variant uppercase">Integritet baze</span><span className="font-body-sm text-[12px] text-on-primary font-semibold">Povezano · PostgreSQL</span></div>
          </div>
        </div>
      </aside>
      {open && <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setOpen(false)} />}

      <div className="lg:pl-72">
        <header className="fixed top-0 left-0 lg:left-72 right-0 h-16 bg-surface-container-lowest/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-40 flex items-center justify-between px-space-md lg:px-space-lg">
          <div className="flex items-center gap-space-md">
            <button type="button" className="lg:hidden w-10 h-10 rounded-lg bg-surface-container-low flex items-center justify-center" onClick={() => setOpen(true)} aria-label="Meni"><span className="material-symbols-outlined">menu</span></button>
            <form action="/admin/objave" className="relative hidden md:flex items-center w-80"><span className="material-symbols-outlined absolute left-3 text-outline text-[18px]">search</span><input name="q" className="w-full h-10 pl-9 pr-3 rounded-lg bg-surface-container-low border border-slate-border text-body-sm text-text-heading placeholder:text-outline focus:outline-none focus:border-primary-container" placeholder="Pretraga objava..." type="text" /></form>
            <div className="hidden sm:flex items-center gap-space-xs px-2.5 py-1 rounded-lg bg-emerald-light border border-secondary-container/60"><span className="w-2 h-2 rounded-full bg-secondary" /><span className="font-label-badge text-label-badge uppercase tracking-wider text-on-secondary-container">Staging · MVP</span></div>
          </div>
          <div className="flex items-center gap-space-md">
            <Link className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface text-body-sm font-button" href="/admin/korisnici#audit"><span className="material-symbols-outlined text-[18px]">history_edu</span><span>Audit log</span></Link>
            <div className="h-6 w-[1px] bg-slate-border hidden md:block" />
            <div className="flex items-center gap-space-sm pl-1">
              <div className="flex flex-col text-right"><span className="font-button text-button font-bold text-text-heading leading-tight">{user?.name ?? 'Urednik MTTO'}</span><span className="font-body-sm text-[12px] text-outline leading-tight">{user?.role === 'ADMIN' ? 'Administrator' : 'Urednik'}</span></div>
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center"><span className="material-symbols-outlined text-on-primary text-[18px]">person</span></div>
              <button type="button" onClick={() => { clearSession(); router.replace('/admin/prijava'); }} className="p-2 rounded-lg text-on-surface-variant hover:bg-surface-container-low hover:text-error" title="Odjava"><span className="material-symbols-outlined text-[20px]">logout</span></button>
            </div>
          </div>
        </header>
        <main className="w-full pt-16 bg-surface min-h-screen"><div className="px-space-md lg:px-space-lg py-space-xl">{children}</div></main>
      </div>
    </div>
  );
}
