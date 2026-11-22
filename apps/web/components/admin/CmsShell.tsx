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
      { href: '/admin/eko-rizik', label: 'Eko-rizik i prijave', icon: 'crisis_alert' },
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
  const initials = (user?.name ?? 'Urednik MTTO').split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
  const Ico = ({ n, cls = '' }: { n: string; cls?: string }) => <span aria-hidden className={`material-symbols-outlined shrink-0 text-[20px] leading-none ${cls}`} style={{ fontVariationSettings: "'wght' 400" }}>{n}</span>;
  const item = (on: boolean) => `group flex items-center gap-3 px-2 py-2 rounded-[6px] text-[14px] leading-5 font-semibold transition-colors ${on ? 'bg-[#fafafa] text-[#262626]' : 'text-[#404040] hover:bg-[#fafafa] hover:text-[#262626]'}`;

  return (
    <div className="cms-theme min-h-screen bg-white">
      {/* Bočna navigacija – Untitled UI "Sidebar navigation" (280 px) */}
      <aside className={`fixed left-0 top-0 h-full w-[280px] bg-white border-r border-[#e5e5e5] z-50 flex flex-col transition-transform lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`} aria-label="Navigacija CMS-a">
        <div className="flex flex-col gap-5 p-5 shrink-0">
          <div className="flex items-center justify-between">
            <a href="/admin" aria-label="MTTO CMS – kontrolna ploča" className="flex items-center gap-2"><img src="/mtto-logo.svg" alt="Ministarstvo trgovine, turizma i zaštite okoliša HNK" className="h-[40px] w-auto" /></a>
            <span className="text-[12px] leading-[18px] font-medium px-2 py-[2px] rounded-full border border-[#e9d7fe] bg-[#f9f5ff] text-[#7f56d9]">CMS</span>
          </div>
          <form action="/admin/objave" className="flex items-center gap-2 h-10 pl-3 pr-2 rounded-[8px] border border-[#d4d4d4] bg-white shadow-[0_1px_2px_rgba(10,13,18,0.05)] focus-within:border-[#d6bbfb] focus-within:shadow-[0_0_0_4px_rgba(10,54,99,0.12)]">
            <Ico n="search" cls="!text-[16px] text-[#a3a3a3]" />
            <input name="q" aria-label="Pretraga objava" placeholder="Pretraga objava" className="flex-1 min-w-0 bg-transparent border-0 p-0 text-[14px] leading-5 text-[#171717] placeholder:text-[#737373] focus:ring-0 focus:outline-none !shadow-none" />
            <kbd className="hidden sm:inline px-1 py-px rounded-[4px] border border-[#e5e5e5] text-[12px] leading-[18px] font-medium text-[#737373] font-[inherit]">⏎</kbd>
          </form>
        </div>
        <nav className="flex-1 overflow-y-auto px-4 pb-4">
          {NAV.map((g, gi) => (
            <div key={g.group} className={gi ? 'pt-5' : ''}>
              <p className="px-2 pb-1 text-[12px] leading-[18px] font-semibold text-[#737373]">{g.group}</p>
              <div className="flex flex-col gap-px">
                {g.items.map((i) => {
                  const on = active(i.href);
                  return (
                    <Link key={i.href} href={i.href} onClick={() => setOpen(false)} aria-current={on ? 'page' : undefined} className={item(on)}>
                      <Ico n={i.icon} cls={on ? 'text-[#737373]' : 'text-[#a3a3a3] group-hover:text-[#737373]'} />
                      <span className="flex-1 truncate">{i.label}</span>
                      {i.f2 && <span className="text-[12px] leading-[18px] font-medium px-2 py-[2px] rounded-full border border-[#e5e5e5] bg-[#fafafa] text-[#404040]">Faza 2</span>}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
        <div className="flex flex-col gap-3 px-4 pb-5 shrink-0">
          <div className="flex flex-col gap-px">
            <a href="/" target="_blank" rel="noopener" className={item(false)}><Ico n="open_in_new" cls="text-[#a3a3a3]" /><span className="flex-1">Otvori javni portal</span></a>
            <Link href="/admin/korisnici#audit" className={item(false)}><Ico n="history" cls="text-[#a3a3a3]" /><span className="flex-1">Audit log</span></Link>
          </div>
          <div className="rounded-[12px] border border-[#e5e5e5] p-4 flex flex-col gap-1">
            <p className="flex items-center gap-2 text-[14px] leading-5 font-semibold text-[#171717]"><span className="relative flex size-2"><span className="absolute inline-flex h-full w-full rounded-full bg-[#22c55e] opacity-60 animate-ping" /><span className="relative inline-flex size-2 rounded-full bg-[#22c55e]" /></span>Demo okruženje</p>
            <p className="text-[14px] leading-5 text-[#525252]">Baza povezana · PostgreSQL. Podaci se mogu resetovati prije produkcije.</p>
          </div>
          <div className="relative flex items-center gap-2 p-3 rounded-[12px] border border-[#e5e5e5]">
            <span className="relative size-10 shrink-0 rounded-full bg-[#f9f5ff] border border-black/10 flex items-center justify-center text-[14px] font-semibold text-[#7f56d9]">{initials}<span className="absolute -bottom-0.5 -right-0.5 size-3.5 rounded-full bg-[#22c55e] border-[1.5px] border-white" /></span>
            <span className="flex-1 min-w-0 flex flex-col"><span className="text-[14px] leading-5 font-semibold text-[#171717] truncate">{user?.name ?? 'Urednik MTTO'}</span><span className="text-[14px] leading-5 text-[#525252] truncate">{user?.email ?? (user?.role === 'ADMIN' ? 'Administrator' : 'Urednik')}</span></span>
            <button type="button" onClick={() => { clearSession(); router.replace('/admin/prijava'); }} className="absolute right-[7px] top-[7px] p-1.5 rounded-[6px] text-[#a3a3a3] hover:bg-[#fafafa] hover:text-[#d92d20]" title="Odjava" aria-label="Odjava"><Ico n="logout" cls="!text-[16px]" /></button>
          </div>
        </div>
      </aside>
      {open && <div className="fixed inset-0 bg-[#0a0d12]/60 backdrop-blur-[2px] z-40 lg:hidden" onClick={() => setOpen(false)} />}

      <div className="lg:pl-[280px]">
        {/* Mobilna traka – Untitled UI (56 px) */}
        <header className="lg:hidden sticky top-0 z-40 h-14 bg-white border-b border-[#e5e5e5] flex items-center justify-between px-4">
          <a href="/admin"><img src="/mtto-logo.svg" alt="MTTO CMS" className="h-8 w-auto" /></a>
          <button type="button" className="p-2 rounded-[8px] text-[#737373] hover:bg-[#fafafa]" onClick={() => setOpen(true)} aria-label="Otvori meni"><Ico n="menu" cls="!text-[24px]" /></button>
        </header>
        <main className="w-full bg-white min-h-screen"><div className="px-4 md:px-8 pt-8 pb-12 max-w-[1600px] mx-auto">{children}</div></main>
      </div>
    </div>
  );
}
