import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createHash } from 'crypto';
import { api, apiSafe, type Doc, type PostListItem } from '@/lib/api';
import { renderMarkdown } from '@/lib/markdown';
import { dateLong, dateShort, dateTime, daysUntil, fileExt, fileSize, POST_TYPE, DOC_TYPE } from '@/lib/format';
import { DemoBadge } from '@/components/site/ui';
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

const SECTOR: Record<string, string> = { Turizam: 'Sektor za turizam i ugostiteljstvo', 'Zaštita okoliša': 'Sektor za zaštitu prirode i okoliša', Trgovina: 'Sektor za trgovinu' };

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await load(slug);
  if (!post) notFound();
  const html = renderMarkdown(post.body);
  const words = post.body.split(/\s+/).length;
  const isCall = post.type === 'JAVNI_POZIV';
  const left = daysUntil(post.deadline);
  const open = isCall && (left === null || left >= 0);
  const hash = createHash('sha256').update(post.title + post.body + post.documents.map((d) => d.id).join()).digest('hex');
  const downloads = post.documents.reduce((s, d) => s + d.downloads, 0);
  const related = (await apiSafe<{ items: PostListItem[] }>('/posts?type=JAVNI_POZIV&limit=4', { items: [] })).items.filter((p) => p.id !== post.id).slice(0, 3);
  const relatedNews = related.length ? related : (await apiSafe<{ items: PostListItem[] }>('/posts?limit=4', { items: [] })).items.filter((p) => p.id !== post.id).slice(0, 3);

  return (
    <>
      <div className="w-full bg-surface-container-low py-space-sm">
        <div className="max-w-7xl mx-auto px-gutter flex flex-wrap items-center justify-between gap-y-2">
          <nav aria-label="Breadcrumb" className="flex items-center gap-space-xs font-body-sm text-body-sm text-on-surface-variant flex-wrap">
            <Link className="hover:text-primary transition-colors flex items-center gap-1" href="/"><span className="material-symbols-outlined text-[16px]">home</span><span>Naslovna</span></Link>
            <span className="material-symbols-outlined text-[14px] text-outline">chevron_right</span>
            <Link className="hover:text-primary transition-colors" href="/vijesti">Vijesti i obavijesti</Link>
            {isCall && (<><span className="material-symbols-outlined text-[14px] text-outline">chevron_right</span><Link className="hover:text-primary transition-colors" href="/vijesti?type=JAVNI_POZIV">Javni pozivi</Link></>)}
            <span className="material-symbols-outlined text-[14px] text-outline">chevron_right</span>
            <span className="text-on-surface font-semibold truncate max-w-xs sm:max-w-md">{post.title}</span>
          </nav>
          <div className="flex items-center gap-space-sm text-body-sm">
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded font-label-badge text-label-badge font-bold ${open || !isCall ? 'bg-emerald-light text-secondary' : 'bg-surface-container-high text-outline'}`}>
              <span className={`w-2 h-2 rounded-full ${open || !isCall ? 'bg-secondary animate-pulse' : 'bg-outline'}`} />
              {isCall ? (open ? 'POZIV JE OTVOREN' : 'POZIV JE ZATVOREN') : 'SLUŽBENA OBJAVA MTTO'}
            </span>
            <span className="hidden md:inline-flex text-outline">|</span>
            <span className="hidden md:inline-flex items-center gap-1 text-on-surface-variant font-label-badge text-label-badge"><span className="material-symbols-outlined text-[15px] text-secondary">verified</span>OBJAVLJENO IZ CMS-a</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-gutter py-space-xl w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-start">
          <article className="lg:col-span-8 flex flex-col gap-space-lg min-w-0">
            <header className="flex flex-col gap-space-md">
              <div className="flex flex-wrap items-center gap-space-sm">
                <span className="px-space-sm py-1 rounded bg-secondary text-on-secondary font-label-badge text-label-badge uppercase tracking-wider">{POST_TYPE[post.type] ?? post.type}</span>
                <span className="px-space-sm py-1 rounded bg-primary-container text-on-primary-container font-label-badge text-label-badge uppercase tracking-wider">{post.category}</span>
                <span className="px-space-sm py-1 rounded bg-surface-container-high text-institutional-navy-deep font-label-badge text-label-badge">GODINA: {new Date(post.publishedAt).getFullYear()}.</span>
                <DemoBadge show={post.isDemo} />
              </div>
              <h1 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-institutional-navy-deep tracking-tight">{post.title}</h1>
              <div className="p-space-md bg-surface-container-lowest rounded-xl shadow-sm flex flex-col gap-space-xs text-on-surface-variant font-body-sm text-body-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-2 gap-x-4">
                  <div className="flex items-center gap-2"><span className="material-symbols-outlined text-primary text-[18px]">calendar_today</span><span>Objavljeno: <strong className="text-on-surface font-semibold">{dateLong(post.publishedAt)}</strong></span></div>
                  <div className="flex items-center gap-2"><span className="material-symbols-outlined text-primary text-[18px]">schedule</span><span>Vrijeme čitanja: <strong className="text-on-surface font-semibold">{Math.max(1, Math.round(words / 200))} min</strong></span></div>
                  <div className="flex items-center gap-2"><span className="material-symbols-outlined text-secondary text-[18px]">update</span><span>Ažurirano: <strong className="text-on-surface font-semibold">{dateTime(post.updatedAt)}</strong></span></div>
                  <div className="flex items-center gap-2"><span className="material-symbols-outlined text-primary text-[18px]">visibility</span><span>Pregleda: <strong className="text-on-surface font-semibold">{post.views.toLocaleString('bs-BA')}</strong></span></div>
                  <div className="flex items-center gap-2 sm:col-span-2"><span className="material-symbols-outlined text-primary text-[18px]">account_box</span><span>Autor: <strong className="text-on-surface font-semibold">{SECTOR[post.category] ?? post.authorName}</strong></span></div>
                </div>
              </div>
              <ShareBar title={post.title} />
            </header>

            {post.coverImage && (
              <figure className="flex flex-col gap-space-xs">
                <div className="relative w-full h-[260px] sm:h-[440px] rounded-xl overflow-hidden shadow-md bg-surface-container">
                  <img alt={post.title} className="w-full h-full object-cover" src={post.coverImage} />
                  <div className="absolute inset-0 bg-gradient-to-t from-institutional-navy-deep/80 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-on-primary">
                    <span className="inline-flex items-center gap-1.5 bg-institutional-navy-deep/80 backdrop-blur-md px-3 py-1 rounded text-body-sm font-label-badge">
                      <span className="material-symbols-outlined text-secondary-fixed text-[16px]">{isCall ? 'campaign' : 'photo_camera'}</span>{post.category.toUpperCase()} · MTTO HNK
                    </span>
                  </div>
                </div>
              </figure>
            )}

            <div className="flex flex-col gap-space-lg text-text-body font-body-regular text-body-regular leading-relaxed" id="readable-content">
              {post.excerpt && (
                <div className="p-space-lg rounded-xl bg-surface-container-low shadow-sm">
                  <p className="font-body-lead text-body-lead text-institutional-navy-deep font-semibold leading-relaxed">{post.excerpt}</p>
                </div>
              )}
              <div className="prose-mtto" dangerouslySetInnerHTML={{ __html: html }} />
              {isCall && post.deadline && (
                <div className="p-space-lg rounded-xl bg-amber-light text-on-surface shadow-sm relative overflow-hidden">
                  <div className="flex items-start gap-space-md">
                    <div className="w-12 h-12 rounded-lg bg-primary-container text-on-primary flex items-center justify-center flex-shrink-0"><span className="material-symbols-outlined text-[28px] text-amber-light">notification_important</span></div>
                    <div className="flex flex-col gap-space-xs">
                      <span className="font-label-kicker text-label-kicker text-institutional-navy-deep uppercase tracking-wider">Ključni rokovi i način dostave prijava</span>
                      <p className="font-body-regular text-body-regular text-institutional-navy-deep font-semibold">Rok za podnošenje prijava je <strong>{dateTime(post.deadline)} sati</strong>.{open && left !== null ? ` Preostalo je ${left} dana.` : ' Rok je istekao.'}</p>
                      <p className="font-body-sm text-body-sm text-text-body mt-1">Prijave se podnose kroz <strong className="text-primary font-semibold">online formu MTTO</strong>. Nakon slanja podnosilac automatski dobija protokolni broj i potvrdu s popisom priloga na e-mail. Forma se zatvara automatski po isteku roka.</p>
                    </div>
                  </div>
                </div>
              )}
              {post.documents.length > 0 && (
                <section className="flex flex-col gap-space-sm pt-space-sm" id="dokumenti">
                  <div className="flex items-center justify-between">
                    <h2 className="font-headline-md text-headline-md text-institutional-navy-deep flex items-center gap-2"><span className="w-2.5 h-6 bg-secondary rounded-full inline-block" />Preuzimanje službene dokumentacije i obrazaca</h2>
                    <span className="hidden sm:inline-block font-label-badge text-label-badge text-outline uppercase">{post.documents.length} datoteka</span>
                  </div>
                  <p className="text-body-sm text-on-surface-variant">Molimo podnosioce da koriste priložene standardizirane obrasce.</p>
                  <div className="grid grid-cols-1 gap-space-sm mt-space-xs">
                    {post.documents.map((d) => {
                      const ext = fileExt(d.fileName);
                      const pdf = ext === 'PDF';
                      return (
                        <div key={d.id} className="p-space-md bg-surface-container-lowest rounded-xl shadow-sm hover:shadow-md transition-shadow flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm">
                          <div className="flex items-start gap-space-sm min-w-0">
                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${pdf ? 'bg-red-50 text-error' : 'bg-blue-50 text-primary'}`}><span className="material-symbols-outlined text-[28px]">{pdf ? 'picture_as_pdf' : 'description'}</span></div>
                            <div className="min-w-0">
                              <h3 className="font-title-md text-title-md text-institutional-navy-deep truncate">{d.title}</h3>
                              <p className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-2 flex-wrap"><span>{DOC_TYPE[d.docType] ?? 'Dokument'}</span><span>•</span><span>{ext}, {fileSize(d.size)}</span>{d.issuedAt && (<><span>•</span><span>{dateShort(d.issuedAt)}</span></>)}</p>
                            </div>
                          </div>
                          <a className={`px-space-md py-2.5 rounded font-button text-button inline-flex items-center justify-center gap-2 transition-colors flex-shrink-0 ${pdf ? 'bg-primary text-on-primary hover:bg-institutional-navy-deep' : 'bg-surface-container-high text-institutional-navy-deep hover:bg-primary hover:text-on-primary'}`} href={`/api/documents/${d.id}/file`} target="_blank" rel="noopener">
                            <span className="material-symbols-outlined text-[18px]">download</span><span>Preuzmi {ext}</span>
                          </a>
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}
            </div>
          </article>

          <aside className="lg:col-span-4 flex flex-col gap-space-lg w-full lg:sticky lg:top-[170px]">
            {isCall && (
              <div className="bg-institutional-navy-deep text-on-primary rounded-xl shadow-md p-space-lg flex flex-col gap-space-sm">
                <span className="font-label-kicker text-label-kicker text-secondary-fixed uppercase tracking-wider">Online prijava</span>
                {post.deadline && <p className="font-headline-sm text-headline-sm font-bold">Rok: {dateTime(post.deadline)} h</p>}
                {open && post.formUrl ? (
                  <a href={post.formUrl} target="_blank" rel="noopener" className="w-full py-3 rounded bg-secondary hover:bg-secondary-fixed hover:text-institutional-navy-deep text-on-secondary font-button text-button font-bold transition-colors flex items-center justify-center gap-2"><span className="material-symbols-outlined text-[20px]">edit_document</span>Podnesi prijavu online</a>
                ) : <p className="font-body-sm text-body-sm text-primary-fixed-dim">{open ? 'Prijava prema uputstvu u prilogu.' : 'Rok za prijave je istekao.'}</p>}
              </div>
            )}
            <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-md flex flex-col gap-space-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-secondary" /><h3 className="font-title-md text-title-md text-institutional-navy-deep">{related.length ? 'Povezani pozivi' : 'Najnovije objave'}</h3></div>
                <Link className="text-body-sm text-secondary hover:underline font-semibold" href={related.length ? '/vijesti?type=JAVNI_POZIV' : '/vijesti'}>Sve</Link>
              </div>
              <div className="flex flex-col gap-space-sm">
                {relatedNews.map((r) => {
                  const d = daysUntil(r.deadline);
                  return (
                    <Link key={r.id} className="group p-space-sm rounded-lg bg-surface-container-low hover:bg-surface-container transition-colors flex flex-col gap-1" href={`/vijesti/${r.slug}`}>
                      <div className="flex items-center justify-between text-body-sm text-outline">
                        <span className={`font-label-badge text-label-badge font-bold ${d !== null && d >= 0 ? 'text-secondary' : 'text-outline'}`}>{r.deadline ? (d! >= 0 ? `OTVOREN DO ${dateShort(r.deadline)}` : 'ZATVOREN') : dateShort(r.publishedAt)}</span>
                        <span>{r.category}</span>
                      </div>
                      <p className="font-body-regular text-body-regular text-institutional-navy-deep font-semibold group-hover:text-secondary transition-colors line-clamp-2">{r.title}</p>
                    </Link>
                  );
                })}
              </div>
            </div>
            <div className="bg-primary text-on-primary rounded-xl shadow-md p-space-lg flex flex-col gap-space-sm relative overflow-hidden">
              <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-secondary/20 pointer-events-none" />
              <div className="flex items-center gap-2"><span className="material-symbols-outlined text-secondary-fixed text-[24px]">mark_email_unread</span><span className="font-label-kicker text-label-kicker text-primary-fixed-dim uppercase tracking-wider">E-obavijesti</span><span className="ml-auto px-2 py-0.5 rounded bg-white/15 font-label-badge text-label-badge uppercase">Faza 2</span></div>
              <h3 className="font-headline-sm text-headline-sm text-on-primary leading-tight">Pretplatite se na e-Bilten MTTO</h3>
              <p className="font-body-sm text-body-sm text-primary-fixed-dim leading-relaxed">Primajte obavijesti o novim pozivima, okolišnim dozvolama i izmjenama propisa direktno na e-mail.</p>
              <form className="flex flex-col gap-space-xs mt-space-xs" action="#">
                <input className="w-full px-3 py-2.5 rounded bg-surface-container-lowest text-on-surface font-body-sm text-body-sm border-0 focus:outline-none focus:ring-2 focus:ring-secondary" placeholder="Unesite vašu e-mail adresu..." type="email" disabled />
                <button className="mt-2 w-full py-2.5 px-4 rounded bg-secondary text-on-secondary font-button text-button font-bold opacity-70 cursor-not-allowed" type="button" disabled>Prijavi se na bilten</button>
              </form>
            </div>
            <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-md flex flex-col gap-space-sm">
              <div className="flex items-center gap-space-sm">
                <div className="w-10 h-10 rounded-lg bg-red-50 text-error flex items-center justify-center flex-shrink-0"><span className="material-symbols-outlined text-[24px]">fmd_bad</span></div>
                <div><h3 className="font-title-md text-title-md text-institutional-navy-deep">Prijavi ekološki incident</h3><span className="font-body-sm text-body-sm text-outline">Građanska prijava inspekciji</span></div>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant">Uočili ste divlju deponiju, ispuštanje otpadnih voda u Neretvu ili bespravnu sječu šuma? Prijavite kantonalnoj inspekciji.</p>
              <Link className="w-full py-2 px-3 rounded bg-red-50 hover:bg-error hover:text-on-error text-error font-button text-button transition-colors flex items-center justify-center gap-2" href="/e-usluge/eko-prijava"><span className="material-symbols-outlined text-[18px]">report_problem</span><span>Otvori Eko-alarm prijavu</span></Link>
            </div>
            <div className="bg-surface-container-low rounded-xl shadow-sm p-space-md flex flex-col gap-space-sm text-on-surface-variant">
              <div className="flex items-center justify-between pb-space-xs border-b border-surface-container">
                <span className="font-label-kicker text-label-kicker text-outline uppercase">Autentičnost objave</span>
                <span className="flex items-center gap-1 font-label-badge text-label-badge text-secondary font-bold"><span className="material-symbols-outlined text-[14px]">verified</span>VALIDIRANO</span>
              </div>
              <div className="flex flex-col gap-1 text-body-sm font-body-sm">
                <div className="flex justify-between"><span className="text-outline">Ukupno pregleda:</span><strong className="text-institutional-navy-deep font-semibold">{post.views.toLocaleString('bs-BA')}</strong></div>
                <div className="flex justify-between"><span className="text-outline">Preuzetih dokumenata:</span><strong className="text-institutional-navy-deep font-semibold">{downloads} puta</strong></div>
                <div className="flex justify-between"><span className="text-outline">Status:</span><strong className="text-secondary font-semibold">{isCall ? (open ? `Aktivan${left !== null ? ` (još ${left} dana)` : ''}` : 'Zatvoren') : 'Objavljeno'}</strong></div>
              </div>
              <div className="p-2 rounded bg-surface-container-lowest mt-1">
                <span className="block font-label-badge text-label-badge text-outline uppercase mb-0.5">SHA-256 verifikacijski kod:</span>
                <code className="block font-mono text-xs text-institutional-navy-deep break-all">{hash}</code>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
