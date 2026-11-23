import Link from 'next/link';
import { apiSafe, type PostListItem } from '@/lib/api';
import { POST_TYPE, dateLong, daysUntil } from '@/lib/format';
import { Badge, Button, CategoryBadge, Container, HeroInfo, MetaGroup, PageHero, Section } from '@/components/uui';
import { ArrowLeft, ArrowRight, ArrowUpRight, Mail01, SearchLg } from '@untitledui/icons';

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

  return (
    <>
      <PageHero
        crumbs={[{ label: 'Naslovna', href: '/' }, { label: isCalls ? 'Javni pozivi' : 'Vijesti' }]}
        eyebrow={isCalls ? 'Javni pozivi i natječaji' : 'Press centar Ministarstva'}
        title={isCalls ? 'Javni pozivi i natječaji' : 'Vijesti, saopćenja i javni pozivi'}
        actions={
          <div className="w-full max-w-[560px]">
            <form action="/vijesti" className="flex flex-col gap-3 sm:flex-row">
              <label className="flex h-11 flex-1 items-center gap-2 rounded-[8px] bg-white px-3.5 shadow-[0_1px_2px_rgba(10,13,18,0.05)] focus-within:ring-2 focus-within:ring-[var(--br-300)]">
                <Mail01 size={20} className="text-[#a3a3a3]" />
                <input type="email" name="bilten" required aria-label="E-mail za e-bilten" placeholder="Vaša e-mail adresa" className="min-w-0 flex-1 border-0 bg-transparent p-0 text-[16px] leading-6 text-[#171717] placeholder:text-[#737373] shadow-none focus:outline-none focus:ring-0" />
              </label>
              <button type="submit" className="inline-flex h-11 items-center justify-center rounded-[8px] bg-[var(--br-600)] px-[18px] text-[16px] font-semibold text-white shadow-[0_1px_2px_rgba(10,13,18,0.05),inset_0_-2px_0_rgba(10,13,18,0.05),inset_0_0_0_1px_rgba(10,13,18,0.18)] ring-2 ring-inset ring-white/10 hover:bg-[var(--br-700)]">Pretplati se</button>
            </form>
            <p className="mt-2 text-[14px] text-[var(--br-200)]">E-bilten s novim pozivima i rokovima · pretplata se aktivira u Fazi 2.</p>
          </div>
        }
        aside={
          <HeroInfo icon={Mail01} label="Služba za odnose s javnošću" value="036 552 922">Izjave, akreditacije i dodatne informacije za medije: info@mtto.gov.ba</HeroInfo>
        }
      >
        {isCalls ? 'Otvoreni i završeni pozivi za sufinansiranje, s tekstom poziva, obrascima i rokovima prijave.' : `Aktuelnosti iz rada Ministarstva trgovine, turizma i zaštite okoliša HNK. Ukupno ${data.total} objava.`}
      </PageHero>

      {sp.bilten && (
        <div className="border-b border-[var(--br-200)] bg-[var(--br-25)]">
          <Container className="py-3 text-[14px] text-[var(--br-800)]"><b>E-bilten je u pripremi (Faza 2).</b> Vaša adresa nije sačuvana; pretplatu ćete moći potvrditi kad se servis pokrene.</Container>
        </div>
      )}

      <section className="bg-white py-12 md:py-16">
        <Container className="grid gap-10 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-16">
          <aside className="lg:sticky lg:top-40 lg:self-start">
            <form action="/vijesti" role="search">
              {sp.type && <input type="hidden" name="type" value={sp.type} />}
              {sp.category && <input type="hidden" name="category" value={sp.category} />}
              <label className="flex h-11 items-center gap-2 rounded-[8px] bg-white px-3.5 ring-1 ring-inset ring-[#d5d7da] shadow-[0_1px_2px_rgba(10,13,18,0.05)] focus-within:ring-2 focus-within:ring-[var(--br-300)]">
                <SearchLg size={20} className="text-[#a3a3a3]" />
                <input name="q" defaultValue={sp.q} aria-label="Pretraga objava" placeholder="Pretraga" className="min-w-0 flex-1 border-0 bg-transparent p-0 text-[16px] leading-6 text-[#171717] placeholder:text-[#737373] shadow-none focus:outline-none focus:ring-0" />
              </label>
            </form>
            <p className="mt-8 text-[14px] font-semibold text-[var(--br-700)]">Vrsta objave</p>
            <nav aria-label="Vrsta objave" className="mt-3 flex gap-1 overflow-x-auto [scrollbar-width:none] lg:flex-col lg:gap-0">
              {([['Sve objave', undefined], ['Vijesti', 'VIJEST'], ['Javni pozivi', 'JAVNI_POZIV'], ['Saopćenja', 'SAOPCENJE']] as const).map(([l, k]) => (
                <Link key={l} href={link({ type: k, page: undefined })} aria-current={sp.type === k || (!sp.type && !k) ? 'page' : undefined} className={side(sp.type === k || (!sp.type && !k))}>{l}</Link>
              ))}
            </nav>
            <p className="mt-8 text-[14px] font-semibold text-[var(--br-700)]">Rubrike</p>
            <nav aria-label="Rubrike" className="mt-3 flex gap-1 overflow-x-auto [scrollbar-width:none] lg:flex-col lg:gap-0">
              <Link href={link({ category: undefined, page: undefined })} aria-current={!sp.category ? 'page' : undefined} className={side(!sp.category)}>Sve rubrike</Link>
              {CATEGORIES.map((c) => <Link key={c} href={link({ category: c, page: undefined })} aria-current={sp.category === c ? 'page' : undefined} className={side(sp.category === c)}>{c}</Link>)}
            </nav>
          </aside>

          <div className="min-w-0">
            {sp.q && <p className="mb-8 text-[16px] text-[#525252]">Rezultati za „<b className="text-[#171717]">{sp.q}</b>”: {data.total}. <Link href={link({ q: undefined, page: undefined })} className="font-semibold text-[var(--br-700)]">Poništi pretragu</Link></p>}

            {featured && (
              <article className="group">
                <Link href={`/vijesti/${featured.slug}`} className="block overflow-hidden rounded-[16px] bg-[#f5f5f5] aspect-[16/9]" aria-hidden tabIndex={-1}>
                  {featured.coverImage ? <img src={featured.coverImage} alt="" className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.02]" /> : <Cover />}
                </Link>
                <div className="mt-6 flex flex-wrap items-center gap-2">
                  <MetaGroup label={featured.category || POST_TYPE[featured.type]}>{POST_TYPE[featured.type]}{featured.attachmentCount ? ` · ${featured.attachmentCount} ${featured.attachmentCount === 1 ? 'prilog' : 'priloga'}` : ''}</MetaGroup>
                  {featured.type === 'JAVNI_POZIV' && <CallBadge p={featured} />}
                  {featured.isDemo && <Badge tone="warning">Demo</Badge>}
                </div>
                <Link href={`/vijesti/${featured.slug}`} className="mt-4 flex items-start justify-between gap-4">
                  <h2 className="text-[24px] leading-8 md:text-[30px] md:leading-[38px] font-semibold text-[#181d27] group-hover:text-[var(--br-700)]">{featured.title}</h2>
                  <ArrowUpRight size={24} className="mt-1.5 shrink-0 text-[#a4a7ae] group-hover:text-[var(--br-700)]" />
                </Link>
                {featured.excerpt && <p className="mt-3 max-w-[760px] text-[18px] leading-7 text-[#535862] line-clamp-3">{featured.excerpt}</p>}
                <Author name={featured.authorName} date={featured.publishedAt} />
              </article>
            )}

            <div className={`grid gap-x-8 gap-y-12 md:grid-cols-2 ${featured ? 'mt-16 border-t border-[#e9eaeb] pt-12' : ''}`}>
              {rest.filter((p) => p && !/^test/i.test(p.title)).map((p) => (
                <article key={p!.id} className="group flex flex-col">
                  <Link href={`/vijesti/${p!.slug}`} className="block overflow-hidden rounded-[16px] bg-[#f5f5f5] aspect-[16/10]" tabIndex={-1} aria-hidden>
                    {p!.coverImage ? <img src={p!.coverImage} alt="" loading="lazy" className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" /> : <Cover />}
                  </Link>
                  <p className="mt-5 text-[14px] leading-5 font-semibold text-[var(--br-700)]">{p!.authorName} · {dateLong(p!.publishedAt)}</p>
                  <Link href={`/vijesti/${p!.slug}`} className="mt-2 flex items-start justify-between gap-4">
                    <h3 className="text-[18px] leading-7 font-semibold text-[#181d27] group-hover:text-[var(--br-700)] line-clamp-3">{p!.title}</h3>
                    <ArrowUpRight size={24} className="mt-0.5 shrink-0 text-[#a4a7ae] group-hover:text-[var(--br-700)]" />
                  </Link>
                  {p!.excerpt && <p className="mt-2 text-[16px] leading-6 text-[#535862] line-clamp-2">{p!.excerpt}</p>}
                  <div className="mt-5 flex flex-wrap gap-2">
                    {p!.category && <CategoryBadge name={p!.category} />}
                    <CategoryBadge name={POST_TYPE[p!.type]} />
                    {p!.type === 'JAVNI_POZIV' && <CallBadge p={p!} />}
                    {p!.isDemo && <Badge tone="warning">Demo</Badge>}
                  </div>
                </article>
              ))}
            </div>
            {items.length === 0 && <p className="mt-4 text-[16px] text-[#525252]">Nema objava za odabrane filtere.</p>}

            {pages > 1 && (
              <nav aria-label="Stranice" className="mt-16 flex items-center justify-between border-t border-[#e9eaeb] pt-5">
                <Button href={page > 1 ? link({ page: String(page - 1) }) : undefined} variant="secondary" icon={ArrowLeft} disabled={page <= 1}>Prethodna</Button>
                <ul className="hidden md:flex items-center gap-0.5">
                  {nums.map((n, i) => (
                    <li key={n} className="flex items-center">
                      {i > 0 && n - nums[i - 1] > 1 && <span className="px-3 text-[#737373]">…</span>}
                      <Link href={link({ page: String(n) })} aria-current={n === page ? 'page' : undefined} className={`flex size-10 items-center justify-center rounded-[8px] text-[14px] font-medium ${n === page ? 'bg-[#fafafa] text-[#262626]' : 'text-[#737373] hover:bg-[#fafafa]'}`}>{n}</Link>
                    </li>
                  ))}
                </ul>
                <span className="md:hidden text-[14px] text-[#404040]">Stranica {page} od {pages}</span>
                <Button href={page < pages ? link({ page: String(page + 1) }) : undefined} variant="secondary" iconRight={ArrowRight} disabled={page >= pages}>Sljedeća</Button>
              </nav>
            )}
          </div>
        </Container>
      </section>

      <Section tone="gray">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-[768px]">
            <h2 className="text-[24px] leading-8 md:text-[30px] md:leading-[38px] font-semibold text-[#171717]">Novinari i mediji</h2>
            <p className="mt-3 text-[18px] leading-7 text-[#525252]">Za izjave, akreditacije i dodatne informacije obratite se službi za odnose s javnošću.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button href="tel:+38736552922" variant="secondary" size="lg">036 552 922</Button>
            <Button href="mailto:info@mtto.gov.ba" size="lg" icon={Mail01}>info@mtto.gov.ba</Button>
          </div>
        </div>
      </Section>
    </>
  );
}

function Cover() {
  return <span className="flex size-full items-center justify-center bg-gradient-to-br from-[var(--br-50)] to-[var(--br-100)]"><img src="/mtto-logo.svg" alt="" className="h-16 opacity-60" /></span>;
}

function Author({ name, date }: { name: string; date: string }) {
  return (
    <div className="mt-6 flex items-center gap-3">
      <span className="flex size-10 items-center justify-center overflow-hidden rounded-full bg-white ring-1 ring-inset ring-black/10"><img src="/mtto-grb.svg" alt="" className="h-6" /></span>
      <span><b className="block text-[14px] leading-5 font-semibold text-[#181d27]">{name || 'MTTO HNK'}</b><span className="text-[14px] leading-5 text-[#535862]">{dateLong(date)}</span></span>
    </div>
  );
}

function CallBadge({ p }: { p: PostListItem }) {
  if (!p.deadline) return <Badge tone="success" dot>Otvoren</Badge>;
  const d = daysUntil(p.deadline) ?? -1;
  return d < 0 ? <Badge tone="gray" dot>Zatvoren</Badge> : <Badge tone={d <= 7 ? 'warning' : 'success'} dot>{d === 0 ? 'Rok danas' : `Još ${d} dana`}</Badge>;
}
