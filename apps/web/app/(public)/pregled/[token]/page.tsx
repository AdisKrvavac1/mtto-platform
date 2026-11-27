// F2-02: pregled objave prije objavljivanja preko potpisanog linka iz CMS-a (važi 72 h, ne indeksira se).
import { notFound } from 'next/navigation';
import { api } from '@/lib/api';
import ArticleView, { type ArticlePost } from '@/components/site/ArticleView';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Pregled prije objave', robots: { index: false, follow: false } };

export default async function PreviewPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  let post: ArticlePost | null = null;
  try {
    post = await api<ArticlePost>(`/preview/${encodeURIComponent(token)}`, { cache: 'no-store' });
  } catch (e: any) {
    if (e.status === 404 || e.status === 400) notFound();
    throw e;
  }
  if (!post) notFound();
  return <ArticleView post={post} preview />;
}
