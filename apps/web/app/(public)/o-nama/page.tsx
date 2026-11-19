import { PageHero } from '@/components/site/ui';
import MapSection from '@/components/site/MapSection';

export const metadata = { title: 'O Ministarstvu i kontakti' };

// Podaci s https://mtto.gov.ba/kontakt/ (novembar 2026.)
const PEOPLE = [
  { role: 'Ministar', name: 'Emil Balavac', phone: '+387 36 551 823', mail: ['ministar@mtto.gov.ba', 'sekretaricaministra@mtto.gov.ba'], icon: 'account_balance' },
  { role: 'Tajnica Ministarstva', name: 'Vesna Krešić, dipl. iur.', phone: '036 552 807', mail: ['tajnik@mtto.gov.ba'], icon: 'badge' },
  { role: 'Kabinet Ministarstva', name: 'Kabinet i odnosi s javnošću', phone: '036 552 922', mail: ['kabinetministarstva@mtto.gov.ba'], icon: 'campaign' },
];
const SECTORS = [
  { title: 'Sektor za trgovinu', head: 'Nazif Nezirić, dipl. oec.', role: 'Pomoćnik ministra', phone: '036 551 823', mail: 'trgovina@mtto.gov.ba', icon: 'storefront', color: 'border-mtto-primary', text: 'Unutrašnja trgovina, tržište i zaštita potrošača.' },
  { title: 'Sektor za turizam i ugostiteljstvo', head: 'Edina Jogunović, dipl. iur.', role: 'Pomoćnica ministra', phone: '036 552 498', mail: 'turizam@mtto.gov.ba', icon: 'travel_explore', color: 'border-neretva-cyan', text: 'Razvoj turizma, kategorizacija objekata, turistički vodiči i javni pozivi za sufinansiranje.' },
  { title: 'Sektor za zaštitu prirode i okoliša', head: 'dr. sc. Zejnil Trešnjo, dipl. fizičar', role: 'Pomoćnik ministra', phone: '036 551 324', mail: 'okolis@mtto.gov.ba', icon: 'forest', color: 'border-eko-green', text: 'Okolišne dozvole, zaštićena područja i očuvanje biološke raznolikosti.' },
  { title: 'Kantonalni inspektorat', head: 'Božana Babić, dipl. oec.', role: 'Glavna županijska inspektorica', phone: '036 552 103', mail: 'inspekcija@mtto.gov.ba', icon: 'policy', color: 'border-herzeg-gold', text: 'Inspekcijski nadzor u oblastima iz nadležnosti Ministarstva.' },
];

export default function AboutPage() {
  return (
    <>
      <PageHero kicker="Uprava HNK" title="O Ministarstvu i kontakti" lead="Ministarstvo trgovine, turizma i zaštite okoliša Hercegovačko-neretvanskog kantona obavlja upravne i stručne poslove u oblastima trgovine, turizma i ugostiteljstva te zaštite prirode i okoliša." crumbs={[{ href: '/', label: 'Naslovna' }, { label: 'O nama' }]} />
      <section className="max-w-7xl mx-auto px-margin-mobile md:px-margin py-space-xl space-y-space-xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-space-lg">
          {PEOPLE.map((p) => (
            <div key={p.role} className="bg-surface-container-lowest rounded-xl shadow-md p-space-lg space-y-space-sm">
              <span className="w-11 h-11 rounded-lg bg-surface-container-high text-primary flex items-center justify-center"><span className="material-symbols-outlined">{p.icon}</span></span>
              <p className="font-label-kicker text-label-kicker uppercase tracking-wider text-secondary">{p.role}</p>
              <h3 className="font-headline-sm text-headline-sm font-bold text-primary">{p.name}</h3>
              <a href={`tel:${p.phone.replace(/\s/g, '')}`} className="flex items-center gap-2 font-body-sm text-body-sm"><span className="material-symbols-outlined text-[18px] text-primary">call</span>{p.phone}</a>
              {p.mail.map((m) => <a key={m} href={`mailto:${m}`} className="flex items-center gap-2 font-body-sm text-body-sm text-mtto-primary"><span className="material-symbols-outlined text-[18px] text-primary">mail</span>{m}</a>)}
            </div>
          ))}
        </div>

        <div className="space-y-space-md">
          <div>
            <span className="font-label-kicker text-label-kicker text-secondary uppercase tracking-wider">Organizacija</span>
            <h2 className="font-headline-md text-headline-md text-primary font-bold">Sektori Ministarstva</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-space-lg">
            {SECTORS.map((s) => (
              <div key={s.title} className={`bg-surface-container-lowest rounded-xl shadow-md p-space-lg border-t-[3px] ${s.color} space-y-space-sm`}>
                <div className="flex items-center gap-space-sm">
                  <span className="material-symbols-outlined text-primary text-[28px]">{s.icon}</span>
                  <h3 className="font-headline-sm text-headline-sm font-bold text-primary">{s.title}</h3>
                </div>
                <p className="font-body-regular text-body-regular text-text-body">{s.text}</p>
                <div className="pt-space-sm border-t border-slate-border grid sm:grid-cols-2 gap-space-xs font-body-sm text-body-sm">
                  <span><span className="block text-on-surface-variant">{s.role}</span><strong className="text-on-surface">{s.head}</strong></span>
                  <span className="space-y-1"><a href={`tel:${s.phone.replace(/\s/g, '')}`} className="block">{s.phone}</a><a href={`mailto:${s.mail}`} className="block text-mtto-primary">{s.mail}</a></span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div id="kontakt" className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start scroll-mt-48">
          <div className="lg:col-span-5 bg-institutional-navy-deep text-on-primary rounded-xl shadow-md p-space-lg space-y-space-md">
            <span className="font-label-kicker text-label-kicker uppercase tracking-wider text-secondary-fixed">Sjedište</span>
            <h2 className="font-headline-md text-headline-md font-bold">Braće Fejića bb, 88000 Mostar</h2>
            <dl className="grid grid-cols-[auto,1fr] gap-x-space-md gap-y-space-xs font-body-regular text-body-regular">
              <dt className="text-surface-variant">Centrala</dt><dd><a href="tel:+38736551823" className="font-bold">+387 36 551 823</a></dd>
              <dt className="text-surface-variant">Faks</dt><dd>+387 36 552 806</dd>
              <dt className="text-surface-variant">Odnosi s javnošću</dt><dd>+387 36 552 922</dd>
              <dt className="text-surface-variant">E-mail</dt><dd><a href="mailto:info@mtto.gov.ba" className="underline">info@mtto.gov.ba</a></dd>
            </dl>
          </div>
          <div className="lg:col-span-7">
            <MapSection title={false} compact height={340} points={[{ id: 'sjediste', layer: 'PROJEKT', name: 'Ministarstvo trgovine, turizma i zaštite okoliša HNK', description: 'Braće Fejića bb, 88000 Mostar', lat: 43.3426, lng: 17.8128, link: null }]} />
          </div>
        </div>
      </section>
    </>
  );
}
