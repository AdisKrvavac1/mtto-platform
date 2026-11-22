import Link from 'next/link';
import { apiSafe, type PostListItem } from '@/lib/api';
import { POST_TYPE } from '@/lib/format';
import { FigHero } from '@/components/figma/FigHero';
import { LeadNewsCard, NewsCard, CallCard } from '@/components/figma/cards';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Vijesti i javni pozivi' };

const CATEGORIES = ['Turizam', 'Zaštita okoliša', 'Trgovina', 'Opće'];
type List = { items: PostListItem[]; total: number; page: number; pages: number };

export default async function NewsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const qs = new URLSearchParams();
  for (const k of ['type', 'category', 'q', 'page']) if (sp[k]) qs.set(k, sp[k]!);
  qs.set('limit', '13');
  const [data, calls, all] = await Promise.all([
    apiSafe<List>(`/posts?${qs}`, { items: [], total: 0, page: 1, pages: 1 }),
    apiSafe<List>('/posts?type=JAVNI_POZIV&limit=4', { items: [], total: 0, page: 1, pages: 1 }),
    apiSafe<List>('/posts?limit=1', { items: [], total: 0, page: 1, pages: 1 }),
  ]);
  const isCalls = sp.type === 'JAVNI_POZIV';
  const filtered = !!(sp.type || sp.category || sp.q);
  const firstPage = !sp.page || sp.page === '1';
  const [lead, ...rest] = data.items;
  const openCalls = calls.items.filter((c) => !c.deadline || new Date(c.deadline) > new Date());
  const link = (patch: Record<string, string | undefined>) => {
    const p = new URLSearchParams();
    const merged = { type: sp.type, category: sp.category, q: sp.q, ...patch };
    for (const [k, v] of Object.entries(merged)) if (v) p.set(k, v);
    const s = p.toString();
    return `/vijesti${s ? `?${s}` : ''}`;
  };
  const chip = (on: boolean) => `px-[12px] py-[6px] rounded-[8px] font-robflex font-semibold text-[14px] tracking-[0.14px] leading-[20px] whitespace-nowrap transition-colors ${on ? 'bg-[#002042] text-white' : 'bg-[#eff4ff] text-[#43474f] hover:bg-[#dce9ff] hover:text-[#002042]'}`;

  return (
    <>
      <FigHero
        icon={isCalls ? 'campaign' : 'newspaper'}
        kicker={isCalls ? 'Javni pozivi i natječaji' : 'Informativni bilten MTTO'}
        title={isCalls ? 'Javni pozivi i natječaji' : 'Vijesti i obavijesti Ministarstva'}
        lead={isCalls ? 'Otvoreni i završeni pozivi za sufinansiranje, s tekstom poziva, obrascima i rokovima.' : 'Aktuelnosti iz rada Ministarstva trgovine, turizma i zaštite okoliša Hercegovačko-neretvanskog kantona.'}
        badge={{ label: 'Ukupno objava', value: `${all.total}`, icon: 'article' }}
      >
        <form action="/vijesti" role="search" className="bg-white rounded-[8px] p-[12px] md:p-[16px] flex flex-col md:flex-row gap-[12px] w-full shadow-[0px_20px_25px_-5px_rgba(0,0,0,0.1)]">
          {sp.type && <input type="hidden" name="type" value={sp.type} />}
          {sp.category && <input type="hidden" name="category" value={sp.category} />}
          <label className="flex-1 flex items-center gap-2 bg-[#eff4ff] rounded-[4px] px-[12px] h-[44px] focus-within:ring-2 focus-within:ring-[#00abeb]">
            <span aria-hidden className="material-symbols-outlined text-[20px] text-[#737780]">search</span>
            <input name="q" defaultValue={sp.q} aria-label="Pretraga vijesti" placeholder="Pretraži naslove i sažetke..." className="bg-transparent border-0 p-0 shadow-none focus:ring-0 flex-1 min-w-0 font-rob text-[14px] text-[#191c1f] placeholder:text-[#737780] focus:outline-none" />
          </label>
          <button className="bg-[#002042] hover:bg-[#062343] text-white rounded-[4px] h-[44px] px-[20px] font-pub font-semibold text-[14px] flex items-center justify-center gap-2"><span aria-hidden className="material-symbols-outlined text-[18px]">tune</span>Pretraži</button>
        </form>
      </FigHero>

      <div className="px-4 md:px-[32px] py-[32px] md:py-[48px] flex flex-col gap-[24px]">
        <div className="flex flex-col gap-[12px]">
          <div className="flex items-center gap-[8px] overflow-x-auto pb-1 [scrollbar-width:none]">
            <Link href={link({ type: undefined, page: undefined })} className={chip(!sp.type)}>Sve objave</Link>
            {Object.entries(POST_TYPE).map(([k, v]) => <Link key={k} href={link({ type: k, page: undefined })} className={chip(sp.type === k)}>{v}</Link>)}
          </div>
          <div className="flex items-center gap-[8px] overflow-x-auto pb-1 [scrollbar-width:none]">
            <span className="font-space font-bold text-[12px] tracking-[0.96px] uppercase text-[#737780] mr-1">Resor</span>
            <Link href={link({ category: undefined, page: undefined })} className={chip(!sp.category)}>Svi</Link>
            {CATEGORIES.map((c) => <Link key={c} href={link({ category: c, page: undefined })} className={chip(sp.category === c)}>{c}</Link>)}
            <span className="ml-auto font-pub text-[13px] text-[#43474f] whitespace-nowrap pl-4">{data.total} {data.total === 1 ? 'rezultat' : 'rezultata'}{sp.q ? ` za „${sp.q}”` : ''}</span>
          </div>
        </div>

        {data.items.length === 0 ? (
          <div className="bg-white rounded-[8px] p-[40px] text-center flex flex-col items-center gap-2">
            <span aria-hidden className="material-symbols-outlined text-[40px] text-[#737780]">search_off</span>
            <p className="font-rob font-bold text-[#002042] text-[18px]">Nema objava za odabrane filtere</p>
            <p className="font-rob text-[#43474f] text-[14px]">Promijenite pojam pretrage ili <Link href="/vijesti" className="text-[#006c4a] font-semibold underline">prikažite sve objave</Link>.</p>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-[24px] items-start">
            <div className="flex flex-col gap-[24px] w-full lg:flex-[940_1_0%] min-w-0">
              {firstPage && !filtered && lead ? <LeadNewsCard p={lead} /> : null}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-[24px]">
                {(firstPage && !filtered ? rest : data.items).map((p) => <NewsCard key={p.id} p={p} />)}
              </div>
              {data.pages > 1 && (
                <nav aria-label="Stranice" className="flex items-center justify-center gap-[8px] flex-wrap pt-2">
                  {data.page > 1 && <Link href={link({ page: String(data.page - 1) })} className="h-10 px-3 rounded-[8px] bg-white text-[#002042] flex items-center gap-1 font-pub font-semibold text-[14px] shadow-sm"><span aria-hidden className="material-symbols-outlined text-[18px]">chevron_left</span>Prethodna</Link>}
                  {Array.from({ length: data.pages }, (_, i) => i + 1).filter((n) => Math.abs(n - data.page) <= 2 || n === 1 || n === data.pages).map((n) => (
                    <Link key={n} href={link({ page: String(n) })} aria-current={n === data.page ? 'page' : undefined} className={`size-10 rounded-[8px] flex items-center justify-center font-pub font-semibold text-[14px] ${n === data.page ? 'bg-[#002042] text-white' : 'bg-white text-[#002042] shadow-sm hover:bg-[#eff4ff]'}`}>{n}</Link>
                  ))}
                  {data.page < data.pages && <Link href={link({ page: String(data.page + 1) })} className="h-10 px-3 rounded-[8px] bg-white text-[#002042] flex items-center gap-1 font-pub font-semibold text-[14px] shadow-sm">Sljedeća<span aria-hidden className="material-symbols-outlined text-[18px]">chevron_right</span></Link>}
                </nav>
              )}
            </div>
            <aside className="flex flex-col gap-[24px] w-full lg:flex-[412_1_0%] min-w-0 lg:sticky lg:top-6">
              <div className="bg-white rounded-[8px] p-[24px] flex flex-col gap-[16px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]">
                <div className="flex items-center justify-between">
                  <h2 className="flex items-center gap-[8px] font-rob font-bold text-[#002042] text-[18px] leading-[26px]"><span aria-hidden className="size-[8px] rounded-full bg-[#006c4a]" />Natječaji i javni uvidi</h2>
                  <span className="bg-[#006c4a] text-white px-[8px] py-[2px] rounded-[2px] font-robflex font-bold text-[11px] tracking-[0.44px] uppercase">{openCalls.length} aktivno</span>
                </div>
                {calls.items.length ? calls.items.slice(0, 3).map((c) => <CallCard key={c.id} p={c} />) : <p className="font-rob text-[13px] text-[#43474f]">Trenutno nema objavljenih poziva.</p>}
                <Link href="/vijesti?type=JAVNI_POZIV" className="bg-[#dce9ff] hover:bg-[#c7dbff] rounded-[4px] py-[10px] text-center font-rob font-bold text-[#002042] text-[14px]">Arhiva svih poziva</Link>
              </div>
              <div className="bg-[#002042] rounded-[8px] p-[24px] flex flex-col gap-[8px] text-white">
                <h2 className="flex items-center gap-[8px] font-rob font-bold text-[18px]"><span aria-hidden className="material-symbols-outlined text-[22px] text-[#85f8c4]">support_agent</span>Služba za odnose s javnošću</h2>
                <p className="font-rob text-[#dce9ff] text-[13px] leading-[20px]">Upiti medija i građana o objavama Ministarstva.</p>
                <a href="tel:+38736552922" className="font-pub font-extrabold text-[14px] hover:underline">Telefon: +387 36 552 922</a>
                <a href="mailto:info@mtto.gov.ba" className="font-pub font-semibold text-[14px] text-[#85f8c4] hover:underline">info@mtto.gov.ba</a>
              </div>
            </aside>
          </div>
        )}
      </div>
    </>
  );
}
