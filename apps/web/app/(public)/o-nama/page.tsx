import Link from 'next/link';
import MapSection from '@/components/site/MapSection';
import InquiryForm from '@/components/figma/InquiryForm';
import type { MapPoint } from '@/lib/api';
import { Badge, Card, Container, FeaturedIcon, GRAD, Head } from '@/components/uui';
import { AlertTriangle, ArrowRight, Building07, CheckCircle, Clock, File06, Mail01, MarkerPin02, Phone01, Scales02, ShieldTick, ShoppingBag02, Sun, Ticket01, Waves } from '@untitledui/icons';

export const metadata = { title: 'O nama i kontakti' };

const HQ: MapPoint = { id: 'mtto-hq', layer: 'PROJEKT', name: 'Ministarstvo trgovine, turizma i zaštite okoliša HNK', description: 'Braće Fejića bb, 88000 Mostar · +387 36 551 823', lat: 43.3436, lng: 17.8128, link: null };
const tel = (p: string) => `tel:${p.replace(/\s/g, '')}`;

const SECTORS = [
  { n: '01', icon: ShoppingBag02, title: 'Sektor za trgovinu i tržišni nadzor', text: 'Provedba propisa o unutarnjoj trgovini, nadzor radnog vremena i neradne nedjelje, zaštita potrošača i praćenje cijena osnovnih namirnica.', tags: ['Neradna nedjelja', 'Zaštita potrošača', 'Evidencija cijena'], person: 'Nazif Nezirić', phone: '+387 36 551 823' },
  { n: '02', icon: Sun, title: 'Sektor za turizam i ugostiteljstvo', text: 'Razvoj i promocija turizma, kategorizacija ugostiteljskih objekata, stručni ispiti za turističke vodiče i razvoj cikloturizma.', tags: ['Kategorizacija objekata', 'Ispiti za vodiče', 'Razvoj Ćiro biciklističke staze'], person: 'Edina Jogunović', phone: '+387 36 552 498', email: 'turizam@mtto.gov.ba' },
  { n: '03', icon: Waves, title: 'Sektor za zaštitu okoliša i prirode', text: 'Okolišne dozvole, planiranje upravljanja otpadom, praćenje stanja okoliša sliva Neretve i parkovi prirode Hutovo blato i Blidinje.', tags: ['Okolišne dozvole', 'Kvaliteta zraka i vode', 'Zaštićena područja'], person: 'dr. sc. Zejnil Trešnjo', phone: '+387 36 551 324' },
  { n: '04', icon: Scales02, title: 'Sektor za pravne, opće i financijske poslove', text: 'Usklađenost s propisima Vlade HNK, javne nabavke, pisarnica, budžet i zahtjevi za slobodan pristup informacijama.', tags: ['Javne nabavke', 'Pristup informacijama', 'Pisarnica'], person: 'Vesna Krešić', phone: '+387 36 552 807', email: 'tajnik@mtto.gov.ba' },
];
const DIRECTORY: [string, string, string, boolean?][] = [
  ['Centrala ministarstva', 'Glavni prijem poziva', '+387 36 551 823'],
  ['Kabinet ministra', 'ministar@mtto.gov.ba', '+387 36 551 823'],
  ['Tajništvo', 'Vesna Krešić', '+387 36 552 807'],
  ['Odnosi s javnošću i mediji', 'Upiti novinara', '+387 36 552 922'],
  ['Inspekcijski poslovi', 'Božana Babić · hitne prijave zagađenja', '+387 36 552 103', true],
];

export default function ONamaPage() {
  return (
    <>
      {/* HERO – institucionalni profil */}
      <section className="bg-[#fafafa] py-12 md:py-16">
        <Container>
          <nav aria-label="Putanja" className="mb-6 flex items-center gap-2 text-[14px] font-medium text-[#525252]"><Link href="/" className="hover:text-[#262626]">Naslovna</Link><span className="text-[#d4d4d4]">/</span><span className="font-semibold text-[var(--br-700)]">O nama</span></nav>
          <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-center">
            <div>
              <Badge tone="brand" dot>Institucionalni profil i uprava</Badge>
              <h1 className="mt-4 text-[36px] leading-[44px] md:text-[48px] md:leading-[60px] font-semibold tracking-[-0.02em] text-[#171717]">Ministarstvo trgovine, turizma i zaštite okoliša HNK</h1>
              <p className="mt-4 text-[18px] leading-7 text-[#525252]">Od obronaka Makljena i vrhova Prenja do obale Jadranskog mora u Neumu – vodimo politiku održivog privrednog razvoja, očuvanja kulturno-historijske baštine i zaštite okoliša Hercegovačko-neretvanskog kantona.</p>
              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                {([[ShoppingBag02, 'Regulatorna snaga', 'Transparentno tržište i nadzor radnog vremena.'], [Waves, 'Eko-integritet', 'Monitoring sliva Neretve i zaštita Hutovog blata.'], [Sun, 'Turistički skok', 'Kategorizacija i certificirani vodiči.']] as const).map(([I, t, d]) => (
                  <Card key={t} className="uui-lift p-4"><FeaturedIcon icon={I} tone="brand" size="md" ripple={false} /><p className="mt-3 text-[16px] font-semibold text-[#171717]">{t}</p><p className="mt-1 text-[14px] text-[#525252]">{d}</p></Card>
                ))}
              </div>
            </div>
            <div className="relative overflow-hidden rounded-[24px]">
              <img src="/hero/mostar-m.jpg" alt="Mostar i dolina Neretve" className="aspect-[4/3] w-full object-cover" />
              <span className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#062343]/90 to-transparent" />
              <div className="absolute inset-x-4 bottom-4 rounded-[16px] bg-white/10 p-5 text-white ring-1 ring-inset ring-white/25 backdrop-blur-md">
                <p className="text-[12px] font-semibold text-[var(--gr-200)]">Teritorijalni opseg</p>
                <p className="mt-1 text-[22px] font-semibold">4.401 km² prirodnog i povijesnog blaga</p>
                <p className="mt-1 text-[14px] text-[var(--br-100)]">9 općina i gradova: Mostar, Konjic, Jablanica, Prozor-Rama, Čitluk, Čapljina, Stolac, Neum i Ravno.</p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* KABINET */}
      <section id="kabinet" className="scroll-mt-28 bg-white py-16 md:py-24">
        <Container>
          <Head k="Izvršno vodstvo" t="Kabinet ministra i upravljanje" action={<p className="max-w-[420px] text-[14px] text-[#525252]">Strateške smjernice usmjerene su ka otvorenoj upravi, digitalizaciji postupaka i strogoj zaštiti javnog interesa.</p>} />
          <div className="mt-10 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
            <Card className="flex flex-col gap-6 p-6 sm:flex-row md:p-8">
              <span className="flex aspect-[4/5] w-full max-w-[200px] shrink-0 flex-col items-center justify-center rounded-[16px] bg-[var(--br-50)] text-[48px] font-semibold text-[var(--br-600)] ring-1 ring-inset ring-[var(--br-100)]">EB<span className="mt-2 text-[12px] font-semibold text-[var(--br-700)]">Ministar</span></span>
              <div className="flex flex-col">
                <Badge tone="brand">Ministar</Badge>
                <h3 className="mt-3 text-[24px] font-semibold text-[#171717]">Emil Balavac</h3>
                <p className="text-[16px] font-medium text-[var(--gr-700)]">Ministar trgovine, turizma i zaštite okoliša</p>
                <p className="mt-4 text-[16px] leading-6 text-[#525252]">Rukovodi radom Ministarstva, predlaže propise iz nadležnosti resora i odgovoran je Vladi Hercegovačko-neretvanskog kantona.</p>
                <div className="mt-auto flex flex-wrap gap-3 pt-6">
                  <a href="mailto:ministar@mtto.gov.ba" className="inline-flex h-10 items-center gap-1.5 rounded-[8px] bg-[var(--br-50)] px-3.5 text-[14px] font-semibold text-[var(--br-700)] hover:bg-[var(--br-100)]"><Mail01 size={18} />ministar@mtto.gov.ba</a>
                  <a href={tel('+387 36 551 823')} className="inline-flex h-10 items-center gap-1.5 rounded-[8px] px-3.5 text-[14px] font-semibold text-[#404040] ring-1 ring-inset ring-[#d4d4d4] hover:bg-[#fafafa]"><Phone01 size={18} className="text-[#a3a3a3]" />+387 36 551 823</a>
                </div>
              </div>
            </Card>
            <div className="flex flex-col gap-6">
              <Card className="p-6">
                <div className="flex items-start gap-4"><FeaturedIcon icon={Building07} size="md" /><div><p className="text-[12px] font-semibold text-[#737373]">Tajništvo ministarstva</p><p className="text-[18px] font-semibold text-[#171717]">Vesna Krešić</p><p className="text-[14px] text-[#525252]">Koordinacija rada sektora i najava sastanaka</p></div></div>
                <dl className="mt-4 space-y-2 border-t border-[#e5e5e5] pt-4 text-[14px]"><div className="flex justify-between"><dt className="text-[#737373]">Telefon</dt><dd className="font-semibold text-[#171717]"><a href={tel('+387 36 552 807')}>+387 36 552 807</a></dd></div><div className="flex justify-between"><dt className="text-[#737373]">E-pošta</dt><dd className="font-semibold text-[#171717]"><a href="mailto:tajnik@mtto.gov.ba">tajnik@mtto.gov.ba</a></dd></div></dl>
              </Card>
              <div className={`rounded-[16px] p-6 text-white ${GRAD}`}>
                <p className="flex items-center gap-2 text-[16px] font-semibold"><ShieldTick size={20} className="text-[var(--gr-300)]" />Strateški stupovi mandata</p>
                <ul className="mt-4 space-y-2.5 text-[14px] text-[var(--br-100)]">{['Slobodna nedjelja i dostojanstvo radnika u trgovini', 'Europski standardi zaštite okoliša i voda', 'Digitalizacija registara i javnih usluga'].map((x) => <li key={x} className="flex gap-2"><CheckCircle size={18} className="shrink-0 text-[var(--gr-300)]" />{x}</li>)}</ul>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* SEKTORI */}
      <section id="sektori" className="scroll-mt-28 bg-[#fafafa] py-16 md:py-24">
        <Container>
          <Head k="Organizacijska struktura" t="Četiri temeljna sektora ministarstva" s="Svaki resor djeluje kroz specijalizirane odjele s jasno definiranim zakonskim nadležnostima." />
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {SECTORS.map((s) => (
              <Card key={s.n} className="group uui-lift flex flex-col p-6 md:p-8">
                <div className="flex items-start justify-between"><FeaturedIcon icon={s.icon} tone="brand" size="md" ripple={false} /><Badge tone={s.n === '02' || s.n === '03' ? 'success' : 'brand'}>Sektor {s.n}</Badge></div>
                <h3 className="mt-5 text-[20px] leading-[30px] font-semibold text-[#171717]">{s.title}</h3>
                <p className="mt-2 text-[16px] leading-6 text-[#525252]">{s.text}</p>
                <div className="mt-5 rounded-[12px] bg-[#fafafa] p-4"><p className="text-[12px] font-semibold text-[#737373]">Ključni djelokrug poslova</p><div className="mt-2 flex flex-wrap gap-1.5">{s.tags.map((t) => <Badge key={t} tone="brand">{t}</Badge>)}</div></div>
                <div className="mt-auto flex items-end justify-between gap-3 pt-6">
                  <div><p className="text-[12px] text-[#737373]">Kontakt sektora</p><p className="text-[14px] font-semibold text-[#171717]">{s.person}</p></div>
                  <a href={s.email ? `mailto:${s.email}` : tel(s.phone)} className="flex items-center gap-1.5 text-[14px] font-semibold text-[var(--br-700)]">{s.phone}<ArrowRight size={16} className="transition-transform group-hover:translate-x-1" /></a>
                </div>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* SREDIŠNJI URED I PISARNICA */}
      <section id="kontakt" className="scroll-mt-28 bg-white py-16 md:py-24">
        <Container className="grid gap-8 lg:grid-cols-[1fr_1.3fr]">
          <div className="flex flex-col gap-6">
            <Head k="Sjedište i rad sa strankama" t="Središnji ured i pisarnica" s="Svi podnesci, žalbe, prijave i zahtjevi za izdavanje dozvola predaju se u pisarnici ministarstva ili elektroničkim putem." />
            <Card className="p-5">
              <div className="flex gap-4"><FeaturedIcon icon={MarkerPin02} size="md" /><div><p className="text-[12px] font-semibold text-[#737373]">Službena adresa</p><p className="text-[18px] font-semibold text-[#171717]">Braće Fejića bb</p><p className="text-[14px] text-[#525252]">88000 Mostar, Bosna i Hercegovina</p></div></div>
              <div className="mt-4 flex gap-3 rounded-[12px] bg-[var(--gr-50)] p-4 ring-1 ring-inset ring-[var(--gr-200)]"><Clock size={20} className="shrink-0 text-[var(--gr-700)]" /><div><p className="text-[12px] font-semibold text-[var(--gr-700)]">Radno vrijeme pisarnice</p><p className="text-[18px] font-semibold text-[var(--gr-900)]">08:00 – 16:00</p><p className="text-[14px] text-[var(--gr-800)]">Svaki radni dan, ponedjeljak – petak</p></div></div>
            </Card>
            <Card className="overflow-hidden">
              <div className="flex items-center gap-2 border-b border-[#e5e5e5] px-5 py-4"><Phone01 size={20} className="text-[var(--br-600)]" /><h3 className="text-[16px] font-semibold text-[#171717]">Telefonski imenik odjela</h3></div>
              <ul className="divide-y divide-[#e5e5e5]">
                {DIRECTORY.map(([l, s, p, urgent]) => (
                  <li key={l} className={`flex items-center justify-between gap-4 px-5 py-3 ${urgent ? 'bg-[#fef3f2]' : ''}`}><span><b className={`flex items-center gap-1.5 text-[14px] font-semibold ${urgent ? 'text-[#b42318]' : 'text-[#171717]'}`}>{urgent && <AlertTriangle size={16} />}{l}</b><span className="text-[14px] text-[#525252]">{s}</span></span><a href={tel(p)} className="whitespace-nowrap text-[14px] font-semibold text-[var(--br-700)]">{p}</a></li>
                ))}
              </ul>
            </Card>
          </div>
          <Card className="flex flex-col overflow-hidden">
            <div className="flex items-center justify-between gap-3 border-b border-[#e5e5e5] px-5 py-4"><div><p className="flex items-center gap-2 text-[16px] font-semibold text-[#171717]"><MarkerPin02 size={20} className="text-[var(--br-600)]" />Lokacija u Mostaru</p><p className="text-[14px] text-[#525252]">Braće Fejića bb, 88000 Mostar</p></div><a href="https://www.google.com/maps/search/?api=1&query=Bra%C4%87e+Fej%C4%87a+bb%2C+Mostar" target="_blank" rel="noopener" className="inline-flex h-10 items-center gap-1.5 rounded-[8px] px-3.5 text-[14px] font-semibold text-[#404040] ring-1 ring-inset ring-[#d4d4d4] hover:bg-[#fafafa]">Google karta</a></div>
            <div className="flex-1 p-2"><div className="h-full overflow-hidden rounded-[8px]"><MapSection points={[HQ]} compact title={false} height={560} /></div></div>
          </Card>
        </Container>
      </section>

      {/* UPIT / ZOSPI */}
      <section id="upit" className="scroll-mt-28 bg-[#fafafa] py-16 md:py-24">
        <Container>
          <div className="mx-auto max-w-[760px] text-center"><Badge tone="brand" dot>Građanski servis i transparentnost</Badge><h2 className="mt-4 text-[30px] leading-[38px] md:text-[36px] md:leading-[44px] font-semibold tracking-[-0.02em] text-[#171717]">Izravni upit ili zahtjev za pristup informacijama</h2><p className="mt-3 text-[18px] text-[#525252]">Postavite upit službenicima ili podnesite zahtjev prema Zakonu o slobodi pristupa informacijama u FBiH.</p></div>
          <div className="mx-auto mt-10 max-w-[760px]"><Card className="p-6 md:p-8"><InquiryForm /></Card></div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {([[File06, 'Zahtjev za okolišnu dozvolu', 'Obrasci i upute za operatere pogona', '/propisi?docType=OBRAZAC'], [Ticket01, 'Javni pozivi i natječaji', 'Subvencije za turizam i eko-projekte', '/vijesti?type=JAVNI_POZIV'], [AlertTriangle, 'Eko-alarm: prijava onečišćenja', 'Brza prijava incidenta s lokacijom', '/eko-rizik/prijava']] as const).map(([I, t, s, href]) => (
              <Link key={t} href={href} className="group uui-lift flex items-center gap-4 rounded-[12px] bg-white p-4 ring-1 ring-inset ring-[#e5e5e5] shadow-[0_1px_2px_rgba(10,13,18,0.05)]"><FeaturedIcon icon={I} tone="success" size="md" ripple={false} /><span className="min-w-0 flex-1"><b className="block text-[16px] font-semibold text-[#171717]">{t}</b><span className="text-[14px] text-[#525252]">{s}</span></span><ArrowRight size={20} className="text-[#a3a3a3] transition-transform group-hover:translate-x-1 group-hover:text-[var(--br-600)]" /></Link>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
