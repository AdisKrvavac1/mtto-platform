import Link from 'next/link';
import { apiSafe, type PostListItem } from '@/lib/api';
import { POST_TYPE, dateLong, daysUntil } from '@/lib/format';
import { Badge, Button, Container, PageHeader, PostCard, Section } from '@/components/uui';
import { ArrowLeft, ArrowRight, ArrowUpRight, Calendar, Mail01, SearchLg } from '@untitledui/icons';

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
  const showFeatured = firstPage && !sp.q && data.items.length > 0;
  const [featured, ...rest] = showFeatured ? data.items : [undefined, ...data.items];
  const link = (patch: Record<string, string | undefined>) => {
    const p = new URLSearchParams();
    for (const [k, v] of Object.entries({ type: sp.type, category: sp.category, q: sp.q, ...patch })) if (v) p.set(k, v);
    const s = p.toString();
    return `/vijesti${s ? `?${s}` : ''}`;
  };
  // Untitled UI "Horizontal tabs" – button-white-border varijanta
  const tab = (on: boolean) => `h-9 px-3 inline-flex items-center rounded-[6px] text-[14px] leading-5 font-semibold whitespace-nowrap transition-colors ${on ? 'bg-white text-[#404040] shadow-[0_1px_2px_rgba(10,13,18,0.05)] ring-1 ring-inset ring-[#d4d4d4]' : 'text-[#737373] hover:text-[#404040]'}`;
  const page = data.page || 1;
  const pages = Math.max(1, data.pages || 1);
  const nums = Array.from({ length: pages }, (_, i) => i + 1).filter((n) => n === 1 || n === pages || Math.abs(n - page) <= 1);

  return (
    <>
      <PageHeader
        eyebrow={isCalls ? 'Javni pozivi' : 'Vijesti'}
        title={isCalls ? 'Javni pozivi i natječaji' : 'Vijesti i obavijesti'}
        align="center"
        after={
          <form action="/vijesti" role="search" className="mx-auto flex w-full max-w-[480px] flex-col gap-3 sm:flex-row">
            {sp.type && <input type="hidden" name="type" value={sp.type} />}
            {sp.category && <input type="hidden" name="category" value={sp.category} />}
            <label className="flex h-11 flex-1 items-center gap-2 rounded-[8px] bg-white px-3.5 ring-1 ring-inset ring-[#d4d4d4] shadow-[0_1px_2px_rgba(10,13,18,0.05)] focus-within:ring-2 focus-within:ring-[var(--br-500)]">
              <SearchLg size={20} className="text-[#a3a3a3]" />
              <input name="q" defaultValue={sp.q} aria-label="Pretraga vijesti" placeholder="Pretraži vijesti" className="min-w-0 flex-1 border-0 bg-transparent p-0 text-[16px] leading-6 text-[#171717] placeholder:text-[#737373] shadow-none focus:outline-none focus:ring-0" />
            </label>
            <Button type="submit" size="lg">Pretraži</Button>
          </form>
        }
      >
        {isCalls ? 'Otvoreni i završeni pozivi za sufinansiranje, s tekstom poziva, obrascima i rokovima prijave.' : `Aktuelnosti iz rada Ministarstva trgovine, turizma i zaštite okoliša HNK. Ukupno ${data.total} objava.`}
      </PageHeader>

      <section className="bg-white pb-16 md:pb-24">
        <Container>
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <nav aria-label="Vrsta objave" className="flex gap-1 overflow-x-auto rounded-[10px] bg-[#fafafa] p-1 ring-1 ring-inset ring-[#e5e5e5] [scrollbar-width:none] self-start max-w-full">
              <Link href={link({ type: undefined, page: undefined })} className={tab(!sp.type)}>Sve objave</Link>
              {Object.entries(POST_TYPE).map(([k, v]) => <Link key={k} href={link({ type: k, page: undefined })} className={tab(sp.type === k)}>{v === 'Javni poziv' ? 'Javni pozivi' : v === 'Vijest' ? 'Vijesti' : 'Saopćenja'}</Link>)}
            </nav>
            <nav aria-label="Kategorija" className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <Link key={c} href={link({ category: sp.category === c ? undefined : c, page: undefined })} aria-pressed={sp.category === c}>
                  <Badge tone={sp.category === c ? 'brand' : 'gray'} size="md">{c}</Badge>
                </Link>
              ))}
            </nav>
          </div>
          {sp.q && <p className="mt-6 text-[16px] text-[#525252]">Rezultati za „<b className="text-[#171717]">{sp.q}</b>”: {data.total}. <Link href={link({ q: undefined, page: undefined })} className="font-semibold text-[var(--br-700)]">Poništi pretragu</Link></p>}

          {featured && (
            <article className="group mt-12 grid gap-8 lg:grid-cols-2 lg:items-center">
              <Link href={`/vijesti/${featured.slug}`} className="block overflow-hidden rounded-[16px] bg-[#f5f5f5] ring-1 ring-inset ring-black/5 aspect-[16/10]" aria-hidden tabIndex={-1}>
                {featured.coverImage ? <img src={featured.coverImage} alt="" className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.02]" /> : <span className="flex size-full items-center justify-center bg-gradient-to-br from-[var(--br-50)] to-[var(--br-100)]"><img src="/mtto-logo.svg" alt="" className="h-20 opacity-60" /></span>}
              </Link>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-[14px] leading-5 font-semibold text-[var(--br-700)]">{featured.category || POST_TYPE[featured.type]}</p>
                  {featured.type === 'JAVNI_POZIV' && <CallBadge p={featured} />}
                  {featured.isDemo && <Badge tone="warning">Demo</Badge>}
                </div>
                <Link href={`/vijesti/${featured.slug}`} className="mt-3 flex items-start justify-between gap-4">
                  <h2 className="text-[24px] leading-8 md:text-[30px] md:leading-[38px] font-semibold text-[#171717] group-hover:text-[var(--br-700)]">{featured.title}</h2>
                  <ArrowUpRight size={24} className="mt-1.5 shrink-0 text-[#a3a3a3] group-hover:text-[var(--br-700)]" />
                </Link>
                {featured.excerpt && <p className="mt-3 text-[18px] leading-7 text-[#525252] line-clamp-4">{featured.excerpt}</p>}
                <p className="mt-6 flex items-center gap-2 text-[14px] leading-5 text-[#525252]"><Calendar size={16} className="text-[#a3a3a3]" />{dateLong(featured.publishedAt)} · {featured.authorName}</p>
              </div>
            </article>
          )}

          <div className={`grid gap-x-8 gap-y-12 md:grid-cols-2 lg:grid-cols-3 ${featured ? 'mt-16 border-t border-[#e5e5e5] pt-12' : 'mt-12'}`}>
            {rest.filter(Boolean).map((p) => (
              <PostCard key={p!.id} href={`/vijesti/${p!.slug}`} image={p!.coverImage} category={p!.category || POST_TYPE[p!.type]} title={p!.title} excerpt={p!.excerpt}
                badge={<>{p!.type === 'JAVNI_POZIV' && <CallBadge p={p!} />}{p!.isDemo && <Badge tone="warning">Demo</Badge>}</>}
                meta={<span className="flex items-center gap-2"><Calendar size={16} className="text-[#a3a3a3]" />{dateLong(p!.publishedAt)}</span>} />
            ))}
          </div>
          {data.items.length === 0 && <p className="mt-12 text-center text-[16px] text-[#525252]">Nema objava za odabrane filtere.</p>}

          {pages > 1 && (
            <nav aria-label="Stranice" className="mt-16 flex items-center justify-between border-t border-[#e5e5e5] pt-5">
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

function CallBadge({ p }: { p: PostListItem }) {
  if (!p.deadline) return <Badge tone="success" dot>Otvoren</Badge>;
  const d = daysUntil(p.deadline) ?? -1;
  return d < 0 ? <Badge tone="gray" dot>Zatvoren</Badge> : <Badge tone={d <= 7 ? 'warning' : 'success'} dot>{d === 0 ? 'Rok danas' : `Još ${d} dana`}</Badge>;
}
