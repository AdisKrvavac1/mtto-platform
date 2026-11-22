import { apiSafe, type MapPoint, type PostListItem } from '@/lib/api';
import MapSection from '@/components/site/MapSection';
import { dateLong, daysUntil, POST_TYPE } from '@/lib/format';
import { Badge, BadgeGroup, Button, Card, Container, CtaBox, Faq, Feature, FeaturedIcon, Metric, PostCard, Section, SectionHeader } from '@/components/uui';
import {
  AlertTriangle, ArrowRight, Building07, Calendar, FileSearch02, Globe02, MessageChatCircle, Phone01, Scales02, Sun, Ticket01, Waves,
} from '@untitledui/icons';

export const dynamic = 'force-dynamic';

type Stats = { posts: number; calls: number; documents: number; permits: number; permitsRenewal: number; facilities: number; locations: number };
type Risk = { level: 1 | 2 | 3; warnings: { items: unknown[] }; fires: { last24h: number } };
const fmt = (n: number) => n.toLocaleString('bs-BA');

export default async function HomePage() {
  const [news, calls, stats, points, risk] = await Promise.all([
    apiSafe<{ items: PostListItem[] }>('/posts?limit=7', { items: [] }),
    apiSafe<{ items: PostListItem[] }>('/posts?type=JAVNI_POZIV&limit=4', { items: [] }),
    apiSafe<Stats>('/stats', { posts: 0, calls: 0, documents: 0, permits: 0, permitsRenewal: 0, facilities: 0, locations: 0 }),
    apiSafe<MapPoint[]>('/map', []),
    apiSafe<Risk | null>('/risk/summary', null),
  ]);
  const posts = news.items.filter((p) => p.type !== 'JAVNI_POZIV').slice(0, 3);
  const open = calls.items.filter((c) => !c.deadline || new Date(c.deadline) > new Date());
  const lvl = risk?.level ?? 1;
  const riskLabel = lvl === 3 ? 'Visok rizik' : lvl === 2 ? 'Pojačan oprez' : 'Uobičajeno stanje';

  return (
    <>
      {/* HERO – Untitled "Hero header section" (centrirano, badge group, dvije akcije, vizual u okviru) */}
      <section className="relative overflow-hidden bg-white pt-16 md:pt-24">
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[640px] [background-image:linear-gradient(#f5f5f5_1px,transparent_1px),linear-gradient(90deg,#f5f5f5_1px,transparent_1px)] [background-size:64px_64px] [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_70%)]" />
        <Container className="relative flex flex-col items-center text-center">
          <BadgeGroup label={riskLabel} tone={lvl === 3 ? 'error' : lvl === 2 ? 'warning' : 'success'} href="/eko-rizik">Eko-rizik HNK uživo</BadgeGroup>
          <h1 className="mt-4 max-w-[1024px] text-[36px] leading-[44px] md:text-[60px] md:leading-[72px] font-semibold tracking-[-0.02em] text-[#171717] text-balance">Trgovina, turizam i okoliš Hercegovačko-neretvanskog kantona</h1>
          <p className="mt-4 md:mt-6 max-w-[768px] text-[18px] leading-7 md:text-[20px] md:leading-[30px] text-[#525252]">Vijesti, javni pozivi, registri i e-usluge Ministarstva na jednom mjestu. Podnesite zahtjev, preuzmite obrazac ili prijavite ekološki incident bez odlaska u ured.</p>
          <div className="mt-8 md:mt-12 flex w-full flex-col-reverse gap-3 sm:w-auto sm:flex-row">
            <Button href="/eko-rizik/prijava" variant="secondary" size="xl" icon={AlertTriangle}>Prijavi incident</Button>
            <Button href="/e-usluge" size="xl">Otvori e-usluge</Button>
          </div>
        </Container>
        <Container className="relative mt-16 md:mt-20">
          <div className="relative rounded-[24px] bg-white p-1 ring-1 ring-black/10 shadow-[0_24px_48px_-12px_rgba(10,13,18,0.18)]">
            <div className="relative overflow-hidden rounded-[20px] aspect-[16/7] bg-[#f5f5f5]">
              <img src="/fig/tile-neretva.jpg" alt="Rijeka Neretva" className="size-full object-cover" />
              <div className="absolute inset-x-0 bottom-0 flex flex-wrap gap-2 p-4 md:p-6 bg-gradient-to-t from-black/50 to-transparent">
                {['Mostar', 'Konjic', 'Jablanica', 'Prozor-Rama', 'Čitluk', 'Čapljina', 'Stolac', 'Neum', 'Ravno'].map((m) => <span key={m} className="rounded-full bg-white/90 px-2.5 py-0.5 text-[12px] leading-[18px] font-medium text-[#404040] backdrop-blur">{m}</span>)}
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* SOCIAL PROOF → izvori podataka */}
      <Section className="!py-12 md:!py-16">
        <p className="text-center text-[16px] leading-6 font-medium text-[#525252]">Portal povezuje službene izvore podataka</p>
        <ul className="mt-6 md:mt-8 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-[18px] md:text-[20px] font-semibold tracking-[-0.01em] text-[#737373]">
          {['mtto.gov.ba', 'NASA FIRMS', 'Copernicus EMS', 'Meteoalarm · FHMZ', 'GloFAS', 'OpenStreetMap'].map((s) => <li key={s}>{s}</li>)}
        </ul>
      </Section>

      {/* FEATURES – e-usluge */}
      <Section tone="gray">
        <SectionHeader eyebrow="E-usluge" title="Sve što trebate od Ministarstva, online" align="center">
          Registri, obrasci i prijave dostupni su 24 sata dnevno. Za većinu postupaka više nije potreban dolazak u pisarnicu.
        </SectionHeader>
        <div className="mt-12 md:mt-16 grid gap-x-8 gap-y-10 md:grid-cols-2 lg:grid-cols-3 md:gap-y-16">
          <Feature icon={FileSearch02} title="Okolišne dozvole" href="/registri/okolisne-dozvole" cta="Pretraži registar">Javni registar izdatih dozvola s rokovima važenja, lokacijom i rješenjima za preuzimanje.</Feature>
          <Feature icon={Building07} title="Ugostiteljski objekti" href="/registri/ugostiteljski-objekti" cta="Otvori registar">Kategorizirani smještaj po općinama i zvjezdicama, s izvozom podataka u CSV.</Feature>
          <Feature icon={Scales02} title="Propisi i obrasci" href="/propisi" cta="Preuzmi obrasce">Zakoni, pravilnici i standardizirani obrasci zahtjeva na jednom mjestu.</Feature>
          <Feature icon={Ticket01} title="Javni pozivi" href="/vijesti?type=JAVNI_POZIV" cta="Pogledaj pozive">Otvoreni pozivi za poticaje u turizmu, trgovini i zaštiti okoliša, s rokovima prijave.</Feature>
          <Feature icon={AlertTriangle} title="Eko-rizik i prijave" href="/eko-rizik" cta="Otvori kartu rizika">Satelitska žarišta požara, meteo upozorenja, protok Neretve i prijave građana.</Feature>
          <Feature icon={Globe02} title="Centar e-usluga" href="/e-usluge" cta="Sve e-usluge">Pregled svih registara, javnih uvida i obrazaca s brzom pretragom.</Feature>
        </div>
      </Section>

      {/* METRICS */}
      <Section>
        <div className="grid gap-12 lg:grid-cols-[1fr_2fr] lg:gap-16 items-start">
          <SectionHeader eyebrow="U brojkama" title="Javni podaci, otvoreni za sve">Svaki broj ispod dolazi direktno iz baze portala i mijenja se čim službenik objavi novi zapis.</SectionHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-12">
            <Metric value={fmt(stats.posts)} label="Objavljenih vijesti">Uključujući arhivu s mtto.gov.ba.</Metric>
            <Metric value={fmt(stats.permits)} label="Okolišnih dozvola">U javnom registru, s rješenjima.</Metric>
            <Metric value={fmt(stats.facilities)} label="Ugostiteljskih objekata">Kategoriziranih na području HNK.</Metric>
            <Metric value={fmt(stats.documents)} label="Dokumenata i obrazaca">Spremnih za preuzimanje.</Metric>
          </div>
        </div>
      </Section>

      {/* BLOG – najnovije vijesti */}
      <Section tone="gray">
        <SectionHeader eyebrow="Vijesti" title="Najnovije iz Ministarstva" actions={<Button href="/vijesti" size="lg">Sve vijesti</Button>}>Saopćenja, odluke i aktivnosti sektora za trgovinu, turizam i zaštitu okoliša.</SectionHeader>
        <div className="mt-12 md:mt-16 grid gap-x-8 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((p) => (
            <PostCard key={p.id} href={`/vijesti/${p.slug}`} image={p.coverImage} category={p.category || POST_TYPE[p.type]} title={p.title} excerpt={p.excerpt}
              badge={p.isDemo ? <Badge tone="warning">Demo</Badge> : undefined}
              meta={<span className="flex items-center gap-2"><Calendar size={16} className="text-[#a3a3a3]" />{dateLong(p.publishedAt)}</span>} />
          ))}
          {posts.length === 0 && <p className="text-[16px] text-[#525252]">Još nema objavljenih vijesti.</p>}
        </div>
      </Section>

      {/* JAVNI POZIVI */}
      <Section>
        <SectionHeader eyebrow="Javni pozivi" title="Otvoreni pozivi i natječaji" actions={<Button href="/vijesti?type=JAVNI_POZIV" variant="secondary" size="lg">Svi pozivi</Button>}>Prijave se podnose online ili u pisarnici Ministarstva, do navedenog roka.</SectionHeader>
        <div className="mt-12 grid gap-4">
          {(open.length ? open : calls.items).slice(0, 4).map((c) => {
            const d = daysUntil(c.deadline);
            const isOpen = !c.deadline || (d ?? 0) >= 0;
            return (
              <Card key={c.id} className="p-5 md:p-6 hover:ring-[#d6bbfb] transition-shadow">
                <a href={`/vijesti/${c.slug}`} className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-start gap-4 min-w-0">
                    <FeaturedIcon icon={Ticket01} size="md" tone="brand" />
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge tone={isOpen ? 'success' : 'gray'} dot>{isOpen ? 'Otvoren' : 'Zatvoren'}</Badge>
                        {c.category && <Badge tone="brand">{c.category}</Badge>}
                        {c.isDemo && <Badge tone="warning">Demo</Badge>}
                      </div>
                      <h3 className="mt-2 text-[18px] leading-7 font-semibold text-[#171717]">{c.title}</h3>
                      {c.excerpt && <p className="mt-1 text-[16px] leading-6 text-[#525252] line-clamp-2">{c.excerpt}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 shrink-0 md:pl-6">
                    {c.deadline && <span className="flex items-center gap-1.5 text-[14px] font-medium text-[#404040]"><Calendar size={16} className="text-[#a3a3a3]" />Rok: {dateLong(c.deadline)}</span>}
                    <ArrowRight size={20} className="text-[#7f56d9]" />
                  </div>
                </a>
              </Card>
            );
          })}
          {calls.items.length === 0 && <p className="text-[16px] text-[#525252]">Trenutno nema objavljenih poziva.</p>}
        </div>
      </Section>

      {/* MAPA */}
      <Section tone="gray">
        <SectionHeader eyebrow="Interaktivna mapa" title="Zaštićena područja, dozvole i destinacije" actions={<Button href="/mapa" variant="secondary" size="lg">Mapa na cijelom ekranu</Button>}>Parkovi prirode Hutovo blato i Blidinje, turističke destinacije i lokacije izdatih dozvola.</SectionHeader>
        <Card className="mt-12 p-2 md:p-3"><div className="overflow-hidden rounded-[8px]"><MapSection points={points} /></div></Card>
      </Section>

      {/* FAQ */}
      <Section>
        <SectionHeader title="Česta pitanja" align="center">Odgovori na pitanja koja građani i privreda najčešće postavljaju Ministarstvu.</SectionHeader>
        <div className="mt-12 md:mt-16">
          <Faq items={[
            { q: 'Kako mogu provjeriti da li firma ima važeću okolišnu dozvolu?', a: <>Otvorite <a className="font-semibold text-[#6941c6]" href="/registri/okolisne-dozvole">registar okolišnih dozvola</a> i pretražite po nazivu operatera, broju rješenja ili općini. Za svaku dozvolu prikazan je rok važenja i dokumenti.</> },
            { q: 'Gdje mogu preuzeti obrasce zahtjeva?', a: <>Svi obrasci nalaze se u rubrici <a className="font-semibold text-[#6941c6]" href="/propisi">Propisi i obrasci</a>. Popunjen zahtjev predaje se u pisarnici Ministarstva ili poštom na adresu Braće Fejića bb, Mostar.</> },
            { q: 'Kako prijaviti divlju deponiju, požar ili zagađenje?', a: <>Koristite <a className="font-semibold text-[#6941c6]" href="/eko-rizik/prijava">Eko-prijavu</a>. Prijava može biti anonimna. Ako je u toku požar, prvo pozovite vatrogasce na 123.</> },
            { q: 'Kako saznati za nove javne pozive?', a: <>Otvoreni pozivi objavljuju se u rubrici <a className="font-semibold text-[#6941c6]" href="/vijesti?type=JAVNI_POZIV">Javni pozivi</a>, s rokom prijave, tekstom poziva i obrascima.</> },
            { q: 'Kako zatražiti informaciju po Zakonu o slobodi pristupa informacijama?', a: <>Zahtjev možete poslati putem obrasca na stranici <a className="font-semibold text-[#6941c6]" href="/o-nama#upit">O nama</a> ili na info@mtto.gov.ba.</> },
          ]} />
        </div>
        <div className="mt-12 md:mt-16">
          <CtaBox icon={<FeaturedIcon icon={MessageChatCircle} tone="brand" />} title="Niste pronašli odgovor?" actions={<><Button href="tel:+38736551823" variant="secondary" size="lg" icon={Phone01}>+387 36 551 823</Button><Button href="/o-nama#kontakt" size="lg">Kontaktirajte nas</Button></>}>
            Službenici Ministarstva odgovaraju radnim danom. Pišite nam ili nazovite centralu.
          </CtaBox>
        </div>
      </Section>

      {/* CTA – resori */}
      <section className="bg-white pb-16 md:pb-24">
        <Container>
          <div className="grid gap-6 md:grid-cols-2">
            {[
              { href: '/turizam-i-bastina', icon: Sun, t: 'Turizam i baština', d: 'Destinacija HNK, UNESCO baština, kategorizacija i poticaji za turizam.', img: '/fig/tile-neum.jpg' },
              { href: '/zastita-okolisa', icon: Waves, t: 'Zaštita okoliša', d: 'Okolišne dozvole, javni uvidi i zaštićena područja Hutovo blato i Blidinje.', img: '/fig/tile-hutovo.jpg' },
            ].map((b) => (
              <a key={b.href} href={b.href} className="group relative overflow-hidden rounded-[16px] min-h-[320px] flex items-end">
                <img src={b.img} alt="" className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
                <span className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <span className="relative m-4 md:m-6 flex flex-col gap-2 rounded-[12px] bg-white/15 p-5 md:p-6 ring-1 ring-white/30 backdrop-blur-md text-white">
                  <span className="flex items-center gap-2 text-[20px] leading-[30px] font-semibold">{b.t}<ArrowRight size={20} /></span>
                  <span className="text-[16px] leading-6 text-white/90">{b.d}</span>
                </span>
              </a>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
