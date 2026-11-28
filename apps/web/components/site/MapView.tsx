'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { MapPoint } from '@/lib/api';
import { createMap, esc, type Engine } from '@/lib/map';

export const LAYERS: Record<MapPoint['layer'], { label: string; color: string; icon: string }> = {
  TURIZAM: { label: 'Turizam', color: '#00abeb', icon: 'travel_explore' },
  ZASTICENO: { label: 'Zaštićena područja', color: '#13693f', icon: 'forest' },
  DOZVOLA: { label: 'Okolišne dozvole', color: '#234696', icon: 'verified' },
  PROJEKT: { label: 'Projekti Ministarstva', color: '#eb851c', icon: 'flag' },
};

const CENTER: [number, number] = [17.8, 43.33];

function pinSvg(color: string) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="30" height="40" viewBox="0 0 30 40" aria-hidden="true"><path d="M15 0C6.7 0 0 6.6 0 14.8 0 26 15 40 15 40s15-14 15-25.2C30 6.6 23.3 0 15 0z" fill="${color}"/><circle cx="15" cy="15" r="6" fill="#fff"/></svg>`;
}

function popupHtml(p: MapPoint) {
  const l = LAYERS[p.layer];
  return `<div style="font-family:Public Sans,system-ui;min-width:200px;max-width:260px">
    <div style="font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:${l.color}">${esc(l.label)}</div>
    <div style="font-size:15px;font-weight:700;color:#002042;margin:2px 0 4px">${esc(p.name)}</div>
    <div style="font-size:13px;color:#43474f">${esc(p.description || '')}</div>
    ${p.link && /^(\/|https:\/\/)/.test(p.link) ? `<a href="${esc(p.link)}" style="display:inline-block;margin-top:6px;font-size:13px;font-weight:700;color:#234696">Detalji</a>` : ''}
  </div>`;
}

export default function MapView({ points, height = 520, compact = false, fill = false }: { points: MapPoint[]; height?: number; compact?: boolean; fill?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<Record<string, boolean>>({ TURIZAM: true, ZASTICENO: true, DOZVOLA: true, PROJEKT: true });
  const [selected, setSelected] = useState<MapPoint | null>(null);
  const [view, setView] = useState<'karta' | 'tabela'>('karta');
  const shown = useMemo(() => points.filter((p) => active[p.layer]), [points, active]);
  const mapRef = useRef<any>(null);
  const mlRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [engine, setEngine] = useState<Engine>('vector');
  const [tick, setTick] = useState(0);

  // inicijalizacija (MapLibre; rezerva OSM raster)
  useEffect(() => {
    let cancelled = false;
    if (!ref.current || mapRef.current) return;
    createMap(ref.current, { center: CENTER, zoom: 8.4, onEngine: setEngine, label: 'Karta lokacija Ministarstva' }).then(({ ml, map }) => {
      if (cancelled) { map.remove(); return; }
      mapRef.current = map; mlRef.current = ml;
      setTick((t) => t + 1);
    });
    return () => { cancelled = true; mapRef.current?.remove(); mapRef.current = null; };
  }, []);

  // markeri
  useEffect(() => {
    const map = mapRef.current, ml = mlRef.current;
    if (!map || !ml) return;
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];
    for (const p of shown) {
      const el = document.createElement('button');
      el.type = 'button';
      el.className = 'block cursor-pointer';
      el.setAttribute('aria-label', `${LAYERS[p.layer].label}: ${p.name}`);
      el.innerHTML = pinSvg(LAYERS[p.layer].color);
      const popup = new ml.Popup({ offset: 30, maxWidth: '280px' }).setHTML(popupHtml(p));
      const m = new ml.Marker({ element: el, anchor: 'bottom' }).setLngLat([p.lng, p.lat]).setPopup(popup).addTo(map);
      el.addEventListener('click', () => setSelected(p));
      markersRef.current.push(m);
    }
  }, [shown, tick]);

  useEffect(() => { if (view === 'karta') mapRef.current?.resize(); }, [view]);

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    points.forEach((p) => (c[p.layer] = (c[p.layer] || 0) + 1));
    return c;
  }, [points]);

  return (
    <div className={`bg-surface-container-lowest rounded-xl shadow-md overflow-hidden border border-slate-border ${fill ? 'flex h-full flex-col' : ''}`}>
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
        <span className="ml-auto font-label-badge text-label-badge text-on-surface-variant uppercase">{engine === 'vector' ? 'OpenStreetMap' : 'OpenStreetMap (rezerva)'} · {shown.length} lokacija</span>
        <ViewToggle view={view} onChange={setView} />
      </div>
      {view === 'tabela' && <PointsTable points={shown} />}
      <div className={`${view === 'tabela' ? 'hidden' : ''} ${compact ? '' : 'grid grid-cols-1 lg:grid-cols-12'} ${fill ? 'flex-1 min-h-[420px] flex flex-col' : ''}`}>
        <div ref={ref} style={fill ? undefined : { height }} className={`${compact ? 'w-full' : 'lg:col-span-8 w-full z-0'} ${fill ? 'flex-1 min-h-[420px]' : ''}`} />
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
                        map.flyTo({ center: [p.lng, p.lat], zoom: 12 });
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

/** Prebacivanje karta / tabela (tabela je pristupačna alternativa karti, F2-21). */
export function ViewToggle({ view, onChange, dark = false }: { view: 'karta' | 'tabela'; onChange: (v: 'karta' | 'tabela') => void; dark?: boolean }) {
  return (
    <div role="group" aria-label="Prikaz" className={`inline-flex rounded-lg p-0.5 ring-1 ring-inset ${dark ? 'ring-white/20' : 'ring-slate-border'}`}>
      {(['karta', 'tabela'] as const).map((v) => (
        <button key={v} type="button" aria-pressed={view === v} onClick={() => onChange(v)}
          className={`rounded-md px-3 py-1 text-[13px] font-semibold capitalize ${view === v ? (dark ? 'bg-white/15 text-white' : 'bg-surface-container-high text-primary') : dark ? 'text-white/70 hover:text-white' : 'text-on-surface-variant hover:text-primary'}`}>
          {v === 'karta' ? 'Karta' : 'Tabela'}
        </button>
      ))}
    </div>
  );
}

function PointsTable({ points }: { points: MapPoint[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-left text-[14px]">
        <caption className="sr-only">Lokacije prikazane na karti</caption>
        <thead className="bg-surface-container-low text-[12px] font-semibold text-on-surface-variant"><tr><th className="px-4 py-3">Naziv</th><th className="px-4 py-3">Sloj</th><th className="px-4 py-3">Opis</th><th className="px-4 py-3">Koordinate</th></tr></thead>
        <tbody className="divide-y divide-slate-border">
          {points.map((p) => (
            <tr key={`${p.layer}-${p.id}`}>
              <td className="px-4 py-3 font-semibold text-primary">{p.link && /^(\/|https:\/\/)/.test(p.link) ? <a href={p.link} className="underline underline-offset-2">{p.name}</a> : p.name}</td>
              <td className="px-4 py-3"><span className="inline-flex items-center gap-1.5"><span aria-hidden className="size-2.5 rounded-full" style={{ background: LAYERS[p.layer].color }} />{LAYERS[p.layer].label}</span></td>
              <td className="px-4 py-3 text-on-surface-variant">{p.description}</td>
              <td className="whitespace-nowrap px-4 py-3 tabular-nums text-on-surface-variant">{p.lat.toFixed(4)}° N, {p.lng.toFixed(4)}° E</td>
            </tr>
          ))}
          {!points.length && <tr><td colSpan={4} className="px-4 py-6 text-on-surface-variant">Nema lokacija za odabrane slojeve.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}
