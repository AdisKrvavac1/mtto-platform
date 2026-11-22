import MapSection from '@/components/site/MapSection';
import { OnamaBody } from '@/components/figma/Onama';
import type { MapPoint } from '@/lib/api';

export const metadata = { title: 'O nama i kontakti' };

const HQ: MapPoint = { id: 'mtto-hq', layer: 'PROJEKT', name: 'Ministarstvo trgovine, turizma i zaštite okoliša HNK', description: 'Braće Fejića bb, 88000 Mostar · +387 36 551 823', lat: 43.3436, lng: 17.8128, link: null };

export default function ONamaPage() {
  return <OnamaBody map={<MapSection points={[HQ]} compact title={false} height={600} />} />;
}
