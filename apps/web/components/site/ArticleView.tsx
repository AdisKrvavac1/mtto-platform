import Link from 'next/link';
import { api, apiSafe, type Doc, type PostListItem } from '@/lib/api';
import { renderBody, wordCount } from '@/lib/markdown';
import { dateLong, dateShort, dateTime, daysUntil, fileExt, fileSize, POST_TYPE, DOC_TYPE } from '@/lib/format';
import { Badge, Button, CATEGORY_TONE, Card, CategoryBadge, Container, FeaturedIcon, FileTypeIcon, GRAD, Head, PostCard, Section, Tag } from '@/components/uui';
import { AlertTriangle, Bell01, Building07, Calendar, Clock, Download01, Edit05, Eye, Mail01, Phone, RefreshCw01, ShieldTick } from '@untitledui/icons';
import ShareButtons from '@/components/uui/ShareButtons';
import { t } from '@/lib/i18n';
import { getLang } from '@/lib/lang.server';

export type ArticlePost = PostListItem & { lang?: string; translated?: boolean; available?: string[]; body: string; formUrl: string | null; updatedAt: string; documents: Doc[]; status?: string; previewExpiresAt?: string | null };

const SITE = 'https://mtto-platform.onrender.com';
const SECTOR: Record<string, string> = { Turizam: 'Sektor za turizam i ugostiteljstvo', 'Zaštita okoliša': 'Sektor za zaštitu prirode i okoliša', Trgovina: 'Sektor za trgovinu' };

/** Članak na portalu. Uz preview=true prikazuje traku „Pregled prije objave“ i ne dijeli link. */
export default async function ArticleView({ post, preview = false }: { post: ArticlePost; preview?: boolean }) {
  const lang = preview ? 'bs' : await getLang();
  const html = renderBody(post.body);
  const words = wordCount(post.body);
  const isCall = post.type === 'JAVNI_POZIV';
  const left = daysUntil(post.deadline);
  const open = isCall && (left === null || left >= 0);
  const downloads = post.documents.reduce((s, d) => s + d.downloads, 0);
  const related = (await apiSafe<{ items: PostListItem[] }>('/posts?type=JAVNI_POZIV&limit=4', { items: [] })).items.filter((p) => p.id !== post.id).slice(0, 3);
  const relatedNews = related.length ? related : (await apiSafe<{ items: PostListItem[] }>('/posts?limit=4', { items: [] })).items.filter((p) => p.id !== post.id).slice(0, 3);

  const sector = SECTOR[post.category] ?? 'Ministarstvo trgovine, turizma i zaštite okoliša HNK';
  const typeLabel = POST_TYPE[post.type];
  const url = `${SITE}/vijesti/${post.slug}`;
  const readMin = Math.max(1, Math.round(words / 200));

  const calls = (await apiSafe<{ items: PostListItem[] }>('/posts?type=JAVNI_POZIV&limit=4', { items: [] })).items.filter((p) => p.id !== post.id).slice(0, 3);
  const facts: [typeof Calendar, string, string][] = [
    [Calendar, 'Objavljeno', post.publishedAt ? dateLong(post.publishedAt) : 'još nije objavljeno'],
    [Clock, 'Vrijeme čitanja', `${readMin} min`],
    [RefreshCw01, 'Ažurirano', dateTime(post.updatedAt)],
    [Eye, 'Pregleda', post.views.toLocaleString('bs-BA')],
    [Building07, 'Autor', sector],
  ];

  return (
    <>
      {preview && <PreviewBar status={post.status} expiresAt={post.previewExpiresAt} />}
    <>
      <section className="border-b border-[#e5e5e5] bg-[#fafafa]">
        <Container className="flex flex-wrap items-center justify-between gap-3 py-3">
          <nav aria-label="Putanja" className="flex flex-wrap items-center gap-2 text-[14px] font-medium text-[#525252]">
            <Link href="/" className="hover:text-[#262626]">Naslovna</Link><span className="text-[#d4d4d4]">/</span>
            <Link href={isCall ? '/javni-pozivi' : '/vijesti'} className="hover:text-[#262626]">{isCall ? 'Javni pozivi' : 'Vijesti'}</Link><span className="text-[#d4d4d4]">/</span>
            <span className="max-w-[360px] truncate font-semibold text-[var(--br-700)]">{post.title}</span>
          </nav>
          <span className="flex items-center gap-1.5 text-[12px] font-semibold text-[var(--gr-700)]"><ShieldTick size={16} />Službeni glasnik HNK · objava Ministarstva</span>
        </Container>
      </section>

      <section className="bg-white py-10 md:py-14">
        <Container className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px]">
          <article className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <CategoryBadge name={typeLabel} size="md" />
              {post.category && <CategoryBadge name={post.category} size="md" />}
              {isCall && <Badge tone={open ? 'success' : 'gray'} size="md" dot>{open ? (left !== null ? `Otvoren · još ${left} dana` : 'Otvoren') : 'Zatvoren'}</Badge>}
              {post.isDemo && <Badge tone="warning" size="md">Demo</Badge>}
            </div>
            <h1 lang={post.translated ? post.lang : 'bs'} className="mt-4 text-[30px] leading-[38px] md:text-[40px] md:leading-[50px] font-semibold tracking-[-0.02em] text-[#171717] text-balance">{post.title}</h1>
            {lang === 'en' && !post.translated && <p className="mt-3 rounded-[8px] bg-[#eff8ff] px-3 py-2 text-[14px] text-[#175cd3] ring-1 ring-inset ring-[#b2ddff]" lang="en">{t('en', 'Ovaj tekst je dostupan samo na bosanskom jeziku.')}</p>}

            <dl className="mt-6 grid gap-x-6 gap-y-3 rounded-[12px] bg-white p-4 ring-1 ring-inset ring-[#e5e5e5] sm:grid-cols-2 md:p-5">
              {facts.map(([I, k, v]) => (
                <div key={k} className="flex items-center gap-2 text-[14px] min-w-0"><I size={16} className="shrink-0 text-[#a3a3a3]" /><dt className="text-[#525252]">{k}:</dt><dd className="truncate font-semibold text-[#171717]">{v}</dd></div>
              ))}
            </dl>
            <div className="mt-4 flex flex-col gap-3 border-y border-[#e5e5e5] py-3 sm:flex-row sm:items-center sm:justify-between">
              {!preview && <ShareButtons url={url} title={post.title} compact />}
              <Badge tone="gray">Audio čitanje · Faza 2</Badge>
            </div>

            {post.coverImage && (
              <figure className="mt-8">
                <div className="relative overflow-hidden rounded-[16px] bg-[#f5f5f5] aspect-[16/9]"><img src={post.coverImage} alt="" className="size-full object-cover" /><span className="absolute bottom-3 left-3 rounded-[8px] bg-black/40 px-2.5 py-1 text-[12px] font-semibold text-white backdrop-blur-md">{post.category || typeLabel} · MTTO HNK</span></div>
                <figcaption className="mt-2 text-[12px] text-[#737373]">Foto: MTTO HNK</figcaption>
              </figure>
            )}

            {post.excerpt && <p className="mt-8 border-l-4 border-[var(--gr-500)] bg-[var(--gr-25)] px-5 py-4 text-[18px] leading-7 font-medium text-[#262626]">{post.excerpt}</p>}

            {isCall && post.deadline && (
              <div id="prijava" className="mt-8 flex gap-4 rounded-[12px] bg-[#fffaeb] p-4 md:p-5 ring-1 ring-inset ring-[#fedf89] scroll-mt-28">
                <FeaturedIcon icon={Bell01} size="md" tone={open ? 'warning' : 'error'} />
                <div className="flex flex-col gap-1 min-w-0">
                  <p className="text-[14px] leading-5 font-semibold text-[#171717]">Ključni rokovi: prijave do {dateTime(post.deadline)} h</p>
                  <p className="text-[14px] leading-5 text-[#525252]">{open ? (left !== null ? `Preostalo je ${left} dana. ` : '') : 'Rok je istekao. '}Nepotpune i nepravovremene prijave se ne razmatraju; uslovi su u tekstu poziva i prilozima.</p>
                  {open && post.formUrl && <div className="mt-3"><Button href={post.formUrl} icon={Edit05}>Podnesi prijavu online</Button></div>}
                </div>
              </div>
            )}

            <div className="prose-uui mt-8" lang={post.translated ? post.lang : 'bs'} dangerouslySetInnerHTML={{ __html: html }} />

            {post.documents.length > 0 && (
              <div id="dokumenti" className="mt-12 scroll-mt-28">
                <div className="flex items-end justify-between gap-4"><h2 className="text-[24px] leading-8 font-semibold text-[#171717]">Preuzimanje službene dokumentacije</h2><span className="hidden text-[14px] text-[#737373] sm:block">{downloads.toLocaleString('bs-BA')} preuzimanja</span></div>
                <ul className="mt-6 flex flex-col gap-3">
                  {post.documents.map((d) => (
                    <li key={d.id} className="uui-lift flex flex-col gap-3 rounded-[12px] bg-white p-4 ring-1 ring-inset ring-[#e5e5e5] sm:flex-row sm:items-center">
                      <span className="flex min-w-0 flex-1 items-center gap-3">
                        <FileTypeIcon ext={fileExt(d.fileName)} />
                        <span className="min-w-0"><span className="block truncate text-[16px] font-semibold text-[#171717]">{d.title}{d.isDemo && <Badge tone="warning" className="ml-2">Demo</Badge>}</span><span className="text-[14px] text-[#525252]">{DOC_TYPE[d.docType] ?? d.docType} · {fileSize(d.size)}{d.number ? ` · ${d.number}` : ''}</span></span>
                      </span>
                      <Button href={`/api/documents/${d.id}/file`} variant="secondary" size="sm" icon={Download01} external>Preuzmi {fileExt(d.fileName)}</Button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className={`mt-10 flex flex-col gap-4 rounded-[16px] p-5 text-white md:flex-row md:items-center md:justify-between ${GRAD}`}>
              <div className="flex items-center gap-3"><span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/20"><Phone size={20} /></span><div><p className="text-[16px] font-semibold">Trebate dodatna pojašnjenja?</p><p className="text-[14px] text-[var(--br-100)]">{sector} · radnim danima 08:00–16:00</p></div></div>
              <div className="flex flex-wrap gap-2"><a href="tel:+38736551823" className="inline-flex h-10 items-center gap-1.5 rounded-[8px] bg-white/10 px-3.5 text-[14px] font-semibold ring-1 ring-inset ring-white/25 hover:bg-white/15"><Phone size={16} />036 551 823</a><a href="mailto:info@mtto.gov.ba" className="inline-flex h-10 items-center gap-1.5 rounded-[8px] bg-[var(--br-600)] px-3.5 text-[14px] font-semibold hover:bg-[var(--br-700)]"><Mail01 size={16} />info@mtto.gov.ba</a></div>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-2 border-t border-[#e5e5e5] pt-6 text-[14px]">
              <span className="font-semibold text-[#525252]">Oznake:</span>
              {[post.category, typeLabel, 'HNK', 'MTTO'].filter(Boolean).map((t) => <Tag key={t} href={`/vijesti?q=${encodeURIComponent(t)}`} dot={CATEGORY_TONE[t]?.dot}>{t}</Tag>)}
            </div>
            <div className="mt-6 flex flex-col gap-4 rounded-[12px] bg-[#fafafa] p-4 ring-1 ring-inset ring-[#e5e5e5] sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3"><img src="/mtto-logo.svg" alt="" className="h-8" /><p className="text-[14px] text-[#404040]">Objavio: <b>{sector}</b></p></div>
              {!preview && <ShareButtons url={url} title={post.title} />}
            </div>
          </article>

          <aside className="flex flex-col gap-5 lg:sticky lg:top-40 lg:self-start">
            {calls.length > 0 && (
              <Card className="p-5">
                <div className="flex items-center justify-between"><h2 className="text-[16px] font-semibold text-[#171717]">Povezani natječaji</h2><Link href="/javni-pozivi" className="text-[14px] font-semibold text-[var(--br-700)]">Svi pozivi</Link></div>
                <ul className="mt-4 flex flex-col gap-3">
                  {calls.map((c) => { const d = daysUntil(c.deadline); const o = d === null || d >= 0; return (
                    <li key={c.id}><Link href={`/vijesti/${c.slug}`} className="group block rounded-[10px] bg-[#fafafa] p-3 ring-1 ring-inset ring-[#e5e5e5] hover:ring-[var(--br-300)]">
                      <span className="flex items-center justify-between gap-2"><Badge tone={o ? 'success' : 'gray'} dot>{o ? (d !== null ? `Do ${dateShort(c.deadline!)}` : 'Otvoren') : 'Zatvoren'}</Badge>{c.isDemo && <Badge tone="warning">Demo</Badge>}</span>
                      <span className="mt-2 block text-[14px] font-semibold leading-5 text-[#171717] group-hover:text-[var(--br-700)] line-clamp-2">{c.title}</span>
                    </Link></li>
                  ); })}
                </ul>
              </Card>
            )}
            <div className={`rounded-[16px] p-5 text-white ${GRAD}`}>
              <Badge tone="success">E-obavijesti · Faza 2</Badge>
              <p className="mt-3 text-[18px] font-semibold">Pretplatite se na e-bilten MTTO</p>
              <p className="mt-1 text-[14px] text-[var(--br-100)]">Obavijesti o novim pozivima, rokovima i javnim uvidima na vaš e-mail.</p>
              <input disabled placeholder="Vaša e-mail adresa" aria-label="E-mail (Faza 2)" className="mt-4 h-10 w-full rounded-[8px] border-0 bg-white/10 px-3 text-[14px] text-white placeholder:text-white/50 ring-1 ring-inset ring-white/20" />
              <button disabled className="mt-2 h-10 w-full cursor-not-allowed rounded-[8px] bg-[var(--br-600)] text-[14px] font-semibold opacity-80">Prijavi se na bilten</button>
            </div>
            <Card className="p-5">
              <div className="flex items-center gap-3"><FeaturedIcon icon={AlertTriangle} size="md" tone="error" /><div><p className="text-[16px] font-semibold text-[#171717]">Prijavi ekološki incident</p><p className="text-[12px] text-[#737373]">Građanski eko-alarm, i anonimno</p></div></div>
              <p className="mt-3 text-[14px] text-[#525252]">Uočili ste divlju deponiju, požar ili zagađenje vode? Pošaljite lokaciju i fotografiju.</p>
              <Button href="/eko-rizik/prijava" variant="secondary" className="mt-4 w-full" icon={AlertTriangle}>Otvori Eko-alarm prijavu</Button>
            </Card>
            <Card className="p-5">
              <div className="flex items-center justify-between"><p className="text-[12px] font-semibold text-[#525252]">Autentičnost objave</p><Badge tone="gray">Faza 2</Badge></div>
              <dl className="mt-3 flex flex-col gap-2 text-[14px]">
                <div className="flex justify-between"><dt className="text-[#525252]">Ukupno pregleda</dt><dd className="font-semibold text-[#171717]">{post.views.toLocaleString('bs-BA')}</dd></div>
                <div className="flex justify-between"><dt className="text-[#525252]">Preuzimanja</dt><dd className="font-semibold text-[#171717]">{downloads.toLocaleString('bs-BA')}</dd></div>
                {isCall && <div className="flex justify-between"><dt className="text-[#525252]">Status poziva</dt><dd className={`font-semibold ${open ? 'text-[var(--gr-700)]' : 'text-[#737373]'}`}>{open ? 'Aktivan' : 'Zatvoren'}</dd></div>}
              </dl>
              <p className="mt-3 rounded-[8px] bg-[#fafafa] p-3 text-[12px] text-[#737373] ring-1 ring-inset ring-[#e5e5e5]">Digitalni potpis i kontrolni hash objave bit će dostupni u Fazi 2.</p>
            </Card>
          </aside>
        </Container>
      </section>

      {relatedNews.length > 0 && (
        <Section tone="gray">
          <Head k={related.length ? 'Javni pozivi' : 'Vijesti'} t={related.length ? 'Povezani pozivi' : 'Najnovije objave'} action={<Button href="/vijesti" variant="secondary">Sve objave</Button>} />
          <div className="mt-10 grid gap-x-8 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
            {relatedNews.map((p) => <PostCard key={p.id} href={`/vijesti/${p.slug}`} image={p.coverImage} category={p.category || POST_TYPE[p.type]} title={p.title} excerpt={p.excerpt} meta={dateLong(p.publishedAt)} />)}
          </div>
        </Section>
      )}
    </>
    </>
  );
}

const STATUS_LABEL: Record<string, string> = { NACRT: 'nacrt', NA_ODOBRENJU: 'čeka odobrenje', VRACENO: 'vraćeno na doradu', ZAKAZANO: 'zakazano', OBJAVLJENO: 'objavljeno', POVUCENO: 'povučeno' };
function PreviewBar({ status, expiresAt }: { status?: string; expiresAt?: string | null }) {
  return (
    <div role="status" className="sticky top-0 z-50 border-b border-[#fedf89] bg-[#fffaeb]">
      <Container>
        <p className="flex flex-wrap items-center gap-x-2 gap-y-1 py-3 text-[14px] leading-5 text-[#7a2e0e]">
          <Eye size={16} className="text-[#dc6803]" />
          <strong className="font-semibold">Pregled prije objave</strong>
          <span>· Ova stranica nije javna{status ? ` (status: ${STATUS_LABEL[status] ?? status})` : ''}.</span>
          {expiresAt && <span>Link važi do {dateTime(expiresAt)}.</span>}
        </p>
      </Container>
    </div>
  );
}
