import { apiSafe, type Facility } from '@/lib/api';

export const dynamic = 'force-dynamic';

const esc = (v: unknown) => { const s = v == null ? '' : String(v); return /[;"\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };

export async function GET(req: Request) {
  const sp = new URL(req.url).searchParams;
  const qs = new URLSearchParams();
  for (const k of ['q', 'kind', 'municipality', 'stars']) { const v = sp.get(k); if (v) qs.set(k, v); }
  const rows = await apiSafe<Facility[]>(`/facilities?${qs}`, []);
  const head = ['Naziv', 'Vrsta', 'Zvjezdice', 'Općina', 'Adresa', 'Jedinice', 'Ležaji', 'Broj rješenja', 'Datum rješenja', 'Demo'];
  const lines = [head, ...rows.map((f) => [f.name, f.kind, f.stars ?? '', f.municipality, f.address, f.rooms ?? '', f.beds ?? '', f.decisionNumber ?? '', f.decisionDate ? f.decisionDate.slice(0, 10) : '', f.isDemo ? 'da' : 'ne'])];
  // UTF-8 BOM + točka-zarez: Excel u BiH lokalizaciji ispravno otvara datoteku
  const body = '﻿' + lines.map((l) => l.map(esc).join(';')).join('\r\n');
  return new Response(body, { headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': 'attachment; filename="registar-ugostiteljskih-objekata.csv"' } });
}
