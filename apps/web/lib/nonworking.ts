// F2-11: kalendar neradnih dana u trgovini. Nedjelje su neradne po zakonu (računaju se),
// praznici i posebni dani dolaze iz registra „neradni-dani“ koji Ministarstvo vodi u CMS-u.
import { apiSafe } from './api';
import type { RegEntry } from './registry';

export type DayOff = { date: string; name: string; kind: 'Nedjelja' | 'Državni praznik' | 'Neradni dan' | 'Izmijenjeno radno vrijeme'; note?: string; confirmed?: boolean };

const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export async function holidays(): Promise<DayOff[]> {
  const r = await apiSafe<{ items: RegEntry[] }>('/registries/neradni-dani/entries?limit=500&sort=datum', { items: [] });
  return r.items.filter((e) => e.data.datum).map((e) => ({
    date: e.data.datum, name: e.data.naziv, kind: e.data.vrsta ?? 'Državni praznik', note: e.data.napomena, confirmed: !!e.data.potvrdjeno,
  }));
}

/** Neradni dani od danas do `days` dana unaprijed: sve nedjelje i dani iz registra, po datumu. */
export async function upcoming(days = 365, from = new Date()): Promise<DayOff[]> {
  const start = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const end = new Date(start); end.setDate(end.getDate() + days);
  const out: DayOff[] = (await holidays()).filter((h) => h.date >= iso(start) && h.date <= iso(end));
  const taken = new Set(out.map((h) => h.date));
  const d = new Date(start); d.setDate(d.getDate() + ((7 - d.getDay()) % 7));
  for (; d <= end; d.setDate(d.getDate() + 7)) if (!taken.has(iso(d))) out.push({ date: iso(d), name: 'Neradna nedjelja', kind: 'Nedjelja', confirmed: true });
  return out.sort((a, b) => a.date.localeCompare(b.date));
}
