'use client';
import { useEffect, useRef, useState } from 'react';
import type { RiskSummary } from '@/lib/risk';
import { LS_STATUS, fireConfidence, fireTime, fmtTime, peakForecast } from '@/lib/risk';
import { GOOGLE_DARK_STYLE, GOOGLE_MAPS_KEY, loadGoogleMaps, onGoogleAuthFailure } from '@/lib/googleMaps';

const CENTER: [number, number] = [43.42, 17.82];
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

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]!));
const pop = (kicker: string, color: string, title: string, body: string) =>
  `<div style="font-family:'Public Sans',system-ui;min-width:190px;max-width:260px"><div style="font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:${color}">${esc(kicker)}</div><div style="font-size:15px;font-weight:700;color:#002042;margin:2px 0 4px">${esc(title)}</div><div style="font-size:13px;color:#43474f;line-height:1.45">${body}</div></div>`;

export default function RiskMap({ data, height = 560, dark = false }: { data: RiskSummary; height?: number; dark?: boolean }) {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const groups = useRef<Partial<Record<LayerKey, any>>>({});
  const [on, setOn] = useState<Record<LayerKey, boolean>>({ fires: true, fwi: true, landslides: true, reports: true, rivers: true });
  const [ready, setReady] = useState(false);
  const [legendOk, setLegendOk] = useState(true);
  const [engine, setEngine] = useState<'google' | 'osm' | null>(null);

  useEffect(() => {
    let cancelled = false;
    let unsubAuth: (() => void) | undefined;
    import('leaflet').then((L) => {
      if (cancelled || !el.current || map.current) return;
      const m = L.map(el.current, { scrollWheelZoom: false, zoomControl: true }).setView(CENTER, 9);
      // Podloga: Google Maps kad ključ radi, inače OpenStreetMap (CARTO dark za krizni prikaz).
      const osm = () => L.tileLayer(dark ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png' : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: dark ? '© OpenStreetMap © CARTO' : '© OpenStreetMap', maxZoom: 18,
      });
      // Odmah OpenStreetMap, a kad Google stigne (i ako ključ radi) podloga se zamijeni Google kartom.
      let base: any = osm().addTo(m);
      base.bringToBack();
      setEngine('osm');
      const useOsm = () => { if (cancelled) return; if (base?._isGoogle) { m.removeLayer(base); base = osm().addTo(m); base.bringToBack(); } setEngine('osm'); };
      if (GOOGLE_MAPS_KEY) {
        unsubAuth = onGoogleAuthFailure(useOsm);
        // Plugin očekuje globalni L (window.L); bez njega import pada.
        (window as any).L = (window as any).L || L;
        Promise.all([loadGoogleMaps(), import('leaflet.gridlayer.googlemutant')])
          .then(([, mod]) => {
            if (cancelled) return;
            const w = window as any;
            const md = mod as any;
            // Dev build koristi ES modul (default export), produkcijski build dist verziju koja klasu stavlja na exports.L.GridLayer.
            const GoogleMutant = [md?.default, md?.default?.GoogleMutant, md?.L?.GridLayer?.GoogleMutant, md?.default?.L?.GridLayer?.GoogleMutant, (L as any).GridLayer?.GoogleMutant, w.L?.GridLayer?.GoogleMutant].find((c) => typeof c === 'function');
            if (!GoogleMutant) throw new Error('GoogleMutant nije učitan');
            const g = new GoogleMutant({ type: 'roadmap', maxZoom: 18, styles: dark ? GOOGLE_DARK_STYLE : [] });
            g._isGoogle = true;
            g.addTo(m); g.bringToBack();
            const old = base; base = g;
            // stara podloga se skida tek kad Google iscrta prve pločice, da karta nikad ne ostane prazna
            g.once?.('load', () => { if (old && m.hasLayer(old)) m.removeLayer(old); });
            window.setTimeout(() => { if (old && m.hasLayer(old)) m.removeLayer(old); }, 2500);
            setEngine('google');
          })
          .catch((e) => { console.warn('[karta] Google podloga nije dostupna, koristi se OpenStreetMap:', e?.message || e); useOsm(); });
      }
      (m as any).__L = L;
      map.current = m;
      setReady(true);
    });
    return () => { cancelled = true; unsubAuth?.(); map.current?.remove(); map.current = null; };
  }, [dark]);

  useEffect(() => {
    const m = map.current;
    if (!ready || !m) return;
    const L = m.__L;
    Object.values(groups.current).forEach((g) => g?.remove());
    groups.current = {};

    // EFFIS – indeks opasnosti od požara (FWI), prognoza za danas
    groups.current.fwi = L.tileLayer.wms(EFFIS_WMS, {
      layers: FWI_LAYER, format: 'image/png', transparent: true, opacity: 0.5, version: '1.1.1',
      time: data.today || new Date().toISOString().slice(0, 10), attribution: 'Opasnost od požara: EFFIS / Copernicus EMS',
    });

    const fires = L.layerGroup();
    for (const f of data.fires.items) {
      const r = 5 + Math.min(10, (f.frp ?? 2) / 3);
      L.circleMarker([f.lat, f.lng], { radius: r, color: '#7f0000', weight: 1.5, fillColor: '#ff5a36', fillOpacity: 0.85 })
        .bindPopup(pop('Toplotna anomalija · satelit', '#ba1a1a', `Žarište ${fireTime(f)}`, `Pouzdanost: ${esc(fireConfidence(f.confidence))}<br/>Snaga (FRP): ${f.frp ?? '—'} MW<br/>Satelit: VIIRS ${esc(f.satellite)} · ${f.daynight === 'N' ? 'noć' : 'dan'}<br/><span style="color:#737780">Satelitska detekcija nije potvrđen požar.</span>`))
        .addTo(fires);
    }
    groups.current.fires = fires;

    const ls = L.layerGroup();
    for (const l of data.landslides) {
      const st = LS_STATUS[l.status] ?? LS_STATUS.PRACENJE;
      L.marker([l.lat, l.lng], {
        icon: L.divIcon({ className: '', iconSize: [26, 26], iconAnchor: [13, 13], html: `<div style="width:26px;height:26px;border-radius:6px;background:${st.color};border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.35);display:flex;align-items:center;justify-content:center"><span class="material-symbols-outlined" style="font-size:16px;color:#fff">landslide</span></div>` }),
        title: l.name,
      }).bindPopup(pop(`Klizište · ${st.label}`, st.color, l.name, `${esc(l.municipality)} · rizik ${l.risk}/3<br/>${esc(l.description)}${l.isDemo ? '<br/><b style="color:#786000">DEMO zapis</b>' : ''}`)).addTo(ls);
    }
    groups.current.landslides = ls;

    const rp = L.layerGroup();
    for (const r of data.reports) {
      if (r.lat == null || r.lng == null) continue;
      L.circleMarker([r.lat, r.lng], { radius: 7, color: '#fff', weight: 2, fillColor: '#234696', fillOpacity: 0.95 })
        .bindPopup(pop(`Prijava građana · ${r.code}`, '#234696', r.kindLabel, `${r.photos?.[0] ? `<img src="${esc(r.photos[0])}" alt="" loading="lazy" style="display:block;width:100%;height:120px;object-fit:cover;border-radius:6px;margin:2px 0 8px"/>` : ''}${esc(r.municipality)}${r.location ? ` · ${esc(r.location)}` : ''}<br/>${esc(r.description.slice(0, 160))}${r.publicNote ? `<div style="margin-top:8px;padding:6px 8px;border-radius:6px;background:#eef4ff;color:#1e3a8a"><b>Ministarstvo:</b> ${esc(r.publicNote)}</div>` : ''}<span style="display:block;margin-top:6px;color:#737780">${fmtTime(r.createdAt)}</span>`), { maxWidth: 260 })
        .addTo(rp);
    }
    groups.current.reports = rp;

    const rv = L.layerGroup();
    for (const s of data.rivers.items) {
      const q = s.discharge[s.todayIndex];
      L.circleMarker([s.lat, s.lng], { radius: 8, color: '#fff', weight: 2, fillColor: s.status === 'VISOKO' ? '#ba1a1a' : s.status === 'POVISENO' ? '#eb851c' : '#00abeb', fillOpacity: 1 })
        .bindPopup(pop('Model protoka · GloFAS', '#00abeb', s.name, `Danas: <b>${q != null ? Math.round(q) : '—'} m³/s</b><br/>Vrh prognoze (10 dana): ${peakForecast(s)} m³/s`))
        .addTo(rv);
    }
    groups.current.rivers = rv;

    (Object.keys(groups.current) as LayerKey[]).forEach((k) => on[k] && groups.current[k]?.addTo(m));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, data]);

  useEffect(() => {
    const m = map.current;
    if (!ready || !m) return;
    (Object.keys(groups.current) as LayerKey[]).forEach((k) => {
      const g = groups.current[k];
      if (!g) return;
      if (on[k] && !m.hasLayer(g)) g.addTo(m);
      if (!on[k] && m.hasLayer(g)) g.remove();
    });
  }, [on, ready]);

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
      </div>
      <div className="relative">
        <div ref={el} style={{ height }} className="w-full z-0" aria-label="Karta rizika Hercegovačko-neretvanskog kantona" data-engine={engine ?? ''} />
        {on.fwi && legendOk && (
          <div className="absolute left-[12px] bottom-[12px] z-[400] bg-white/95 rounded-[4px] shadow p-[8px] max-w-[220px]">
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
