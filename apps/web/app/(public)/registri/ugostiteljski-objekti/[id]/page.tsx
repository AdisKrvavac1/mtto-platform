import { RegistryDossier } from '@/components/site/RegistryPublic';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Kategorizirani smještajni objekat' };

/** F2-13: dosje objekta iz registra kategoriziranih smještajnih objekata (registry builder). */
export default async function FacilityPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <RegistryDossier slug="ugostiteljski-objekti" id={id} />;
}
