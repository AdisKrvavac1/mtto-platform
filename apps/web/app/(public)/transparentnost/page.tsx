// F2-10: transparentnost i pristup informacijama (ZOSPI FBiH). Podaci dolaze iz registara (budžet, nabavke,
// indeks-registar), dokumenata i e-pisarnice; Ministarstvo ih uređuje u CMS-u.
import Link from 'next/link';
import { apiSafe } from '@/lib/api';
import { km } from '@/lib/calls';
import { dateShort } from '@/lib/format';
import { Badge, Container, HB1, HB2, Head, PageHero } from '@/components/uui';
import { ArrowRight, Database01, Download01, File06, LinkExternal01, Send01 } from '@untitledui/icons';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Transparentnost i pristup informacijama', description: 'Budžet, javne nabavke i izvještaji Ministarstva, te zahtjev za pristup informacijama po ZOSPI FBiH.' };

type T = {
  budget: { years: { year: number; planned: number; spent: number; items: number; demo: boolean }[]; latest: number | null; kinds: { kind: string; planned: number; spent: number }[] };
  procurement: { byStatus: { year: number; status: string; count: number; estimated: number; contracted: number; demo: boolean }[]; latest: any[] };
  foi: { year: number; received: number; closed: number; onTime: number; refused: number }[];
  reports: { id: string; title: string; issuedAt: string | null; fileName: string; size: number; isDemo: boolean }[];
};
const EMPTY: T = { budget: { years: [], latest: null, kinds: [] }, procurement: { byStatus: [], latest: [] }, foi: [], reports: [] };
const pct = (a: number, b: number) => (b ? Math.round((a / b) * 100) : 0);
const STATUS_TONE: Record<string, 'gray' | 'blue' | 'success' | 'error'> = { Planirano: 'gray', 'U toku': 'blue', Ugovoreno: 'success', Poništeno: 'error' };

export default async function Transparency() {
  const d = await apiSafe<T>('/transparency', EMPTY);
  const by = d.budget.years.find((y) => y.year === d.budget.latest);
  const procYear = d.procurement.byStatus[0]?.year;
  const proc = d.procurement.byStatus.filter((p) => p.year === procYear);
  const procDemo = proc.some((p) => p.demo);
  const foi = d.foi[0];
  const maxKind = Math.max(1, ...d.budget.kinds.map((k) => k.planned));

  return (
    <>
      <PageHero crumbs={[{ label: 'Naslovna', href: '/' }, { label: 'Transparentnost' }]} eyebrow="Otvorena uprava" title="Transparentnost i pristup informacijama"
        stats={[
          { label: `Budžet ${d.budget.latest ?? ''}`.trim(), value: by ? km(by.planned) : '—' },
          { label: 'Izvršeno', value: by ? `${pct(by.spent, by.planned)} %` : '—' },
          { label: `Nabavke ${procYear ?? ''}`.trim(), value: String(proc.reduce((t, p) => t + p.count, 0)) },
          { label: 'Zahtjeva za informacije riješeno u roku', value: foi?.closed ? `${pct(foi.onTime, foi.closed)} %` : '—' },
        ]}
        actions={<><Link href="/e-usluge/obrasci/zahtjev-za-pristup-informacijama" className={HB1}><Send01 size={20} />Zahtjev za pristup informacijama</Link><Link href="/registri/indeks-registar" className={HB2}><Database01 size={20} />Indeks-registar</Link></>}>
        Kako Ministarstvo troši javni novac, šta nabavlja i kako odgovara na zahtjeve građana. Svaki podatak se može preuzeti, a ono što nije objavljeno možete zatražiti.
      </PageHero>

      <section id="pristup-informacijama" className="scroll-mt-24 bg-white py-16 md:py-20">
        <Container>
          <div className="grid gap-12 lg:grid-cols-2">
            <div>
              <Head k="ZOSPI FBiH" t="Pristup informacijama" s="Svako fizičko i pravno lice ima pravo pristupa informacijama koje su pod kontrolom Ministarstva, bez obrazloženja zašto ih traži." />
              <ol className="mt-8 space-y-5">
                {[
                  ['Provjerite da li je već objavljeno', 'Indeks-registar navodi koje informacije Ministarstvo posjeduje i gdje su dostupne.', '/registri/indeks-registar', 'Indeks-registar informacija'],
                  ['Podnesite zahtjev', 'Elektronski, s opisom informacije i načinom dostave. Odmah dobijate broj predmeta.', '/e-usluge/obrasci/zahtjev-za-pristup-informacijama', 'Zahtjev za pristup informacijama'],
                  ['Odgovor u roku od 15 dana', 'Ministarstvo odobrava pristup ili donosi rješenje s obrazloženjem i poukom o pravu na žalbu. Možete se obratiti i Instituciji ombudsmena.', '/e-usluge/status', 'Status predmeta'],
                ].map(([t, s, href, l], i) => (
                  <li key={t} className="flex gap-4">
                    <span aria-hidden className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[var(--br-600)] text-[15px] font-semibold text-white">{i + 1}</span>
                    <div><p className="text-[17px] font-semibold text-[#171717]">{t}</p><p className="mt-1 text-[15px] leading-6 text-[#525252]">{s}</p><Link href={href} className="mt-2 inline-flex items-center gap-1 text-[14px] font-semibold text-[var(--br-700)]">{l}<ArrowRight size={14} /></Link></div>
                  </li>
                ))}
              </ol>
              <p className="mt-8 text-[13px] text-[#737373]">Zakon o slobodi pristupa informacijama u Federaciji BiH (Sl. novine FBiH 32/01, 48/11). Za ličnu informaciju o sebi Ministarstvo može tražiti dokaz identiteta.</p>
            </div>
            <div className="lg:pt-2">
              <div className="rounded-[16px] bg-[#fafafa] p-6 ring-1 ring-inset ring-[#e5e5e5]">
                <p className="text-[16px] font-semibold text-[#171717]">Zahtjevi po godinama</p>
                <p className="mt-1 text-[14px] text-[#525252]">Iz e-pisarnice, automatski.</p>
                {d.foi.length ? (
                  <table className="mt-4 w-full text-left text-[14px]">
                    <thead className="text-[12px] text-[#525252]"><tr className="border-b border-[#e5e5e5]"><th className="py-2">Godina</th><th className="py-2 text-right">Primljeno</th><th className="py-2 text-right">Riješeno</th><th className="py-2 text-right">U roku</th><th className="py-2 text-right">Odbijeno</th></tr></thead>
                    <tbody className="divide-y divide-[#f0f0f0] tabular-nums">{d.foi.map((f) => <tr key={f.year}><td className="py-2 font-medium">{f.year}</td><td className="py-2 text-right">{f.received}</td><td className="py-2 text-right">{f.closed}</td><td className="py-2 text-right">{f.closed ? `${pct(f.onTime, f.closed)} %` : '—'}</td><td className="py-2 text-right">{f.refused}</td></tr>)}</tbody>
                  </table>
                ) : <p className="mt-6 text-[14px] text-[#525252]">Elektronski zahtjevi primaju se od pokretanja portala. Statistika se prikazuje čim stigne prvi zahtjev.</p>}
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section id="budzet" className="scroll-mt-24 bg-[#fafafa] py-16 md:py-20">
        <Container>
          <Head k="Javni novac" t={`Budžet${d.budget.latest ? ` ${d.budget.latest}.` : ''}`} s="Planirana i izvršena sredstva po vrstama rashoda."
            action={<div className="flex gap-3"><Link href="/registri/budzet" className="inline-flex h-10 items-center gap-1.5 rounded-[8px] bg-white px-4 text-[14px] font-semibold text-[#404040] ring-1 ring-inset ring-[#d4d4d4] hover:bg-[#fafafa]">Sve pozicije</Link><a href="/api/registries/budzet/export.csv" className="inline-flex h-10 items-center gap-1.5 rounded-[8px] bg-white px-4 text-[14px] font-semibold text-[#404040] ring-1 ring-inset ring-[#d4d4d4] hover:bg-[#fafafa]"><Download01 size={18} />CSV</a></div>} />
          {by?.demo && <p className="mt-6"><Badge tone="warning">Primjer: iznosi nisu stvarni dok ih Ministarstvo ne upiše</Badge></p>}
          {d.budget.kinds.length ? (
            <ul className="mt-8 space-y-5">
              {d.budget.kinds.map((k) => (
                <li key={k.kind}>
                  <div className="flex flex-wrap items-baseline justify-between gap-2 text-[15px]"><span className="font-semibold text-[#171717]">{k.kind}</span><span className="tabular-nums text-[#525252]">{km(k.spent)} od {km(k.planned)} · {pct(k.spent, k.planned)} %</span></div>
                  <div className="mt-2 h-3 rounded-full bg-[#e5e5e5]" style={{ width: `${Math.max(8, (k.planned / maxKind) * 100)}%` }} role="img" aria-label={`${k.kind}: izvršeno ${pct(k.spent, k.planned)} posto`}>
                    <div className="h-3 rounded-full bg-[var(--br-600)]" style={{ width: `${Math.min(100, pct(k.spent, k.planned))}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          ) : <p className="mt-8 text-[15px] text-[#525252]">Budžet još nije objavljen.</p>}
        </Container>
      </section>

      <section id="nabavke" className="scroll-mt-24 bg-white py-16 md:py-20">
        <Container>
          <Head k="Javne nabavke" t={`Nabavke${procYear ? ` ${procYear}.` : ''}`} s="Planirani i pokrenuti postupci i zaključeni ugovori. Obavještenja i tenderska dokumentacija objavljuju se na portalu e-Nabavke."
            action={<div className="flex flex-wrap gap-3"><Link href="/registri/javne-nabavke" className="inline-flex h-10 items-center rounded-[8px] px-4 text-[14px] font-semibold text-[#404040] ring-1 ring-inset ring-[#d4d4d4] hover:bg-[#fafafa]">Sve nabavke</Link><a href="https://next.ejn.gov.ba/" target="_blank" rel="noopener" className="inline-flex h-10 items-center gap-1.5 rounded-[8px] px-4 text-[14px] font-semibold text-[#404040] ring-1 ring-inset ring-[#d4d4d4] hover:bg-[#fafafa]">e-Nabavke<LinkExternal01 size={16} /></a></div>} />
          {procDemo && <p className="mt-6"><Badge tone="warning">Primjer: postupci i dobavljači nisu stvarni</Badge></p>}
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {['Planirano', 'U toku', 'Ugovoreno', 'Poništeno'].map((s) => { const p = proc.find((x) => x.status === s); return (
              <div key={s} className="rounded-[12px] p-5 ring-1 ring-inset ring-[#e5e5e5]"><Badge tone={STATUS_TONE[s]} dot>{s}</Badge><p className="mt-3 text-[28px] font-semibold tabular-nums text-[#171717]">{p?.count ?? 0}</p><p className="text-[13px] text-[#737373]">{s === 'Ugovoreno' ? `ugovoreno ${km(p?.contracted ?? 0)}` : `procijenjeno ${km(p?.estimated ?? 0)}`}</p></div>
            ); })}
          </div>
          {d.procurement.latest.length > 0 && (
            <div className="mt-8 overflow-x-auto rounded-[12px] ring-1 ring-inset ring-[#e5e5e5]">
              <table className="w-full min-w-[720px] text-left text-[14px]">
                <thead className="bg-[#fafafa] text-[12px] font-medium text-[#525252]"><tr><th className="px-4 py-3">Predmet</th><th className="px-4 py-3">Postupak</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Dobavljač</th><th className="px-4 py-3 text-right">Vrijednost</th></tr></thead>
                <tbody className="divide-y divide-[#e5e5e5]">{d.procurement.latest.map((p) => (
                  <tr key={p.id}><td className="px-4 py-3 font-medium text-[#171717]"><Link href={`/registri/javne-nabavke/${p.id}`} className="hover:underline">{p.predmet}</Link></td><td className="px-4 py-3 text-[#525252]">{p.postupak ?? '—'}</td><td className="px-4 py-3"><Badge tone={STATUS_TONE[p.status] ?? 'gray'}>{p.status}</Badge></td><td className="px-4 py-3 text-[#525252]">{p.dobavljac ?? '—'}</td><td className="px-4 py-3 text-right tabular-nums">{km(p.ugovoreno ?? p.procijenjeno ?? null)}</td></tr>
                ))}</tbody>
              </table>
            </div>
          )}
        </Container>
      </section>

      <section id="izvjestaji" className="scroll-mt-24 bg-[#fafafa] py-16 md:py-20">
        <Container>
          <Head k="Izvještaji" t="Izvještaji o radu" s="Godišnji izvještaji, izvještaji o izvršenju budžeta i revizije." action={<Link href="/propisi?docType=IZVJESTAJ#tablica" className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-[var(--br-700)]">Svi izvještaji<ArrowRight size={16} /></Link>} />
          {d.reports.length ? (
            <ul className="mt-8 divide-y divide-[#e5e5e5] rounded-[12px] bg-white ring-1 ring-inset ring-[#e5e5e5]">
              {d.reports.map((r) => <li key={r.id}><a href={`/api/documents/${r.id}/file`} className="flex items-center gap-3 px-5 py-4 text-[15px] hover:bg-[#fafafa]"><File06 size={20} className="shrink-0 text-[#a3a3a3]" /><span className="min-w-0 flex-1 font-medium text-[#171717]">{r.title}{r.isDemo && <Badge tone="warning" className="ml-2">Primjer</Badge>}</span><span className="text-[13px] text-[#737373]">{r.issuedAt ? dateShort(r.issuedAt) : ''}</span><Download01 size={18} className="text-[#a3a3a3]" /></a></li>)}
            </ul>
          ) : <p className="mt-8 rounded-[12px] bg-white p-6 text-[15px] text-[#525252] ring-1 ring-inset ring-[#e5e5e5]">Izvještaji se objavljuju u Dokumentima i propisima s vrstom „Izvještaj“ i ovdje se pojavljuju automatski.</p>}
        </Container>
      </section>
    </>
  );
}
