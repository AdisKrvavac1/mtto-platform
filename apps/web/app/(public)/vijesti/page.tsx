import Link from 'next/link';
import { apiSafe, type PostListItem } from '@/lib/api';
import { PageHero, PostCard, EmptyState, DeadlineBadge } from '@/components/site/ui';
import { POST_TYPE } from '@/lib/format';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Vijesti i javni pozivi' };

const CATEGORIES = ['Turizam', 'Zaštita okoliša', 'Trgovina', 'Opće'];

export default async function NewsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const qs = new URLSearchParams();
  for (const k of ['type', 'category', 'q', 'page']) if (sp[k]) qs.set(k, sp[k]!);
  qs.set('limit', '12');
  const data = await apiSafe<{ items: PostListItem[]; total: number; page: number; pages: number }>(`/posts?${qs}`, { items: [], total: 0, page: 1, pages: 1 });
  const isCalls = sp.type === 'JAVNI_POZIV';
  const link = (patch: Record<string, string | undefined>) => {
    const p = new URLSearchParams();
    const merged = { type: sp.type, category: sp.category, q: sp.q, ...patch };
    for (const [k, v] of Object.entries(merged)) if (v) p.set(k, v);
    const s = p.toString();
    return `/vijesti${s ? `?${s}` : ''}`;
  };
  const chip = (activeChip: boolean) => `px-3 py-1.5 rounded-lg font-button text-button whitespace-nowrap transition-colors ${activeChip ? 'bg-primary-container text-on-primary' : 'bg-surface-container-lowest text-on-surface-variant border border-slate-border hover:border-primary'}`;

  return (
    <>
      <PageHero
        kicker={isCalls ? 'Javni pozivi i grantovi' : 'Informativni bilten'}
        title={isCalls ? 'Javni pozivi Ministarstva' : 'Vijesti i saopćenja'}
        lead={isCalls ? 'Otvoreni i zatvoreni pozivi za sufinansiranje, s dokumentacijom i online prijavom.' : 'Aktuelnosti iz rada Ministarstva, objavljene direktno iz CMS-a.'}
        crumbs={[{ href: '/', label: 'Naslovna' }, { label: isCalls ? 'Javni pozivi' : 'Vijesti' }]}
      />
      <section className="max-w-7xl mx-auto px-margin-mobile md:px-margin py-space-xl space-y-space-lg">
        <div className="bg-surface-container-lowest rounded-xl shadow-md p-space-md flex flex-col lg:flex-row lg:items-center gap-space-md">
          <form action="/vijesti" className="flex items-center bg-surface-container-low rounded-lg px-space-md py-2 flex-1">
            {sp.type && <input type="hidden" name="type" value={sp.type} />}
            {sp.category && <input type="hidden" name="category" value={sp.category} />}
            <span className="material-symbols-outlined text-outline text-[20px] mr-2">search</span>
            <input name="q" defaultValue={sp.q} aria-label="Pretraga" placeholder="Pretraži naslove i sažetke..." className="bg-transparent w-full border-0 p-0 focus:ring-0 font-body-regular text-body-regular" />
          </form>
          <div className="flex items-center gap-space-xs overflow-x-auto">
            <Link href={link({ type: undefined, page: undefined })} className={chip(!sp.type)}>Sve</Link>
            {Object.entries(POST_TYPE).map(([k, v]) => <Link key={k} href={link({ type: k, page: undefined })} className={chip(sp.type === k)}>{v}</Link>)}
          </div>
        </div>
        <div className="flex items-center gap-space-xs overflow-x-auto">
          <span className="font-label-kicker text-label-kicker uppercase text-on-surface-variant mr-1">Resor:</span>
          <Link href={link({ category: undefined, page: undefined })} className={chip(!sp.category)}>Svi</Link>
          {CATEGORIES.map((c) => <Link key={c} href={link({ category: c, page: undefined })} className={chip(sp.category === c)}>{c}</Link>)}
          <span className="ml-auto font-body-sm text-body-sm text-on-surface-variant whitespace-nowrap">{data.total} rezultata</span>
        </div>

        {data.items.length === 0 ? (
          <EmptyState title="Nema rezultata" text="Promijenite filtere ili pojam pretrage." />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-lg">
            {data.items.map((p) => (
              <div key={p.id} className="relative">
                <PostCard p={p} />
                {p.type === 'JAVNI_POZIV' && <div className="absolute top-6 right-6 bg-surface-container-lowest rounded px-2 py-1 shadow"><DeadlineBadge deadline={p.deadline} /></div>}
              </div>
            ))}
          </div>
        )}

        {data.pages > 1 && (
          <div className="flex items-center justify-center gap-space-xs">
            {Array.from({ length: data.pages }, (_, i) => i + 1).map((n) => (
              <Link key={n} href={link({ page: String(n) })} className={`w-10 h-10 rounded-lg flex items-center justify-center font-button text-button ${n === data.page ? 'bg-primary text-on-primary' : 'bg-surface-container-lowest border border-slate-border text-primary'}`}>{n}</Link>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
