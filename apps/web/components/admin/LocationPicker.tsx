'use client';
import { MarkerPin02 } from '@untitledui/icons';
import { useEffect, useRef, useState } from 'react';
import { createMap } from '@/lib/map';

/** Klik na kartu postavlja koordinate (MapLibre, OpenStreetMap). Koordinate se mogu upisati i ručno. */
export default function LocationPicker({ lat, lng, onChange, height = 260 }: { lat: number | null; lng: number | null; onChange: (lat: number, lng: number) => void; height?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const ml = useRef<any>(null);
  const marker = useRef<any>(null);
  const cb = useRef(onChange);
  cb.current = onChange;
  const [ready, setReady] = useState(false);

  const place = (la: number, lo: number) => {
    if (!map.current || !ml.current) return;
    if (marker.current) { marker.current.setLngLat([lo, la]); return; }
    const el = document.createElement('div');
    el.style.cssText = 'width:22px;height:22px;border-radius:50%;background:#7f56d9;border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.35)';
    marker.current = new ml.current.Marker({ element: el, draggable: true }).setLngLat([lo, la]).addTo(map.current);
    marker.current.on('dragend', () => { const p = marker.current.getLngLat(); cb.current(Math.round(p.lat * 1e5) / 1e5, Math.round(p.lng * 1e5) / 1e5); });
  };

  useEffect(() => {
    let off = false;
    if (!ref.current) return;
    createMap(ref.current, { center: [lng ?? 17.8, lat ?? 43.33], zoom: lat ? 12 : 8.4, scrollZoom: true, label: 'Karta za odabir lokacije' }).then((r) => {
      if (off) { r.map.remove(); return; }
      map.current = r.map; ml.current = r.ml;
      r.map.getCanvas().style.cursor = 'crosshair';
      r.map.on('click', (e: any) => {
        const la = Math.round(e.lngLat.lat * 1e5) / 1e5, lo = Math.round(e.lngLat.lng * 1e5) / 1e5;
        place(la, lo);
        cb.current(la, lo);
      });
      if (lat != null && lng != null) place(lat, lng);
      setReady(true);
    });
    return () => { off = true; map.current?.remove(); map.current = null; marker.current = null; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { if (ready && lat != null && lng != null) place(lat, lng); }, [lat, lng, ready]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="space-y-1">
      <div ref={ref} style={{ height }} className="rounded-[8px] ring-1 ring-inset ring-[#e5e5e5] overflow-hidden" />
      <p className="flex items-center gap-1.5 text-[14px] text-[#525252]"><MarkerPin02 size={16} className="text-[#a3a3a3]" />Kliknite na kartu da postavite lokaciju; tačku možete i povući.</p>
    </div>
  );
}
