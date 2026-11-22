import Link from 'next/link';
import { apiSafe, type Permit } from '@/lib/api';
import { dateShort, daysUntil } from '@/lib/format';
import { Badge, Button, Card, Container, Feature, FilterField, Metric, PageHeader, Section, SectionHeader, TableCard, inputCls, td, th } from '@/components/uui';
import { Code02, Database01, Eye, File06, FilterLines, Map01, MarkerPin04, SearchLg, Table, XClose } from '@untitledui/icons';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Registar okolišnih dozvola' };

const MUNICIPALITIES = ['Čapljina', 'Čitluk', 'Jablanica', 'Konjic', 'Mostar', 'Neum', 'Prozor-Rama', 'Ravno', 'Stolac'];
const ACTIVITY = ['Industrija', 'Energetika', 'Otpad', 'Turizam', 'Ostalo'];
const STATUS: Record<string, { label: string; tone: 'success' | 'warning' | 'error' }> = {
  VAZECA: { label: 'Važeća', tone: 'success' },
  U_OBNOVI: { label: 'U obnovi', tone: 'warning' },
  ISTEKLA: { label: 'Istekla', tone: 'error' },
};
const LABELS: Record<string, string> = { q: 'Pojam', municipality: 'Općina', activity: 'Djelatnost', status: 'Status' };

function remaining(validUntil: string) {
  const d = daysUntil(validUntil)!;
  if (d < 0) return { t: 'Istekla', c: 'text-[#d92d20]' };
  if (d < 60) return { t: `Ističe za ${d} dana`, c: 'text-[#d92d20]' };
  const m = Math.round(d / 30.4);
  return { t: m >= 12 ? `Još ${Math.floor(m / 12)} god. ${m % 12} mj.` : `Još ${m} mj.`, c: 'text-[#737373]' };
}

export default async function PermitsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const qs = new URLSearchParams();
  for (const k of ['q', 'municipality', 'activity', 'status']) if (sp[k]) qs.set(k, sp[k]!);
  const [rows0, all] = await Promise.all([apiSafe<Permit[]>(`/permits?${qs}`, []), apiSafe<Permit[]>('/permits', [])]);
  const sort = sp.sort || 'newest';
  const rows = [...rows0].sort((a, b) => sort === 'expiry' ? a.validUntil.localeCompare(b.validUntil) : sort === 'operator' ? a.operator.localeCompare(b.operator, 'bs') : sort === 'municipality' ? a.municipality.localeCompare(b.municipality, 'bs') : b.issuedAt.localeCompare(a.issuedAt));
  const by = (k: string) => all.filter((p) => p.activity === k).length;
  const pills = Object.keys(LABELS).filter((k) => sp[k]);
  const without = (k: string) => { const p = new URLSearchParams(qs); p.delete(k); return `/registri/okolisne-dozvole?${p}#rezultati`; };

  return (
    <>
      <PageHeader
        crumbs={[{ label: 'Naslovna', href: '/' }, { label: 'E-usluge', href: '/e-usluge' }, { label: 'Okolišne dozvole' }]}
        eyebrow="Javni registar"
        title="Registar okolišnih dozvola"
        actions={<><Button href="/registri/okolisne-dozvole/izvoz?format=csv" variant="secondary" size="lg" icon={Table}>Izvoz CSV</Button><Button href="/mapa" size="lg" icon={Map01}>Prikaži na karti</Button></>}
      >
        Dozvole izdane prema Zakonu o zaštiti okoliša HNK, s rokom važenja, operaterom i lokacijom postrojenja.
      </PageHeader>

      <Section tone="gray" className="!py-12 md:!py-16">
        <div className="grid gap-8 grid-cols-2 lg:grid-cols-5">
          <Metric value={String(all.length)} label="Ukupno dozvola" />
          <Metric value={String(by('Industrija'))} label="Industrija" />
          <Metric value={String(by('Energetika'))} label="Energetika" />
          <Metric value={String(by('Otpad'))} label="Otpad" />
          <Metric value={String(all.filter((p) => p.status === 'U_OBNOVI').length)} label="U postupku obnove" />
        </div>
      </Section>

      <section id="rezultati" className="bg-white py-12 md:py-16 scroll-mt-24">
        <Container>
          {all.some((p) => p.isDemo) && (
            <div className="mb-6 flex items-start gap-3 rounded-[12px] bg-[#fffcf5] p-4 text-[14px] leading-5 text-[#b54708] ring-1 ring-inset ring-[#fedf89]">
              <Badge tone="warning">Demo</Badge><span>Zapisi označeni kao Demo su primjeri za prezentaciju. Stvarne dozvole unosi Sektor za zaštitu okoliša kroz CMS.</span>
            </div>
          )}
          <Card className="p-5 md:p-6">
            <form action="/registri/okolisne-dozvole#rezultati" className="grid gap-4 md:grid-cols-2 lg:grid-cols-6 lg:items-end">
              <FilterField label="Pretraga" className="lg:col-span-2">
                <span className="relative"><SearchLg size={20} className="pointer-events-none absolute left-3 top-2.5 text-[#a3a3a3]" /><input name="q" defaultValue={sp.q} placeholder="Operater, broj rješenja, postrojenje" className={`${inputCls} pl-10`} /></span>
              </FilterField>
              <FilterField label="Općina"><select name="municipality" defaultValue={sp.municipality ?? ''} className={inputCls}><option value="">Sve općine</option>{MUNICIPALITIES.map((m) => <option key={m}>{m}</option>)}</select></FilterField>
              <FilterField label="Djelatnost"><select name="activity" defaultValue={sp.activity ?? ''} className={inputCls}><option value="">Sve djelatnosti</option>{ACTIVITY.map((m) => <option key={m}>{m}</option>)}</select></FilterField>
              <FilterField label="Status"><select name="status" defaultValue={sp.status ?? ''} className={inputCls}><option value="">Svi statusi</option><option value="VAZECA">Važeće</option><option value="U_OBNOVI">U obnovi</option><option value="ISTEKLA">Istekle</option></select></FilterField>
              <FilterField label="Sortiranje"><select name="sort" defaultValue={sort} className={inputCls}><option value="newest">Najnovije rješenje</option><option value="expiry">Rok važenja</option><option value="operator">Operater (A–Ž)</option><option value="municipality">Općina</option></select></FilterField>
              <div className="flex gap-3 lg:col-span-6 lg:justify-end">
                {pills.length > 0 && <Button href="/registri/okolisne-dozvole#rezultati" variant="tertiary">Očisti filtere</Button>}
                <button className="inline-flex h-10 items-center justify-center gap-1.5 rounded-[8px] border-2 border-white/10 bg-[var(--br-600)] px-[14px] text-[14px] font-semibold text-white shadow-[0_1px_2px_rgba(10,13,18,0.05),inset_0_-2px_0_rgba(10,13,18,0.05),inset_0_0_0_1px_rgba(10,13,18,0.18)] hover:bg-[var(--br-700)]"><FilterLines size={20} />Primijeni filtere</button>
              </div>
            </form>
          </Card>

          {pills.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {pills.map((k) => (
                <Link key={k} href={without(k)} className="inline-flex items-center gap-1 rounded-[6px] bg-white py-0.5 pl-2 pr-1 text-[14px] font-medium text-[#404040] ring-1 ring-inset ring-[#d4d4d4] hover:bg-[#fafafa]" title="Ukloni filter">
                  {LABELS[k]}: {k === 'status' ? STATUS[sp[k]!]?.label : sp[k]}<XClose size={14} className="text-[#a3a3a3]" />
                </Link>
              ))}
            </div>
          )}

          <div className="mt-6">
            <TableCard title="Izdane okolišne dozvole" badge={<Badge tone="brand">{rows.length} od {all.length}</Badge>}>
              <table className="w-full min-w-[960px]">
                <thead><tr><th className={th}>Broj i datum</th><th className={th}>Operater i postrojenje</th><th className={th}>Lokacija</th><th className={th}>Djelatnost</th><th className={th}>Rok važenja</th><th className={th}>Status</th><th className={`${th} text-right`}><span className="sr-only">Radnje</span></th></tr></thead>
                <tbody>
                  {rows.length === 0 && <tr><td colSpan={7} className={`${td} py-12 text-center`}>Nema dozvola za odabrane kriterije.</td></tr>}
                  {rows.map((p) => {
                    const st = STATUS[p.status] ?? STATUS.VAZECA;
                    const r = remaining(p.validUntil);
                    return (
                      <tr key={p.id} className="hover:bg-[#fafafa]">
                        <td className={td}><Link href={`/registri/okolisne-dozvole/${p.id}`} className="block font-medium text-[var(--br-700)] hover:underline whitespace-nowrap">{p.registerNumber}</Link><span className="text-[#737373]">{dateShort(p.issuedAt)}</span></td>
                        <td className={td}><span className="block font-medium text-[#171717]">{p.operator}{p.isDemo && <Badge tone="warning" className="ml-2">Demo</Badge>}</span><span>{p.facility}</span></td>
                        <td className={td}><span className="block font-medium text-[#171717]">{p.municipality}</span><span>{p.address}</span></td>
                        <td className={td}><Badge tone="gray">{p.activity}</Badge></td>
                        <td className={`${td} whitespace-nowrap`}><span className="block font-medium text-[#171717]">{dateShort(p.validUntil)}</span><span className={r.c}>{r.t}</span></td>
                        <td className={td}><Badge tone={st.tone} dot>{st.label}</Badge></td>
                        <td className={`${td} text-right`}>
                          <div className="flex justify-end gap-1">
                            <Link className="rounded-[8px] p-2 text-[#a3a3a3] hover:bg-[#fafafa] hover:text-[#525252]" title="Rješenje i dokumentacija" href={`/registri/okolisne-dozvole/${p.id}#dokumenti`}><File06 size={20} /></Link>
                            <Link className="rounded-[8px] p-2 text-[#a3a3a3] hover:bg-[#fafafa] hover:text-[#525252]" title="Lokacija na karti" href="/mapa"><MarkerPin04 size={20} /></Link>
                            <Link className="rounded-[8px] p-2 text-[#a3a3a3] hover:bg-[#fafafa] hover:text-[#525252]" title="Detalji dozvole" href={`/registri/okolisne-dozvole/${p.id}`}><Eye size={20} /></Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </TableCard>
          </div>
        </Container>
      </section>

      <Section tone="gray">
        <SectionHeader eyebrow="Otvoreni podaci" title="Preuzmite registar">Podaci iz registra dostupni su za istraživače, novinare i programske integracije.</SectionHeader>
        <div className="mt-12 grid gap-x-8 gap-y-10 md:grid-cols-2 lg:grid-cols-4">
          <Feature icon={Table} title="CSV za Excel" href="/registri/okolisne-dozvole/izvoz?format=csv" cta="Preuzmi CSV">UTF-8, razdvojeno tačka-zarezom, otvara se direktno u Excelu.</Feature>
          <Feature icon={Code02} title="JSON" href="/registri/okolisne-dozvole/izvoz?format=json" cta="Otvori JSON">Strojno čitljiv izvoz cijelog registra za integracije.</Feature>
          <Feature icon={Database01} title="WFS / WMS sloj">OGC geoprostorni servis za GIS alate. <Badge tone="gray" className="ml-1">Faza 2</Badge></Feature>
          <Feature icon={File06} title="Uvid u spis" href="/o-nama#upit" cta="Pošalji zahtjev">Zahtjev po Zakonu o slobodi pristupa informacijama, rok 15 dana.</Feature>
        </div>
      </Section>
    </>
  );
}
