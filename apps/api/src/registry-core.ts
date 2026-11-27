/**
 * F2-04: jezgro registry buildera – shema polja, provjera zapisa, CSV uvoz i izvoz.
 * Bez NestJS zavisnosti, da se može testirati samostalno.
 */

export const FIELD_TYPES = ['text', 'longtext', 'number', 'integer', 'date', 'select', 'boolean', 'url', 'email'] as const;
export type FieldType = (typeof FIELD_TYPES)[number];
export const FIELD_TYPE_LABELS: Record<FieldType, string> = {
  text: 'Kratki tekst', longtext: 'Duži tekst', number: 'Broj', integer: 'Cijeli broj', date: 'Datum',
  select: 'Izbor s liste', boolean: 'Da / ne', url: 'Web adresa', email: 'E-mail',
};

export type Field = {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: string[];
  /** prikazuje se javno (portal, javni API, javni CSV) */
  public?: boolean;
  /** javni filter (izbor s liste, da/ne) */
  filter?: boolean;
  /** ulazi u pretragu po pojmu */
  search?: boolean;
  /** vrijednost se ne smije ponoviti (npr. broj rješenja); koristi se i za ažuriranje pri uvozu */
  unique?: boolean;
  /** kolona u tabeli */
  list?: boolean;
  help?: string;
};

export type FieldError = { field: string; label: string; message: string };

const RESERVED = new Set(['id', 'lat', 'lng', 'status', 'createdat', 'updatedat', 'isdemo']);
const KEY_RE = /^[a-z][a-zA-Z0-9_]{0,39}$/;
export const MAX_FIELDS = 40;

export class SchemaError extends Error {}

/** Provjera i čišćenje sheme iz buildera. Baca SchemaError s porukom za korisnika. */
export function normalizeFields(raw: unknown): Field[] {
  if (!Array.isArray(raw) || raw.length === 0) throw new SchemaError('Registar mora imati barem jedno polje.');
  if (raw.length > MAX_FIELDS) throw new SchemaError(`Registar može imati najviše ${MAX_FIELDS} polja.`);
  const seen = new Set<string>();
  return raw.map((r: any, i) => {
    const label = String(r?.label ?? '').trim().slice(0, 80);
    if (!label) throw new SchemaError(`Polje ${i + 1}: unesite naziv.`);
    const key = String(r?.key ?? '').trim() || keyFromLabel(label);
    if (!KEY_RE.test(key)) throw new SchemaError(`Polje „${label}“: ključ smije imati samo slova, brojeve i _ i mora počinjati slovom.`);
    if (RESERVED.has(key.toLowerCase())) throw new SchemaError(`Polje „${label}“: ključ „${key}“ je rezerviran.`);
    if (seen.has(key)) throw new SchemaError(`Ključ „${key}“ se ponavlja.`);
    seen.add(key);
    const type = String(r?.type ?? 'text') as FieldType;
    if (!FIELD_TYPES.includes(type)) throw new SchemaError(`Polje „${label}“: nepoznata vrsta „${type}“.`);
    const f: Field = { key, label, type };
    if (type === 'select') {
      const opts = [...new Set((Array.isArray(r.options) ? r.options : String(r.options ?? '').split('\n')).map((o: any) => String(o).trim()).filter(Boolean))] as string[];
      if (!opts.length) throw new SchemaError(`Polje „${label}“: dodajte barem jednu opciju.`);
      if (opts.length > 200) throw new SchemaError(`Polje „${label}“: najviše 200 opcija.`);
      f.options = opts.map((o) => o.slice(0, 120));
    }
    for (const b of ['required', 'public', 'filter', 'search', 'unique', 'list'] as const) if (r[b]) f[b] = true;
    if (f.filter && !['select', 'boolean'].includes(type)) delete f.filter;
    if (f.unique && !['text', 'integer', 'email', 'url'].includes(type)) delete f.unique;
    if (r.help) f.help = String(r.help).trim().slice(0, 200);
    return f;
  });
}

export function keyFromLabel(label: string) {
  const map: Record<string, string> = { č: 'c', ć: 'c', đ: 'dj', š: 's', ž: 'z' };
  const words = label.toLowerCase().replace(/[čćđšž]/g, (c) => map[c]).replace(/[^a-z0-9]+/g, ' ').trim().split(' ').filter(Boolean);
  const k = words.map((w, i) => (i ? w[0].toUpperCase() + w.slice(1) : w)).join('').slice(0, 40);
  return /^[a-z]/.test(k) ? k : `polje${k}`;
}

const empty = (v: unknown) => v === undefined || v === null || (typeof v === 'string' && v.trim() === '');

/** Pretvara unos (iz forme ili CSV-a) u vrijednost polja. */
export function coerce(f: Field, raw: unknown): { value?: any; error?: string } {
  if (empty(raw)) return f.required ? { error: 'obavezno polje' } : { value: undefined };
  const s = typeof raw === 'string' ? raw.trim() : raw;
  switch (f.type) {
    case 'text': return String(s).length > 500 ? { error: 'najviše 500 znakova' } : { value: String(s) };
    case 'longtext': return String(s).length > 5000 ? { error: 'najviše 5000 znakova' } : { value: String(s) };
    case 'number':
    case 'integer': {
      const n = typeof s === 'number' ? s : parseNumber(String(s));
      if (!Number.isFinite(n)) return { error: 'nije broj' };
      if (f.type === 'integer' && !Number.isInteger(n)) return { error: 'mora biti cijeli broj' };
      return { value: n };
    }
    case 'date': {
      const d = parseDate(String(s));
      return d ? { value: d } : { error: 'datum u obliku DD.MM.GGGG ili GGGG-MM-DD' };
    }
    case 'select': {
      const hit = f.options?.find((o) => o.toLowerCase() === String(s).toLowerCase());
      return hit ? { value: hit } : { error: `dozvoljeno: ${f.options?.slice(0, 8).join(', ')}${(f.options?.length ?? 0) > 8 ? '…' : ''}` };
    }
    case 'boolean': {
      const v = String(s).toLowerCase();
      if (['da', 'true', '1', 'yes', 'x'].includes(v) || s === true) return { value: true };
      if (['ne', 'false', '0', 'no'].includes(v) || s === false) return { value: false };
      return { error: 'unesite da ili ne' };
    }
    case 'url': return /^https?:\/\/[^\s]+$/i.test(String(s)) && String(s).length <= 500 ? { value: String(s) } : { error: 'adresa mora počinjati s https://' };
    case 'email': return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(s)) && String(s).length <= 200 ? { value: String(s).toLowerCase() } : { error: 'neispravan e-mail' };
  }
}

/** "1.234,5" i "1234,5" (BiH) te "1234.5" → broj; tačka je separator hiljada samo uz zarez ili u više grupa. */
export function parseNumber(raw: string): number {
  let s = raw.replace(/[\s ]/g, '');
  if (s.includes(',')) s = s.replace(/\./g, '').replace(',', '.');
  else if (/^-?\d{1,3}(\.\d{3}){2,}$/.test(s)) s = s.replace(/\./g, '');
  return s === '' ? NaN : Number(s);
}

export function parseDate(s: string): string | null {
  let y: number, m: number, d: number;
  let r = /^(\d{4})-(\d{1,2})-(\d{1,2})/.exec(s);
  if (r) { y = +r[1]; m = +r[2]; d = +r[3]; } else {
    r = /^(\d{1,2})\.\s*(\d{1,2})\.\s*(\d{4})\.?$/.exec(s);
    if (!r) return null;
    d = +r[1]; m = +r[2]; y = +r[3];
  }
  const dt = new Date(Date.UTC(y, m - 1, d));
  if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== m - 1 || dt.getUTCDate() !== d) return null;
  return dt.toISOString().slice(0, 10);
}

export function parseCoord(v: unknown, max: number): number | null | 'error' {
  if (empty(v)) return null;
  const n = typeof v === 'number' ? v : Number(String(v).trim().replace(',', '.'));
  return Number.isFinite(n) && Math.abs(n) <= max ? n : 'error';
}

/**
 * Provjera zapisa prema shemi. partial = izmjena (polja kojih nema u unosu ostaju kakva jesu).
 * Vraća očišćene podatke i listu grešaka po polju.
 */
export function validateEntry(fields: Field[], input: Record<string, any>, opts: { partial?: boolean; previous?: Record<string, any> } = {}) {
  const data: Record<string, any> = { ...(opts.previous ?? {}) };
  const errors: FieldError[] = [];
  for (const f of fields) {
    if (opts.partial && !(f.key in input)) continue;
    const { value, error } = coerce(f, input[f.key]);
    if (error) errors.push({ field: f.key, label: f.label, message: error });
    else if (value === undefined) delete data[f.key];
    else data[f.key] = value;
  }
  return { data, errors };
}

export function searchText(fields: Field[], data: Record<string, any>, titleField?: string | null) {
  return fields
    .filter((f) => f.search || f.key === titleField || f.unique)
    .map((f) => data[f.key])
    .filter((v) => v !== undefined && v !== null)
    .join(' ')
    .toLowerCase()
    .slice(0, 4000);
}

/** Polja vidljiva javnosti. */
export const publicFields = (fields: Field[]) => fields.filter((f) => f.public);

export function publicData(fields: Field[], data: Record<string, any>) {
  const out: Record<string, any> = {};
  for (const f of fields) if (f.public && data[f.key] !== undefined) out[f.key] = data[f.key];
  return out;
}

/* ───────── CSV ───────── */

export const MAX_IMPORT_ROWS = 5000;

/** CSV parser: navodnici, "" unutar navodnika, CRLF, BOM; razdjelnik ; , ili tab (određuje se po zaglavlju). */
export function parseCsv(text: string): string[][] {
  const src = text.replace(/^﻿/, '');
  const firstLine = src.slice(0, src.search(/\r?\n|$/));
  const count = (ch: string) => firstLine.split(ch).length - 1;
  const delim = [';', ',', '\t'].sort((a, b) => count(b) - count(a))[0];
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let q = false;
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (q) {
      if (c === '"') { if (src[i + 1] === '"') { cell += '"'; i++; } else q = false; } else cell += c;
    } else if (c === '"' && cell === '') q = true;
    else if (c === delim) { row.push(cell); cell = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && src[i + 1] === '\n') i++;
      row.push(cell); cell = '';
      if (row.some((x) => x.trim() !== '')) rows.push(row);
      row = [];
    } else cell += c;
  }
  row.push(cell);
  if (row.some((x) => x.trim() !== '')) rows.push(row);
  return rows;
}

const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'dj').replace(/[^a-z0-9]/g, '');
const LAT = ['lat', 'latitude', 'sirina', 'geografskasirina'];
const LNG = ['lng', 'lon', 'long', 'longitude', 'duzina', 'geografskaduzina'];

/** Kolona CSV-a → ključ polja (po ključu ili nazivu, bez obzira na velika slova i dijakritiku). */
export function mapHeader(fields: Field[], header: string[]) {
  const byName = new Map<string, string>();
  for (const f of fields) { byName.set(norm(f.key), f.key); byName.set(norm(f.label), f.key); }
  const map: (string | null)[] = [];
  const unknown: string[] = [];
  for (const h of header) {
    const n = norm(h);
    if (LAT.includes(n)) map.push('lat');
    else if (LNG.includes(n)) map.push('lng');
    else if (n === 'id' || n === 'idzapisa') map.push('id');
    else if (byName.has(n)) map.push(byName.get(n)!);
    else { map.push(null); if (h.trim()) unknown.push(h.trim()); }
  }
  const present = new Set(map.filter(Boolean));
  const missingRequired = fields.filter((f) => f.required && !present.has(f.key)).map((f) => f.label);
  return { map, unknown, missingRequired };
}

/** Zaštita od CSV/formula injekcije pri otvaranju u Excelu. */
const safeCell = (v: unknown) => {
  let s = v === undefined || v === null ? '' : typeof v === 'boolean' ? (v ? 'da' : 'ne') : String(v);
  if (/^[=+\-@\t\r]/.test(s) && !/^-?\d+([.,]\d+)?$/.test(s)) s = `'${s}`;
  return /[;"\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

/** CSV za Excel (BOM + točka-zarez). */
export function toCsv(fields: Field[], rows: { id?: string; data: Record<string, any>; lat?: number | null; lng?: number | null }[], opts: { geo?: boolean; withId?: boolean } = {}) {
  const head = [...(opts.withId ? ['id'] : []), ...fields.map((f) => f.label), ...(opts.geo ? ['lat', 'lng'] : [])];
  const lines = [head, ...rows.map((r) => [
    ...(opts.withId ? [r.id] : []),
    ...fields.map((f) => (f.type === 'date' && r.data[f.key] ? fmtDate(r.data[f.key]) : r.data[f.key])),
    ...(opts.geo ? [r.lat ?? '', r.lng ?? ''] : []),
  ])];
  return '﻿' + lines.map((l) => l.map(safeCell).join(';')).join('\r\n');
}

const fmtDate = (iso: string) => { const [y, m, d] = iso.split('-'); return `${d}.${m}.${y}.`; };
