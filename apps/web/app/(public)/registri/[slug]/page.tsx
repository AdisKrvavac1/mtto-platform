import { RegistryList, loadRegistry } from '@/components/site/RegistryPublic';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const r = await loadRegistry(slug);
  return { title: r.name, description: r.description };
}

export default async function RegistryPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<Record<string, string | undefined>> }) {
  const [{ slug }, sp] = await Promise.all([params, searchParams]);
  return <RegistryList slug={slug} sp={sp} />;
}
