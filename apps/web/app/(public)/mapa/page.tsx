import { apiSafe, type MapPoint } from '@/lib/api';
import { Container, PageHero } from '@/components/uui';
import MapSection from '@/components/site/MapSection';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Interaktivna mapa' };

export default async function MapPage() {
  const points = await apiSafe<MapPoint[]>('/map', []);
  const n = (k: string) => String(points.filter((p) => p.layer === k).length);
  return (
    <>
      <PageHero crumbs={[{ label: 'Naslovna', href: '/' }, { label: 'Interaktivna mapa' }]} eyebrow="Geoportal MTTO" title="Interaktivna mapa kantona"
        stats={[{ label: 'Lokacija na karti', value: String(points.length) }, { label: 'Turističke lokacije', value: n('TURIZAM') }, { label: 'Zaštićena područja', value: n('ZASTICENO') }, { label: 'Okolišne dozvole', value: n('DOZVOLA') }]}>
        Zaštićena područja, turističke lokacije, projekti Ministarstva i izdane okolišne dozvole. Slojeve uključujete i isključujete iznad mape.
      </PageHero>
      <section className="bg-white py-12 md:py-16">
        <Container>
          <MapSection points={points} height={640} title={false} />
          <p className="mt-4 text-[14px] text-[#525252]">Granice zaštićenih područja i službeni prostorni slojevi dodaju se u Fazi 2, nakon što Ministarstvo dostavi provjerene geografske podatke.</p>
        </Container>
      </section>
    </>
  );
}
