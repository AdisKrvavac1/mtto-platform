import { api, type Permit } from '@/lib/api';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const format = new URL(req.url).searchParams.get('format') ?? 'csv';
  const rows = await api<Permit[]>('/permits');
  if (format === 'json') return Response.json(rows);
  const cols: (keyof Permit)[] = ['registerNumber', 'operator', 'facility', 'activity', 'municipality', 'issuedAt', 'validUntil', 'status', 'lat', 'lng', 'isDemo'];
  const esc = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const csv = '﻿' + [cols.join(';'), ...rows.map((r) => cols.map((c) => esc(r[c])).join(';'))].join('\r\n');
  return new Response(csv, { headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': 'attachment; filename="registar-okolisnih-dozvola.csv"' } });
}
