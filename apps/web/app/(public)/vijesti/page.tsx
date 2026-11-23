import Link from 'next/link';
import { apiSafe, type PostListItem } from '@/lib/api';
import { POST_TYPE, daysUntil } from '@/lib/format';
import { Badge, Button, CATEGORY_TONE, Container, FeaturedOverlay, NewsCard, Tag } from '@/components/uui';
import { ArrowLeft, ArrowRight, SearchLg } from '@untitledui/icons';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Vijesti i javni pozivi' };

const CATEGORIES = ['Turizam', 'Zaštita okoliša', 'Trgovina', 'Opće'];
type List = { items: PostListItem[]; total: number; page: number; pages: number };

export default async function NewsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const qs = new URLSearchParams();
  for (const k of ['type', 'category', 'q', 'page']) if (sp[k]) qs.set(k, sp[k]!);
  qs.set('limit', '10');
  const data = await apiSafe<List>(`/posts?${qs}`, { items: [], total: 0, page: 1, pages: 1 });
  const isCalls = sp.type === 'JAVNI_POZIV';
  const firstPage = !sp.page || sp.page === '1';
  const items = data.items.filter((p) => !/^test/i.test(p.title));
  const showFeatured = firstPage && !sp.q && items.length > 0;
  const [featured, ...rest] = showFeatured ? items : [undefined, ...items];
  const link = (patch: Record<string, string | undefined>) => {
    const p = new URLSearchParams();
    for (const [k, v] of Object.entries({ type: sp.type, category: sp.category, q: sp.q, ...patch })) if (v) p.set(k, v);
    const s = p.toString();
    return `/vijesti${s ? `?${s}` : ''}`;
  };
  // Untitled "Blog categories": aktivna stavka ima lijevu liniju u boji brenda
  const side = (on: boolean) => `shrink-0 whitespace-nowrap border-l-2 px-4 py-2.5 text-[16px] leading-6 font-semibold transition-colors ${on ? 'border-[var(--br-600)] text-[var(--br-700)]' : 'border-transparent text-[#717680] hover:text-[#414651]'}`;
  const page = data.page || 1;
  const pages = Math.max(1, data.pages || 1);
  const nums = Array.from({ length: pages }, (_, i) => i + 1).filter((n) => n === 1 || n === pages || Math.abs(n - page) <= 1);

  const tabCls = (on: boolean) => `shrink-0 whitespace-nowrap border-b-2 px-1 pb-3 text-[14px] leading-5 font-semibold transition-colors ${on ? 'border-[var(--br-600)] text-[var(--br-700)]' : 'border-transparent text-[#717680] hover:text-[#414651]'}`;
  const typeLabel = (t: string) => POST_TYPE[t] ?? 'Vijest';
  const badgesFor = (p: PostListItem) => <>{p.type === 'JAVNI_POZIV' && <CallBadge p={p} />}{p.isDemo && <Badge tone="warning">Demo</Badge>}</>;

  return (
    <>
      <section className="bg-white pt-10 md:pt-14">
        <Container>
          <nav aria-label="Putanja" className="flex items-center gap-2 text-[14px] font-medium text-[#535862]"><Link href="/" className="hover:text-[#181d27]">Naslovna</Link><span className="text-[#d5d7da]">/</span><span className="font-semibold text-[var(--br-700)]">{isCalls ? 'Javni pozivi' : 'Vijesti'}</span></nav>
          <p className="mt-8 text-[16px] font-semibold text-[var(--br-700)]">Press centar Ministarstva</p>
          <h1 className="mt-3 text-[36px] leading-[44px] md:text-[48px] md:leading-[60px] font-semibold tracking-[-0.02em] text-[#181d27]">{isCalls ? 'Javni pozivi i natječaji' : 'Vijesti, saopćenja i javni pozivi'}</h1>
          <p className="mt-4 max-w-[768px] text-[18px] leading-7 md:text-[20px] md:leading-[30px] text-[#535862]">{isCalls ? 'Otvoreni i završeni pozivi za sufinansiranje, s tekstom poziva, obrascima i rokovima prijave.' : 'Aktuelnosti iz rada Ministarstva trgovine, turizma i zaštite okoliša Hercegovačko-neretvanskog kantona.'}</p>
          {sp.bilten && <p className="mt-6 rounded-[12px] bg-[var(--br-25)] px-4 py-3 text-[14px] text-[var(--br-800)] ring-1 ring-inset ring-[var(--br-200)]"><b>E-bilten je u pripremi (Faza 2).</b> Vaša adresa nije sačuvana; pretplatu ćete moći potvrditi kad se servis pokrene.</p>}
          {featured && (
            <div className="mt-12 md:mt-16">
              <FeaturedOverlay p={featured} tags={[featured.category, typeLabel(featured.type)].filter(Boolean) as string[]} badges={badgesFor(featured)} />
            </div>
          )}
        </Container>
      </section>

      <section className="bg-white pb-16 pt-12 md:pb-24 md:pt-16">
        <Container>
          <div className="flex flex-col gap-5 border-b border-[#e9eaeb] md:flex-row md:items-end md:justify-between md:gap-8">
            <nav aria-label="Vrsta objave" className="-mb-px flex gap-4 overflow-x-auto [scrollbar-width:none]">
              {([['Sve objave', undefined], ['Vijesti', 'VIJEST'], ['Javni pozivi', 'JAVNI_POZIV'], ['Saopćenja', 'SAOPCENJE']] as const).map(([l, k]) => (
                <Link key={l} href={link({ type: k, page: undefined })} aria-current={sp.type === k || (!sp.type && !k) ? 'page' : undefined} className={tabCls(sp.type === k || (!sp.type && !k))}>{l}</Link>
              ))}
            </nav>
            <form action="/vijesti" role="search" className="mb-3 w-full md:w-[320px]">
              {sp.type && <input type="hidden" name="type" value={sp.type} />}
              {sp.category && <input type="hidden" name="category" value={sp.category} />}
              <label className="flex h-10 items-center gap-2 rounded-[8px] bg-white px-3 ring-1 ring-inset ring-[#d5d7da] shadow-[0_1px_2px_rgba(10,13,18,0.05)] focus-within:ring-2 focus-within:ring-[var(--br-300)]">
                <SearchLg size={18} className="text-[#a4a7ae]" />
                <input name="q" defaultValue={sp.q} aria-label="Pretraga objava" placeholder="Pretraga objava" className="min-w-0 flex-1 border-0 bg-transparent p-0 text-[16px] leading-6 text-[#181d27] placeholder:text-[#717680] shadow-none focus:outline-none focus:ring-0" />
              </label>
            </form>
          </div>
          <nav aria-label="Rubrike" className="mt-5 flex flex-wrap gap-2">
            <Tag href={link({ category: undefined, page: undefined })} dot={!sp.category ? 'var(--br-600)' : undefined}>Sve rubrike</Tag>
            {CATEGORIES.map((c) => <Tag key={c} href={link({ category: sp.category === c ? undefined : c, page: undefined })} dot={sp.category === c ? CATEGORY_TONE[c]?.dot ?? '#a4a7ae' : undefined}>{c}</Tag>)}
          </nav>
          {sp.q && <p className="mt-6 text-[16px] text-[#535862]">Rezultati za „<b className="text-[#181d27]">{sp.q}</b>”: {data.total}. <Link href={link({ q: undefined, page: undefined })} className="font-semibold text-[var(--br-700)]">Poništi pretragu</Link></p>}

          <div className="mt-10 grid gap-x-8 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
            {rest.filter((p) => p && !/^test/i.test(p.title)).map((p) => <NewsCard key={p!.id} p={p!} label={p!.category || typeLabel(p!.type)} badges={badgesFor(p!)} />)}
          </div>
          {items.length === 0 && <p className="mt-10 text-[16px] text-[#535862]">Nema objava za odabrane filtere.</p>}

          {pages > 1 && (
            <nav aria-label="Stranice" className="mt-16 flex items-center justify-between border-t border-[#e9eaeb] pt-5">
              <Button href={page > 1 ? link({ page: String(page - 1) }) : undefined} variant="secondary" icon={ArrowLeft} disabled={page <= 1}>Prethodna</Button>
              <ul className="hidden md:flex items-center gap-0.5">
                {nums.map((n, i) => (
                  <li key={n} className="flex items-center">
                    {i > 0 && n - nums[i - 1] > 1 && <span className="px-3 text-[#717680]">…</span>}
                    <Link href={link({ page: String(n) })} aria-current={n === page ? 'page' : undefined} className={`flex size-10 items-center justify-center rounded-[8px] text-[14px] font-medium ${n === page ? 'bg-[#fafafa] text-[#252b37]' : 'text-[#717680] hover:bg-[#fafafa]'}`}>{n}</Link>
                  </li>
                ))}
              </ul>
              <span className="md:hidden text-[14px] text-[#414651]">Stranica {page} od {pages}</span>
              <Button href={page < pages ? link({ page: String(page + 1) }) : undefined} variant="secondary" iconRight={ArrowRight} disabled={page >= pages}>Sljedeća</Button>
            </nav>
          )}
        </Container>
      </section>

      {/* NEWSLETTER (Untitled "Join our newsletter") */}
      <section className="border-t border-[#e9eaeb] bg-white py-16 md:py-20">
        <Container className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-[640px]">
            <h2 className="text-[20px] leading-[30px] md:text-[24px] md:leading-8 font-semibold text-[#181d27]">E-bilten Ministarstva</h2>
            <p className="mt-2 text-[16px] leading-6 md:text-[18px] md:leading-7 text-[#535862]">Novi javni pozivi, rokovi i javni uvidi na vaš e-mail. Za izjave i akreditacije: 036 552 922, info@mtto.gov.ba.</p>
          </div>
          <div className="w-full lg:w-[480px]">
            <form action="/vijesti" className="flex flex-col gap-3 sm:flex-row">
              <input type="email" name="bilten" required aria-label="E-mail za e-bilten" placeholder="Vaša e-mail adresa" className="h-11 min-w-0 flex-1 rounded-[8px] border-0 bg-white px-3.5 text-[16px] text-[#181d27] ring-1 ring-inset ring-[#d5d7da] shadow-[0_1px_2px_rgba(10,13,18,0.05)] placeholder:text-[#717680] focus:ring-2 focus:ring-[var(--br-300)]" />
              <button type="submit" className="inline-flex h-11 items-center justify-center rounded-[8px] bg-[var(--br-600)] px-[18px] text-[16px] font-semibold text-white shadow-[0_1px_2px_rgba(10,13,18,0.05),inset_0_-2px_0_rgba(10,13,18,0.05),inset_0_0_0_1px_rgba(10,13,18,0.18)] ring-2 ring-inset ring-white/10 hover:bg-[var(--br-700)]">Pretplati se</button>
            </form>
            <p className="mt-2 text-[14px] text-[#535862]">Pretplata se aktivira u Fazi 2. Podatke obrađujemo u skladu sa Zakonom o zaštiti ličnih podataka.</p>
          </div>
        </Container>
      </section>
    </>
  );
}

function CallBadge({ p }: { p: PostListItem }) {
  if (!p.deadline) return <Badge tone="success" dot>Otvoren</Badge>;
  const d = daysUntil(p.deadline) ?? -1;
  return d < 0 ? <Badge tone="gray" dot>Zatvoren</Badge> : <Badge tone={d <= 7 ? 'warning' : 'success'} dot>{d === 0 ? 'Rok danas' : `Još ${d} dana`}</Badge>;
}
