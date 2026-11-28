'use client';
/**
 * F2-21: sve karte portala i CMS-a na MapLibre GL.
 * Podloga: OpenFreeMap vektorske karte (OpenStreetMap podaci, bez ključa i naplate). Ako stil ne stigne
 * za 8 s ili javi grešku prije prvog prikaza, karta prelazi na rasterske pločice OpenStreetMap-a
 * (za tamni krizni prikaz CARTO dark). Slojevi se dodaju na svaki 'style.load', pa prežive promjenu podloge.
 */
import type { Map as MLMap, StyleSpecification } from 'maplibre-gl';

export type MapLib = typeof import('maplibre-gl');
export type Engine = 'vector' | 'raster';
/** [lng, lat] */
export const HNK_CENTER: [number, number] = [17.8, 43.33];

const VECTOR = { light: 'https://tiles.openfreemap.org/styles/liberty', dark: 'https://tiles.openfreemap.org/styles/dark' };
const ATTR_OSM = '© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>';

export function rasterStyle(dark = false): StyleSpecification {
  return {
    version: 8,
    sources: {
      osm: dark
        ? { type: 'raster', tiles: ['a', 'b', 'c'].map((s) => `https://${s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png`), tileSize: 256, maxzoom: 19, attribution: `${ATTR_OSM} © CARTO` }
        : { type: 'raster', tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'], tileSize: 256, maxzoom: 19, attribution: ATTR_OSM },
    },
    layers: [{ id: 'osm', type: 'raster', source: 'osm' }],
  };
}

let lib: Promise<MapLib> | null = null;
export function loadMapLib(): Promise<MapLib> {
  lib ??= import('maplibre-gl').then((m) => {
    const ml = ((m as any).default ?? m) as MapLib;
    ml.setWorkerUrl(`/vendor/maplibre-gl-worker-${ml.getVersion()}.mjs`);
    return ml;
  });
  return lib;
}

export type CreateOptions = { center?: [number, number]; zoom?: number; dark?: boolean; scrollZoom?: boolean; onEngine?: (e: Engine) => void; label?: string };

/** Karta s rezervnom podlogom. Vraća null ako je komponenta u međuvremenu uklonjena. */
export async function createMap(el: HTMLElement, o: CreateOptions = {}): Promise<{ ml: MapLib; map: MLMap }> {
  const ml = await loadMapLib();
  const map = new ml.Map({
    container: el, style: VECTOR[o.dark ? 'dark' : 'light'], center: o.center ?? HNK_CENTER, zoom: o.zoom ?? 8.4,
    scrollZoom: o.scrollZoom ?? false, attributionControl: { compact: true }, maxZoom: 18, dragRotate: false, pitchWithRotate: false,
  });
  map.touchZoomRotate.disableRotation();
  map.addControl(new ml.NavigationControl({ showCompass: false }), 'top-right');
  map.getCanvas().setAttribute('aria-label', o.label ?? 'Karta Hercegovačko-neretvanskog kantona');
  let shown = false;
  let engine: Engine = 'vector';
  o.onEngine?.(engine);
  const fallback = (why: string) => {
    if (shown || engine === 'raster') return;
    engine = 'raster';
    console.warn(`[karta] vektorska podloga nije dostupna (${why}); koristi se OpenStreetMap raster`);
    map.setStyle(rasterStyle(o.dark));
    o.onEngine?.(engine);
  };
  const timer = window.setTimeout(() => fallback('isteklo vrijeme'), 8000);
  map.once('load', () => { shown = true; window.clearTimeout(timer); });
  map.on('error', (e: any) => { if (!shown) fallback(e?.error?.message ?? 'greška'); });
  return { ml, map };
}

export const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));

/** Dodaje ili zamjenjuje GeoJSON izvor. */
export function setGeoJSON(map: MLMap, id: string, features: GeoJSON.Feature[]) {
  const data: GeoJSON.FeatureCollection = { type: 'FeatureCollection', features };
  const src = map.getSource(id) as any;
  if (src) src.setData(data); else map.addSource(id, { type: 'geojson', data });
}
export const point = (lng: number, lat: number, properties: Record<string, unknown>): GeoJSON.Feature => ({ type: 'Feature', geometry: { type: 'Point', coordinates: [lng, lat] }, properties });

/**
 * Karta u vlastitom podelementu domaćina. React (StrictMode, ponovno montiranje) može pokrenuti efekat dvaput;
 * svaka karta tada ima svoj element, pa uklanjanje jedne ne kvari drugu. Vraća funkciju za čišćenje.
 */
export function mountMap(host: HTMLElement, o: CreateOptions, onReady: (r: { ml: MapLib; map: MLMap }) => void): () => void {
  let off = false;
  let map: MLMap | null = null;
  const node = document.createElement('div');
  node.style.cssText = 'position:absolute;inset:0';
  if (getComputedStyle(host).position === 'static') host.style.position = 'relative';
  host.appendChild(node);
  createMap(node, o).then((r) => {
    if (off) { r.map.remove(); return; }
    map = r.map;
    onReady(r);
  });
  return () => { off = true; map?.remove(); node.remove(); };
}
