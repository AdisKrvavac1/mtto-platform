import { notFound } from 'next/navigation';
import { api, apiSafe } from '@/lib/api';
import ArticleView, { type ArticlePost } from '@/components/site/ArticleView';

export const dynamic = 'force-dynamic';

type Post = ArticlePost;

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
  if (!p) return { title: 'Objava nije pronađena' };
  const img = p.coverImage ? (p.coverImage.startsWith('http') ? p.coverImage : `${SITE}${p.coverImage}`) : `${SITE}/og/mtto-og.jpg`;
  return {
    title: p.title, description: p.excerpt,
    openGraph: { type: 'article', title: p.title, description: p.excerpt ?? undefined, url: `${SITE}/vijesti/${p.slug}`, siteName: 'MTTO HNK', locale: 'bs_BA', images: [{ url: img, width: 1200, height: 630, alt: p.title }] },
    twitter: { card: 'summary_large_image', title: p.title, description: p.excerpt ?? undefined, images: [img] },
  };
}

const SITE = 'https://mtto-platform.onrender.com';

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await load(slug);
  if (!post) notFound();
  return <ArticleView post={post} />;
}
