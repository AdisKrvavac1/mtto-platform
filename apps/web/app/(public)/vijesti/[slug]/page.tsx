import Link from 'next/link';
import { notFound } from 'next/navigation';
import { api, apiSafe, type Doc, type PostListItem } from '@/lib/api';
import { renderMarkdown } from '@/lib/markdown';
import { dateLong, dateShort, dateTime, daysUntil, fileExt, fileSize, POST_TYPE, DOC_TYPE } from '@/lib/format';
import { Badge, Button, Container, FeaturedIcon, PostCard, Section, SectionHeader } from '@/components/uui';
import { Bell01, Calendar, Clock, Download01, Edit05, Eye, File06, Mail01, Share07 } from '@untitledui/icons';

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
  const downloads = post.documents.reduce((s, d) => s + d.downloads, 0);
  const related = (await apiSafe<{ items: PostListItem[] }>('/posts?type=JAVNI_POZIV&limit=4', { items: [] })).items.filter((p) => p.id !== post.id).slice(0, 3);
  const relatedNews = related.length ? related : (await apiSafe<{ items: PostListItem[] }>('/posts?limit=4', { items: [] })).items.filter((p) => p.id !== post.id).slice(0, 3);

  const sector = SECTOR[post.category] ?? 'Ministarstvo trgovine, turizma i zaštite okoliša HNK';
  const typeLabel = POST_TYPE[post.type];
  const url = `https://mtto-platform.onrender.com/vijesti/${post.slug}`;
  const readMin = Math.max(1, Math.round(words / 200));

  return (
    <>
      {/* Untitled UI "Blog post" – zaglavlje */}
      <section className="bg-white pt-12 md:pt-16">
        <Container className="flex flex-col items-center text-center">
          <nav aria-label="Putanja" className="flex flex-wrap items-center justify-center gap-2 text-[14px] leading-5 font-medium text-[#525252]">
            <Link href="/" className="hover:text-[#262626]">Naslovna</Link><span className="text-[#d4d4d4]">/</span>
            <Link href={isCall ? '/vijesti?type=JAVNI_POZIV' : '/vijesti'} className="hover:text-[#262626]">{isCall ? 'Javni pozivi' : 'Vijesti'}</Link>
          </nav>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
            <Badge tone="brand" size="md">{post.category || typeLabel}</Badge>
            {isCall && <Badge tone={open ? 'success' : 'gray'} size="md" dot>{open ? (left !== null ? `Otvoren · još ${left} dana` : 'Otvoren') : 'Zatvoren'}</Badge>}
            {post.isDemo && <Badge tone="warning" size="md">Demo</Badge>}
          </div>
          <h1 className="mt-4 max-w-[960px] text-[30px] leading-[38px] md:text-[48px] md:leading-[60px] font-semibold tracking-[-0.02em] text-[#171717] text-balance">{post.title}</h1>
          {post.excerpt && <p className="mt-4 md:mt-6 max-w-[768px] text-[18px] leading-7 md:text-[20px] md:leading-[30px] text-[#525252]">{post.excerpt}</p>}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[14px] leading-5 text-[#525252]">
            <span className="flex items-center gap-2"><Calendar size={16} className="text-[#a3a3a3]" />{dateLong(post.publishedAt)}</span>
            <span className="flex items-center gap-2"><Clock size={16} className="text-[#a3a3a3]" />{readMin} min čitanja</span>
            <span className="flex items-center gap-2"><Eye size={16} className="text-[#a3a3a3]" />{post.views.toLocaleString('bs-BA')} pregleda</span>
          </div>
        </Container>
        {post.coverImage && (
          <Container className="mt-12 md:mt-16">
            <div className="overflow-hidden rounded-[16px] md:rounded-[24px] bg-[#f5f5f5] aspect-[16/8]"><img src={post.coverImage} alt="" className="size-full object-cover" /></div>
          </Container>
        )}
      </section>

      <section className="bg-white py-12 md:py-16">
        <Container>
          <div className="mx-auto max-w-[720px]">
            {isCall && post.deadline && (
              <div id="prijava" className="mb-10 flex gap-4 rounded-[12px] bg-white p-4 md:p-5 ring-1 ring-inset ring-[var(--br-300)] shadow-[0_1px_2px_rgba(10,13,18,0.05)] scroll-mt-28">
                <FeaturedIcon icon={Bell01} size="md" tone={open ? 'brand' : 'warning'} />
                <div className="flex flex-col gap-1 min-w-0">
                  <p className="text-[14px] leading-5 font-semibold text-[#171717]">Rok za prijavu: {dateTime(post.deadline)} h</p>
                  <p className="text-[14px] leading-5 text-[#525252]">{open ? (left !== null ? `Preostalo je ${left} dana. ` : '') : 'Rok je istekao. '}Nepotpune i nepravovremene prijave se ne razmatraju; uslovi su u tekstu poziva i prilozima.</p>
                  {open && post.formUrl && <div className="mt-3"><Button href={post.formUrl} icon={Edit05}>Podnesi prijavu online</Button></div>}
                </div>
              </div>
            )}
            <div className="prose-uui" dangerouslySetInnerHTML={{ __html: html }} />

            {post.documents.length > 0 && (
              <div id="dokumenti" className="mt-12 scroll-mt-28">
                <h2 className="text-[24px] leading-8 font-semibold text-[#171717]">Dokumenti za preuzimanje</h2>
                <ul className="mt-6 flex flex-col gap-3">
                  {post.documents.map((d) => (
                    <li key={d.id} className="flex items-center gap-3 rounded-[12px] bg-white p-4 ring-1 ring-inset ring-[#e5e5e5]">
                      <span className="relative flex h-10 w-8 shrink-0 items-end justify-center rounded-[4px] ring-1 ring-inset ring-[#d4d4d4] bg-white"><span className="absolute -left-1.5 bottom-1.5 rounded-[2px] bg-[#d92d20] px-1 text-[10px] leading-[14px] font-bold text-white">{fileExt(d.fileName).slice(0, 4)}</span></span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[14px] leading-5 font-medium text-[#404040]">{d.title}{d.isDemo && <Badge tone="warning" className="ml-2">Demo</Badge>}</p>
                        <p className="text-[14px] leading-5 text-[#525252]">{fileSize(d.size)} · {DOC_TYPE[d.docType] ?? d.docType}{d.number ? ` · ${d.number}` : ''}</p>
                      </div>
                      <Button href={`/api/documents/${d.id}/file`} variant="tertiary" size="sm" icon={Download01} external>Preuzmi</Button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-12 flex flex-col gap-6 border-t border-[#e5e5e5] pt-6 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-3">
                <span className="flex size-12 items-center justify-center rounded-full bg-[var(--br-50)] ring-1 ring-black/10"><img src="/mtto-logo.svg" alt="" className="h-6" /></span>
                <div><p className="text-[16px] leading-6 font-semibold text-[#171717]">{sector}</p><p className="text-[16px] leading-6 text-[#525252]">Ažurirano {dateTime(post.updatedAt)}</p></div>
              </div>
              <div className="flex gap-3">
                <Button href={`mailto:?subject=${encodeURIComponent(post.title)}&body=${encodeURIComponent(url)}`} variant="secondary" icon={Mail01}>E-mail</Button>
                <Button href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`} variant="secondary" icon={Share07}>Facebook</Button>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {relatedNews.length > 0 && (
        <Section tone="gray">
          <SectionHeader eyebrow={related.length ? 'Javni pozivi' : 'Vijesti'} title={related.length ? 'Povezani pozivi' : 'Najnovije objave'} actions={<Button href="/vijesti" size="lg">Sve objave</Button>} />
          <div className="mt-12 grid gap-x-8 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
            {relatedNews.map((p) => <PostCard key={p.id} href={`/vijesti/${p.slug}`} image={p.coverImage} category={p.category || POST_TYPE[p.type]} title={p.title} excerpt={p.excerpt} meta={dateLong(p.publishedAt)} />)}
          </div>
        </Section>
      )}
    </>
  );
}
