import { apiSafe, type MapPoint, type PostListItem } from '@/lib/api';
import Link from 'next/link';
import MapSection from '@/components/site/MapSection';
import HeroSlider, { type Slide } from '@/components/uui/HeroSlider';
import { dateLong, daysUntil, POST_TYPE } from '@/lib/format';
import { Badge, BadgeGroup, Button, Card, Container, CtaBox, Faq, Feature, FeaturedIcon, Metric, PostCard, FeaturedPost, Section, SectionHeader } from '@/components/uui';
import {
  AlertTriangle, ArrowRight, Building07, Calendar, FileSearch02, Globe02, MessageChatCircle, Phone01, Scales02, Sun, Ticket01, Waves,
} from '@untitledui/icons';

export const dynamic = 'force-dynamic';

type Stats = { posts: number; calls: number; documents: number; permits: number; permitsRenewal: number; facilities: number; locations: number };
type Risk = { level: 1 | 2 | 3; warnings: { items: unknown[] }; fires: { last24h: number } };
const fmt = (n: number) => n.toLocaleString('bs-BA');
const SLIDES: Slide[] = [
  { src: '/hero/mostar.jpg', alt: 'Stari most u Mostaru', place: 'Stari most, Mostar' },
  { src: '/hero/blagaj.jpg', alt: 'Tekija na vrelu Bune u Blagaju', place: 'Vrelo Bune, Blagaj' },
  { src: '/hero/pocitelj.jpg', alt: 'Počitelj', place: 'Počitelj' },
  { src: '/hero/neum.jpg', alt: 'Neum', place: 'Neum' },
  { src: '/hero/neretva.jpg', alt: 'Dolina Neretve', place: 'Dolina Neretve' },
];

export default async function HomePage() {
  const [news, calls, stats, points, risk] = await Promise.all([
    apiSafe<{ items: PostListItem[] }>('/posts?limit=7', { items: [] }),
    apiSafe<{ items: PostListItem[] }>('/posts?type=JAVNI_POZIV&limit=4', { items: [] }),
    apiSafe<Stats>('/stats', { posts: 0, calls: 0, documents: 0, permits: 0, permitsRenewal: 0, facilities: 0, locations: 0 }),
    apiSafe<MapPoint[]>('/map', []),
    apiSafe<Risk | null>('/risk/summary', null),
  ]);
  const posts = news.items.filter((p) => p.type !== 'JAVNI_POZIV');
  const featured = posts.find((p) => p.coverImage) ?? posts[0];
  const rest = posts.filter((p) => p !== featured).slice(0, 3);
  const open = calls.items.filter((c) => !c.deadline || new Date(c.deadline) > new Date());
  const lvl = risk?.level ?? 1;
  const riskLabel = lvl === 3 ? 'Visok rizik' : lvl === 2 ? 'Pojačan oprez' : 'Uobičajeno stanje';

  return (
    <>
      {/* HERO – Untitled "Hero header" s punom pozadinom: slider fotografija, plavi prelaz, staklena traka s brojkama */}
      <section className="relative isolate flex min-h-[760px] flex-col overflow-hidden bg-[var(--br-950)] md:min-h-[860px]">
        <HeroSlider slides={SLIDES} />
        <div aria-hidden className="absolute inset-0 bg-[linear-gradient(90deg,rgba(16,42,86,0.92)_0%,rgba(16,42,86,0.7)_40%,rgba(16,42,86,0.1)_100%)]" />
        <div aria-hidden className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-[rgba(16,42,86,0.85)] to-transparent" />
        <Container className="relative flex flex-1 flex-col justify-center pb-12 pt-36 md:pt-40">
          <Link href="/eko-rizik" className="inline-flex w-max max-w-full items-center gap-2 rounded-full bg-white/10 py-1 pl-1 pr-3 text-[14px] leading-5 font-medium text-white ring-1 ring-inset ring-white/20 backdrop-blur-md hover:bg-white/15">
            <span className={`flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[12px] leading-[18px] ${lvl === 3 ? 'bg-[#fef3f2] text-[#b42318]' : lvl === 2 ? 'bg-[#fffaeb] text-[#b54708]' : 'bg-[var(--gr-50)] text-[var(--gr-700)]'}`}><span className={`size-1.5 rounded-full ${lvl === 3 ? 'bg-[#f04438]' : lvl === 2 ? 'bg-[#f79009]' : 'bg-[var(--gr-500)]'}`} />{riskLabel}</span>
            <span className="truncate">Eko-rizik HNK uživo</span><ArrowRight size={16} className="shrink-0" />
          </Link>
          <h1 className="mt-6 max-w-[960px] text-[40px] leading-[48px] md:text-[60px] md:leading-[72px] font-medium tracking-[-0.02em] text-white">
            Trgovina, turizam i okoliš <span className="underline decoration-[3px] decoration-[var(--gr-400)] underline-offset-[10px]">Hercegovine</span> na jednom mjestu
          </h1>
          <p className="mt-6 max-w-[560px] text-[18px] leading-7 md:text-[20px] md:leading-[30px] text-white/80">— Vijesti, javni pozivi, registri i e-usluge Ministarstva. Podnesite zahtjev ili prijavite ekološki incident bez odlaska u ured.</p>
          <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row md:mt-12">
            <Link href="/eko-rizik/prijava" className="inline-flex h-12 items-center justify-center gap-2 rounded-[8px] bg-white px-5 text-[16px] font-semibold text-[#404040] ring-1 ring-inset ring-[#d4d4d4] shadow-[0_1px_2px_rgba(10,13,18,0.05)] hover:bg-[#fafafa]"><AlertTriangle size={20} className="text-[#a3a3a3]" />Prijavi incident</Link>
            <Link href="/e-usluge" className="inline-flex h-12 items-center justify-center gap-2 rounded-[8px] border-2 border-white/10 bg-[var(--gr-600)] px-5 text-[16px] font-semibold text-white shadow-[0_1px_2px_rgba(10,13,18,0.05),inset_0_-2px_0_rgba(10,13,18,0.05),inset_0_0_0_1px_rgba(10,13,18,0.18)] hover:bg-[var(--gr-700)]">Otvori e-usluge<ArrowRight size={20} /></Link>
          </div>
        </Container>
        <Container className="relative pb-14 md:pb-16">
          <dl className="grid grid-cols-2 overflow-hidden rounded-[16px] bg-white/10 ring-1 ring-inset ring-white/20 backdrop-blur-xl md:grid-cols-4">
            {[['9', 'općina i gradova'], [fmt(stats.posts), 'objava na portalu'], [fmt(stats.permits), 'okolišnih dozvola'], [fmt(stats.documents), 'propisa i obrazaca']].map(([v, l], k) => (
              <div key={l} className={`px-5 py-4 md:px-6 md:py-5 ${k % 2 ? 'border-l border-white/15' : ''} ${k > 1 ? 'border-t border-white/15 md:border-t-0' : ''} ${k === 2 ? 'md:border-l' : ''}`}>
                <dt className="sr-only">{l}</dt><dd className="text-[30px] leading-[38px] md:text-[36px] md:leading-[44px] font-semibold text-white">{v}</dd><dd className="mt-1 text-[14px] md:text-[16px] text-[var(--br-200)]">{l}</dd>
              </div>
            ))}
          </dl>
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
      <Section>
        <SectionHeader eyebrow="Vijesti" title="Najnovije iz Ministarstva" actions={<Button href="/vijesti" size="lg">Sve vijesti</Button>}>Saopćenja, odluke i aktivnosti sektora za trgovinu, turizam i zaštitu okoliša.</SectionHeader>
        {featured && (
          <div className="mt-12 md:mt-16">
            <FeaturedPost href={`/vijesti/${featured.slug}`} image={featured.coverImage} category={featured.category || POST_TYPE[featured.type]} title={featured.title} excerpt={featured.excerpt} date={dateLong(featured.publishedAt)} badge={featured.isDemo ? <Badge tone="warning">Demo</Badge> : undefined} />
          </div>
        )}
        <div className="mt-12 grid gap-x-8 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
          {rest.map((p) => (
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
              <Card key={c.id} className="p-5 md:p-6 hover:ring-[var(--br-300)] transition-shadow">
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
                    <ArrowRight size={20} className="text-[var(--br-600)]" />
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
            { q: 'Kako mogu provjeriti da li firma ima važeću okolišnu dozvolu?', a: <>Otvorite <a className="font-semibold text-[var(--br-700)]" href="/registri/okolisne-dozvole">registar okolišnih dozvola</a> i pretražite po nazivu operatera, broju rješenja ili općini. Za svaku dozvolu prikazan je rok važenja i dokumenti.</> },
            { q: 'Gdje mogu preuzeti obrasce zahtjeva?', a: <>Svi obrasci nalaze se u rubrici <a className="font-semibold text-[var(--br-700)]" href="/propisi">Propisi i obrasci</a>. Popunjen zahtjev predaje se u pisarnici Ministarstva ili poštom na adresu Braće Fejića bb, Mostar.</> },
            { q: 'Kako prijaviti divlju deponiju, požar ili zagađenje?', a: <>Koristite <a className="font-semibold text-[var(--br-700)]" href="/eko-rizik/prijava">Eko-prijavu</a>. Prijava može biti anonimna. Ako je u toku požar, prvo pozovite vatrogasce na 123.</> },
            { q: 'Kako saznati za nove javne pozive?', a: <>Otvoreni pozivi objavljuju se u rubrici <a className="font-semibold text-[var(--br-700)]" href="/vijesti?type=JAVNI_POZIV">Javni pozivi</a>, s rokom prijave, tekstom poziva i obrascima.</> },
            { q: 'Kako zatražiti informaciju po Zakonu o slobodi pristupa informacijama?', a: <>Zahtjev možete poslati putem obrasca na stranici <a className="font-semibold text-[var(--br-700)]" href="/o-nama#upit">O nama</a> ili na info@mtto.gov.ba.</> },
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
