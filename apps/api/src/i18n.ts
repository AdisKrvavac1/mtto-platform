/** F2-06: prijevodi sadržaja. Jezik izvornika je bs; prijevod postoji samo za jezike u TRANSLATABLE. */
import { BadRequestException } from '@nestjs/common';

export const TRANSLATABLE = ['en'] as const;
export type TLang = (typeof TRANSLATABLE)[number];
export const lang = (v: unknown): TLang | null => (TRANSLATABLE as readonly string[]).includes(String(v)) ? (v as TLang) : null;

/** Provjera prijevoda: samo dozvoljeni jezici i polja, ograničene dužine. Prazna polja se brišu. */
export function cleanTranslations(v: unknown, fields: Record<string, number>): Record<string, Record<string, string>> {
  if (v == null) return {};
  if (typeof v !== 'object' || Array.isArray(v)) throw new BadRequestException('Prijevodi moraju biti objekat po jezicima');
  const out: Record<string, Record<string, string>> = {};
  for (const [l, t] of Object.entries(v as Record<string, any>)) {
    if (!lang(l)) throw new BadRequestException(`Nepodržan jezik prijevoda: ${l}`);
    const o: Record<string, string> = {};
    for (const [f, max] of Object.entries(fields)) {
      const s = t?.[f] == null ? '' : String(t[f]).trim();
      if (s.length > max) throw new BadRequestException(`Prijevod (${l}) ${f}: najviše ${max} znakova`);
      if (s) o[f] = s;
    }
    if (Object.keys(o).length) out[l] = o;
  }
  return out;
}

/** Zamjenjuje prevedena polja ako prijevod postoji; vraća i oznaku da li je sadržaj preveden. */
export function localize<T extends Record<string, any>>(row: T, l: TLang | null, fields: string[]): T & { lang: string; translated: boolean } {
  const { translations, ...rest } = row as any;
  const t = l ? translations?.[l] : null;
  if (!t || !t.title) return { ...rest, lang: 'bs', translated: false };
  const o: any = { ...rest };
  for (const f of fields) if (t[f]) o[f] = t[f];
  return { ...o, lang: l, translated: true };
}
