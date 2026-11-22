import MapSection from '@/components/site/MapSection';
import InquiryForm from '@/components/figma/InquiryForm';
import type { MapPoint } from '@/lib/api';
import { Badge, Button, Card, Container, Feature, FeaturedIcon, PageHeader, Section, SectionHeader } from '@/components/uui';
import { Clock, Mail01, MarkerPin02, Phone01, Scales02, ShoppingBag02, Sun, Waves } from '@untitledui/icons';

export const metadata = { title: 'O nama i kontakti' };

const HQ: MapPoint = { id: 'mtto-hq', layer: 'PROJEKT', name: 'Ministarstvo trgovine, turizma i zaštite okoliša HNK', description: 'Braće Fejića bb, 88000 Mostar · +387 36 551 823', lat: 43.3436, lng: 17.8128, link: null };
const tel = (p: string) => `tel:${p.replace(/\s/g, '')}`;

const SECTORS = [
  { icon: ShoppingBag02, title: 'Sektor za trgovinu', text: 'Provedba propisa o unutarnjoj trgovini, nadzor radnog vremena i neradne nedjelje, zaštita potrošača i praćenje cijena osnovnih namirnica.', person: 'Nazif Nezirić', phone: '+387 36 551 823' },
  { icon: Sun, title: 'Sektor za turizam i ugostiteljstvo', text: 'Razvoj i promocija turizma, kategorizacija ugostiteljskih objekata, stručni ispiti za turističke vodiče i razvoj cikloturizma.', person: 'Edina Jogunović', phone: '+387 36 552 498', email: 'turizam@mtto.gov.ba' },
  { icon: Waves, title: 'Sektor za zaštitu okoliša', text: 'Okolišne dozvole, planiranje upravljanja otpadom, praćenje stanja okoliša sliva Neretve i parkovi prirode Hutovo blato i Blidinje.', person: 'dr. sc. Zejnil Trešnjo', phone: '+387 36 551 324' },
  { icon: Scales02, title: 'Pravni, opći i financijski poslovi', text: 'Usklađenost s propisima Vlade HNK, javne nabavke, pisarnica, budžet i zahtjevi za slobodan pristup informacijama.', person: 'Vesna Krešić', phone: '+387 36 552 807', email: 'tajnik@mtto.gov.ba' },
];
const DIRECTORY = [
  ['Centrala ministarstva', 'Glavni prijem poziva', '+387 36 551 823'],
  ['Kabinet ministra', 'ministar@mtto.gov.ba', '+387 36 551 823'],
  ['Tajništvo', 'Vesna Krešić', '+387 36 552 807'],
  ['Odnosi s javnošću', 'Upiti novinara', '+387 36 552 922'],
  ['Inspekcijski poslovi', 'Božana Babić', '+387 36 552 103'],
];

export default function ONamaPage() {
  return (
    <>
      <PageHeader crumbs={[{ label: 'Naslovna', href: '/' }, { label: 'O nama' }]} eyebrow="O nama" title="Ministarstvo trgovine, turizma i zaštite okoliša HNK">
        Od obronaka Makljena i vrhova Prenja do obale Jadranskog mora u Neumu – vodimo politiku održivog privrednog razvoja, očuvanja kulturno-historijske baštine i zaštite okoliša Hercegovačko-neretvanskog kantona.
      </PageHeader>

      {/* Untitled "Content section" – slika + misija */}
      <section className="bg-white pb-16 md:pb-24">
        <Container>
          <div className="overflow-hidden rounded-[16px] md:rounded-[24px] aspect-[16/7] bg-[#f5f5f5]"><img src="/fig/tile-neretva.jpg" alt="Rijeka Neretva kroz Hercegovačko-neretvanski kanton" className="size-full object-cover" /></div>
          <div className="mt-12 md:mt-16 grid gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <h2 className="text-[30px] leading-[38px] md:text-[36px] md:leading-[44px] font-semibold tracking-[-0.02em] text-[#171717]">Jedno ministarstvo, tri resora</h2>
              <p className="mt-4 text-[18px] leading-7 text-[#525252]">Ministarstvo je organ uprave Hercegovačko-neretvanskog kantona. Ministar rukovodi njegovim radom, predlaže propise iz nadležnosti resora i odgovoran je Vladi Kantona.</p>
            </div>
            <dl className="grid grid-cols-2 gap-8">
              {[['4.401 km²', 'površina kantona'], ['9', 'općina i gradova'], ['2', 'parka prirode'], ['3', 'resora: trgovina, turizam, okoliš']].map(([v, l]) => (
                <div key={l} className="border-l-2 border-[var(--br-600)] pl-5"><dt className="text-[36px] leading-[44px] md:text-[48px] md:leading-[60px] font-semibold tracking-[-0.02em] text-[#171717]">{v}</dt><dd className="mt-1 text-[16px] leading-6 text-[#525252]">{l}</dd></div>
              ))}
            </dl>
          </div>
        </Container>
      </section>

      {/* Kabinet – Untitled "Team section" (bez fotografija) */}
      <Section tone="gray">
        <SectionHeader eyebrow="Rukovodstvo" title="Kabinet ministra">Kontakti kabineta i tajništva Ministarstva.</SectionHeader>
        <div className="mt-12 grid gap-8 md:grid-cols-2">
          {[
            { init: 'EB', name: 'Emil Balavac', role: 'Ministar trgovine, turizma i zaštite okoliša', text: 'Rukovodi radom Ministarstva i odgovara Vladi Hercegovačko-neretvanskog kantona.', mail: 'ministar@mtto.gov.ba', phone: '+387 36 551 823' },
            { init: 'VK', name: 'Vesna Krešić', role: 'Tajništvo ministarstva', text: 'Koordinacija rada sektora i najava sastanaka. Prijem stranaka uz prethodnu najavu.', mail: 'tajnik@mtto.gov.ba', phone: '+387 36 552 807' },
          ].map((p) => (
            <Card key={p.name} className="flex flex-col gap-5 p-6 md:p-8 sm:flex-row">
              <span className="flex size-20 shrink-0 items-center justify-center rounded-full bg-[var(--br-50)] text-[24px] font-semibold text-[var(--br-600)] ring-1 ring-black/5">{p.init}</span>
              <div className="flex flex-col">
                <h3 className="text-[18px] leading-7 font-semibold text-[#171717]">{p.name}</h3>
                <p className="text-[16px] leading-6 text-[var(--br-700)]">{p.role}</p>
                <p className="mt-3 text-[16px] leading-6 text-[#525252]">{p.text}</p>
                <div className="mt-5 flex flex-wrap gap-3"><Button href={`mailto:${p.mail}`} variant="secondary" size="sm" icon={Mail01}>{p.mail}</Button><Button href={tel(p.phone)} variant="tertiary" size="sm" icon={Phone01}>{p.phone}</Button></div>
              </div>
            </Card>
          ))}
        </div>
      </Section>

      {/* Sektori – features */}
      <Section>
        <SectionHeader eyebrow="Organizacija" title="Sektori ministarstva" align="center">Svaki resor djeluje kroz službe s jasno definiranim zakonskim nadležnostima.</SectionHeader>
        <div className="mt-12 md:mt-16 grid gap-x-8 gap-y-12 md:grid-cols-2">
          {SECTORS.map((s) => (
            <Feature key={s.title} icon={s.icon} title={s.title}>
              <p>{s.text}</p>
              <p className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-[14px]"><Badge tone="brand">Kontakt</Badge><span className="font-semibold text-[#404040]">{s.person}</span><a href={tel(s.phone)} className="text-[var(--br-700)] font-semibold">{s.phone}</a>{s.email && <a href={`mailto:${s.email}`} className="text-[var(--br-700)] font-semibold">{s.email}</a>}</p>
            </Feature>
          ))}
        </div>
      </Section>

      {/* Kontakt – Untitled "Contact section" s mapom */}
      <Section tone="gray" id="kontakt">
        <SectionHeader eyebrow="Kontakt" title="Posjetite nas ili nazovite">Sjedište Ministarstva i pisarnica nalaze se u Mostaru.</SectionHeader>
        <div className="mt-12 grid gap-12 lg:grid-cols-[1fr_1.4fr]">
          <div className="flex flex-col gap-10">
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-1">
              {[
                [MarkerPin02, 'Adresa', 'Braće Fejića bb, 88000 Mostar', 'https://www.google.com/maps/search/?api=1&query=Bra%C4%87e+Fej%C4%87a+bb%2C+Mostar', 'Upute za dolazak'],
                [Mail01, 'E-pošta', 'Odgovaramo radnim danom.', 'mailto:info@mtto.gov.ba', 'info@mtto.gov.ba'],
                [Phone01, 'Telefon', 'Ponedjeljak – petak, 08:00 – 16:00', 'tel:+38736551823', '+387 36 551 823'],
              ].map(([I, t, d, href, cta]) => (
                <div key={t as string} className="flex gap-4">
                  <FeaturedIcon icon={I as any} size="md" />
                  <div><p className="text-[18px] leading-7 font-semibold text-[#171717]">{t as string}</p><p className="mt-1 text-[16px] leading-6 text-[#525252]">{d as string}</p><a href={href as string} className="mt-3 inline-block text-[16px] leading-6 font-semibold text-[var(--br-700)] hover:text-[var(--br-800)]">{cta as string}</a></div>
                </div>
              ))}
            </div>
            <Card className="overflow-hidden">
              <div className="px-5 py-4 border-b border-[#e5e5e5] flex items-center gap-2"><Clock size={20} className="text-[#a3a3a3]" /><h3 className="text-[16px] font-semibold text-[#171717]">Telefonski imenik</h3></div>
              <ul className="divide-y divide-[#e5e5e5]">
                {DIRECTORY.map(([l, s, p]) => <li key={l} className="flex items-center justify-between gap-4 px-5 py-3"><span><b className="block text-[14px] font-medium text-[#171717]">{l}</b><span className="text-[14px] text-[#525252]">{s}</span></span><a href={tel(p)} className="text-[14px] font-semibold text-[var(--br-700)] whitespace-nowrap">{p}</a></li>)}
              </ul>
            </Card>
          </div>
          <Card className="overflow-hidden p-2"><div className="overflow-hidden rounded-[8px] h-full min-h-[420px]"><MapSection points={[HQ]} compact title={false} height={640} /></div></Card>
        </div>
      </Section>

      {/* Upit – Untitled "Contact form" */}
      <Section id="upit">
        <div className="mx-auto max-w-[640px]">
          <SectionHeader eyebrow="Pišite nam" title="Upit ili zahtjev za pristup informacijama" align="center">Pošaljite upit službenicima ili zahtjev u skladu sa Zakonom o slobodi pristupa informacijama u FBiH.</SectionHeader>
          <div className="mt-12"><InquiryForm /></div>
        </div>
      </Section>
    </>
  );
}
