// F2-04: tipovi i prikaz za registry builder (CMS i portal).
import { dateShort } from './format';

export type FieldType = 'text' | 'longtext' | 'number' | 'integer' | 'date' | 'select' | 'boolean' | 'url' | 'email';
export type RegField = {
  key: string; label: string; type: FieldType; required?: boolean; options?: string[];
  public?: boolean; filter?: boolean; search?: boolean; unique?: boolean; list?: boolean; help?: string;
};
export type Registry = {
  id: string; slug: string; name: string; description: string; sector: string | null; fields: RegField[]; titleField: string | null;
  geo: boolean; public: boolean; legalBasis: string; isDemo: boolean; updatedAt: string; count?: number; lastEntryAt?: string | null;
};
export type RegEntry = { id: string; data: Record<string, any>; lat?: number | null; lng?: number | null; status?: string; isDemo: boolean; updatedAt: string; createdAt?: string };
export type PublicRegistry = Omit<Registry, 'id' | 'public'> & { count: number; facets?: Record<string, { value: string; count: number }[]> };

export const FIELD_TYPES: { value: FieldType; label: string; hint: string }[] = [
  { value: 'text', label: 'Kratki tekst', hint: 'Naziv, adresa, broj akta' },
  { value: 'longtext', label: 'Duži tekst', hint: 'Opis, napomena' },
  { value: 'select', label: 'Izbor s liste', hint: 'Općina, vrsta, status; može biti filter' },
  { value: 'integer', label: 'Cijeli broj', hint: 'Broj ležaja, zaposlenih' },
  { value: 'number', label: 'Broj', hint: 'Površina, iznos' },
  { value: 'date', label: 'Datum', hint: 'Datum rješenja, rok važenja' },
  { value: 'boolean', label: 'Da / ne', hint: 'Može biti filter' },
  { value: 'url', label: 'Web adresa', hint: 'Mora počinjati s https://' },
  { value: 'email', label: 'E-mail', hint: 'Kontakt adresa' },
];
export const typeLabel = (t: FieldType) => FIELD_TYPES.find((x) => x.value === t)?.label ?? t;

/** Vrijednost polja za prikaz u tabeli i dosjeu. */
export function show(f: RegField, v: any): string {
  if (v === undefined || v === null || v === '') return '—';
  if (f.type === 'date') return dateShort(v);
  if (f.type === 'boolean') return v ? 'Da' : 'Ne';
  if (f.type === 'number' || f.type === 'integer') return Number(v).toLocaleString('bs-BA');
  return String(v);
}

export function titleOf(reg: { fields: RegField[]; titleField: string | null }, e: { data: Record<string, any>; id: string }) {
  const k = reg.titleField ?? reg.fields[0]?.key;
  return (k && e.data[k]) || `Zapis ${e.id.slice(0, 8)}`;
}

/** Kolone tabele: označene „u tabeli“, inače prva četiri polja. */
export function listFields(fields: RegField[]) {
  const l = fields.filter((f) => f.list);
  return (l.length ? l : fields.slice(0, 4)).slice(0, 6);
}
