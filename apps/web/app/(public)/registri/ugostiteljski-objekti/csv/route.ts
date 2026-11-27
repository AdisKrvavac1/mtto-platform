// F2-13: CSV registra smještaja dolazi iz registry buildera (jedan izvor za portal, CSV i API).
const API = process.env.API_INTERNAL_URL || 'http://localhost:4000';

export const dynamic = 'force-dynamic';

const MAP: Record<string, string> = { kind: 'vrsta', municipality: 'opcina', stars: 'kategorija', status: 'status' };

export async function GET(req: Request) {
  const sp = new URL(req.url).searchParams;
  const qs = new URLSearchParams();
  if (sp.get('q')) qs.set('q', sp.get('q')!);
  for (const [k, f] of Object.entries(MAP)) { const v = sp.get(k); if (v) qs.set(`f.${f}`, v); }
  const res = await fetch(`${API}/registries/ugostiteljski-objekti/export.csv?${qs}`, { cache: 'no-store' });
  return new Response(res.body, { status: res.status, headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': 'attachment; filename="registar-ugostiteljskih-objekata.csv"' } });
}
