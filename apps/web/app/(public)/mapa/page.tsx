import { apiSafe, type MapPoint } from '@/lib/api';
import { PageHero } from '@/components/site/ui';
import MapSection from '@/components/site/MapSection';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Interaktivna mapa' };

export default async function MapPage() {
  const points = await apiSafe<MapPoint[]>('/map', []);
  return (
    <>
      <PageHero kicker="Geoportal MTTO" title="Interaktivna mapa kantona" lead="Zaštićena područja, turističke lokacije, projekti Ministarstva i izdane okolišne dozvole. Slojeve uključujete i isključujete iznad mape." crumbs={[{ href: '/', label: 'Naslovna' }, { label: 'Interaktivna mapa' }]} />
      <section className="max-w-7xl mx-auto px-margin-mobile md:px-margin py-space-xl">
        <MapSection points={points} height={640} title={false} />
        <p className="mt-space-md font-body-sm text-body-sm text-on-surface-variant">Granice zaštićenih područja i službeni prostorni slojevi dodaju se u Fazi 2, nakon što Ministarstvo dostavi provjerene geografske podatke.</p>
      </section>
    </>
  );
}
