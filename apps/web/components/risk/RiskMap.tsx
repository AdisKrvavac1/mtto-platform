'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { RiskSummary } from '@/lib/risk';
import { LS_STATUS, fireConfidence, fireTime, fmtTime, peakForecast } from '@/lib/risk';
import { createMap, esc, point, setGeoJSON, type Engine } from '@/lib/map';
import { ViewToggle } from '@/components/site/MapView';

const EFFIS_WMS = 'https://maps.effis.emergency.copernicus.eu/effis';
const FWI_LAYER = 'ecmwf007.fwi';

type LayerKey = 'fires' | 'fwi' | 'landslides' | 'reports' | 'rivers';
const LAYERS: { key: LayerKey; label: string; color: string; icon: string }[] = [
  { key: 'fires', label: 'Aktivna žarišta (NASA FIRMS)', color: '#ba1a1a', icon: 'local_fire_department' },
  { key: 'fwi', label: 'Opasnost od požara (EFFIS)', color: '#eb851c', icon: 'thermostat' },
  { key: 'landslides', label: 'Klizišta', color: '#7a4a1f', icon: 'landslide' },
  { key: 'reports', label: 'Prijave građana', color: '#234696', icon: 'campaign' },
  { key: 'rivers', label: 'Mjerne tačke rijeka', color: '#00abeb', icon: 'water' },
];

const pop = (kicker: string, color: string, title: string, body: string) =>
  `<div style="font-family:'Public Sans',system-ui;min-width:190px;max-width:260px"><div style="font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:${color}">${esc(kicker)}</div><div style="font-size:15px;font-weight:700;color:#002042;margin:2px 0 4px">${esc(title)}</div><div style="font-size:13px;color:#43474f;line-height:1.45">${body}</div></div>`;

type Row = { layer: LayerKey; kind: string; name: string; place: string; detail: string; when: string };
const VIS = (on: boolean) => (on ? 'visible' : 'none');
const LAYER_IDS: Record<Exclude<LayerKey, 'landslides'>, string> = { fires: 'r-fires', fwi: 'r-fwi', reports: 'r-reports', rivers: 'r-rivers' };

export default function RiskMap({ data, height = 560, dark = false }: { data: RiskSummary; height?: number; dark?: boolean }) {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const ml = useRef<any>(null);
  const markers = useRef<any[]>([]);
  const dataRef = useRef(data);
  dataRef.current = data;
  const [on, setOn] = useState<Record<LayerKey, boolean>>({ fires: true, fwi: true, landslides: true, reports: true, rivers: true });
  const onRef = useRef(on);
  onRef.current = on;
  const [ready, setReady] = useState(false);
  const [legendOk, setLegendOk] = useState(true);
  const [engine, setEngine] = useState<Engine | null>(null);
  const [view, setView] = useState<'karta' | 'tabela'>('karta');

  /** Slojevi iz podataka; poziva se na svaki 'style.load' (i nakon prelaska na rezervnu podlogu). */
  const overlays = useCallback((m: any) => {
    const d = dataRef.current, v = onRef.current;
    if (!m.getSource('r-fwi')) {
      m.addSource('r-fwi', { type: 'raster', tileSize: 256, attribution: 'Opasnost od požara: EFFIS / Copernicus EMS',
        tiles: [`${EFFIS_WMS}?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&LAYERS=${FWI_LAYER}&STYLES=&FORMAT=image/png&TRANSPARENT=true&SRS=EPSG:3857&WIDTH=256&HEIGHT=256&BBOX={bbox-epsg-3857}&TIME=${d.today || new Date().toISOString().slice(0, 10)}`] });
      m.addLayer({ id: 'r-fwi', type: 'raster', source: 'r-fwi', paint: { 'raster-opacity': 0.5 }, layout: { visibility: VIS(v.fwi) } });
    }
    setGeoJSON(m, 'r-fires', d.fires.items.map((f) => point(f.lng, f.lat, { frp: f.frp ?? 2, html: pop('Toplotna anomalija · satelit', '#ba1a1a', `Žarište ${fireTime(f)}`, `Pouzdanost: ${esc(fireConfidence(f.confidence))}<br/>Snaga (FRP): ${f.frp ?? '—'} MW<br/>Satelit: VIIRS ${esc(f.satellite)} · ${f.daynight === 'N' ? 'noć' : 'dan'}<br/><span style="color:#737780">Satelitska detekcija nije potvrđen požar.</span>`) })));
    setGeoJSON(m, 'r-reports', d.reports.filter((r) => r.lat != null && r.lng != null).map((r) => point(r.lng!, r.lat!, { html: pop(`Prijava građana · ${r.code}`, '#234696', r.kindLabel, `${r.photos?.[0] ? `<img src="${esc(r.photos[0])}" alt="" loading="lazy" style="display:block;width:100%;height:120px;object-fit:cover;border-radius:6px;margin:2px 0 8px"/>` : ''}${esc(r.municipality)}${r.location ? ` · ${esc(r.location)}` : ''}<br/>${esc(r.description.slice(0, 160))}${r.publicNote ? `<div style="margin-top:8px;padding:6px 8px;border-radius:6px;background:#eef4ff;color:#1e3a8a"><b>Ministarstvo:</b> ${esc(r.publicNote)}</div>` : ''}<span style="display:block;margin-top:6px;color:#737780">${fmtTime(r.createdAt)}</span>`) })));
    setGeoJSON(m, 'r-rivers', d.rivers.items.map((s) => { const q = s.discharge[s.todayIndex]; return point(s.lng, s.lat, { color: s.status === 'VISOKO' ? '#ba1a1a' : s.status === 'POVISENO' ? '#eb851c' : '#00abeb', html: pop('Model protoka · GloFAS', '#00abeb', s.name, `Danas: <b>${q != null ? Math.round(q) : '—'} m³/s</b><br/>Vrh prognoze (10 dana): ${peakForecast(s)} m³/s`) }); }));
    if (!m.getLayer('r-fires')) {
      m.addLayer({ id: 'r-fires', type: 'circle', source: 'r-fires', layout: { visibility: VIS(v.fires) }, paint: { 'circle-radius': ['+', 5, ['min', 10, ['/', ['get', 'frp'], 3]]], 'circle-color': '#ff5a36', 'circle-opacity': 0.85, 'circle-stroke-color': '#7f0000', 'circle-stroke-width': 1.5 } });
      m.addLayer({ id: 'r-reports', type: 'circle', source: 'r-reports', layout: { visibility: VIS(v.reports) }, paint: { 'circle-radius': 7, 'circle-color': '#234696', 'circle-stroke-color': '#fff', 'circle-stroke-width': 2 } });
      m.addLayer({ id: 'r-rivers', type: 'circle', source: 'r-rivers', layout: { visibility: VIS(v.rivers) }, paint: { 'circle-radius': 8, 'circle-color': ['get', 'color'], 'circle-stroke-color': '#fff', 'circle-stroke-width': 2 } });
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    if (!el.current) return;
    createMap(el.current, { dark, center: [17.82, 43.42], zoom: 8.3, onEngine: setEngine, label: 'Karta rizika Hercegovačko-neretvanskog kantona' }).then(({ ml: lib, map: m }) => {
      if (cancelled) { m.remove(); return; }
      map.current = m; ml.current = lib;
      m.on('style.load', () => overlays(m));
      for (const id of ['r-fires', 'r-reports', 'r-rivers']) {
        m.on('click', id, (e: any) => { const f = e.features?.[0]; if (f) new lib.Popup({ maxWidth: '280px' }).setLngLat(f.geometry.coordinates).setHTML(f.properties.html).addTo(m); });
        m.on('mouseenter', id, () => { m.getCanvas().style.cursor = 'pointer'; });
        m.on('mouseleave', id, () => { m.getCanvas().style.cursor = ''; });
      }
      setReady(true);
    });
    return () => { cancelled = true; markers.current.forEach((x) => x.remove()); markers.current = []; map.current?.remove(); map.current = null; };
  }, [dark, overlays]);

  // novi podaci → osvježi izvore; klizišta su HTML markeri (prežive promjenu podloge)
  useEffect(() => {
    const m = map.current, lib = ml.current;
    if (!ready || !m || !lib) return;
    if (m.isStyleLoaded()) overlays(m);
    markers.current.forEach((x) => x.remove());
    markers.current = data.landslides.map((l) => {
      const st = LS_STATUS[l.status] ?? LS_STATUS.PRACENJE;
      const div = document.createElement('button');
      div.type = 'button';
      div.setAttribute('aria-label', `Klizište: ${l.name}`);
      div.style.cssText = `width:26px;height:26px;border-radius:6px;background:${st.color};border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.35);display:flex;align-items:center;justify-content:center;cursor:pointer`;
      div.innerHTML = '<span class="material-symbols-outlined" style="font-size:16px;color:#fff">landslide</span>';
      const mk = new lib.Marker({ element: div }).setLngLat([l.lng, l.lat]).setPopup(new lib.Popup({ offset: 16, maxWidth: '280px' }).setHTML(pop(`Klizište · ${st.label}`, st.color, l.name, `${esc(l.municipality)} · rizik ${l.risk}/3<br/>${esc(l.description)}${l.isDemo ? '<br/><b style="color:#786000">DEMO zapis</b>' : ''}`)));
      if (onRef.current.landslides) mk.addTo(m);
      return mk;
    });
  }, [ready, data, overlays]);

  useEffect(() => {
    const m = map.current;
    if (!ready || !m) return;
    for (const [k, id] of Object.entries(LAYER_IDS)) if (m.getLayer(id)) m.setLayoutProperty(id, 'visibility', VIS(on[k as LayerKey]));
    markers.current.forEach((x) => (on.landslides ? x.addTo(m) : x.remove()));
  }, [on, ready]);

  useEffect(() => { if (view === 'karta') map.current?.resize(); }, [view]);

  const rows: Row[] = [
    ...(on.fires ? data.fires.items.map((f) => ({ layer: 'fires' as const, kind: 'Satelitsko žarište', name: `FRP ${f.frp ?? '—'} MW`, place: `${f.lat.toFixed(3)}° N, ${f.lng.toFixed(3)}° E`, detail: `Pouzdanost: ${fireConfidence(f.confidence)}`, when: fireTime(f) })) : []),
    ...(on.landslides ? data.landslides.map((l) => ({ layer: 'landslides' as const, kind: 'Klizište', name: l.name + (l.isDemo && !/primjer/i.test(l.name) ? ' (demo)' : ''), place: l.municipality, detail: `${LS_STATUS[l.status]?.label ?? l.status}, rizik ${l.risk}/3`, when: '' })) : []),
    ...(on.reports ? data.reports.map((r) => ({ layer: 'reports' as const, kind: 'Prijava građana', name: `${r.kindLabel} (${r.code})`, place: [r.municipality, r.location].filter(Boolean).join(', '), detail: r.publicNote || r.description.slice(0, 120), when: fmtTime(r.createdAt) })) : []),
    ...(on.rivers ? data.rivers.items.map((s) => ({ layer: 'rivers' as const, kind: 'Protok rijeke (model)', name: s.name, place: '', detail: `Danas ${Math.round(s.discharge[s.todayIndex] ?? 0)} m³/s, vrh prognoze ${peakForecast(s)} m³/s`, when: '' })) : []),
  ];

  const count: Record<LayerKey, number | null> = { fires: data.fires.items.length, fwi: null, landslides: data.landslides.length, reports: data.reports.filter((r) => r.lat != null).length, rivers: data.rivers.items.length };
  const chip = dark ? 'border-white/15 text-white' : 'border-[#c3c6d0] text-[#002042]';

  return (
    <div className={`rounded-[8px] overflow-hidden ${dark ? 'bg-[#0b1c30]' : 'bg-white shadow-[0px_1px_2px_rgba(0,0,0,0.05)]'}`}>
      <div className={`flex flex-wrap gap-[8px] p-[12px] md:p-[16px] ${dark ? 'border-b border-white/10' : 'border-b border-[#eff4ff]'}`} role="group" aria-label="Slojevi karte">
        {LAYERS.map((l) => (
          <button key={l.key} type="button" aria-pressed={on[l.key]} onClick={() => setOn((o) => ({ ...o, [l.key]: !o[l.key] }))}
            className={`inline-flex items-center gap-[6px] px-[10px] py-[6px] rounded-[4px] border font-pub font-semibold text-[13px] leading-[18px] transition-colors ${on[l.key] ? (dark ? 'bg-white/10 border-white/20 text-white' : 'bg-[#eff4ff] border-transparent text-[#002042]') : `${chip} opacity-60 line-through`}`}>
            <span aria-hidden className="material-symbols-outlined text-[16px]" style={{ color: l.color }}>{l.icon}</span>
            {l.label}
            {count[l.key] != null && <span className={`font-rmono text-[11px] ${dark ? 'text-white/60' : 'text-[#737780]'}`}>{count[l.key]}</span>}
          </button>
        ))}
        <span className="ml-auto"><ViewToggle view={view} onChange={setView} dark={dark} /></span>
      </div>
      {view === 'tabela' && (
        <div className="overflow-x-auto" style={{ maxHeight: height }}>
          <table className={`w-full min-w-[720px] text-left text-[14px] ${dark ? 'text-white' : 'text-[#002042]'}`}>
            <caption className="sr-only">Podaci prikazani na karti rizika</caption>
            <thead className={`sticky top-0 text-[12px] font-semibold ${dark ? 'bg-[#0b1c30] text-white/70' : 'bg-[#f8f9ff] text-[#43474f]'}`}><tr><th className="px-4 py-3">Vrsta</th><th className="px-4 py-3">Naziv</th><th className="px-4 py-3">Mjesto</th><th className="px-4 py-3">Detalji</th><th className="px-4 py-3">Vrijeme</th></tr></thead>
            <tbody className={`divide-y ${dark ? 'divide-white/10' : 'divide-[#eff4ff]'}`}>
              {rows.map((r, i) => <tr key={i}><td className="px-4 py-2.5 whitespace-nowrap"><span className="inline-flex items-center gap-1.5"><span aria-hidden className="size-2.5 rounded-full" style={{ background: LAYERS.find((l) => l.key === r.layer)!.color }} />{r.kind}</span></td><td className="px-4 py-2.5 font-semibold">{r.name}</td><td className="px-4 py-2.5">{r.place || '—'}</td><td className={`px-4 py-2.5 ${dark ? 'text-white/75' : 'text-[#43474f]'}`}>{r.detail}</td><td className="px-4 py-2.5 whitespace-nowrap">{r.when || '—'}</td></tr>)}
              {!rows.length && <tr><td colSpan={5} className="px-4 py-6">Nema podataka za odabrane slojeve.</td></tr>}
            </tbody>
          </table>
          {on.fwi && <p className={`px-4 py-3 text-[12px] ${dark ? 'text-white/60' : 'text-[#737780]'}`}>Indeks opasnosti od požara (EFFIS) postoji samo kao kartografski sloj.</p>}
        </div>
      )}
      <div className={`relative ${view === 'tabela' ? 'hidden' : ''}`}>
        <div ref={el} style={{ height }} className="w-full" data-engine={engine ?? ''} />
        {on.fwi && legendOk && (
          <div className="absolute left-[12px] bottom-[12px] z-[2] bg-white/95 rounded-[4px] shadow p-[8px] max-w-[220px]">
            <p className="font-pub font-bold text-[#002042] text-[11px] tracking-[0.44px] uppercase leading-[14px] mb-[4px]">Indeks opasnosti od požara (FWI)</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img alt="Legenda EFFIS FWI" className="max-w-full h-auto" onError={() => setLegendOk(false)}
              src={`${EFFIS_WMS}?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetLegendGraphic&LAYER=${FWI_LAYER}&FORMAT=image/png`} />
          </div>
        )}
      </div>
    </div>
  );
}
