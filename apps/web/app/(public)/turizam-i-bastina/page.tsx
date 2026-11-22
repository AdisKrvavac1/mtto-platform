import Link from 'next/link';
import { apiSafe, type PostListItem, type Facility } from '@/lib/api';
import { dateShort, dateTime } from '@/lib/format';
import { Badge, Button, Card, CtaBox, Feature, FeaturedIcon, ImageCard, Metric, Section, SectionHeader, SplitHero, TableCard, td, th } from '@/components/uui';
import { ArrowRight, Award01, Building07, Calendar, CheckVerified01, Download01, Edit05, File06, Map01, Phone01, Mail01, Route, Users01 } from '@untitledui/icons';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Turizam i baština' };

type Stats = { calls: number; facilities: number };
type List = { items: PostListItem[] };

export default async function TurizamPage() {
  const [stats, calls, facilities] = await Promise.all([
    apiSafe<Stats>('/stats', { calls: 0, facilities: 0 }),
    apiSafe<List>(`/posts?type=JAVNI_POZIV&category=Turizam&limit=1`, { items: [] }),
    apiSafe<Facility[]>('/facilities', []),
  ]);
  const call = calls.items[0];
  const open = call && (!call.deadline || new Date(call.deadline) > new Date());

  return (
    <>
      <SplitHero
        crumbs={[{ label: 'Naslovna', href: '/' }, { label: 'Turizam i baština' }]}
        eyebrow="Sektor za turizam i ugostiteljstvo"
        title="Turizam i baština Hercegovine"
        image="/fig/tile-neum.jpg"
        imageAlt="Neumski zaljev"
        actions={<><Button href="/turisticki-vodici" variant="secondary" size="xl" icon={Users01}>Ispit za vodiče</Button><Button href="/registri/ugostiteljski-objekti" size="xl" icon={Building07}>Kategorizirani objekti</Button></>}
        card={<div className="flex items-center gap-4"><span className="flex size-12 items-center justify-center rounded-full bg-[#f9f5ff] text-[#7f56d9]"><Map01 size={24} /></span><div><p className="text-[14px] font-semibold text-[#171717]">Neum</p><p className="text-[14px] text-[#525252]">Jedini izlaz BiH na Jadransko more</p></div></div>}
      >
        Kategorizacija ugostiteljskih objekata, licenciranje turističkih vodiča i poticaji za razvoj turističke ponude – od Starog grada Mostara do obale u Neumu.
      </SplitHero>

      <Section tone="gray" className="!py-12 md:!py-16">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <Metric value={String(stats.facilities)} label="Kategoriziranih objekata u registru" />
          <Metric value="2" label="Lokaliteta na UNESCO listi (Mostar, Stećci)" />
          <Metric value="2" label="Parka prirode" />
          <Metric value="4.401 km²" label="Površina kantona" />
        </div>
      </Section>

      {/* Usluge resora */}
      <Section>
        <SectionHeader eyebrow="Za privrednike i vodiče" title="Usluge Sektora za turizam">Kontakt: Edina Jogunović, +387 36 552 498, turizam@mtto.gov.ba.</SectionHeader>
        <div className="mt-12 grid gap-x-8 gap-y-10 md:grid-cols-2 lg:grid-cols-4">
          <Feature icon={Award01} title="Kategorizacija objekata" href="/registri/ugostiteljski-objekti" cta="Otvori registar">Rješenja o kategoriji hotela, motela, pansiona, kampova i privatnog smještaja.</Feature>
          <Feature icon={Users01} title="Turistički vodiči" href="/turisticki-vodici" cta="Uslovi ispita">Stručni ispit za turističke vodiče i budući javni registar licenci.</Feature>
          <Feature icon={File06} title="Obrasci i dozvole" href="/propisi?docType=OBRAZAC" cta="Preuzmi obrasce">Zahtjevi za kategorizaciju i ostali obrasci iz oblasti ugostiteljstva.</Feature>
          <Feature icon={CheckVerified01} title="Poticaji i grantovi" href="/vijesti?type=JAVNI_POZIV" cta="Javni pozivi">Javni pozivi za sufinanciranje projekata razvoja turizma.</Feature>
        </div>
      </Section>

      {/* Javni poziv */}
      <Section tone="gray">
        <SectionHeader eyebrow="Javni poziv" title="Sufinanciranje u turizmu" actions={<Button href="/vijesti?type=JAVNI_POZIV" variant="secondary" size="lg">Svi pozivi</Button>} />
        <div className="mt-10">
          {call ? (
            <Card className="flex flex-col gap-6 p-6 md:p-8 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-[720px]">
                <div className="flex flex-wrap gap-2">{open ? <Badge tone="success" dot>Otvoren poziv</Badge> : <Badge tone="gray" dot>Zatvoren poziv</Badge>}{call.deadline && <Badge tone="error"><Calendar size={12} className="mr-1" />Rok {dateTime(call.deadline)} h</Badge>}</div>
                <h3 className="mt-4 text-[20px] leading-[30px] md:text-[24px] md:leading-8 font-semibold text-[#171717]"><Link href={`/vijesti/${call.slug}`} className="hover:text-[#6941c6]">{call.title}</Link></h3>
                {call.excerpt && <p className="mt-2 text-[16px] leading-6 text-[#525252]">{call.excerpt}</p>}
              </div>
              <div className="flex shrink-0 flex-col gap-3 sm:flex-row lg:flex-col">
                {open && <Button href={`/vijesti/${call.slug}#prijava`} size="lg" icon={Edit05}>Prijava</Button>}
                <Button href={`/vijesti/${call.slug}#dokumenti`} variant="secondary" size="lg" icon={Download01}>Tekst poziva i obrasci</Button>
              </div>
            </Card>
          ) : <p className="text-[16px] text-[#525252]">Trenutno nema objavljenih poziva iz oblasti turizma.</p>}
        </div>
      </Section>

      {/* Tematske cjeline */}
      <Section>
        <SectionHeader eyebrow="Razvojni prioriteti" title="Tematske cjeline turizma" align="center">Pravci razvoja turističkih proizvoda kantona.</SectionHeader>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          <ImageCard href="/mapa" image="/fig/tile-neretva.jpg" title="Kulturna baština" text="Stari most u Mostaru, Počitelj, Blagaj i tekija na vrelu Bune." />
          <ImageCard href="/mapa" image="/fig/tile-prenj.jpg" title="Aktivni turizam" text="Ćiro trasa, planinarenje na Prenju i rafting Neretvom." />
          <ImageCard href="/mapa" image="/fig/tile-hutovo.jpg" title="Enogastronomija" text="Vinske ceste Hercegovine, žilavka i blatina." />
        </div>
      </Section>

      {/* Kategorizirani objekti */}
      <Section tone="gray">
        <TableCard title="Kategorizirani ugostiteljski objekti" badge={<Badge tone="brand">{facilities.length} objekata</Badge>} description="Izvod iz registra rješenja o kategorizaciji." actions={<Button href="/registri/ugostiteljski-objekti" variant="secondary" iconRight={ArrowRight}>Cijeli registar</Button>}>
          <table className="w-full min-w-[720px]">
            <thead><tr><th className={th}>Objekat</th><th className={th}>Vrsta</th><th className={th}>Kategorija</th><th className={th}>Općina</th><th className={th}>Rješenje</th></tr></thead>
            <tbody>
              {facilities.slice(0, 6).map((f) => (
                <tr key={f.id} className="hover:bg-[#fafafa]">
                  <td className={td}><span className="font-medium text-[#171717]">{f.name}</span>{f.isDemo && <Badge tone="warning" className="ml-2">Demo</Badge>}</td>
                  <td className={td}>{f.kind}</td>
                  <td className={td}>{f.stars ? <span className="text-[#f79009]" aria-label={`${f.stars} zvjezdice`}>{'★'.repeat(f.stars)}</span> : '—'}</td>
                  <td className={td}>{f.municipality}</td>
                  <td className={`${td} whitespace-nowrap`}>{f.decisionNumber || '—'}{f.decisionDate ? ` · ${dateShort(f.decisionDate)}` : ''}</td>
                </tr>
              ))}
              {facilities.length === 0 && <tr><td className={`${td} text-center py-12`} colSpan={5}>Registar je prazan.</td></tr>}
            </tbody>
          </table>
        </TableCard>
        <div className="mt-16">
          <CtaBox title="Planirate otvoriti ugostiteljski objekat?" icon={<FeaturedIcon icon={Route} tone="brand" />} actions={<><Button href="tel:+38736552498" variant="secondary" size="lg" icon={Phone01}>036 552 498</Button><Button href="mailto:turizam@mtto.gov.ba" size="lg" icon={Mail01}>turizam@mtto.gov.ba</Button></>}>
            Sektor za turizam savjetuje o uslovima za kategorizaciju i potrebnoj dokumentaciji.
          </CtaBox>
        </div>
      </Section>
    </>
  );
}
