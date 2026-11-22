import Link from 'next/link';
import { apiSafe, type Facility } from '@/lib/api';
import { dateShort } from '@/lib/format';
import { Badge, Button, Card, Container, FilterField, Metric, PageHeader, Section, TableCard, inputCls, td, th } from '@/components/uui';
import { Download01, FilterLines, MarkerPin04, SearchLg, Star01, Table, XClose } from '@untitledui/icons';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Registar kategoriziranih ugostiteljskih objekata' };

const KINDS = ['Hotel', 'Motel', 'Pansion', 'Apartmani', 'Kamp'];
const MUNICIPALITIES = ['Čapljina', 'Čitluk', 'Jablanica', 'Konjic', 'Mostar', 'Neum', 'Prozor-Rama', 'Ravno', 'Stolac'];
const LABELS: Record<string, string> = { q: 'Pojam', kind: 'Vrsta', municipality: 'Općina', stars: 'Zvjezdice' };
const fmt = (n: number) => n.toLocaleString('bs-BA');

function Stars({ n }: { n: number | null }) {
  return (
    <span className="flex" aria-label={n ? `${n} zvjezdica` : 'Bez kategorije'}>
      {[1, 2, 3, 4, 5].map((i) => <Star01 key={i} size={16} className={i <= (n ?? 0) ? 'fill-[#fdb022] text-[#fdb022]' : 'text-[#d4d4d4]'} />)}
    </span>
  );
}

export default async function FacilitiesPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const qs = new URLSearchParams();
  for (const k of ['q', 'kind', 'municipality', 'stars']) if (sp[k]) qs.set(k, sp[k]!);
  const [rows, all] = await Promise.all([apiSafe<Facility[]>(`/facilities?${qs}`, []), apiSafe<Facility[]>('/facilities', [])]);
  const beds = all.reduce((s, f) => s + (f.beds || 0), 0);
  const hotels = all.filter((f) => f.kind === 'Hotel' && (f.stars ?? 0) >= 4).length;
  const motels = all.filter((f) => ['Motel', 'Pansion'].includes(f.kind)).length;
  const priv = all.filter((f) => ['Apartmani', 'Kamp'].includes(f.kind)).length;
  const csv = `/registri/ugostiteljski-objekti/csv${qs.toString() ? `?${qs}` : ''}`;
  const pills = Object.keys(LABELS).filter((k) => sp[k]);
  const without = (k: string) => { const p = new URLSearchParams(qs); p.delete(k); return `/registri/ugostiteljski-objekti?${p}#rezultati`; };

  return (
    <>
      <PageHeader
        crumbs={[{ label: 'Naslovna', href: '/' }, { label: 'E-usluge', href: '/e-usluge' }, { label: 'Ugostiteljski objekti' }]}
        eyebrow="Javni registar smještaja"
        title="Kategorizirani ugostiteljski objekti"
        actions={<><Button href={csv} variant="secondary" size="lg" icon={Table} external>Za Excel</Button><Button href={csv} size="lg" icon={Download01} external>Preuzmi CSV</Button></>}
      >
        Hoteli, moteli, pansioni, kampovi i objekti za iznajmljivanje s dodijeljenom kategorijom na području 9 općina i gradova kantona.
      </PageHeader>

      <Section tone="gray" className="!py-12 md:!py-16">
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-5">
          <Metric value={fmt(all.length)} label="Ukupno objekata" />
          <Metric value={fmt(beds)} label="Registriranih ležaja" />
          <Metric value={fmt(hotels)} label="Hoteli 4★ i 5★" />
          <Metric value={fmt(motels)} label="Moteli i pansioni" />
          <Metric value={fmt(priv)} label="Apartmani i kampovi" />
        </div>
      </Section>

      <section id="rezultati" className="bg-white py-12 md:py-16 scroll-mt-24">
        <Container>
          {all.some((f) => f.isDemo) && (
            <div className="mb-6 flex items-start gap-3 rounded-[12px] bg-[#fffcf5] p-4 text-[14px] leading-5 text-[#b54708] ring-1 ring-inset ring-[#fedf89]">
              <Badge tone="warning">Demo</Badge><span>Prikazani su demo objekti. Stvarni popis kategoriziranih objekata uvozi se iz evidencije Sektora za turizam pri migraciji.</span>
            </div>
          )}
          <Card className="p-5 md:p-6">
            <form action="/registri/ugostiteljski-objekti#rezultati" className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 lg:items-end">
              <FilterField label="Pretraga" className="lg:col-span-2">
                <span className="relative"><SearchLg size={20} className="pointer-events-none absolute left-3 top-2.5 text-[#a3a3a3]" /><input name="q" defaultValue={sp.q} placeholder="Naziv objekta ili naselje" className={`${inputCls} pl-10`} /></span>
              </FilterField>
              <FilterField label="Općina"><select name="municipality" defaultValue={sp.municipality ?? ''} className={inputCls}><option value="">Sve općine</option>{MUNICIPALITIES.map((m) => <option key={m}>{m}</option>)}</select></FilterField>
              <FilterField label="Vrsta"><select name="kind" defaultValue={sp.kind ?? ''} className={inputCls}><option value="">Sve vrste</option>{KINDS.map((m) => <option key={m}>{m}</option>)}</select></FilterField>
              <FilterField label="Zvjezdice"><select name="stars" defaultValue={sp.stars ?? ''} className={inputCls}><option value="">Sve kategorije</option>{[5, 4, 3, 2].map((n) => <option key={n} value={n}>{n} ★</option>)}</select></FilterField>
              <div className="flex gap-3 lg:col-span-5 lg:justify-end">
                {pills.length > 0 && <Button href="/registri/ugostiteljski-objekti#rezultati" variant="tertiary">Očisti filtere</Button>}
                <button className="inline-flex h-10 items-center justify-center gap-1.5 rounded-[8px] border-2 border-white/10 bg-[var(--br-600)] px-[14px] text-[14px] font-semibold text-white shadow-[0_1px_2px_rgba(10,13,18,0.05),inset_0_-2px_0_rgba(10,13,18,0.05),inset_0_0_0_1px_rgba(10,13,18,0.18)] hover:bg-[var(--br-700)]"><FilterLines size={20} />Primijeni filtere</button>
              </div>
            </form>
          </Card>

          {pills.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {pills.map((k) => (
                <Link key={k} href={without(k)} className="inline-flex items-center gap-1 rounded-[6px] bg-white py-0.5 pl-2 pr-1 text-[14px] font-medium text-[#404040] ring-1 ring-inset ring-[#d4d4d4] hover:bg-[#fafafa]" title="Ukloni filter">
                  {LABELS[k]}: {k === 'stars' ? `${sp[k]} ★` : sp[k]}<XClose size={14} className="text-[#a3a3a3]" />
                </Link>
              ))}
            </div>
          )}

          <div className="mt-6">
            <TableCard title="Rješenja o kategorizaciji" badge={<Badge tone="brand">{rows.length} od {fmt(all.length)}</Badge>} description="Evidencija prema Zakonu o ugostiteljskoj djelatnosti.">
              <table className="w-full min-w-[900px]">
                <thead><tr><th className={th}>Objekat</th><th className={th}>Lokacija</th><th className={th}>Kategorija</th><th className={th}>Kapacitet</th><th className={th}>Rješenje</th><th className={th}>Status</th><th className={`${th} text-right`}><span className="sr-only">Radnje</span></th></tr></thead>
                <tbody>
                  {rows.length === 0 && <tr><td colSpan={7} className={`${td} py-12 text-center`}>Nema objekata za odabrane kriterije.</td></tr>}
                  {rows.map((f) => (
                    <tr key={f.id} className="hover:bg-[#fafafa]">
                      <td className={td}><span className="block font-medium text-[#171717]">{f.name}{f.isDemo && <Badge tone="warning" className="ml-2">Demo</Badge>}</span><span>{f.kind}</span></td>
                      <td className={td}><span className="block font-medium text-[#171717]">{f.municipality}</span><span>{f.address}</span></td>
                      <td className={td}><Stars n={f.stars} /></td>
                      <td className={`${td} whitespace-nowrap`}><span className="block text-[#171717]">{f.rooms ?? '—'} jedinica</span><span>{f.beds ?? '—'} ležaja</span></td>
                      <td className={`${td} whitespace-nowrap`}><span className="block font-medium text-[#171717]">{f.decisionNumber || '—'}</span><span>{dateShort(f.decisionDate)}</span></td>
                      <td className={td}><Badge tone="success" dot>Aktivno</Badge></td>
                      <td className={`${td} text-right`}>{f.lat != null && <Link href="/mapa" title="Prikaži na karti" aria-label={`${f.name} na karti`} className="inline-flex rounded-[8px] p-2 text-[#a3a3a3] hover:bg-[#fafafa] hover:text-[#525252]"><MarkerPin04 size={20} /></Link>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TableCard>
          </div>
        </Container>
      </section>
    </>
  );
}
