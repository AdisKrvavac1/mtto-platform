import Link from 'next/link';
import { apiSafe, type Permit, type PostListItem, type MapPoint } from '@/lib/api';
import MapSection from '@/components/site/MapSection';
import { POST_TYPE, dateShort } from '@/lib/format';
import { Badge, Button, Card, Container, CtaBox, Feature, ImageCard, Metric, Section, SectionHeader, SplitHero, TableCard, td, th } from '@/components/uui';
import { AlertTriangle, ArrowRight, Calendar, Clock, Download01, File06, Map01, Trash03, Globe04, Waves } from '@untitledui/icons';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Zaštita okoliša' };

type Stats = { posts: number; calls: number; documents: number; permits: number; permitsRenewal: number; facilities: number; locations: number };
type List = { items: PostListItem[] };

const PERMIT_ST: Record<string, [string, 'success' | 'warning' | 'error' | 'gray']> = {
  VAZECA: ['Važeća', 'success'], U_OBNOVI: ['U obnovi', 'warning'], ISTEKLA: ['Istekla', 'error'], POVUCENA: ['Povučena', 'gray'],
};

export default async function OkolisPage() {
  const [stats, permits, envPosts, calls, points] = await Promise.all([
    apiSafe<Stats>('/stats', { posts: 0, calls: 0, documents: 0, permits: 0, permitsRenewal: 0, facilities: 0, locations: 0 }),
    apiSafe<Permit[]>('/permits', []),
    apiSafe<List>(`/posts?category=${encodeURIComponent('Zaštita okoliša')}&limit=3`, { items: [] }),
    apiSafe<List>('/posts?type=JAVNI_POZIV&limit=3', { items: [] }),
    apiSafe<MapPoint[]>('/map', []),
  ]);
  const openCall = calls.items.find((c) => !c.deadline || new Date(c.deadline) > new Date());

  return (
    <>
      <SplitHero
        crumbs={[{ label: 'Naslovna', href: '/' }, { label: 'Zaštita okoliša' }]}
        eyebrow="Resor zaštite okoliša"
        title="Zaštita okoliša sliva Neretve"
        image="/fig/tile-hutovo.jpg"
        imageAlt="Park prirode Hutovo blato"
        actions={<><Button href="/registri/okolisne-dozvole" variant="secondary" size="xl" icon={File06}>Registar dozvola</Button><Button href="/eko-rizik" size="xl" icon={AlertTriangle}>Eko-rizik HNK</Button></>}
        card={<div className="flex items-center gap-4"><span className="flex size-12 items-center justify-center rounded-full bg-[var(--br-50)] text-[var(--br-600)]"><Globe04 size={24} /></span><div><p className="text-[14px] font-semibold text-[#171717]">Park prirode Hutovo blato</p><p className="text-[14px] text-[#525252]">Ramsarsko područje · Čapljina</p></div></div>}
      >
        Okolišne dozvole, upravljanje otpadom, javni uvidi i praćenje rizika od požara, poplava i klizišta na području Hercegovačko-neretvanskog kantona.
      </SplitHero>

      {/* Metrike */}
      <Section tone="gray" className="!py-12 md:!py-16">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <Metric value={String(stats.permits)} label="Okolišnih dozvola u registru" />
          <Metric value={String(stats.permitsRenewal)} label="Dozvola u postupku obnove" />
          <Metric value={String(stats.documents)} label="Propisa i obrazaca" />
          <Metric value={String(stats.locations + stats.permits + stats.facilities)} label="Lokacija na GIS karti" />
        </div>
      </Section>

      {/* Nadležnosti */}
      <Section>
        <SectionHeader eyebrow="Nadležnosti" title="Što radi Sektor za zaštitu okoliša">Kontakt: dr. sc. Zejnil Trešnjo, +387 36 551 324.</SectionHeader>
        <div className="mt-12 grid gap-x-8 gap-y-10 md:grid-cols-2 lg:grid-cols-4">
          <Feature icon={File06} title="Okolišne dozvole">Izdavanje i obnova dozvola za pogone i postrojenja, uz javni registar.</Feature>
          <Feature icon={Trash03} title="Upravljanje otpadom">Kantonalni plan upravljanja otpadom i registar ovlaštenih operatera.</Feature>
          <Feature icon={Waves} title="Vode i priroda">Praćenje stanja sliva Neretve, parkovi prirode Hutovo blato i Blidinje.</Feature>
          <Feature icon={AlertTriangle} title="Rizici">Dnevni pregled požara, upozorenja i vodostaja u modulu Eko-rizik HNK.</Feature>
        </div>
      </Section>

      {/* Registar dozvola */}
      <Section tone="gray">
        <TableCard title="Registar okolišnih dozvola" badge={<Badge tone="brand">{stats.permits} dozvola</Badge>} description="Najnovije dozvole; puni registar ima pretragu i izvoz." actions={<Button href="/registri/okolisne-dozvole" variant="secondary" iconRight={ArrowRight}>Cijeli registar</Button>}>
          <table className="w-full min-w-[820px]">
            <thead><tr><th className={th}>Broj</th><th className={th}>Operater</th><th className={th}>Općina</th><th className={th}>Djelatnost</th><th className={th}>Vrijedi do</th><th className={th}>Status</th></tr></thead>
            <tbody>
              {permits.slice(0, 6).map((p) => {
                const [sl, tone] = PERMIT_ST[p.status] ?? PERMIT_ST.VAZECA;
                return (
                  <tr key={p.id} className="hover:bg-[#fafafa]">
                    <td className={td}><Link href={`/registri/okolisne-dozvole/${p.id}`} className="font-medium text-[var(--br-700)] hover:underline whitespace-nowrap">{p.registerNumber}</Link></td>
                    <td className={td}><span className="font-medium text-[#171717]">{p.operator}</span>{p.isDemo && <Badge tone="warning" className="ml-2">Demo</Badge>}</td>
                    <td className={td}>{p.municipality}</td>
                    <td className={td}>{p.activity}</td>
                    <td className={`${td} whitespace-nowrap`}>{dateShort(p.validUntil)}</td>
                    <td className={td}><Badge tone={tone} dot>{sl}</Badge></td>
                  </tr>
                );
              })}
              {permits.length === 0 && <tr><td className={`${td} text-center py-12`} colSpan={6}>Nema dozvola u registru.</td></tr>}
            </tbody>
          </table>
        </TableCard>
      </Section>

      {/* Javni uvidi */}
      <Section>
        <SectionHeader eyebrow="Učešće javnosti" title="Javni uvidi i rasprave" actions={<Button href="/vijesti?category=Za%C5%A1tita%20okoli%C5%A1a" variant="secondary" size="lg">Sve objave</Button>}>Studije utjecaja na okoliš i planovi o kojima javnost može dati mišljenje.</SectionHeader>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {envPosts.items.map((p) => {
            const open = p.deadline ? new Date(p.deadline) > new Date() : null;
            return (
              <Card key={p.id} className="uui-lift flex flex-col p-6">
                <div className="flex flex-wrap gap-2"><Badge tone="brand">{POST_TYPE[p.type]}</Badge>{p.deadline && <Badge tone={open ? 'error' : 'gray'} dot>{open ? `Rok ${dateShort(p.deadline)}` : 'Završeno'}</Badge>}</div>
                <h3 className="mt-4 text-[18px] leading-7 font-semibold text-[#171717]"><Link href={`/vijesti/${p.slug}`} className="hover:text-[var(--br-700)]">{p.title}</Link></h3>
                {p.excerpt && <p className="mt-2 text-[16px] leading-6 text-[#525252] line-clamp-3">{p.excerpt}</p>}
                <div className="mt-auto pt-6 flex items-center justify-between gap-3 text-[14px]">
                  <span className="flex items-center gap-1.5 text-[#737373]"><Calendar size={16} />{dateShort(p.publishedAt)}</span>
                  <Button href={`/vijesti/${p.slug}${p.attachmentCount ? '#dokumenti' : ''}`} variant="link" size="sm" icon={p.attachmentCount ? Download01 : undefined}>{p.attachmentCount ? `Dokumenti (${p.attachmentCount})` : 'Otvori'}</Button>
                </div>
              </Card>
            );
          })}
          {envPosts.items.length === 0 && <p className="text-[16px] text-[#525252]">Trenutno nema otvorenih javnih uvida.</p>}
        </div>
      </Section>

      {/* Zaštićena područja */}
      <Section tone="gray">
        <SectionHeader eyebrow="Priroda" title="Zaštićena područja kantona" />
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          <ImageCard href="/turizam-i-bastina" image="/fig/tile-hutovo.jpg" title="Hutovo blato" text="Močvarni park prirode i stanište ptica selica." />
          <ImageCard href="/turizam-i-bastina" image="/fig/pa-blidinje.jpg" title="Blidinje" text="Visoravan između Čvrsnice i Vran planine." />
          <ImageCard href="/turizam-i-bastina" image="/fig/tile-neretva.jpg" title="Kanjon Neretve" text="Riječni koridor od Konjica do Čapljine." />
        </div>
      </Section>

      {/* Karta */}
      <Section>
        <SectionHeader eyebrow="GIS" title="Karta dozvola i zaštićenih područja" actions={<Button href="/mapa" variant="secondary" size="lg" icon={Map01}>Otvori punu kartu</Button>} />
        <Card className="mt-10 overflow-hidden p-2"><div className="overflow-hidden rounded-[8px]"><MapSection points={points} compact title={false} /></div></Card>
      </Section>

      {/* Javni poziv */}
      {openCall && (
        <section className="bg-white pb-16 md:pb-24">
          <Container>
            <CtaBox title={openCall.title} actions={<><Button href={`/vijesti/${openCall.slug}#dokumenti`} variant="secondary" size="lg" icon={Download01}>Kriteriji i upute</Button><Button href={`/vijesti/${openCall.slug}#prijava`} size="lg">Prijavi se online</Button></>}>
              <span className="mb-3 inline-flex"><Badge tone="success" dot>Otvoren javni poziv{openCall.deadline ? ` · rok ${dateShort(openCall.deadline)}` : ''}</Badge></span>
              {openCall.excerpt && <span className="block">{openCall.excerpt}</span>}
            </CtaBox>
          </Container>
        </section>
      )}
    </>
  );
}
