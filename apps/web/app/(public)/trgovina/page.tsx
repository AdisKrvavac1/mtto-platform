import Link from 'next/link';
import { Badge, Card, Container, CountUp, Faq, FeaturedIcon, GRAD, HB1, HB2, Head, PageHero } from '@/components/uui';
import {
  AlertTriangle, Bell01, Building07, Calendar, CheckCircle, Clock, File06, FileCheck02, LineChartUp01,
  Mail01, Map01, MarkerPin02, Package, Phone, Receipt, Scales02, ShieldTick, ShoppingBag01, ShoppingCart01, Sun, Tag01, Users01,
} from '@untitledui/icons';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Trgovina i zaštita potrošača' };

const DAYS = ['nedjelja', 'ponedjeljak', 'utorak', 'srijeda', 'četvrtak', 'petak', 'subota'];
const fmt = (d: Date) => `${d.getDate()}. ${d.getMonth() + 1}. ${d.getFullYear()}.`;

/** Neradni dani: naredne nedjelje (zakon) i državni praznici (kalendar potvrđuje Ministarstvo). */
function calendar(now = new Date()) {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const sundays: Date[] = [];
  const d = new Date(today);
  d.setDate(d.getDate() + ((7 - d.getDay()) % 7 || 7));
  if (today.getDay() === 0) sundays.push(new Date(today));
  while (sundays.length < 6) { sundays.push(new Date(d)); d.setDate(d.getDate() + 7); }
  const y = today.getFullYear();
  const holidays = [
    [new Date(y, 10, 25), 'Dan državnosti BiH'], [new Date(y + 1, 0, 1), 'Nova godina'], [new Date(y + 1, 0, 2), 'Nova godina, drugi dan'],
    [new Date(y + 1, 2, 1), 'Dan nezavisnosti BiH'], [new Date(y + 1, 4, 1), 'Praznik rada'],
  ].filter(([dt]) => (dt as Date) >= today).slice(0, 4) as [Date, string][];
  const endOfYear = new Date(y, 11, 31);
  let left = 0;
  for (const s = new Date(sundays[0]); s <= endOfYear; s.setDate(s.getDate() + 7)) left++;
  return { sundays, holidays, left };
}

/* DEMO: potrošačka korpa (cijene u KM, 8 sedmica). Stvarne cijene unose inspektori ili trgovci kroz CMS u Fazi 2. */
const BASKET: [string, string, number[]][] = [
  ['Hljeb bijeli', '500 g', [1.3, 1.3, 1.3, 1.35, 1.35, 1.35, 1.35, 1.35]],
  ['Mlijeko 2,8 %', '1 l', [1.85, 1.85, 1.89, 1.89, 1.89, 1.92, 1.92, 1.92]],
  ['Jaja', '10 kom', [3.2, 3.2, 3.25, 3.3, 3.3, 3.29, 3.35, 3.39]],
  ['Šećer', '1 kg', [1.95, 1.95, 1.93, 1.9, 1.9, 1.89, 1.89, 1.85]],
  ['Brašno T-500', '1 kg', [1.4, 1.4, 1.4, 1.42, 1.42, 1.42, 1.45, 1.45]],
  ['Ulje suncokretovo', '1 l', [3.6, 3.55, 3.55, 3.5, 3.49, 3.45, 3.45, 3.45]],
  ['Riža', '1 kg', [2.9, 2.9, 2.95, 2.95, 2.95, 2.99, 2.99, 2.99]],
  ['Pileći file', '1 kg', [12.5, 12.5, 12.9, 12.9, 13.2, 13.2, 13.2, 13.5]],
  ['Krompir', '1 kg', [1.5, 1.45, 1.45, 1.4, 1.4, 1.45, 1.49, 1.49]],
  ['Kafa mljevena', '100 g', [2.6, 2.6, 2.65, 2.7, 2.75, 2.75, 2.79, 2.85]],
];
const WEEKS = ['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8'];
const totals = WEEKS.map((_, i) => BASKET.reduce((a, [, , p]) => a + p[i], 0));
const km = (n: number) => n.toFixed(2).replace('.', ',');

function BasketChart() {
  const W = 640, H = 240, P = 28;
  const min = Math.min(...totals) - 0.4, max = Math.max(...totals) + 0.4;
  const x = (i: number) => P + (i * (W - 2 * P)) / (totals.length - 1);
  const y = (v: number) => H - P - ((v - min) / (max - min)) * (H - 2 * P);
  const line = totals.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(' ');
  const area = `${line} L${x(totals.length - 1)} ${H - P} L${x(0)} ${H - P} Z`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={`Ukupna cijena korpe po sedmicama, od ${km(totals[0])} do ${km(totals[totals.length - 1])} KM (demo podaci)`}>
      <defs><linearGradient id="korpa" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#1570EF" stopOpacity="0.22" /><stop offset="100%" stopColor="#1570EF" stopOpacity="0" /></linearGradient></defs>
      {[0, 1, 2, 3].map((k) => <line key={k} x1={P} x2={W - P} y1={P + (k * (H - 2 * P)) / 3} y2={P + (k * (H - 2 * P)) / 3} stroke="#e5e5e5" strokeDasharray="4 4" />)}
      <path d={area} fill="url(#korpa)" />
      <path d={line} fill="none" stroke="#1570EF" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
      {totals.map((v, i) => <circle key={i} cx={x(i)} cy={y(v)} r={i === totals.length - 1 ? 6 : 4} fill="#fff" stroke="#1570EF" strokeWidth="2.5" />)}
    </svg>
  );
}

const STEPS: [typeof Building07, string, string, string][] = [
  [Building07, 'Registracija subjekta', 'Obrt se registruje u općini, a privredno društvo kod nadležnog suda.', 'Općina / općinski sud'],
  [Receipt, 'Porezni i ID broj', 'Upis u registar poreznih obveznika i, po potrebi, PDV registracija.', 'Porezna uprava FBiH / UIO BiH'],
  [FileCheck02, 'Uslovi prodajnog objekta', 'Provjera minimalnih tehničkih uslova i namjene prostora prije otvaranja.', 'Općina / Ministarstvo'],
  [Tag01, 'Fiskalni uređaj', 'Svaka prodaja evidentira se fiskalnim računom.', 'Porezna uprava FBiH'],
  [Clock, 'Cijene i radno vrijeme', 'Cijene se ističu na proizvodu ili polici, a radno vrijeme na ulazu u objekat.', 'Trgovac'],
  [ShieldTick, 'Nadzor', 'Tržišna inspekcija provjerava uslove, cijene, račune i radno vrijeme.', 'Inspekcija'],
];

const RIGHTS = [
  { q: 'Kupio sam neispravan proizvod. Šta mogu uraditi?', a: 'Vratite se trgovcu s računom i podnesite reklamaciju. Sačuvajte račun i ambalažu dok se reklamacija ne riješi. Ako je trgovac odbije bez obrazloženja, obratite se inspekciji.' },
  { q: 'Cijena na kasi veća je nego na polici.', a: 'Istaknuta cijena je ponuda trgovca. Upozorite blagajnika i zatražite ispravku. Ako se odstupanje ponavlja, prijavite trgovca inspekciji, po mogućnosti s fotografijom police i računom.' },
  { q: 'Trgovac mi nije izdao fiskalni račun.', a: 'Zatražite fiskalni račun za svaku kupovinu. Račun je dokaz kupovine i osnova za reklamaciju.' },
  { q: 'Prodajni objekat radi u nedjelju.', a: 'Neki objekti po zakonu smiju raditi nedjeljom. Ako sumnjate da objekat radi protivno propisima, prijavite to tržišnoj inspekciji s adresom i vremenom.' },
];

const LOCAL = [
  [Sun, 'Vina', 'Žilavka i Blatina, vinarije i vinske ceste'], [Package, 'Med i pčelinji proizvodi', 'Kadulja, vrijesak i livadski med'],
  [ShoppingBag01, 'Suho voće', 'Smokve, šipak i sušeno voće'], [Scales02, 'Sirevi', 'Tradicionalni hercegovački sirevi'],
  [Tag01, 'Maslinovo ulje', 'Južna Hercegovina i Neum'], [CheckCircle, 'Ljekovito bilje', 'Kadulja, smilje i vrisak'],
] as const;

export default function TrgovinaPage() {
  const { sundays, holidays, left } = calendar();
  const next = sundays[0];
  const first = totals[0], last = totals[totals.length - 1];
  const change = ((last - first) / first) * 100;

  return (
    <>
      <PageHero
        crumbs={[{ label: 'Naslovna', href: '/' }, { label: 'Trgovina' }]}
        eyebrow="Sektor za trgovinu"
        title="Trgovina i zaštita potrošača"
        actions={<><Link href="#radno-vrijeme" className={HB1}><Calendar size={20} />Rade li trgovine u nedjelju?</Link><Link href="#potrosaci" className={HB2}><AlertTriangle size={20} />Prijavi nepravilnost</Link></>}
        stats={[
          { label: 'Neradnih nedjelja do kraja godine', value: String(left), icon: Calendar },
          { label: 'Proizvoda u potrošačkoj korpi', value: String(BASKET.length), sub: 'Demo podaci', icon: ShoppingCart01 },
          { label: 'Koraka do otvaranja trgovine', value: String(STEPS.length), icon: Building07 },
          { label: 'Neradna nedjelja u primjeni', value: '2 godine', sub: 'Od 17. 11. 2024.', icon: Clock },
        ]}
      >
        Radno vrijeme i neradni dani, cijene osnovnih proizvoda, prava potrošača i vodič za trgovce na jednom mjestu.
      </PageHero>

      {/* BRZI LINKOVI */}
      <section className="border-b border-[#e5e5e5] bg-white">
        <Container className="grid gap-2 py-4 sm:grid-cols-2 lg:grid-cols-4">
          {([[Calendar, 'Neradni dani', 'Nedjelje i praznici', '#radno-vrijeme', true], [LineChartUp01, 'Potrošačka korpa', 'Kretanje cijena', '#cijene', false], [Building07, 'Otvaram trgovinu', 'Vodič korak po korak', '#otvaram-trgovinu', false], [Scales02, 'Prava potrošača', 'Reklamacije i prijave', '#potrosaci', false]] as const).map(([I, t, s, href, rip]) => (
            <Link key={t} href={href} className="group flex items-center gap-3 rounded-[12px] p-3 hover:bg-[#fafafa]"><FeaturedIcon icon={I} tone={rip ? 'success' : 'brand'} size="md" ripple={rip} /><span><b className="block text-[16px] font-semibold text-[#171717] group-hover:text-[var(--br-700)]">{t}</b><span className="text-[14px] text-[#525252]">{s}</span></span></Link>
          ))}
        </Container>
      </section>

      {/* 1 RADNO VRIJEME */}
      <section id="radno-vrijeme" className="scroll-mt-28 bg-white py-16 md:py-24">
        <Container>
          <Head k="Radno vrijeme i neradni dani" t="Rade li trgovine u nedjelju?" />
          <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-stretch">
          <div className="flex flex-col gap-6">
            <div className={`flex flex-1 flex-col justify-center rounded-[20px] p-6 text-white md:p-8 ${GRAD}`}>
              <p className="text-[40px] leading-[48px] md:text-[56px] md:leading-[64px] font-semibold tracking-[-0.02em]">Ne, uz izuzetke.</p>
              <p className="mt-4 max-w-[640px] text-[18px] leading-7 text-[var(--br-100)]">Prema Zakonu o unutrašnjoj trgovini Federacije BiH („Službene novine FBiH”, br. 87/2024) prodajni objekti su nedjeljom zatvoreni, uz izuzetke propisane zakonom. Prva neradna nedjelja bila je 17. 11. 2024.</p>
              <div className="mt-6 flex flex-wrap gap-2"><Badge tone="success">Federalni propis</Badge><Badge tone="gray">Izuzeci i rad za praznike: provjeriti s Ministarstvom</Badge></div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {([[ShoppingCart01, 'Prodajni objekti', 'Nedjeljom zatvoreni'], [CheckCircle, 'Zakonski izuzeci', 'Popis u zakonu, objavljuje Ministarstvo'], [AlertTriangle, 'Rad protivno propisu', 'Prijava tržišnoj inspekciji']] as const).map(([I, t, s]) => (
                <Card key={t} className="uui-lift p-5"><FeaturedIcon icon={I} tone="brand" size="md" ripple={false} /><p className="mt-4 text-[16px] font-semibold text-[#171717]">{t}</p><p className="mt-1 text-[14px] text-[#525252]">{s}</p></Card>
              ))}
            </div>
          </div>
          <Card className="flex flex-col p-6">
            <div className="flex items-center justify-between gap-2"><h3 className="text-[18px] font-semibold text-[#171717]">Kalendar neradnih dana</h3><Badge tone="warning">Demo</Badge></div>
            <p className="mt-1 text-[14px] text-[#525252]">Naredne nedjelje i državni praznici.</p>
            <ul className="mt-4 flex flex-1 flex-col justify-between divide-y divide-[#e5e5e5]">
              {[...sundays.map((s) => [s, 'Neradna nedjelja', false] as const), ...holidays.map(([h, n]) => [h, n, true] as const)]
                .sort((a, b) => a[0].getTime() - b[0].getTime()).slice(0, 6).map(([dt, n, hol]) => (
                  <li key={dt.toISOString() + n} className="flex items-center gap-4 py-2.5">
                    <span className={`flex size-12 shrink-0 flex-col items-center justify-center rounded-[10px] ring-1 ring-inset ${hol ? 'bg-[var(--gr-50)] text-[var(--gr-700)] ring-[var(--gr-200)]' : 'bg-[var(--br-50)] text-[var(--br-700)] ring-[var(--br-200)]'}`}><b className="text-[18px] leading-5">{dt.getDate()}</b><span className="text-[11px] leading-3 font-semibold">{dt.getMonth() + 1}.</span></span>
                    <span className="min-w-0"><b className="block text-[14px] font-semibold text-[#171717]">{n}</b><span className="text-[14px] capitalize text-[#525252]">{DAYS[dt.getDay()]}, {fmt(dt)}</span></span>
                  </li>
                ))}
            </ul>
            <p className="mt-4 text-[12px] text-[#737373]">Kalendar praznika i radno vrijeme za praznike potvrđuje Ministarstvo.</p>
          </Card>
          </div>
        </Container>
      </section>

      {/* 2 POTROŠAČKA KORPA */}
      <section id="cijene" className="scroll-mt-28 bg-[#fafafa] py-16 md:py-24">
        <Container>
          <Head k="Praćenje cijena" t="Potrošačka korpa" s="Deset osnovnih proizvoda i kretanje ukupne cijene korpe kroz posljednjih osam sedmica." action={<Badge tone="warning" size="md">Demo podaci · stvarni unos u Fazi 2</Badge>} />
          <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_520px]">
            <Card className="p-6">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div><p className="text-[14px] font-medium text-[#525252]">Ukupno, korpa od {BASKET.length} proizvoda</p><p className="mt-1 text-[36px] leading-[44px] font-semibold text-[#171717]"><CountUp value={`${km(last)} KM`} /></p></div>
                <Badge tone={change > 0 ? 'error' : 'success'} size="md">{change > 0 ? '+' : ''}{change.toFixed(1).replace('.', ',')} % za 8 sedmica</Badge>
              </div>
              <div className="mt-6"><BasketChart /></div>
              <div className="mt-2 flex justify-between px-6 text-[12px] font-medium text-[#737373]">{WEEKS.map((w) => <span key={w}>{w}</span>)}</div>
            </Card>
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[460px] text-[14px]">
                  <thead><tr className="bg-[#fafafa] text-left text-[12px] font-medium text-[#525252]"><th className="px-5 py-3">Proizvod</th><th className="px-5 py-3 text-right">Cijena</th><th className="px-5 py-3 text-right">Promjena</th></tr></thead>
                  <tbody>
                    {BASKET.map(([n, u, p]) => {
                      const d = p[p.length - 1] - p[0];
                      return (
                        <tr key={n} className="border-t border-[#e5e5e5]">
                          <td className="px-5 py-3"><b className="font-semibold text-[#171717]">{n}</b> <span className="text-[#737373]">{u}</span></td>
                          <td className="px-5 py-3 text-right font-semibold text-[#171717]">{km(p[p.length - 1])} KM</td>
                          <td className={`px-5 py-3 text-right font-semibold ${d > 0 ? 'text-[#d92d20]' : d < 0 ? 'text-[var(--gr-700)]' : 'text-[#737373]'}`}>{d > 0 ? '+' : ''}{km(d)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </Container>
      </section>

      {/* 3 OTVARAM TRGOVINU */}
      <section id="otvaram-trgovinu" className="scroll-mt-28 bg-white py-16 md:py-24">
        <Container>
          <Head k="Vodič za trgovce" t="Otvaram trgovinu" s="Pregled koraka od registracije do otvaranja prodajnog objekta, s institucijom koja je nadležna za svaki korak." action={<Badge tone="gray" size="md">Nadležnosti: provjeriti s Ministarstvom</Badge>} />
          <ol className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {STEPS.map(([I, t, s, who], i) => (
              <li key={t}>
                <Card className="uui-lift flex h-full flex-col p-6">
                  <div className="flex items-center justify-between"><FeaturedIcon icon={I} tone="brand" size="md" ripple={false} /><span className="text-[36px] leading-none font-semibold text-[var(--br-100)]">{String(i + 1).padStart(2, '0')}</span></div>
                  <h3 className="mt-5 text-[18px] font-semibold text-[#171717]">{t}</h3>
                  <p className="mt-2 flex-1 text-[14px] text-[#525252]">{s}</p>
                  <p className="mt-5 flex items-center gap-2 border-t border-[#e5e5e5] pt-4 text-[14px] font-semibold text-[var(--br-700)]"><Building07 size={16} />{who}</p>
                </Card>
              </li>
            ))}
          </ol>
          <div className="mt-6 flex flex-wrap gap-3"><Link href="/propisi?q=trgovin" className="inline-flex h-11 items-center gap-1.5 rounded-[8px] bg-[var(--br-600)] px-4 text-[16px] font-semibold text-white hover:bg-[var(--br-700)]"><File06 size={20} />Propisi i obrasci za trgovinu</Link></div>
        </Container>
      </section>

      {/* 4 PRAVA POTROŠAČA */}
      <section id="potrosaci" className="scroll-mt-28 bg-[#fafafa] py-16 md:py-24">
        <Container className="grid gap-8 lg:grid-cols-[1fr_420px]">
          <div>
            <Head k="Zaštita potrošača" t="Koja su moja prava?" s="Odgovori na najčešće situacije u kupovini. Tekst je informativan; službeno tumačenje daje nadležna inspekcija." />
            <div className="mt-8"><Faq items={RIGHTS} /></div>
          </div>
          <div className="flex flex-col gap-5 self-start">
            <Card className="p-6">
              <FeaturedIcon icon={ShieldTick} tone="error" size="md" />
              <h3 className="mt-5 text-[18px] font-semibold text-[#171717]">Prijava nepravilnosti</h3>
              <p className="mt-2 text-[14px] text-[#525252]">Pogrešne cijene, račun koji nije izdan ili rad protivno propisima prijavite inspekciji.</p>
              <p className="mt-5 text-[14px] font-semibold text-[#171717]">Božana Babić, inspekcija</p>
              <a href="tel:+38736552103" className="mt-3 inline-flex h-11 w-full items-center justify-center gap-1.5 rounded-[8px] bg-[var(--br-600)] px-4 text-[16px] font-semibold text-white hover:bg-[var(--br-700)]"><Phone size={20} />036 552 103</a>
              <button disabled className="mt-2 inline-flex h-11 w-full cursor-not-allowed items-center justify-center gap-1.5 rounded-[8px] bg-white px-4 text-[16px] font-semibold text-[#a3a3a3] ring-1 ring-inset ring-[#e5e5e5]">Online prijava · Faza 2</button>
            </Card>
            <div className={`rounded-[16px] p-6 text-white ${GRAD}`} id="mapa-nedjelja">
              <Badge tone="gray">Faza 2</Badge>
              <p className="mt-3 text-[18px] font-semibold">Gdje kupiti nedjeljom</p>
              <p className="mt-1 text-[14px] text-[var(--br-100)]">Karta objekata koji po zakonu smiju raditi nedjeljom i za praznike, po općinama.</p>
              <span className={`mt-5 w-full cursor-not-allowed opacity-70 ${HB2}`}><Map01 size={20} />Karta u pripremi</span>
            </div>
          </div>
        </Container>
      </section>

      {/* 6 PROIZVEDENO U HERCEGOVINI */}
      <section id="proizvedeno" className="scroll-mt-28 bg-white py-16 md:py-24">
        <Container>
          <Head k="Lokalna privreda" t="Proizvedeno u Hercegovini" s="Katalog domaćih proizvođača po kategorijama. Proizvođači se upisuju kroz CMS nakon provjere podataka." action={<Badge tone="warning" size="md">Demo · bez upisanih proizvođača</Badge>} />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {LOCAL.map(([I, t, s]) => (
              <Card key={t} className="uui-lift flex items-center gap-4 p-5"><FeaturedIcon icon={I} tone="success" size="lg" ripple={false} /><span><b className="block text-[16px] font-semibold text-[#171717]">{t}</b><span className="text-[14px] text-[#525252]">{s}</span><span className="mt-1 block text-[12px] font-medium text-[#737373]">0 proizvođača u katalogu</span></span></Card>
            ))}
          </div>
        </Container>
      </section>

      {/* 7 PIJACE / 8 PROPISI / 9 OBAVIJESTI */}
      <section id="pijace" className="scroll-mt-28 bg-[#fafafa] py-16 md:py-24">
        <Container>
          <Head k="Tržnice i sajmovi" t="Pijace, sajmovi i sezonska prodaja" />
          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            <Card className="p-6"><FeaturedIcon icon={MarkerPin02} tone="brand" size="md" ripple={false} /><div className="mt-5 flex items-center gap-2"><h3 className="text-[18px] font-semibold text-[#171717]">Pijace i tržnice</h3><Badge tone="warning">Demo</Badge></div><p className="mt-2 text-[14px] text-[#525252]">Raspored i radno vrijeme gradskih pijaca po općinama, s lokacijom na karti.</p></Card>
            <Card className="p-6"><FeaturedIcon icon={Calendar} tone="brand" size="md" ripple={false} /><div className="mt-5 flex items-center gap-2"><h3 className="text-[18px] font-semibold text-[#171717]">Kalendar sajmova</h3><Badge tone="gray">Faza 2</Badge></div><p className="mt-2 text-[14px] text-[#525252]">Sajmovi, izložbe i manifestacije s prodajom, s datumima i uslovima učešća.</p></Card>
            <Card className="p-6"><FeaturedIcon icon={ShoppingBag01} tone="brand" size="md" ripple={false} /><div className="mt-5 flex items-center gap-2"><h3 className="text-[18px] font-semibold text-[#171717]">Sezonska i ulična prodaja</h3><Badge tone="gray">Provjeriti s općinom</Badge></div><p className="mt-2 text-[14px] text-[#525252]">Uslovi za štand, ambulantnu i sezonsku prodaju i obrasci zahtjeva.</p></Card>
          </div>
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <div id="propisi" className="flex flex-col gap-4 rounded-[16px] bg-white p-6 ring-1 ring-inset ring-[#e5e5e5] sm:flex-row sm:items-center sm:justify-between">
              <span className="flex items-center gap-4"><FeaturedIcon icon={File06} tone="brand" size="lg" ripple={false} /><span><b className="block text-[16px] font-semibold text-[#171717]">Propisi i obrasci za trgovinu</b><span className="text-[14px] text-[#525252]">Zakoni, pravilnici i obrasci zahtjeva</span></span></span>
              <Link href="/propisi?q=trgovin" className="inline-flex h-10 shrink-0 items-center justify-center rounded-[8px] bg-white px-4 text-[14px] font-semibold text-[#404040] ring-1 ring-inset ring-[#d4d4d4] hover:bg-[#fafafa]">Otvori arhivu</Link>
            </div>
            <div id="obavijesti" className={`flex flex-col gap-4 rounded-[16px] p-6 text-white sm:flex-row sm:items-center sm:justify-between ${GRAD}`}>
              <span className="flex items-center gap-4"><span className="flex size-12 shrink-0 items-center justify-center rounded-[10px] bg-white/10 ring-1 ring-white/20"><Bell01 size={24} /></span><span><b className="block text-[16px] font-semibold">Obavijesti za trgovce</b><span className="text-[14px] text-[var(--br-100)]">Izmjene propisa, neradni dani i rokovi na e-mail</span></span></span>
              <Badge tone="gray">Faza 2</Badge>
            </div>
          </div>
        </Container>
      </section>

      {/* 10 STATISTIKA */}
      <section id="statistika" className="scroll-mt-28 bg-white py-16 md:py-24">
        <Container>
          <Head k="Statistika" t="Trgovina u brojkama" s="Federalni pokazatelji iz javnih izvora i kantonalni pokazatelji koji se uvode s podacima Ministarstva." />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="p-6"><p className="text-[14px] font-medium text-[#525252]">Prosječna neto plata u trgovini, FBiH</p><p className="mt-2 text-[30px] leading-[38px] font-semibold text-[#171717]"><CountUp value="1.377 KM" /></p><p className="mt-1 text-[12px] text-[#737373]">Septembar 2026. · Federalno ministarstvo trgovine</p></Card>
            <Card className="p-6"><p className="text-[14px] font-medium text-[#525252]">Rast fiskalnog prometa, FBiH</p><p className="mt-2 text-[30px] leading-[38px] font-semibold text-[#171717]"><CountUp value="6,51 %" /></p><p className="mt-1 text-[12px] text-[#737373]">I–VII 2025. u odnosu na 2024. · Federalno ministarstvo trgovine</p></Card>
            <Card className="p-6"><div className="flex items-center justify-between"><p className="text-[14px] font-medium text-[#525252]">Prodajni objekti u HNK</p><Badge tone="gray">Faza 2</Badge></div><p className="mt-2 text-[30px] leading-[38px] font-semibold text-[#a3a3a3]">—</p><p className="mt-1 text-[12px] text-[#737373]">Iz evidencije Ministarstva</p></Card>
            <Card className="p-6"><div className="flex items-center justify-between"><p className="text-[14px] font-medium text-[#525252]">Prijave potrošača</p><Badge tone="gray">Faza 2</Badge></div><p className="mt-2 text-[30px] leading-[38px] font-semibold text-[#a3a3a3]">—</p><p className="mt-1 text-[12px] text-[#737373]">Iz online prijava na portalu</p></Card>
          </div>
          <p className="mt-4 text-[12px] text-[#737373]">Izvor federalnih pokazatelja: izjave federalnog ministra trgovine, Paragraf.ba (3. 9. 2025. i 19. 11. 2026.).</p>
        </Container>
      </section>

      {/* 11 KONTAKT */}
      <section id="kontakt" className="scroll-mt-28 bg-[#fafafa] py-16 md:py-24">
        <Container>
          <div className="flex flex-col gap-6 rounded-[16px] bg-white p-6 ring-1 ring-inset ring-[#e5e5e5] md:flex-row md:items-center md:justify-between md:p-8">
            <div className="flex items-center gap-4"><FeaturedIcon icon={Users01} tone="brand" size="lg" /><div><p className="text-[18px] font-semibold text-[#171717]">Sektor za trgovinu</p><p className="text-[14px] text-[#525252]">Nazif Nezirić · radnim danima 08:00–16:00</p></div></div>
            <div className="flex flex-wrap gap-2">
              <a href="tel:+38736551823" className="inline-flex h-11 items-center gap-1.5 rounded-[8px] bg-white px-4 text-[16px] font-semibold text-[#404040] ring-1 ring-inset ring-[#d4d4d4] hover:bg-[#fafafa]"><Phone size={20} />036 551 823</a>
              <a href="mailto:info@mtto.gov.ba" className="inline-flex h-11 items-center gap-1.5 rounded-[8px] bg-[var(--br-600)] px-4 text-[16px] font-semibold text-white hover:bg-[var(--br-700)]"><Mail01 size={20} />info@mtto.gov.ba</a>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}

