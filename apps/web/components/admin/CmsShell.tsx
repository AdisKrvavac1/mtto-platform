'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { can, getUser, isSignedIn, logout, refreshUser, type CmsUser, type Module } from '@/lib/adminApi';
import { AlertTriangle, Announcement01, BarChartSquare02, Building07, ClockRewind, Folder, Image01, Inbox01, LinkExternal01, LogOut01, Map01, Menu02, SearchLg, Database01, ShieldTick, Users01, XClose } from '@untitledui/icons';

type Icon = React.FC<React.SVGProps<SVGSVGElement> & { size?: number }>;
type Item = { href: string; label: string; icon: Icon; f2?: boolean; perm?: Module };

const NAV: { group?: string; items: Item[] }[] = [
  { items: [{ href: '/admin', label: 'Kontrolna ploča', icon: BarChartSquare02, perm: 'kontrolna' }] },
  {
    group: 'Sadržaj portala',
    items: [
      { href: '/admin/objave', label: 'Objave i vijesti', icon: Announcement01, perm: 'objave' },
      { href: '/admin/dokumenti', label: 'Dokumenti i propisi', icon: Folder, perm: 'dokumenti' },
      { href: '/admin/multimedija', label: 'Multimedija', icon: Image01, perm: 'mediji', f2: true },
      { href: '/admin/mapa', label: 'Lokacije na karti', icon: Map01, perm: 'registri' },
      { href: '/admin/eko-rizik', label: 'Eko-rizik i prijave', icon: AlertTriangle, perm: 'eko' },
    ],
  },
  {
    group: 'Registri i administracija',
    items: [
      { href: '/admin/registri', label: 'Javni registri', icon: Database01, perm: 'registri' },
      { href: '/admin/resorni-odjeli', label: 'Resorni odjeli', icon: Building07, f2: true },
      { href: '/admin/korisnici', label: 'Korisnici i dnevnik', icon: Users01, perm: 'korisnici' },
      { href: '/admin/predmeti', label: 'E-pisarnica', icon: Inbox01, f2: true },
    ],
  },
];

export default function CmsShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<CmsUser | null>(null);
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);
  const search = useRef<HTMLInputElement>(null);
  const isLogin = path === '/admin/prijava' || path === '/admin/aktivacija';

  useEffect(() => {
    if (isLogin) { setReady(true); return; }
    if (!isSignedIn()) { router.replace('/admin/prijava'); return; }
    setUser(getUser());
    setReady(true);
  }, [isLogin, router, path]);

  // uloga i prava sa servera pri otvaranju CMS-a (promjena uloge vrijedi bez ponovne prijave u drugom tabu)
  useEffect(() => { if (!isLogin && isSignedIn()) refreshUser().then(setUser).catch(() => {}); }, [isLogin]);

  useEffect(() => {
    const u = () => setUser(getUser());
    window.addEventListener('mtto-user', u);
    return () => window.removeEventListener('mtto-user', u);
  }, []);

  useEffect(() => {
    const k = (e: KeyboardEvent) => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); search.current?.focus(); } };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, []);

  if (isLogin) return <div className="cms-theme">{children}</div>;
  if (!ready) return <div className="cms-theme flex min-h-screen items-center justify-center text-[14px] text-[#525252]">Učitavanje…</div>;

  const active = (href: string) => (href === '/admin' ? path === '/admin' : path.startsWith(href));
  const name = user?.name ?? 'Urednik MTTO';
  const ini = name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
  const item = (on: boolean) => `group flex items-center gap-3 rounded-[6px] px-3 py-1.5 text-[15px] leading-6 font-semibold transition-colors ${on ? 'bg-[#fafafa] text-[#262626]' : 'text-[#404040] hover:bg-[#fafafa] hover:text-[#262626]'}`;

  return (
    <div className="cms-theme min-h-screen bg-white">
      <aside className={`fixed left-0 top-0 z-50 flex h-full w-[296px] flex-col border-r border-[#e5e5e5] bg-white transition-transform lg:w-[280px] lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`} aria-label="Navigacija CMS-a">
        <div className="flex flex-col gap-5 px-5 pt-6 lg:pt-8">
          <div className="flex items-center justify-between">
            <Link href="/admin" className="flex items-center gap-2" aria-label="MTTO CMS – kontrolna ploča"><img src="/mtto-logo.svg" alt="Ministarstvo trgovine, turizma i zaštite okoliša HNK" className="h-9 w-auto" /></Link>
            <span className="hidden items-center gap-1.5 rounded-full bg-[#ecfdf3] py-0.5 pl-1.5 pr-2 text-[12px] leading-[18px] font-medium text-[#067647] ring-1 ring-inset ring-[#abefc6] lg:inline-flex" title="Demo okruženje: demo zapisi se brišu prije puštanja u rad"><span className="size-1.5 rounded-full bg-[#17b26a]" />Demo</span>
            <button type="button" className="rounded-[8px] p-2 text-[#a3a3a3] hover:bg-[#fafafa] lg:hidden" onClick={() => setOpen(false)} aria-label="Zatvori meni"><XClose size={20} /></button>
          </div>
          <form action="/admin/objave" className="flex h-10 items-center gap-2 rounded-[8px] bg-white pl-3 pr-2 ring-1 ring-inset ring-[#d4d4d4] shadow-[0_1px_2px_rgba(10,13,18,0.05)] focus-within:ring-2 focus-within:ring-[#9e77ed]">
            <SearchLg size={20} className="shrink-0 text-[#a3a3a3]" />
            <input ref={search} name="q" aria-label="Pretraga objava" placeholder="Pretraga" className="min-w-0 flex-1 border-0 bg-transparent p-0 text-[16px] leading-6 text-[#171717] placeholder:text-[#737373] !shadow-none focus:outline-none focus:ring-0" />
            <kbd className="hidden rounded-[4px] px-1 py-px font-[inherit] text-[12px] leading-[18px] font-medium text-[#737373] ring-1 ring-inset ring-[#e5e5e5] sm:inline">⌘K</kbd>
          </form>
        </div>
        <nav className="mt-5 flex-1 overflow-y-auto px-4">
          {NAV.map((g) => ({ ...g, items: g.items.filter((i) => !i.perm || !user?.permissions || can(user, i.perm)) })).filter((g) => g.items.length).map((g, gi) => (
            <div key={gi} className={gi ? 'mt-4' : ''}>
              {g.group && <p className="px-3 pb-1 text-[12px] leading-[18px] font-semibold text-[#737373]">{g.group}</p>}
              <ul className="flex flex-col gap-0.5">
                {g.items.map((i) => {
                  const on = active(i.href);
                  return (
                    <li key={i.href}>
                      <Link href={i.href} onClick={() => setOpen(false)} aria-current={on ? 'page' : undefined} className={item(on)}>
                        <i.icon size={20} className={on ? 'text-[#737373]' : 'text-[#a3a3a3] group-hover:text-[#737373]'} />
                        <span className="flex-1 truncate">{i.label}</span>
                        {i.f2 && <span className="rounded-full bg-[#fafafa] px-2 py-0.5 text-[12px] leading-[18px] font-medium text-[#404040] ring-1 ring-inset ring-[#e5e5e5]">F2</span>}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
        <div className="flex flex-col gap-4 px-4 pb-6 pt-4">
          <ul className="flex flex-col gap-0.5">
            <li><a href="/" target="_blank" rel="noopener" className={item(false)}><LinkExternal01 size={20} className="text-[#a3a3a3]" /><span className="flex-1">Javni portal</span></a></li>
            {can(user, 'dnevnik') && <li><Link href="/admin/korisnici#dnevnik" className={item(false)}><ClockRewind size={20} className="text-[#a3a3a3]" /><span className="flex-1">Dnevnik aktivnosti</span></Link></li>}
            <li><Link href="/admin/sigurnost" aria-current={path.startsWith('/admin/sigurnost') ? 'page' : undefined} className={item(path.startsWith('/admin/sigurnost'))}><ShieldTick size={20} className="text-[#a3a3a3]" /><span className="flex-1">Sigurnost naloga</span>{user && !user.mfaEnabled && <span className="size-2 rounded-full bg-[#f79009]" aria-label="MFA nije uključen" />}</Link></li>
          </ul>
          <div className="relative flex items-center gap-3 rounded-[12px] p-3 ring-1 ring-inset ring-[#e5e5e5]">
            <span className="relative flex size-10 shrink-0 items-center justify-center rounded-full bg-[#f9f5ff] text-[14px] font-semibold text-[#7f56d9] ring-1 ring-inset ring-black/10">{ini}<span className="absolute bottom-0 right-0 size-2.5 rounded-full bg-[#17b26a] ring-[1.5px] ring-white" /></span>
            <span className="flex min-w-0 flex-1 flex-col"><span className="truncate text-[14px] leading-5 font-semibold text-[#171717]">{name}</span><span className="truncate text-[14px] leading-5 text-[#525252]" title={user?.email}>{user?.roleLabel ?? user?.email ?? 'Urednik'}</span></span>
            <button type="button" onClick={async () => { await logout(); router.replace('/admin/prijava'); }} className="rounded-[6px] p-1.5 text-[#a3a3a3] hover:bg-[#fafafa] hover:text-[#d92d20]" title="Odjava" aria-label="Odjava"><LogOut01 size={20} /></button>
          </div>
        </div>
      </aside>
      {open && <div className="fixed inset-0 z-40 bg-[#0a0d12]/70 backdrop-blur-[2px] lg:hidden" onClick={() => setOpen(false)} />}

      <div className="lg:pl-[280px]">
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-[#e5e5e5] bg-white px-4 lg:hidden">
          <Link href="/admin"><img src="/mtto-logo.svg" alt="MTTO CMS" className="h-8 w-auto" /></Link>
          <button type="button" className="rounded-[8px] p-2 text-[#737373] hover:bg-[#fafafa]" onClick={() => setOpen(true)} aria-label="Otvori meni"><Menu02 size={24} /></button>
        </header>
        <main className="min-h-screen w-full bg-white"><div className="mx-auto max-w-[1600px] px-4 pb-12 pt-8 md:px-8">{children}</div></main>
      </div>
    </div>
  );
}
