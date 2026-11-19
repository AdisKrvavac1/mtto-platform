export function slugify(input: string): string {
  const map: Record<string, string> = { č: 'c', ć: 'c', đ: 'dj', š: 's', ž: 'z', Č: 'c', Ć: 'c', Đ: 'dj', Š: 's', Ž: 'z' };
  return input
    .replace(/[čćđšžČĆĐŠŽ]/g, (c) => map[c] ?? c)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 90);
}

export function toInt(v: unknown, def: number): number {
  const n = parseInt(String(v ?? ''), 10);
  return Number.isFinite(n) && n > 0 ? n : def;
}

export function toDate(v: unknown): Date | null {
  if (v === null || v === undefined || v === '') return null;
  const d = new Date(String(v));
  return isNaN(d.getTime()) ? null : d;
}

export function toFloat(v: unknown): number | null {
  if (v === null || v === undefined || v === '') return null;
  const n = parseFloat(String(v));
  return Number.isFinite(n) ? n : null;
}

export function pick<T extends object>(src: any, keys: (keyof T)[]): Partial<T> {
  const out: any = {};
  for (const k of keys) if (src && src[k] !== undefined) out[k] = src[k];
  return out;
}
