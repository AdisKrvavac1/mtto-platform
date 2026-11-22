import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createHash } from 'crypto';
import { api, apiSafe, type Doc, type PostListItem } from '@/lib/api';
import { renderMarkdown } from '@/lib/markdown';
import { dateLong, dateShort, dateTime, daysUntil, fileExt, fileSize, POST_TYPE, DOC_TYPE } from '@/lib/format';
import { ArticleBody } from '@/components/figma/Article';
import { ArticleShare, ArticleFigure, ArticleDocs, RelatedList, H2 } from '@/components/figma/ArticleParts';
import { DemoTag } from '@/components/figma/cards';

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

  const deadlineBox = isCall && post.deadline ? (
    <div id="prijava" className="bg-[#fffbeb] border-l-4 border-[#f59e0b] flex gap-[16px] items-start p-[20px] md:p-[24px] rounded-[8px] w-full scroll-mt-24">
      <div className="bg-[#062343] flex items-center justify-center rounded-[8px] shrink-0 size-[40px]"><span aria-hidden className="material-symbols-outlined text-white text-[22px]">notifications_active</span></div>
      <div className="flex flex-col gap-[6px] min-w-0">
        <p className="font-space font-bold text-[#062343] text-[12px] tracking-[0.6px] uppercase leading-[16px]">Ključni rokovi i način dostave prijava</p>
        <p className="font-pub font-semibold text-[#062343] text-[15px] leading-[24px]">Rok za podnošenje prijava je <span className="font-extrabold">{dateTime(post.deadline)} sati</span>.{open && left !== null ? ` Preostalo je ${left} dana.` : ' Rok je istekao.'}</p>
        <p className="font-pub text-[#334155] text-[13px] leading-[20px]">Nepotpune i nepravovremene prijave neće se razmatrati. Detaljni uslovi su u tekstu poziva i priloženim dokumentima.</p>
        {open && post.formUrl && (
          <a href={post.formUrl} target="_blank" rel="noopener" className="mt-[8px] self-start bg-[#006c4a] hover:bg-[#005339] flex gap-[8px] items-center px-[16px] py-[10px] rounded-[4px] font-pub font-semibold text-[14px] text-white tracking-[0.14px] leading-[20px]"><span aria-hidden className="material-symbols-outlined text-[18px]">edit_document</span>Podnesi prijavu online</a>
        )}
      </div>
    </div>
  ) : null;
  const sector = SECTOR[post.category] ?? 'Ministarstvo trgovine, turizma i zaštite okoliša HNK';
  const typeLabel = POST_TYPE[post.type];

  return (
    <ArticleBody
      crumbType={isCall ? 'Javni pozivi' : typeLabel}
      crumbTitle={<span className="inline-block max-w-[16rem] md:max-w-md truncate align-bottom">{post.title}</span>}
      statusText={isCall ? (open ? 'POZIV JE OTVOREN' : 'POZIV JE ZATVOREN') : typeLabel.toUpperCase()}
      tag1={(isCall ? 'Javni pozivi · ' : '') + post.category.toUpperCase()}
      tag3={`GODINA: ${new Date(post.publishedAt).getFullYear()}.`}
      title={<>{post.title} {post.isDemo && <DemoTag show />}</>}
      published={dateLong(post.publishedAt)}
      readMin={Math.max(1, Math.round(words / 200))}
      updated={dateTime(post.updatedAt)}
      number={post.documents[0]?.number || `MTTO-${post.id.slice(0, 8).toUpperCase()}`}
      statusShort={isCall ? (open ? 'STATUS: OTVOREN' : 'STATUS: ZATVOREN') : typeLabel.toUpperCase()}
      author={sector}
      share={<ArticleShare title={post.title} />}
      figure={<ArticleFigure src={post.coverImage} chip={isCall ? 'JAVNI POZIV MTTO' : post.category.toUpperCase()} caption={post.excerpt.slice(0, 120)} />}
      lead={post.excerpt || null}
      body={<div className="prose-mtto prose-figma w-full" dangerouslySetInnerHTML={{ __html: html }} />}
      deadline={deadlineBox}
      docs={<ArticleDocs docs={post.documents} />}
      relatedTitle={related.length ? 'Povezani natječaji' : 'Najnovije objave'}
      related={<RelatedList items={relatedNews} />}
      views={`${post.views.toLocaleString('bs-BA')} pregleda`}
      downloads={`${downloads} puta`}
      callStatus={isCall ? (open ? (left !== null ? `Aktivan (još ${left} dana)` : 'Aktivan') : 'Zatvoren') : 'Objavljeno'}
      hash1={hash.slice(0, 46)}
      hash2={hash.slice(46)}
    />
  );
}
