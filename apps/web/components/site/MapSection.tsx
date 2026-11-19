'use client';
import dynamic from 'next/dynamic';
import type { MapPoint } from '@/lib/api';

const MapView = dynamic(() => import('./MapView'), {
  ssr: false,
  loading: () => <div className="h-[520px] rounded-xl bg-surface-container-low animate-pulse" />,
});

export default function MapSection({ points, height = 520, compact = false, title = true }: { points: MapPoint[]; height?: number; compact?: boolean; title?: boolean }) {
  return (
    <div className="space-y-space-md">
      {title && (
        <div className="flex flex-wrap items-center justify-between gap-space-sm">
          <div className="flex items-center gap-space-sm">
            <span className="w-10 h-10 rounded-lg bg-primary text-on-primary flex items-center justify-center"><span className="material-symbols-outlined">map</span></span>
            <div>
              <h3 className="font-headline-sm text-headline-sm font-bold text-primary">Interaktivna mapa kantona</h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">Lokacije se unose u CMS-u i odmah pojavljuju na mapi</p>
            </div>
          </div>
        </div>
      )}
      <MapView points={points} height={height} compact={compact} />
    </div>
  );
}
