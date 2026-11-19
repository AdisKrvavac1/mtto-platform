import Link from 'next/link';
import { notFound } from 'next/navigation';
import { api, apiSafe, type Doc, type PostListItem } from '@/lib/api';
import { renderMarkdown } from '@/lib/markdown';
import { dateLong, dateTime, daysUntil, POST_TYPE } from '@/lib/format';
import { DocRow, DemoBadge } from '@/components/site/ui';
import ShareBar from '@/components/site/ShareBar';

export const dynamic = 'force-dynamic';

type Post = PostListItem & { body: string; formUrl: string | null; updatedAt: string; documents: Doc[] };

async function load(slug: string): Promise<Post | null> {
  try {
    return await api<Post>(`/posts/${encodeURIComponent(slug)}`);
  } catch (e: any) {
    if (e.status === 404) return null;
    throw e;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = await apiSafe<Post | null>(`/posts/${encodeURIComponent(slug)}`, null);
  return p ? { title: p.title, description: p.excerpt } : { title: 'Objava nije pronađena' };
}

const SECTOR: Record<string, { name: string; phone: string; mail: string }> = {
  Turizam: { name: 'Sektor za turizam i ugostiteljstvo', phone: '036 552 498', mail: 'turizam@mtto.gov.ba' },
  'Zaštita okoliša': { name: 'Sektor za zaštitu prirode i okoliša', phone: '036 551 324', mail: 'okolis@mtto.gov.ba' },
  Trgovina: { name: 'Sektor za trgovinu', phone: '036 551 823', mail: 'trgovina@mtto.gov.ba' },
};

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await load(slug);
  if (!post) notFound();
  const html = renderMarkdown(post.body);
  const words = post.body.split(/\s+/).length;
  const isCall = post.type === 'JAVNI_POZIV';
  const left = daysUntil(post.deadline);
  const open = isCall && (left === null || left >= 0);
  const sector = SECTOR[post.category] ?? { name: 'Kabinet Ministarstva', phone: '036 552 922', mail: 'info@mtto.gov.ba' };
  const related = (await apiSafe<{ items: PostListItem[] }>(`/posts?limit=4&category=${encodeURIComponent(post.category)}`, { items: [] })).items.filter((p) => p.id !== post.id).slice(0, 3);

  return (
    <>
      <div className="w-full bg-surface-container-low py-space-sm">
        <div className="max-w-7xl mx-auto px-margin-mobile md:px-margin flex flex-wrap items-center justify-between gap-y-2">
          <nav aria-label="Putanja" className="flex items-center gap-space-xs font-body-sm text-body-sm text-on-surface-variant flex-wrap">
            <Link className="hover:text-primary flex items-center gap-1" href="/"><span className="material-symbols-outlined text-[16px]">home</span>Naslovna</Link>
            <span className="material-symbols-outlined text-[14px] text-outline">chevron_right</span>
            <Link className="hover:text-primary" href={isCall ? '/vijesti?type=JAVNI_POZIV' : '/vijesti'}>{isCall ? 'Javni pozivi' : 'Vijesti'}</Link>
            <span className="material-symbols-outlined text-[14px] text-outline">chevron_right</span>
            <span className="text-on-surface font-semibold truncate max-w-[16rem] sm:max-w-md">{post.title}</span>
          </nav>
          {isCall && (
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded font-label-badge text-label-badge font-bold ${open ? 'bg-emerald-light text-secondary' : 'bg-surface-container-high text-outline'}`}>
              <span className={`w-2 h-2 rounded-full ${open ? 'bg-secondary animate-pulse' : 'bg-outline'}`} />
              {open ? 'Poziv je otvoren' : 'Poziv je zatvoren'}
            </span>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-margin-mobile md:px-margin py-space-xl w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-start">
          <article className="lg:col-span-8 flex flex-col gap-space-lg min-w-0">
            <header className="flex flex-col gap-space-md">
              <div className="flex flex-wrap items-center gap-space-sm">
                <span className="px-space-sm py-1 rounded bg-secondary text-on-secondary font-label-badge text-label-badge uppercase tracking-wider">{POST_TYPE[post.type] ?? post.type}</span>
                <span className="px-space-sm py-1 rounded bg-primary-container text-on-primary font-label-badge text-label-badge uppercase tracking-wider">{post.category}</span>
                <DemoBadge show={post.isDemo} />
              </div>
              <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-institutional-navy-deep tracking-tight">{post.title}</h1>
              <div className="p-space-md bg-surface-container-lowest rounded-xl shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-2 gap-x-4 text-on-surface-variant font-body-sm text-body-sm">
                <span className="flex items-center gap-2"><span className="material-symbols-outlined text-primary text-[18px]">calendar_today</span>Objavljeno: <strong className="text-on-surface">{dateLong(post.publishedAt)}</strong></span>
                <span className="flex items-center gap-2"><span className="material-symbols-outlined text-primary text-[18px]">schedule</span>Čitanje: <strong className="text-on-surface">{Math.max(1, Math.round(words / 200))} min</strong></span>
                <span className="flex items-center gap-2"><span className="material-symbols-outlined text-primary text-[18px]">visibility</span>Pregleda: <strong className="text-on-surface">{post.views.toLocaleString('bs-BA')}</strong></span>
                <span className="flex items-center gap-2 sm:col-span-2"><span className="material-symbols-outlined text-primary text-[18px]">account_box</span>Autor: <strong className="text-on-surface">{post.authorName}</strong></span>
                <span className="flex items-center gap-2"><span className="material-symbols-outlined text-secondary text-[18px]">update</span>Ažurirano: <strong className="text-on-surface">{dateTime(post.updatedAt)}</strong></span>
              </div>
              <ShareBar title={post.title} />
            </header>

            {post.coverImage && (
              <figure className="relative w-full h-[260px] sm:h-[420px] rounded-xl overflow-hidden shadow-md bg-surface-container">
                <img className="w-full h-full object-cover" src={post.coverImage} alt="" />
              </figure>
            )}

            {post.excerpt && <p className="font-body-lead text-body-lead text-institutional-navy-deep border-l-4 border-primary pl-space-md">{post.excerpt}</p>}
            <div className="prose-mtto" dangerouslySetInnerHTML={{ __html: html }} />

            {post.documents.length > 0 && (
              <section className="bg-surface-container-lowest rounded-xl shadow-sm p-space-md md:p-space-lg space-y-space-md" id="dokumenti">
                <div className="flex items-center justify-between">
                  <h2 className="font-headline-sm text-headline-sm font-bold text-primary">Službena dokumentacija i obrasci</h2>
                  <span className="font-label-badge text-label-badge text-on-surface-variant uppercase">{post.documents.length} datoteka</span>
                </div>
                <div className="grid gap-space-sm">{post.documents.map((d) => <DocRow key={d.id} d={d} />)}</div>
              </section>
            )}
          </article>

          <aside className="lg:col-span-4 space-y-space-md lg:sticky lg:top-44">
            {isCall && (
              <div className="bg-institutional-navy-deep text-on-primary rounded-xl p-space-lg shadow-lg space-y-space-md">
                <span className="font-label-kicker text-label-kicker uppercase tracking-wider text-secondary-fixed">Online prijava</span>
                {post.deadline && (
                  <div>
                    <p className="font-body-sm text-body-sm text-surface-container-high">Rok za prijave</p>
                    <p className="font-headline-sm text-headline-sm font-bold">{dateTime(post.deadline)} h</p>
                    {open && left !== null && <p className="font-body-sm text-body-sm text-secondary-fixed">Preostalo dana: {left}</p>}
                  </div>
                )}
                {open && post.formUrl ? (
                  <a href={post.formUrl} target="_blank" rel="noopener" className="flex items-center justify-center gap-space-xs w-full py-3 rounded-lg bg-secondary text-on-secondary font-button text-button hover:bg-secondary/90">
                    <span className="material-symbols-outlined text-[20px]">edit_document</span>Podnesi prijavu online
                  </a>
                ) : (
                  <p className="font-body-sm text-body-sm text-surface-variant">{open ? 'Prijava se podnosi prema uputstvu u prilogu.' : 'Rok za prijave je istekao.'}</p>
                )}
                <ul className="space-y-1 font-body-sm text-body-sm text-surface-container-high">
                  <li className="flex gap-2"><span className="material-symbols-outlined text-[16px] text-secondary-fixed">check_circle</span>Automatski protokolni broj</li>
                  <li className="flex gap-2"><span className="material-symbols-outlined text-[16px] text-secondary-fixed">check_circle</span>Potvrda s popisom priloga na e-mail</li>
                  <li className="flex gap-2"><span className="material-symbols-outlined text-[16px] text-secondary-fixed">check_circle</span>Forma se zatvara automatski po isteku roka</li>
                </ul>
              </div>
            )}
            <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-md space-y-space-sm">
              <span className="font-label-kicker text-label-kicker uppercase tracking-wider text-secondary">Kontakt za informacije</span>
              <h3 className="font-title-md text-title-md font-bold text-primary">{sector.name}</h3>
              <a href={`tel:${sector.phone.replace(/\s/g, '')}`} className="flex items-center gap-2 font-body-sm text-body-sm text-on-surface"><span className="material-symbols-outlined text-[18px] text-primary">call</span>{sector.phone}</a>
              <a href={`mailto:${sector.mail}`} className="flex items-center gap-2 font-body-sm text-body-sm text-on-surface"><span className="material-symbols-outlined text-[18px] text-primary">mail</span>{sector.mail}</a>
            </div>
            {related.length > 0 && (
              <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-md space-y-space-sm">
                <h3 className="font-title-md text-title-md font-bold text-primary">Povezane objave</h3>
                {related.map((r) => (
                  <Link key={r.id} href={`/vijesti/${r.slug}`} className="block p-space-sm rounded-lg hover:bg-surface-container-low">
                    <span className="block font-body-sm text-body-sm text-on-surface-variant">{dateLong(r.publishedAt)}</span>
                    <span className="block font-title-md text-[15px] font-bold text-primary leading-snug">{r.title}</span>
                  </Link>
                ))}
              </div>
            )}
          </aside>
        </div>
      </div>
    </>
  );
}
