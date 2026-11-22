// Tipovi i pomoćne funkcije modula Eko-rizik HNK (podaci dolaze iz /risk/summary).
export type Fire = { lat: number; lng: number; date: string; time: string; confidence: string; frp: number | null; satellite: string; daynight: string };
export type Warning = { region: string; event: string; level: number; color: string; type: string; onset: string; expires: string; headline: string; description: string; instruction: string };
export type River = { key: string; name: string; lat: number; lng: number; days: string[]; discharge: (number | null)[]; max: (number | null)[]; todayIndex: number; status: 'NORMALNO' | 'POVISENO' | 'VISOKO' | 'NEPOZNATO'; ratio: number | null };
export type Landslide = { id: string; name: string; municipality: string; lat: number; lng: number; status: 'AKTIVNO' | 'PRACENJE' | 'SANIRANO'; risk: number; description: string; source: string; isDemo: boolean; updatedAt: string };
export type PublicReport = { id: string; code: string; kind: string; kindLabel: string; municipality: string; location: string; lat: number | null; lng: number | null; description: string; status: string; createdAt: string };
type Feed<T> = { items: T[]; updatedAt: string; error: string | null };
export type RiskSummary = {
  generatedAt: string; today: string; level: 1 | 2 | 3;
  fires: Feed<Fire> & { last24h: number }; warnings: Feed<Warning>; rivers: Feed<River>;
  landslides: Landslide[]; reports: PublicReport[]; reportKinds: Record<string, string>;
};

export const EMPTY: RiskSummary = {
  generatedAt: new Date(0).toISOString(), today: '', level: 1,
  fires: { items: [], updatedAt: '', error: 'Podaci trenutno nisu dostupni', last24h: 0 },
  warnings: { items: [], updatedAt: '', error: 'Podaci trenutno nisu dostupni' },
  rivers: { items: [], updatedAt: '', error: 'Podaci trenutno nisu dostupni' },
  landslides: [], reports: [], reportKinds: {},
};

export const LEVEL = {
  1: { label: 'Uobičajeno stanje', short: 'Normalno', bg: 'bg-[#006c4a]', text: 'text-[#006c4a]', soft: 'bg-[#ecfdf5]', ring: 'ring-[#85f8c4]', icon: 'verified_user' },
  2: { label: 'Pojačan oprez', short: 'Oprez', bg: 'bg-[#eb851c]', text: 'text-[#8a4a00]', soft: 'bg-[#fffbeb]', ring: 'ring-[#fadc12]', icon: 'warning' },
  3: { label: 'Visok rizik', short: 'Visok rizik', bg: 'bg-[#ba1a1a]', text: 'text-[#ba1a1a]', soft: 'bg-[#ffdad6]', ring: 'ring-[#ffb4ab]', icon: 'emergency_home' },
} as const;

export const WARN_COLOR: Record<string, string> = { green: '#2e7d32', yellow: '#fadc12', orange: '#eb851c', red: '#ba1a1a' };
export const RIVER_STATUS: Record<River['status'], { label: string; cls: string }> = {
  NORMALNO: { label: 'Uobičajen protok', cls: 'bg-[#ecfdf5] text-[#006c4a]' },
  POVISENO: { label: 'Povišen protok', cls: 'bg-[#fffbeb] text-[#8a4a00]' },
  VISOKO: { label: 'Visok protok', cls: 'bg-[#ffdad6] text-[#ba1a1a]' },
  NEPOZNATO: { label: 'Nema podataka', cls: 'bg-[#eff4ff] text-[#43474f]' },
};
export const LS_STATUS: Record<Landslide['status'], { label: string; color: string; cls: string }> = {
  AKTIVNO: { label: 'Aktivno', color: '#ba1a1a', cls: 'bg-[#ffdad6] text-[#ba1a1a]' },
  PRACENJE: { label: 'U praćenju', color: '#eb851c', cls: 'bg-[#fffbeb] text-[#8a4a00]' },
  SANIRANO: { label: 'Sanirano', color: '#006c4a', cls: 'bg-[#ecfdf5] text-[#006c4a]' },
};
export const REPORT_STATUS: Record<string, string> = { NOVO: 'Zaprimljeno', U_OBRADI: 'U obradi', RIJESENO: 'Riješeno', ODBACENO: 'Odbačeno' };

export const fmtTime = (iso?: string) => {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  // numerički dijelovi su isti na serveru i u pregledniku (bez razlika u lokalizaciji → nema hydration greške)
  const p = Object.fromEntries(new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Sarajevo', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(d).map((x) => [x.type, x.value]));
  return `${p.day}.${p.month}. ${p.hour}:${p.minute}`;
};
/** FIRMS vrijeme je UTC "HHMM" */
export const fireTime = (f: Fire) => {
  const iso = `${f.date}T${f.time.padStart(4, '0').slice(0, 2)}:${f.time.padStart(4, '0').slice(2)}:00Z`;
  return fmtTime(iso);
};
export const fireConfidence = (c: string) => ({ l: 'niska', n: 'nominalna', h: 'visoka' } as Record<string, string>)[c.toLowerCase()] ?? (c ? `${c}%` : '—');
