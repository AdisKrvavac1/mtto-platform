/** Učitava Google Maps JavaScript API jednom po stranici. Odbija ako ključa nema, skripta ne stigne ili Google odbije ključ. */
export const GOOGLE_MAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || '';

let pending: Promise<void> | null = null;
const authListeners = new Set<() => void>();

/** Poziva se kad Google naknadno odbije ključ (npr. pogrešna ograničenja domene). */
export function onGoogleAuthFailure(fn: () => void) { authListeners.add(fn); return () => { authListeners.delete(fn); }; }

export function loadGoogleMaps(timeoutMs = 8000): Promise<void> {
  if (typeof window === 'undefined' || !GOOGLE_MAPS_KEY) return Promise.reject(new Error('no-key'));
  const w = window as any;
  if (w.google?.maps?.Map) return Promise.resolve();
  if (pending) return pending;
  w.gm_authFailure = () => authListeners.forEach((f) => f());
  pending = new Promise<void>((resolve, reject) => {
    const timer = window.setTimeout(() => { pending = null; reject(new Error('timeout')); }, timeoutMs);
    const s = document.createElement('script');
    s.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(GOOGLE_MAPS_KEY)}&language=bs&region=BA`;
    s.async = true;
    s.onload = () => { window.clearTimeout(timer); w.google?.maps?.Map ? resolve() : reject(new Error('no-maps')); };
    s.onerror = () => { window.clearTimeout(timer); pending = null; reject(new Error('load-failed')); };
    document.head.appendChild(s);
  });
  return pending;
}

/** Tamni stil Google karte za krizni prikaz. */
export const GOOGLE_DARK_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#0b1c30' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#8ea2c0' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0b1c30' }] },
  { featureType: 'administrative', elementType: 'geometry.stroke', stylers: [{ color: '#2c4566' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1c3352' }] },
  { featureType: 'road', elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#06243f' }] },
  { featureType: 'landscape.natural', elementType: 'geometry', stylers: [{ color: '#102742' }] },
];
