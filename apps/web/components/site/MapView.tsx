'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { MapPoint } from '@/lib/api';

export const LAYERS: Record<MapPoint['layer'], { label: string; color: string; icon: string }> = {
  TURIZAM: { label: 'Turizam', color: '#00abeb', icon: 'travel_explore' },
  ZASTICENO: { label: 'Zaštićena područja', color: '#13693f', icon: 'forest' },
  DOZVOLA: { label: 'Okolišne dozvole', color: '#234696', icon: 'verified' },
  PROJEKT: { label: 'Projekti Ministarstva', color: '#eb851c', icon: 'flag' },
};

const GOOGLE_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;
const CENTER = { lat: 43.33, lng: 17.8 };

function pinSvg(color: string) {
  return `data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="30" height="40" viewBox="0 0 30 40"><path d="M15 0C6.7 0 0 6.6 0 14.8 0 26 15 40 15 40s15-14 15-25.2C30 6.6 23.3 0 15 0z" fill="${color}"/><circle cx="15" cy="15" r="6" fill="#fff"/></svg>`)}`;
}

function popupHtml(p: MapPoint) {
  const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]!));
  const l = LAYERS[p.layer];
  return `<div style="font-family:Public Sans,system-ui;min-width:200px;max-width:260px">
    <div style="font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:${l.color}">${l.label}</div>
    <div style="font-size:15px;font-weight:700;color:#002042;margin:2px 0 4px">${esc(p.name)}</div>
    <div style="font-size:13px;color:#43474f">${esc(p.description || '')}</div>
    ${p.link ? `<a href="${esc(p.link)}" style="display:inline-block;margin-top:6px;font-size:13px;font-weight:700;color:#234696">Detalji →</a>` : ''}
  </div>`;
}

export default function MapView({ points, height = 520, compact = false }: { points: MapPoint[]; height?: number; compact?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<Record<string, boolean>>({ TURIZAM: true, ZASTICENO: true, DOZVOLA: true, PROJEKT: true });
  const [selected, setSelected] = useState<MapPoint | null>(null);
  const shown = useMemo(() => points.filter((p) => active[p.layer]), [points, active]);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const engine = GOOGLE_KEY ? 'google' : 'leaflet';
  const [tick, setTick] = useState(0);

  // inicijalizacija
  useEffect(() => {
    let cancelled = false;
    if (!ref.current || mapRef.current) return;
    if (engine === 'google') {
      const init = () => {
        if (cancelled || !ref.current) return;
        const g = (window as any).google;
        mapRef.current = new g.maps.Map(ref.current, { center: CENTER, zoom: 9, mapTypeControl: false, streetViewControl: false, fullscreenControl: true });
        mapRef.current.__info = new g.maps.InfoWindow();
        setTick((t) => t + 1);
      };
      if ((window as any).google?.maps) init();
      else {
        const s = document.createElement('script');
        s.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_KEY}&language=bs&region=BA`;
        s.async = true;
        s.onload = init;
        document.head.appendChild(s);
      }
    } else {
      import('leaflet').then((L) => {
        if (cancelled || !ref.current) return;
        const map = L.map(ref.current, { scrollWheelZoom: false }).setView([CENTER.lat, CENTER.lng], 9);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap', maxZoom: 18 }).addTo(map);
        mapRef.current = map;
        mapRef.current.__L = L;
        setTick((t) => t + 1);
      });
    }
    return () => {
      cancelled = true;
    };
  }, [engine]);

  // markeri
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    markersRef.current.forEach((m) => (engine === 'google' ? m.setMap(null) : m.remove()));
    markersRef.current = [];
    for (const p of shown) {
      const color = LAYERS[p.layer].color;
      if (engine === 'google') {
        const g = (window as any).google;
        const m = new g.maps.Marker({ position: { lat: p.lat, lng: p.lng }, map, title: p.name, icon: { url: pinSvg(color), scaledSize: new g.maps.Size(30, 40) } });
        m.addListener('click', () => {
          map.__info.setContent(popupHtml(p));
          map.__info.open({ anchor: m, map });
          setSelected(p);
        });
        markersRef.current.push(m);
      } else {
        const L = map.__L;
        const icon = L.icon({ iconUrl: pinSvg(color), iconSize: [30, 40], iconAnchor: [15, 40], popupAnchor: [0, -34] });
        const m = L.marker([p.lat, p.lng], { icon, title: p.name }).addTo(map).bindPopup(popupHtml(p));
        m.on('click', () => setSelected(p));
        markersRef.current.push(m);
      }
    }
  }, [shown, tick, engine]);

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    points.forEach((p) => (c[p.layer] = (c[p.layer] || 0) + 1));
    return c;
  }, [points]);

  return (
    <div className="bg-surface-container-lowest rounded-xl shadow-md overflow-hidden border border-slate-border">
      <div className="flex flex-wrap items-center gap-space-xs p-space-md border-b border-slate-border">
        {(Object.keys(LAYERS) as MapPoint['layer'][]).map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => setActive((a) => ({ ...a, [k]: !a[k] }))}
            aria-pressed={active[k]}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-button text-button border transition-colors ${active[k] ? 'bg-surface-container-high text-primary border-transparent' : 'bg-transparent text-outline border-slate-border line-through'}`}
          >
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: LAYERS[k].color }} />
            {LAYERS[k].label}
            <span className="font-label-badge text-label-badge text-on-surface-variant">{counts[k] || 0}</span>
          </button>
        ))}
        <span className="ml-auto font-label-badge text-label-badge text-on-surface-variant uppercase">{engine === 'google' ? 'Google Maps' : 'OpenStreetMap'} · {shown.length} lokacija</span>
      </div>
      <div className={compact ? '' : 'grid grid-cols-1 lg:grid-cols-12'}>
        <div ref={ref} style={{ height }} className={compact ? 'w-full' : 'lg:col-span-8 w-full z-0'} />
        {!compact && (
          <aside className="lg:col-span-4 border-t lg:border-t-0 lg:border-l border-slate-border p-space-md overflow-y-auto" style={{ maxHeight: height }}>
            {selected ? (
              <div className="space-y-space-sm">
                <span className="font-label-kicker text-label-kicker uppercase tracking-wider" style={{ color: LAYERS[selected.layer].color }}>{LAYERS[selected.layer].label}</span>
                <h3 className="font-headline-sm text-headline-sm font-bold text-primary">{selected.name}</h3>
                <p className="font-body-sm text-body-sm text-text-body">{selected.description}</p>
                <p className="font-label-badge text-label-badge text-on-surface-variant">{selected.lat.toFixed(4)}° N, {selected.lng.toFixed(4)}° E</p>
                {selected.link && (
                  <a href={selected.link} className="inline-flex items-center gap-space-xs px-space-md py-2 rounded-lg bg-primary-container text-on-primary font-button text-button">
                    Otvori detalje<span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </a>
                )}
                <button type="button" onClick={() => setSelected(null)} className="block font-button text-button text-on-surface-variant hover:text-primary">← Sve lokacije</button>
              </div>
            ) : (
              <ul className="space-y-space-xs">
                <li className="font-label-kicker text-label-kicker uppercase tracking-wider text-on-surface-variant pb-space-xs">Kliknite na pin ili lokaciju</li>
                {shown.map((p) => (
                  <li key={`${p.layer}-${p.id}`}>
                    <button
                      type="button"
                      onClick={() => {
                        setSelected(p);
                        const map = mapRef.current;
                        if (!map) return;
                        if (engine === 'google') map.panTo({ lat: p.lat, lng: p.lng });
                        else map.setView([p.lat, p.lng], 12);
                      }}
                      className="w-full text-left flex items-start gap-space-sm p-space-sm rounded-lg hover:bg-surface-container-low"
                    >
                      <span className="mt-1.5 w-2.5 h-2.5 rounded-full shrink-0" style={{ background: LAYERS[p.layer].color }} />
                      <span>
                        <span className="block font-title-md text-[14px] font-bold text-primary leading-snug">{p.name}</span>
                        <span className="block font-body-sm text-body-sm text-on-surface-variant line-clamp-1">{p.description}</span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </aside>
        )}
      </div>
    </div>
  );
}
