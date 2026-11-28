// F2-11: kalendar neradnih dana za Outlook, Google i Apple kalendar (pretplata ili preuzimanje).
import { holidays } from '@/lib/nonworking';

export const dynamic = 'force-dynamic';

const esc = (s: string) => s.replace(/\\/g, '\\\\').replace(/[,;]/g, (m) => `\\${m}`).replace(/\r?\n/g, '\\n');
const d8 = (iso: string) => iso.replace(/-/g, '');
const next = (iso: string) => { const d = new Date(`${iso}T12:00:00Z`); d.setUTCDate(d.getUTCDate() + 1); return d.toISOString().slice(0, 10).replace(/-/g, ''); };

export async function GET() {
  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+Z$/, 'Z');
  const lines = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//MTTO HNK//Neradni dani u trgovini//BS', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
    'X-WR-CALNAME:Neradni dani u trgovini (HNK)', 'X-WR-TIMEZONE:Europe/Sarajevo', 'REFRESH-INTERVAL;VALUE=DURATION:P1D',
    // nedjelja: jedan ponavljajući događaj umjesto 52
    'BEGIN:VEVENT', 'UID:neradna-nedjelja@mtto.gov.ba', `DTSTAMP:${stamp}`, 'DTSTART;VALUE=DATE:20241117', 'DTEND;VALUE=DATE:20241118', 'RRULE:FREQ=WEEKLY;BYDAY=SU',
    'SUMMARY:Neradna nedjelja (trgovina)', `DESCRIPTION:${esc('Prodajni objekti ne rade, osim zakonom propisanih izuzetaka. Zakon o unutrašnjoj trgovini FBiH.')}`, 'TRANSP:TRANSPARENT', 'END:VEVENT',
  ];
  for (const h of await holidays()) {
    lines.push('BEGIN:VEVENT', `UID:${h.date}-${d8(h.date)}@mtto.gov.ba`, `DTSTAMP:${stamp}`, `DTSTART;VALUE=DATE:${d8(h.date)}`, `DTEND;VALUE=DATE:${next(h.date)}`,
      `SUMMARY:${esc(`${h.name} (${h.kind.toLowerCase()})`)}`, ...(h.note ? [`DESCRIPTION:${esc(h.note)}`] : []), 'TRANSP:TRANSPARENT', 'END:VEVENT');
  }
  lines.push('END:VCALENDAR');
  // RFC 5545: redovi do 75 okteta, CRLF
  const fold = (l: string) => { const out: string[] = []; let cur = ''; for (const ch of l) { if (Buffer.byteLength(cur + ch) > 74) { out.push(cur); cur = ' ' + ch; } else cur += ch; } out.push(cur); return out.join('\r\n'); };
  return new Response(lines.map(fold).join('\r\n') + '\r\n', {
    headers: { 'Content-Type': 'text/calendar; charset=utf-8', 'Content-Disposition': 'inline; filename="neradni-dani-trgovina.ics"', 'Cache-Control': 'public, max-age=3600' },
  });
}
