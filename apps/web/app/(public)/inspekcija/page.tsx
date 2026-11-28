// F2-20: godišnji plan i izvještaj inspekcijskog nadzora u strukturiranom obliku.
// Podaci su u registrima „plan-nadzora“ i „izvjestaj-nadzora“ (CMS, CSV, javni API).
import Link from 'next/link';
import { apiSafe } from '@/lib/api';
import type { RegEntry } from '@/lib/registry';
import { Badge, Card, Container, HB1, HB2, Head, PageHero } from '@/components/uui';
import { Code02, Download01, ShieldTick } from '@untitledui/icons';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Plan i izvještaj inspekcijskog nadzora', description: 'Šta inspekcija planira kontrolisati i šta je utvrdila, po područjima.' };

const km = (n: number) => n.toLocaleString('bs-BA');
type Row = { podrucje: string; inspekcija: string; planirano: number; nadzora: number | null; naloga: number; kazne: number; subjekata: number };

function PlanChart({ rows }: { rows: Row[] }) {
  const max = Math.max(1, ...rows.map((r) => Math.max(r.planirano, r.nadzora ?? 0)));
  const W = 1000, L = 240, H = 30 * rows.length + 30, bw = W - L - 60;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Planirani i izvršeni nadzori po područjima">
      {rows.map((r, i) => {
        const y = 10 + i * 30;
        const p = (r.planirano / max) * bw, d = ((r.nadzora ?? 0) / max) * bw;
        return (
          <g key={r.podrucje}>
            <text x={L - 12} y={y + 15} textAnchor="end" fontSize="13" fill="#404040">{r.podrucje}</text>
            <rect x={L} y={y + 3} width={Math.max(p, 1)} height={18} rx={4} fill="var(--br-100)" />
            <rect x={L} y={y + 7} width={Math.max(d, r.nadzora ? 2 : 0)} height={10} rx={3} fill="var(--br-600)" />
            <text x={L + Math.max(p, d) + 8} y={y + 16} fontSize="12" fill="#525252">{r.nadzora ?? 0} / {r.planirano}</text>
          </g>
        );
      })}
    </svg>
  );
}

export default async function InspectionPage({ searchParams }: { searchParams: Promise<{ godina?: string }> }) {
  const sp = await searchParams;
  const [plan, rep] = await Promise.all([
    apiSafe<{ items: RegEntry[] }>('/registries/plan-nadzora/entries?limit=500', { items: [] }),
    apiSafe<{ items: RegEntry[] }>('/registries/izvjestaj-nadzora/entries?limit=500', { items: [] }),
  ]);
  const years = [...new Set([...plan.items, ...rep.items].map((e) => Number(e.data.godina)).filter(Boolean))].sort((a, b) => b - a);
  const year = Number(sp.godina) || years[0] || new Date().getFullYear();
  const pY = plan.items.filter((e) => Number(e.data.godina) === year);
  const rY = rep.items.filter((e) => Number(e.data.godina) === year);
  const areas = [...new Set([...pY, ...rY].map((e) => e.data.podrucje as string))];
  const rows: Row[] = areas.map((a) => {
    const ps = pY.filter((e) => e.data.podrucje === a), rs = rY.filter((e) => e.data.podrucje === a);
    const sum = (xs: RegEntry[], k: string) => xs.reduce((t, e) => t + (Number(e.data[k]) || 0), 0);
    return {
      podrucje: a, inspekcija: (ps[0] ?? rs[0]).data.inspekcija, planirano: sum(ps, 'planirano'),
      nadzora: rs.some((e) => e.data.nadzora != null) ? sum(rs, 'nadzora') : null, naloga: sum(rs, 'prekrsajnihNaloga'), kazne: sum(rs, 'iznosKazni'), subjekata: sum(rs, 'subjekataNepravilnosti'),
    };
  }).sort((a, b) => b.planirano - a.planirano);
  const tot = rows.reduce((t, r) => ({ plan: t.plan + r.planirano, done: t.done + (r.nadzora ?? 0), naloga: t.naloga + r.naloga, kazne: t.kazne + r.kazne }), { plan: 0, done: 0, naloga: 0, kazne: 0 });
  const planDemo = pY.some((e) => e.isDemo);

  return (
    <>
      <PageHero
        crumbs={[{ label: 'Naslovna', href: '/' }, { label: 'Inspekcija' }]}
        eyebrow="Inspekcijski nadzor" title="Plan i izvještaj nadzora"
        stats={[
          { label: `Planiranih nadzora ${year}.`, value: km(tot.plan) },
          { label: 'Izvršenih nadzora', value: km(tot.done) },
          { label: 'Prekršajnih naloga', value: km(tot.naloga) },
          { label: 'Iznos kazni', value: `${km(tot.kazne)} KM` },
        ]}
        actions={<><Link href="/e-usluge/prijava-inspekciji" className={HB1}><ShieldTick size={20} />Prijavi inspekciji</Link><a href="/api/registries/plan-nadzora/export.csv" className={HB2}><Download01 size={20} />Plan (CSV)</a></>}
      >
        Šta inspekcija planira kontrolisati, šta je izvršeno i šta je utvrđeno, po područjima. Podaci su dostupni i kao otvoreni podaci.
      </PageHero>

      <section className="bg-white py-16 md:py-20">
        <Container>
          <Head k={`Godina ${year}.`} t="Plan i izvršenje po područjima" s="Svijetla traka je plan, tamna izvršeni nadzori."
            action={years.length > 1 ? <div className="flex gap-2">{years.map((y) => <Link key={y} href={`/inspekcija?godina=${y}`} className={`rounded-[8px] px-3 py-1.5 text-[14px] font-semibold ${y === year ? 'bg-[var(--br-50)] text-[var(--br-700)]' : 'text-[#525252] hover:bg-[#fafafa]'}`}>{y}.</Link>)}</div> : undefined} />
          {planDemo && <p className="mt-6 flex items-start gap-2 rounded-[12px] bg-[#fffcf5] p-4 text-[14px] text-[#b54708] ring-1 ring-inset ring-[#fedf89]"><Badge tone="warning">Demo</Badge>Plan za {year}. sadrži demo vrijednosti. Službeni plan rada inspekcije Ministarstvo upisuje u CMS.</p>}
          {rows.length === 0 ? <p className="mt-8 text-[16px] text-[#525252]">Za {year}. još nema upisanog plana ni izvještaja.</p> : (
            <>
              <Card className="mt-8 p-6"><PlanChart rows={rows} /></Card>
              <div className="mt-8 overflow-x-auto rounded-[12px] ring-1 ring-inset ring-[#e5e5e5]">
                <table className="w-full min-w-[760px] text-left text-[14px]">
                  <thead className="bg-[#fafafa] text-[12px] font-medium text-[#525252]"><tr><th className="px-5 py-3">Područje</th><th className="px-5 py-3">Inspekcija</th><th className="px-5 py-3 text-right">Plan</th><th className="px-5 py-3 text-right">Izvršeno</th><th className="px-5 py-3 text-right">Subjekata s nepravilnostima</th><th className="px-5 py-3 text-right">Naloga</th><th className="px-5 py-3 text-right">Kazne (KM)</th></tr></thead>
                  <tbody className="divide-y divide-[#e5e5e5]">
                    {rows.map((r) => (
                      <tr key={r.podrucje}>
                        <td className="px-5 py-4 font-medium text-[#171717]">{r.podrucje}</td><td className="px-5 py-4 text-[#525252]">{r.inspekcija}</td>
                        <td className="px-5 py-4 text-right tabular-nums">{r.planirano ? km(r.planirano) : '—'}</td><td className="px-5 py-4 text-right tabular-nums">{r.nadzora != null ? km(r.nadzora) : '—'}</td>
                        <td className="px-5 py-4 text-right tabular-nums">{r.subjekata ? km(r.subjekata) : '—'}</td><td className="px-5 py-4 text-right tabular-nums">{r.naloga ? km(r.naloga) : '—'}</td><td className="px-5 py-4 text-right tabular-nums">{r.kazne ? km(r.kazne) : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
          {rY.some((e) => e.data.mjere || e.data.izvor) && (
            <ul className="mt-6 space-y-2 text-[14px] text-[#525252]">
              {rY.filter((e) => e.data.mjere || e.data.izvor).map((e) => <li key={e.id}><b className="font-medium text-[#404040]">{e.data.podrucje}{e.data.period ? `, ${e.data.period}` : ''}:</b> {e.data.mjere}{e.data.izvor && <> <a className="font-medium text-[var(--br-700)] underline" href={e.data.izvor} target="_blank" rel="noopener">Izvor</a></>}</li>)}
            </ul>
          )}
        </Container>
      </section>

      <section className="bg-[#fafafa] py-12">
        <Container>
          <div className="flex flex-col gap-4 rounded-[16px] bg-white p-6 ring-1 ring-inset ring-[#e5e5e5] md:flex-row md:items-center md:justify-between">
            <div><p className="flex items-center gap-2 text-[16px] font-semibold text-[#171717]"><Code02 size={20} className="text-[#737373]" />Otvoreni podaci</p>
              <p className="mt-1 text-[14px] text-[#525252]">Plan i izvještaj su javni registri: pretraga, CSV i JSON bez prijave.</p></div>
            <div className="flex flex-wrap gap-3">
              <Link href="/registri/plan-nadzora" className="inline-flex h-10 items-center rounded-[8px] px-4 text-[14px] font-semibold text-[#404040] ring-1 ring-inset ring-[#d4d4d4] hover:bg-[#fafafa]">Registar plana</Link>
              <Link href="/registri/izvjestaj-nadzora" className="inline-flex h-10 items-center rounded-[8px] px-4 text-[14px] font-semibold text-[#404040] ring-1 ring-inset ring-[#d4d4d4] hover:bg-[#fafafa]">Registar izvještaja</Link>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
