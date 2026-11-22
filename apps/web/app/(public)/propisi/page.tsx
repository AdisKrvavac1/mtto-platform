import Link from 'next/link';
import { apiSafe, type Doc } from '@/lib/api';
import { DOC_TYPE, dateShort, fileExt, fileSize } from '@/lib/format';
import { Badge, Button, Card, Container, FeaturedIcon, GRAD, Head, HeroInfo, PageHero, TableCard, td, th } from '@/components/uui';
import { BankNote01, Building07, CheckCircle, Clock, Download01, File06, Mail01, MarkerPin02, Monitor01, Phone01, Scales02, SearchLg, Send01 } from '@untitledui/icons';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Propisi, zakoni i obrasci' };

const TABS = [
  { key: 'ZAKON', label: 'Zakoni i uredbe' },
  { key: 'PRAVILNIK', label: 'Pravilnici' },
  { key: 'OBRAZAC', label: 'Obrasci zahtjeva' },
  { key: 'ODLUKA', label: 'Odluke i rješenja' },
  { key: 'IZVJESTAJ', label: 'Strategije i planovi' },
];

export default async function PropisiPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const tab = sp.docType || 'ZAKON';
  const qs = new URLSearchParams({ docType: tab });
  if (sp.q) qs.set('q', sp.q);
  const [rows, all] = await Promise.all([apiSafe<Doc[]>(`/documents?${qs}`, []), apiSafe<Doc[]>('/documents', [])]);
  const forms = all.filter((d) => d.docType === 'OBRAZAC').slice(0, 5);
  const count = (t: string) => all.filter((d) => d.docType === t).length;
  const latest = all.map((d) => d.createdAt).sort().pop();

  return (
    <>
      <PageHero
        crumbs={[{ label: 'Naslovna', href: '/' }, { label: 'Propisi i obrasci' }]}
        eyebrow="Normativni okvir i e-uprava"
        title="Službeni propisi, zakoni i obrasci zahtjeva"
        aside={<HeroInfo icon={CheckCircle} label="Ažurnost arhiva" value={latest ? dateShort(latest) : '—'}>Zadnji učitani dokument</HeroInfo>}
        stats={[
          { label: 'Važećih zakona', value: count('ZAKON'), sub: 'Hercegovačko-neretvanski kanton', icon: Scales02 },
          { label: 'Pravilnika i akata', value: count('PRAVILNIK') + count('ODLUKA'), sub: 'Turizam, okoliš i trgovina', icon: File06 },
          { label: 'Obrazaca', value: count('OBRAZAC'), sub: 'Spremni za preuzimanje', icon: Download01 },
          { label: 'Pisarnica Mostar', value: '08–16 h', sub: 'Rad sa strankama radnim danom', icon: Building07 },
        ]}
      >
        Važeći kantonalni zakoni, podzakonski akti, pravilnici, odluke Vlade i službeni obrasci za građane i privredne subjekte, spremni za preuzimanje.
      </PageHero>

      {/* NAJČEŠĆI OBRASCI */}
      <section className="bg-white py-16 md:py-24">
        <Container>
          <Head k="Hitni i najčešći postupci" t="Najčešće traženi obrasci" action={<p className="max-w-[420px] text-[14px] text-[#525252]">Standardizirani obrasci usklađeni s upravnim postupkom. Popunite ih na računaru ili ručno i predajte na protokol.</p>} />
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {forms.map((d, i) => (
              <Card key={d.id} className="group uui-lift flex flex-col p-6">
                <div className="flex flex-wrap items-start justify-between gap-2"><Badge tone="success">Obrazac {String(i + 1).padStart(2, '0')} · {d.sector}</Badge>{d.isDemo && <Badge tone="warning">Demo</Badge>}</div>
                <h3 className="mt-4 text-[18px] leading-7 font-semibold text-[#171717]">{d.title}</h3>
                {d.description && <p className="mt-2 line-clamp-3 text-[14px] leading-5 text-[#525252]">{d.description}</p>}
                <div className="mt-6 flex items-center justify-between gap-3 border-t border-[#e5e5e5] pt-4">
                  <span className="text-[12px] font-medium text-[#737373]">Dostupan format</span>
                  <Button href={`/api/documents/${d.id}/file`} size="sm" icon={Download01} external>{fileExt(d.fileName)} · {fileSize(d.size)}</Button>
                </div>
              </Card>
            ))}
            <div className={`flex flex-col rounded-[12px] p-6 text-white ${GRAD}`}>
              <span className="flex size-12 items-center justify-center rounded-[10px] bg-white/10 ring-1 ring-inset ring-white/20"><Mail01 size={24} /></span>
              <h3 className="mt-5 text-[20px] leading-[30px] font-semibold">Trebate obrazac ili taksu koja nije navedena?</h3>
              <p className="mt-2 text-[14px] text-[var(--br-100)]">Ukoliko traženi upravni akt nije u pregledu, pogledajte cijelu pravnu bazu ili kontaktirajte pisarnicu.</p>
              <Link href="#tablica" className="mt-6 inline-flex h-11 items-center justify-center gap-1.5 rounded-[8px] border-2 border-white/10 bg-[var(--gr-600)] px-4 text-[16px] font-semibold text-white hover:bg-[var(--gr-700)] lg:mt-auto">Kompletna pravna baza</Link>
            </div>
          </div>
          {forms.length === 0 && <p className="mt-6 text-[16px] text-[#525252]">Obrasci još nisu objavljeni.</p>}
        </Container>
      </section>

      {/* PROPISI PO CJELINAMA */}
      <section id="tablica" className="scroll-mt-28 bg-[#fafafa] py-16 md:py-24">
        <Container>
          <Head k="Registar važećih akata HNK" t="Službeni propisi po pravnim cjelinama" action={
            <form action="/propisi#tablica" className="flex h-11 w-full items-center gap-2 rounded-[8px] bg-white px-3.5 ring-1 ring-inset ring-[#d4d4d4] shadow-[0_1px_2px_rgba(10,13,18,0.05)] focus-within:ring-2 focus-within:ring-[var(--br-500)] md:w-[320px]">
              <input type="hidden" name="docType" value={tab} />
              <SearchLg size={20} className="text-[#a3a3a3]" />
              <input name="q" defaultValue={sp.q} aria-label="Pretraga propisa" placeholder="Naziv ili broj glasnika" className="min-w-0 flex-1 border-0 bg-transparent p-0 text-[16px] !shadow-none focus:outline-none focus:ring-0" />
            </form>
          } />
          <nav aria-label="Vrsta akta" className="mt-8 flex gap-2 overflow-x-auto [scrollbar-width:none]">
            {TABS.map((t) => (
              <Link key={t.key} href={`/propisi?docType=${t.key}#tablica`} scroll={false} className={`flex h-10 shrink-0 items-center gap-2 rounded-[8px] px-3.5 text-[14px] font-semibold ${tab === t.key ? 'bg-[#062343] text-white' : 'bg-white text-[#404040] ring-1 ring-inset ring-[#d4d4d4] hover:bg-[#f5f5f5]'}`}>
                {t.label}<span className={`rounded-full px-2 text-[12px] leading-[18px] ${tab === t.key ? 'bg-white/15 text-white' : 'bg-[#f5f5f5] text-[#525252]'}`}>{count(t.key)}</span>
              </Link>
            ))}
          </nav>
          <div className="mt-6">
            <TableCard title={TABS.find((t) => t.key === tab)?.label} badge={<Badge tone="brand">{rows.length} dokumenata</Badge>}>
              <table className="w-full min-w-[860px]">
                <thead><tr><th className={th}>Naziv pravnog akta</th><th className={th}>Službeno glasilo</th><th className={th}>Datum</th><th className={th}>Sažetak i nadležnost</th><th className={`${th} text-right`}>Tekst</th></tr></thead>
                <tbody>
                  {rows.map((d) => (
                    <tr key={d.id} className="hover:bg-[#fafafa]">
                      <td className={td}><p className="font-semibold text-[#171717]">{d.title}</p><p className="mt-0.5 text-[12px] font-semibold text-[var(--gr-700)]">{d.sector}</p>{d.isDemo && <Badge tone="warning" className="mt-1">Demo</Badge>}</td>
                      <td className={td}>{d.number ? <Badge tone="brand">{d.number}</Badge> : '—'}</td>
                      <td className={`${td} whitespace-nowrap`}>{dateShort(d.issuedAt)}</td>
                      <td className={`${td} max-w-[360px]`}><span className="line-clamp-3">{d.description || DOC_TYPE[d.docType]}</span></td>
                      <td className={`${td} text-right`}><Button href={`/api/documents/${d.id}/file`} size="sm" variant={d.docType === 'ZAKON' ? 'primary' : 'secondary'} icon={Download01} external>{fileExt(d.fileName)} ({fileSize(d.size)})</Button></td>
                    </tr>
                  ))}
                  {rows.length === 0 && <tr><td className={`${td} py-12 text-center`} colSpan={5}>Nema dokumenata u ovoj kategoriji{sp.q ? ` za „${sp.q}”` : ''}.</td></tr>}
                </tbody>
              </table>
            </TableCard>
            <p className="mt-4 flex flex-col gap-2 text-[14px] text-[#525252] md:flex-row md:justify-between"><span>Prikazano je {rows.length} propisa u odabranoj kategoriji.</span><span>Trebate ovjereni izvod iz arhive? <Link href="/o-nama#upit" className="font-semibold text-[var(--br-700)]">Kontaktirajte protokol</Link></span></p>
          </div>
        </Container>
      </section>

      {/* KAKO PODNIJETI ZAHTJEV */}
      <section className="bg-white py-16 md:py-24">
        <Container className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <Head k="Standardizacija predaje" t="Kako ispravno podnijeti zahtjev Ministarstvu?" s="Građani i privredni subjekti zahtjev mogu podnijeti na dva ravnopravna načina, prema Zakonu o upravnom postupku." />
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <Card className="uui-lift p-5"><FeaturedIcon icon={Monitor01} tone="brand" size="md" /><h3 className="mt-4 text-[16px] font-semibold text-[#171717]">1. Putem e-pisarnice</h3><p className="mt-1 text-[14px] text-[#525252]">Ispunjeni obrazac s kvalificiranim e-potpisom šalje se na e-protokol.</p><Badge tone="gray" className="mt-3">Faza 2</Badge></Card>
              <Card className="uui-lift p-5"><FeaturedIcon icon={Building07} tone="success" size="md" /><h3 className="mt-4 text-[16px] font-semibold text-[#171717]">2. Fizički na protokolu</h3><p className="mt-1 text-[14px] text-[#525252]">Original s prilozima predaje se u pisarnici u Mostaru, radnim danom.</p><Badge tone="success" dot className="mt-3">Prijemni štambilj odmah</Badge></Card>
            </div>
            <div className="mt-4 flex gap-3 rounded-[12px] bg-[#fffcf5] p-4 ring-1 ring-inset ring-[#fedf89]">
              <BankNote01 size={20} className="mt-0.5 shrink-0 text-[#dc6803]" />
              <p className="text-[14px] leading-5 text-[#93370d]"><b className="font-semibold">Upravna pristojba (taksa).</b> Iznos takse i račun za uplatu navedeni su u obrascu i pravilniku za svaki postupak. U slučaju nedoumice nazovite pisarnicu.</p>
            </div>
          </div>
          <div className="relative overflow-hidden rounded-[24px]"><img src="/hero/pocitelj-m.jpg" alt="Počitelj" className="aspect-[4/3] w-full object-cover" /><span className="absolute bottom-4 left-4 rounded-full bg-white/90 px-3 py-1 text-[12px] font-semibold text-[#404040] backdrop-blur">Počitelj, Čapljina</span></div>
        </Container>
      </section>

      {/* PISARNICA + PROVJERA STATUSA */}
      <section className="bg-[#fafafa] py-16 md:py-24">
        <Container className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <Card className="p-6 md:p-8">
            <p className="text-[14px] font-semibold text-[var(--br-700)]">Izravan kontakt s referentima</p>
            <h2 className="mt-2 text-[24px] leading-8 md:text-[30px] md:leading-[38px] font-semibold text-[#171717]">Centralna pisarnica i služba za odnose sa strankama</h2>
            <p className="mt-2 text-[16px] text-[#525252]">Ukoliko imate dilemu oko dokumentacije za izdavanje dozvola ili želite provjeriti status predmeta, javite se pisarnici.</p>
            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              {([[MarkerPin02, 'Adresa pisarnice', 'Braće Fejića bb, 88000 Mostar'], [Clock, 'Radno vrijeme', 'Ponedjeljak – petak, 08:00 – 16:00'], [Phone01, 'Telefonski protokol', '+387 36 551 823'], [Mail01, 'E-pošta', 'info@mtto.gov.ba']] as const).map(([I, t, v]) => (
                <div key={t} className="flex gap-3"><FeaturedIcon icon={I} size="md" /><div><p className="text-[16px] font-semibold text-[#171717]">{t}</p><p className="text-[14px] text-[#525252]">{v}</p></div></div>
              ))}
            </div>
          </Card>
          <div className={`rounded-[16px] p-6 text-white md:p-8 ${GRAD}`}>
            <Badge tone="success">Brza e-provjera · Faza 2</Badge>
            <h3 className="mt-4 text-[20px] leading-[30px] font-semibold">Provjera statusa vašeg podneska</h3>
            <p className="mt-2 text-[14px] text-[var(--br-100)]">Unesite broj predmeta (npr. UP/1-07-128/26) kako biste vidjeli zaduženog referenta i stanje rješavanja.</p>
            <div className="mt-6 space-y-3">
              <label className="block space-y-1.5"><span className="text-[14px] font-medium text-[var(--br-100)]">Broj predmeta</span><input disabled placeholder="UP/1-07-128/26" className="h-11 w-full rounded-[8px] border-0 bg-white/10 px-3.5 text-[16px] text-white ring-1 ring-inset ring-white/20 placeholder:text-white/50" /></label>
              <label className="block space-y-1.5"><span className="text-[14px] font-medium text-[var(--br-100)]">JIB podnosioca ili firme</span><input disabled placeholder="13-cifreni identifikator" className="h-11 w-full rounded-[8px] border-0 bg-white/10 px-3.5 text-[16px] text-white ring-1 ring-inset ring-white/20 placeholder:text-white/50" /></label>
              <button disabled className="flex h-11 w-full items-center justify-center gap-1.5 rounded-[8px] bg-[var(--gr-600)] text-[16px] font-semibold text-white opacity-70"><Send01 size={20} />Provjeri status u pisarnici</button>
            </div>
            <p className="mt-4 text-[12px] text-[var(--br-200)]">Usluga se uključuje uvođenjem e-pisarnice.</p>
          </div>
        </Container>
      </section>
    </>
  );
}
