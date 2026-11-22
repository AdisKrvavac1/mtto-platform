import Link from 'next/link';
import { apiSafe, type Doc } from '@/lib/api';
import { DOC_TYPE, dateShort, fileExt, fileSize } from '@/lib/format';
import { Badge, Button, Container, CtaBox, FeaturedIcon, PageHeader, Section, SectionHeader, TableCard, td, th } from '@/components/uui';
import { Download01, File06, FileCheck02, Mail01, Phone01, Scales02, SearchLg, BarChartSquare02, CheckDone01 } from '@untitledui/icons';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Propisi, zakoni i obrasci' };

const TABS = [
  { key: 'ZAKON', label: 'Zakoni i uredbe' },
  { key: 'PRAVILNIK', label: 'Pravilnici' },
  { key: 'OBRAZAC', label: 'Obrasci' },
  { key: 'ODLUKA', label: 'Odluke i rješenja' },
  { key: 'IZVJESTAJ', label: 'Strategije i izvještaji' },
];

export default async function PropisiPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const tab = sp.docType || 'ZAKON';
  const qs = new URLSearchParams({ docType: tab });
  if (sp.q) qs.set('q', sp.q);
  const [rows, all] = await Promise.all([apiSafe<Doc[]>(`/documents?${qs}`, []), apiSafe<Doc[]>('/documents', [])]);
  const forms = all.filter((d) => d.docType === 'OBRAZAC').slice(0, 3);
  const count = (t: string) => all.filter((d) => d.docType === t).length;

  return (
    <>
      <PageHeader crumbs={[{ label: 'Naslovna', href: '/' }, { label: 'Propisi i obrasci' }]} eyebrow="Pravna baza" title="Propisi, zakoni i obrasci">
        Važeći zakoni, pravilnici i službeni obrasci iz nadležnosti Ministarstva, s brojem službenog glasnika i datumom donošenja.
      </PageHeader>

      {/* Istaknuti obrasci */}
      <Section tone="gray" className="!pt-12 md:!pt-16">
        <SectionHeader eyebrow="Najčešće preuzimano" title="Obrasci zahtjeva" actions={<Button href="/propisi?docType=OBRAZAC#tablica" variant="secondary" size="lg">Svi obrasci ({count('OBRAZAC')})</Button>} />
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {forms.map((d) => (
            <div key={d.id} className="uui-lift flex flex-col rounded-[12px] bg-white p-6 ring-1 ring-inset ring-[#e5e5e5] shadow-[0_1px_2px_rgba(10,13,18,0.05)]">
              <div className="flex items-start justify-between gap-3"><FeaturedIcon icon={FileCheck02} size="md" /><div className="flex gap-2">{d.isDemo && <Badge tone="warning">Demo</Badge>}<Badge tone="gray">{fileExt(d.fileName)} · {fileSize(d.size)}</Badge></div></div>
              <h3 className="mt-5 text-[18px] leading-7 font-semibold text-[#171717]">{d.title}</h3>
              <p className="mt-1 text-[14px] leading-5 text-[#525252]">{d.sector}{d.number ? ` · ${d.number}` : ''}</p>
              {d.description && <p className="mt-3 text-[16px] leading-6 text-[#525252] line-clamp-3">{d.description}</p>}
              <div className="mt-auto pt-6"><Button href={`/api/documents/${d.id}/file`} variant="secondary" icon={Download01} external className="w-full">Preuzmi obrazac</Button></div>
            </div>
          ))}
          {forms.length === 0 && <p className="text-[16px] text-[#525252]">Obrasci još nisu objavljeni.</p>}
        </div>
      </Section>

      {/* Tablica akata */}
      <section id="tablica" className="bg-white py-16 md:py-24 scroll-mt-24">
        <Container>
          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <nav aria-label="Vrsta akta" className="flex gap-1 overflow-x-auto rounded-[10px] bg-[#fafafa] p-1 ring-1 ring-inset ring-[#e5e5e5] [scrollbar-width:none] max-w-full">
              {TABS.map((t) => (
                <Link key={t.key} href={`/propisi?docType=${t.key}#tablica`} scroll={false} className={`h-9 px-3 inline-flex items-center gap-2 rounded-[6px] text-[14px] font-semibold whitespace-nowrap ${tab === t.key ? 'bg-white text-[#404040] shadow-[0_1px_2px_rgba(10,13,18,0.05)] ring-1 ring-inset ring-[#d4d4d4]' : 'text-[#737373] hover:text-[#404040]'}`}>
                  {t.label}<span className={`rounded-full px-2 text-[12px] leading-[18px] font-medium ${tab === t.key ? 'bg-[var(--br-50)] text-[var(--br-700)]' : 'bg-[#f5f5f5] text-[#525252]'}`}>{count(t.key)}</span>
                </Link>
              ))}
            </nav>
            <form action="/propisi#tablica" className="flex h-10 w-full items-center gap-2 rounded-[8px] px-3 ring-1 ring-inset ring-[#d4d4d4] shadow-[0_1px_2px_rgba(10,13,18,0.05)] focus-within:ring-2 focus-within:ring-[var(--br-500)] lg:w-[320px]">
              <input type="hidden" name="docType" value={tab} />
              <SearchLg size={20} className="text-[#a3a3a3]" />
              <input name="q" defaultValue={sp.q} aria-label="Pretraga propisa" placeholder="Pretraži po nazivu ili broju" className="min-w-0 flex-1 border-0 bg-transparent p-0 text-[16px] text-[#171717] placeholder:text-[#737373] shadow-none focus:outline-none focus:ring-0" />
            </form>
          </div>
          <TableCard title={TABS.find((t) => t.key === tab)?.label} badge={<Badge tone="brand">{rows.length} dokumenata</Badge>} description="Klikom na preuzimanje otvara se izvorni dokument.">
            <table className="w-full min-w-[760px]">
              <thead><tr><th className={th}>Naziv akta</th><th className={th}>Broj / glasnik</th><th className={th}>Datum</th><th className={th}>Status</th><th className={`${th} text-right`}>Dokument</th></tr></thead>
              <tbody>
                {rows.map((d) => (
                  <tr key={d.id} className="hover:bg-[#fafafa]">
                    <td className={td}>
                      <div className="flex items-center gap-3">
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[var(--br-50)] text-[var(--br-600)]"><File06 size={20} /></span>
                        <div className="min-w-0"><p className="font-medium text-[#171717]">{d.title}</p><p className="text-[#525252]">{d.description || d.sector}</p></div>
                      </div>
                    </td>
                    <td className={td}>{d.number || '—'}</td>
                    <td className={`${td} whitespace-nowrap`}>{dateShort(d.issuedAt)}</td>
                    <td className={td}><div className="flex gap-1.5">{d.status === 'VAZECI' ? <Badge tone="success" dot>Važeći</Badge> : <Badge tone="gray" dot>Arhiviran</Badge>}{d.isDemo && <Badge tone="warning">Demo</Badge>}</div></td>
                    <td className={`${td} text-right`}><Button href={`/api/documents/${d.id}/file`} variant="tertiary" size="sm" icon={Download01} external>{fileExt(d.fileName)} · {fileSize(d.size)}</Button></td>
                  </tr>
                ))}
                {rows.length === 0 && <tr><td className={`${td} text-center py-12`} colSpan={5}>Nema dokumenata u ovoj kategoriji{sp.q ? ` za „${sp.q}”` : ''}.</td></tr>}
              </tbody>
            </table>
          </TableCard>
        </Container>
      </section>

      {/* Kako podnijeti zahtjev */}
      <Section tone="gray" id="kako-podnijeti">
        <SectionHeader eyebrow="Postupak" title="Kako ispravno podnijeti zahtjev" align="center">Pravilno popunjen zahtjev s prilozima ubrzava rješavanje predmeta.</SectionHeader>
        <div className="mt-12 md:mt-16 grid gap-10 md:grid-cols-3">
          {[
            [Scales02, 'Provjerite propis', 'Pronađite zakon i pravilnik koji uređuju postupak i provjerite potrebne priloge.'],
            [CheckDone01, 'Popunite obrazac', 'Koristite važeći obrazac iz ove baze i priložite tražene dokumente i dokaz o uplati takse.'],
            [BarChartSquare02, 'Pratite predmet', 'Nakon predaje u pisarnici dobijate broj predmeta. Online praćenje statusa dolazi u Fazi 2.'],
          ].map(([I, t, d]) => (
            <div key={t as string} className="flex flex-col items-center text-center"><FeaturedIcon icon={I as any} tone="brand" /><h3 className="mt-5 text-[20px] leading-[30px] font-semibold text-[#171717]">{t as string}</h3><p className="mt-2 text-[16px] leading-6 text-[#525252]">{d as string}</p></div>
          ))}
        </div>
        <div className="mt-16">
          <CtaBox title="Trebate pomoć oko zahtjeva?" actions={<><Button href="tel:+38736551823" variant="secondary" size="lg" icon={Phone01}>+387 36 551 823</Button><Button href="mailto:info@mtto.gov.ba" size="lg" icon={Mail01}>info@mtto.gov.ba</Button></>}>
            Pisarnica Ministarstva, Braće Fejića bb, Mostar. Rad sa strankama radnim danom.
          </CtaBox>
        </div>
      </Section>
    </>
  );
}
