const MONTHS = ['januar', 'februar', 'mart', 'april', 'maj', 'juni', 'juli', 'august', 'septembar', 'oktobar', 'novembar', 'decembar'];

function parse(d: string | Date) {
  if (d instanceof Date) return d;
  return /^\d{4}-\d{2}-\d{2}$/.test(d) ? new Date(d + 'T12:00:00') : new Date(d);
}

export function dateLong(d?: string | Date | null) {
  if (!d) return '';
  const x = new Date(parse(d).toLocaleString('en-US', { timeZone: 'Europe/Sarajevo' }));
  return `${x.getDate()}. ${MONTHS[x.getMonth()]} ${x.getFullYear()}.`;
}

export function dateShort(d?: string | Date | null) {
  if (!d) return '—';
  const x = parse(d);
  return x.toLocaleDateString('bs-BA', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'Europe/Sarajevo' });
}

export function dateTime(d?: string | Date | null) {
  if (!d) return '';
  const x = parse(d);
  return x.toLocaleString('bs-BA', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Sarajevo' });
}

export function fileSize(b: number) {
  if (b > 1024 * 1024) return `${(b / 1024 / 1024).toFixed(1).replace('.', ',')} MB`;
  return `${Math.max(1, Math.round(b / 1024))} KB`;
}

export function fileExt(name: string) {
  return (name.split('.').pop() || '').toUpperCase();
}

export function daysUntil(d?: string | null) {
  if (!d) return null;
  return Math.ceil((parse(d).getTime() - Date.now()) / 864e5);
}

export const POST_TYPE: Record<string, string> = { VIJEST: 'Vijest', JAVNI_POZIV: 'Javni poziv', SAOPCENJE: 'Saopćenje' };
export const DOC_TYPE: Record<string, string> = { ZAKON: 'Zakon', PRAVILNIK: 'Pravilnik', ODLUKA: 'Odluka / rješenje', OBRAZAC: 'Obrazac', UPUTSTVO: 'Uputstvo', IZVJESTAJ: 'Izvještaj', OSTALO: 'Ostalo' };
export const PERMIT_STATUS: Record<string, { label: string; cls: string }> = {
  VAZECA: { label: 'Važeća', cls: 'bg-eko-green-light text-eko-green border border-eko-green-border' },
  U_OBNOVI: { label: 'U obnovi', cls: 'bg-herzeg-gold-soft text-[#786000] border border-herzeg-gold' },
  ISTEKLA: { label: 'Istekla', cls: 'bg-error-container text-on-error-container border border-error/20' },
};
