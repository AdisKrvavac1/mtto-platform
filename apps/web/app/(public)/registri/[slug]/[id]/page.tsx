import { RegistryDossier } from '@/components/site/RegistryPublic';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Zapis iz javnog registra' };

export default async function EntryPage({ params }: { params: Promise<{ slug: string; id: string }> }) {
  const { slug, id } = await params;
  return <RegistryDossier slug={slug} id={id} />;
}
