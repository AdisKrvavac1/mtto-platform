'use client';
import { useEffect, useRef } from 'react';

/** Klik na mapu postavlja koordinate. Koristi Leaflet + OpenStreetMap (radi bez API ključa). */
export default function LocationPicker({ lat, lng, onChange, height = 260 }: { lat: number | null; lng: number | null; onChange: (lat: number, lng: number) => void; height?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const marker = useRef<any>(null);
  const cb = useRef(onChange);
  cb.current = onChange;

  useEffect(() => {
    let off = false;
    import('leaflet').then((L) => {
      if (off || !ref.current || map.current) return;
      const m = L.map(ref.current).setView([lat ?? 43.33, lng ?? 17.8], lat ? 12 : 9);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap', maxZoom: 18 }).addTo(m);
      const icon = L.divIcon({ className: '', html: '<div style="width:22px;height:22px;border-radius:50%;background:#234696;border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.35)"></div>', iconSize: [22, 22], iconAnchor: [11, 11] });
      m.on('click', (e: any) => {
        const { lat: la, lng: lo } = e.latlng;
        if (marker.current) marker.current.setLatLng(e.latlng);
        else marker.current = L.marker(e.latlng, { icon }).addTo(m);
        cb.current(Math.round(la * 1e5) / 1e5, Math.round(lo * 1e5) / 1e5);
      });
      if (lat && lng) marker.current = L.marker([lat, lng], { icon }).addTo(m);
      map.current = m;
      (map.current as any).__L = L;
      (map.current as any).__icon = icon;
    });
    return () => { off = true; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const m = map.current;
    if (!m || lat === null || lng === null) return;
    if (marker.current) marker.current.setLatLng([lat, lng]);
    else marker.current = m.__L.marker([lat, lng], { icon: m.__icon }).addTo(m);
  }, [lat, lng]);

  return (
    <div className="space-y-1">
      <div ref={ref} style={{ height }} className="rounded-lg border border-[#cbd5e1] overflow-hidden z-0" />
      <p className="font-body-sm text-[12px] text-on-surface-variant flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">touch_app</span>Kliknite na mapu da postavite lokaciju</p>
    </div>
  );
}
