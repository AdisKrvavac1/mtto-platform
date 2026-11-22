/* Stranica "O nama" prema Figma okviru 12:5906 (O nama i Kontakti – Desktop), ručno prilagođena stvarnim podacima. */
import type { ReactNode } from 'react';
import InquiryForm from './InquiryForm';

const Icon = ({ name, className = '', size = 20 }: { name: string; className?: string; size?: number }) => (
  <span aria-hidden className={`material-symbols-outlined shrink-0 leading-none ${className}`} style={{ fontSize: size }}>{name}</span>
);
const Eyebrow = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
  <p className={`font-space font-bold text-[#006c4a] text-[12px] tracking-[1.2px] uppercase leading-[16px] ${className}`}>{children}</p>
);
const H2 = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
  <h2 className={`font-pub font-bold text-[#002042] text-[22px] md:text-[24px] tracking-[-0.24px] leading-[32px] ${className}`}>{children}</h2>
);

const PILLARS = [
  { icon: 'balance', title: 'Regulatorna snaga', text: 'Transparentno tržište i nadzor nad primjenom propisa o unutarnjoj trgovini.' },
  { icon: 'eco', title: 'Eko-integritet', text: 'Praćenje stanja okoliša u slivu Neretve i zaštita Hutovog blata, Prenja i Blidinja.' },
  { icon: 'travel_explore', title: 'Održivi turizam', text: 'Razvoj cjelogodišnje ponude, cikloturizma i promocija kulturne baštine.' },
];

type Sector = { n: string; icon: string; tone: 'blue' | 'green'; title: string; text: string; tags: string[]; contactLabel: string; contact: string; phone: string; email?: string };
const SECTORS: Sector[] = [
  { n: '01', icon: 'storefront', tone: 'blue', title: 'Sektor za trgovinu', text: 'Provedba propisa o unutarnjoj trgovini, nadzor primjene radnog vremena i neradne nedjelje, zaštita potrošača te praćenje cijena osnovnih životnih namirnica.', tags: ['Neradna nedjelja', 'Zaštita potrošača', 'Praćenje cijena', 'Registar trgovaca'], contactLabel: 'Kontakt sektora', contact: 'Nazif Nezirić', phone: '+387 36 551 823' },
  { n: '02', icon: 'luggage', tone: 'green', title: 'Sektor za turizam i ugostiteljstvo', text: 'Razvoj i promocija turizma, kategorizacija ugostiteljskih objekata, stručni ispiti za turističke vodiče te poticanje agroturizma i cikloturističkih ruta (Ćiro staza).', tags: ['Kategorizacija objekata', 'Ispiti za vodiče', 'Ćiro cikloturizam', 'Turističke agencije'], contactLabel: 'Kontakt sektora', contact: 'Edina Jogunović', phone: '+387 36 552 498', email: 'turizam@mtto.gov.ba' },
  { n: '03', icon: 'forest', tone: 'green', title: 'Sektor za zaštitu okoliša', text: 'Upravni postupci izdavanja okolišnih dozvola, planiranje upravljanja otpadom, praćenje stanja okoliša sliva Neretve te zaštićena područja – parkovi prirode Hutovo blato i Blidinje.', tags: ['Okolišne dozvole', 'Kvaliteta zraka i voda', 'Parkovi prirode', 'Upravljanje otpadom'], contactLabel: 'Kontakt sektora', contact: 'dr. sc. Zejnil Trešnjo', phone: '+387 36 551 324' },
  { n: '04', icon: 'gavel', tone: 'blue', title: 'Pravni, opći i financijski poslovi', text: 'Pravna usklađenost s propisima Vlade HNK, javne nabavke, rad pisarnice, budžet i računovodstvo te postupanje po zahtjevima za slobodan pristup informacijama.', tags: ['Javne nabavke', 'Pristup informacijama', 'Pisarnica', 'Budžet'], contactLabel: 'Tajništvo ministarstva', contact: 'Vesna Krešić', phone: '+387 36 552 807', email: 'tajnik@mtto.gov.ba' },
];

const DIRECTORY = [
  { label: 'Centrala ministarstva', sub: 'Glavni prijem poziva', phone: '+387 36 551 823', hi: true },
  { label: 'Tajništvo ministarstva', sub: 'Vesna Krešić', phone: '+387 36 552 807' },
  { label: 'Odnosi s javnošću', sub: 'Upiti novinara i priopćenja', phone: '+387 36 552 922', hi: true },
  { label: 'Inspekcijski poslovi', sub: 'Božana Babić', phone: '+387 36 552 103', warn: true },
];

const tel = (p: string) => `tel:${p.replace(/\s/g, '')}`;

export function OnamaBody({ map }: { map: ReactNode }) {
  return (
    <>
      {/* HERO I MISIJA */}
      <section className="bg-white px-[16px] md:px-[32px] py-[40px] w-full">
        <div className="flex flex-col lg:flex-row gap-[24px] items-stretch w-full">
          <div className="flex flex-col gap-[16px] lg:flex-1 min-w-0">
            <p className="self-start bg-[#dce9ff] flex gap-[4px] items-center px-[8px] py-[4px] rounded-[2px] font-space font-bold text-[#002042] text-[12px] tracking-[0.96px] uppercase leading-[16px]"><Icon name="account_balance" size={13} />Institucionalni profil i uprava</p>
            <h1 className="font-pub font-bold text-[#062343] text-[28px] md:text-[36px] tracking-[-0.9px] leading-[36px] md:leading-[44px] pt-[2.5px] max-w-[640px]">Ministarstvo trgovine, turizma i zaštite okoliša HNK</h1>
            <p className="font-pub text-[#334155] text-[16px] md:text-[18px] leading-[26px] md:leading-[28px] max-w-[640px]">Od obronaka Makljena i vrhova Prenja do obale Jadranskog mora u Neumu — Ministarstvo vodi politiku održivog privrednog razvoja, očuvanja kulturno-historijske baštine i zaštite okoliša Hercegovačko-neretvanskog kantona.</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-[16px] pt-[4px]">
              {PILLARS.map((p) => (
                <div key={p.title} className="bg-[#eff4ff] flex flex-col gap-[2px] p-[16px] rounded-[8px]">
                  <Icon name={p.icon} className="text-[#002042]" size={22} />
                  <p className="font-pub font-semibold text-[#002042] text-[18px] leading-[26px] pt-[9px]">{p.title}</p>
                  <p className="font-pub text-[#43474f] text-[13px] leading-[20px]">{p.text}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="relative lg:flex-1 min-h-[300px] rounded-[8px] overflow-hidden bg-[#dce9ff] shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)]">
            <img alt="Rijeka Neretva" src="/fig/tile-neretva.jpg" className="absolute inset-0 size-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[rgba(6,35,67,0.9)] via-[rgba(6,35,67,0.2)] to-[rgba(6,35,67,0)] flex flex-col justify-end p-[24px]">
              <p className="font-space font-bold text-[#85f8c4] text-[12px] tracking-[0.6px] uppercase leading-[16px]">Teritorijalni obuhvat</p>
              <p className="font-pub font-bold text-white text-[20px] leading-[28px]">4.401 km² prirodnog i kulturnog bogatstva</p>
              <p className="font-pub text-[#d3e4fe] text-[13px] leading-[20px] pt-[4px]">Koordinacija 9 općina i gradova: Mostar, Konjic, Jablanica, Prozor-Rama, Čitluk, Čapljina, Stolac, Neum i Ravno.</p>
            </div>
          </div>
        </div>
      </section>

      {/* KABINET */}
      <section className="bg-[#f8f9ff] px-[16px] md:px-[32px] py-[40px] w-full">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-[8px] mb-[24px]">
          <div className="flex flex-col gap-[7px] pt-[5px]"><Eyebrow>Rukovodstvo</Eyebrow><H2>Kabinet ministra</H2></div>
          <p className="font-pub text-[#43474f] text-[13px] leading-[20px] max-w-[448px]">Ministarstvo je organ uprave Hercegovačko-neretvanskog kantona; ministar rukovodi njegovim radom i odgovara Vladi Kantona.</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-[24px]">
          <div className="lg:col-span-7 bg-white drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)] flex flex-col sm:flex-row gap-[24px] p-[24px] rounded-[8px]">
            <div className="relative h-[224px] w-full sm:w-[192px] shrink-0 rounded-[8px] overflow-hidden bg-gradient-to-br from-[#002042] to-[#062343] flex items-center justify-center shadow-[inset_0px_2px_4px_0px_rgba(0,0,0,0.05)]">
              <img src="/mtto-logo.svg" alt="" className="w-[96px] h-[96px] opacity-90" />
              <p className="absolute bottom-[8px] left-[8px] right-[8px] backdrop-blur-[12px] bg-[rgba(6,35,67,0.8)] rounded-[2px] pt-[10px] pb-[8px] px-[8px] font-pub font-bold text-[#d3e4fe] text-[11px] text-center tracking-[0.44px] uppercase leading-[14px]">Fotografija se unosi kroz CMS</p>
            </div>
            <div className="flex flex-col gap-[4px] flex-1 min-w-0">
              <div className="flex items-center justify-between"><span className="bg-[#dce9ff] px-[8px] py-[2px] rounded-[2px] font-pub font-bold text-[#002042] text-[11px] tracking-[0.44px] uppercase leading-[14px]">Ministar</span><Icon name="verified" className="text-[#006c4a]" size={17} /></div>
              <h3 className="font-pub font-semibold text-[#0f172a] text-[20px] leading-[28px]">Emil Balavac</h3>
              <p className="font-pub text-[#006c4a] text-[13px] leading-[20px]">Ministar trgovine, turizma i zaštite okoliša</p>
              <p className="font-pub text-[#334155] text-[15px] leading-[24px] pt-[4px]">Ministar rukovodi radom Ministarstva, predlaže propise iz nadležnosti resora i odgovoran je Vladi Hercegovačko-neretvanskog kantona. Izjava ministra unosi se kroz CMS.</p>
              <div className="flex flex-wrap gap-[8px] items-center pt-[8px]">
                <a href="mailto:ministar@mtto.gov.ba" className="bg-[#eff4ff] hover:bg-[#dce9ff] flex gap-[6px] items-center px-[16px] py-[6px] rounded-[4px] font-pub font-semibold text-[#002042] text-[14px] tracking-[0.14px] leading-[20px]"><Icon name="mail" size={15} />ministar@mtto.gov.ba</a>
                <a href={tel('+387 36 551 823')} className="flex gap-[6px] items-center font-pub text-[#43474f] text-[13px] leading-[20px] hover:text-[#002042]"><Icon name="call" size={13} />+387 36 551 823</a>
              </div>
            </div>
          </div>
          <div className="lg:col-span-5 flex flex-col gap-[16px] self-start">
            <div className="bg-white drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)] flex flex-col gap-[16px] p-[24px] rounded-[8px]">
              <div className="flex gap-[16px] items-center">
                <span className="bg-[#0a3663] flex items-center justify-center rounded-[12px] shrink-0 size-[56px]"><Icon name="badge" className="text-white" size={24} /></span>
                <div className="flex flex-col pt-[6px]">
                  <p className="font-pub font-bold text-[#737780] text-[11px] tracking-[0.44px] uppercase leading-[14px]">Ured ministra</p>
                  <h3 className="font-pub font-semibold text-[#0f172a] text-[18px] leading-[26px] pt-[4px]">Tajništvo ministarstva</h3>
                  <p className="font-pub text-[#43474f] text-[13px] leading-[20px]">Vesna Krešić · koordinacija i najava sastanaka</p>
                </div>
              </div>
              <div className="bg-[#eff4ff] flex flex-col gap-[4px] pt-[16px] pb-[8px] px-[8px] rounded-[4px] font-pub text-[13px] leading-[20px]">
                <div className="flex justify-between gap-2"><span className="text-[#737780]">Telefon:</span><a href={tel('+387 36 552 807')} className="text-[#0b1c30] hover:underline">+387 36 552 807</a></div>
                <div className="flex justify-between gap-2"><span className="text-[#737780]">E-pošta:</span><a href="mailto:tajnik@mtto.gov.ba" className="text-[#0b1c30] hover:underline">tajnik@mtto.gov.ba</a></div>
                <div className="flex justify-between gap-2"><span className="text-[#737780]">Prijem stranaka:</span><span className="text-[#0b1c30]">uz prethodnu najavu</span></div>
              </div>
            </div>
            <div className="bg-[#062343] drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)] flex flex-col gap-[4px] p-[24px] rounded-[8px]">
              <p className="flex gap-[4px] items-center font-space font-bold text-[#85f8c4] text-[12px] tracking-[0.96px] uppercase leading-[16px]"><Icon name="flag" size={13} />Resorni prioriteti</p>
              <ul className="flex flex-col gap-[3.5px] pt-[4px]">
                {['Neradna nedjelja i dostojanstvo radnika u trgovini', 'Zaštita vodotoka i zaštićenih područja prirode', 'Digitalizacija registara turističkih vodiča i objekata'].map((t) => (
                  <li key={t} className="flex gap-[8px] items-center font-pub text-[#dce9ff] text-[13px] leading-[20px]"><span className="bg-[#85f8c4] rounded-[12px] shrink-0 size-[6px]" />{t}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* SEKTORI */}
      <section className="bg-white px-[16px] md:px-[32px] py-[40px] w-full">
        <div className="flex flex-col gap-[4px] pt-[5px] mb-[24px]">
          <Eyebrow>Organizacijska struktura</Eyebrow>
          <H2 className="pt-[3px]">Sektori ministarstva</H2>
          <p className="font-pub text-[#334155] text-[15px] leading-[24px] max-w-[672px]">Svaki resor djeluje kroz specijalizirane službe s jasno definiranim zakonskim nadležnostima i postupcima.</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-[24px]">
          {SECTORS.map((s) => {
            const green = s.tone === 'green';
            return (
              <article key={s.n} className="bg-[#f8f9ff] drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)] flex flex-col justify-between p-[24px] rounded-[8px]">
                <div className="flex flex-col gap-[4px]">
                  <div className="flex items-center justify-between">
                    <span className={`flex items-center justify-center rounded-[4px] size-[48px] ${green ? 'bg-[#ecfdf5] text-[#006c4a]' : 'bg-[#dce9ff] text-[#002042]'}`}><Icon name={s.icon} size={24} /></span>
                    <span className={`px-[8px] py-[2px] rounded-[2px] font-pub font-bold text-[11px] tracking-[0.44px] uppercase leading-[14px] ${green ? 'bg-[#85f8c4] text-[#005137]' : 'bg-[#d3e4fe] text-[#002042]'}`}>Sektor {s.n}</span>
                  </div>
                  <h3 className="font-pub font-semibold text-[#0f172a] text-[20px] leading-[28px] pt-[12px]">{s.title}</h3>
                  <p className="font-pub text-[#334155] text-[13px] leading-[20px] pb-[12px]">{s.text}</p>
                  <div className="bg-white flex flex-col gap-[8px] p-[16px] rounded-[4px]">
                    <p className="font-pub font-bold text-[#737780] text-[11px] tracking-[0.44px] uppercase leading-[14px]">Ključni djelokrug poslova:</p>
                    <div className="flex flex-wrap gap-[8px]">
                      {s.tags.map((t) => <span key={t} className={`px-[8px] py-[2px] rounded-[2px] font-pub text-[12px] leading-[18px] ${green ? 'bg-[#ecfdf5] text-[#006c4a]' : 'bg-[#eff4ff] text-[#002042]'}`}>{t}</span>)}
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-[8px] pt-[32px]">
                  <div className="flex flex-col">
                    <span className="font-pub text-[#737780] text-[12px] leading-[20px]">{s.contactLabel}:</span>
                    <span className="font-pub text-[#0f172a] text-[13px] leading-[20px]">{s.contact} · <a href={tel(s.phone)} className="hover:underline">{s.phone}</a></span>
                  </div>
                  <a href={s.email ? `mailto:${s.email}` : tel(s.phone)} className={`flex gap-[4px] items-center font-pub font-semibold text-[14px] tracking-[0.14px] leading-[20px] hover:underline ${green ? 'text-[#006c4a]' : 'text-[#002042]'}`}>Kontakt resora<Icon name="arrow_forward" size={14} /></a>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* SJEDIŠTE, IMENIK, KARTA */}
      <section id="kontakt" className="bg-[#f8f9ff] px-[16px] md:px-[32px] py-[40px] w-full scroll-mt-[120px]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-[24px] lg:gap-[40px]">
          <div className="lg:col-span-5 flex flex-col gap-[24px]">
            <div className="flex flex-col gap-[4px] pt-[5px]">
              <Eyebrow>Sjedište i rad sa strankama</Eyebrow>
              <H2 className="pt-[3px]">Sjedište i pisarnica</H2>
              <p className="font-pub text-[#334155] text-[15px] leading-[24px]">Podnesci, prijave i zahtjevi za izdavanje dozvola predaju se u pisarnici Ministarstva ili poštom na službenu adresu.</p>
            </div>
            <div className="bg-white drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)] flex flex-col gap-[16px] p-[24px] rounded-[8px]">
              <div className="flex gap-[16px] items-start">
                <span className="bg-[#dce9ff] flex items-center justify-center rounded-[4px] shrink-0 size-[40px]"><Icon name="location_on" className="text-[#002042]" size={20} /></span>
                <div className="flex flex-col">
                  <p className="font-space font-bold text-[#737780] text-[12px] tracking-[0.96px] uppercase leading-[16px]">Službena adresa</p>
                  <p className="font-pub font-semibold text-[#0f172a] text-[20px] leading-[28px]">Braće Fejića bb</p>
                  <p className="font-pub text-[#334155] text-[15px] leading-[24px]">88000 Mostar, Bosna i Hercegovina</p>
                </div>
              </div>
              <div className="bg-[#ecfdf5] flex gap-[16px] items-start p-[16px] rounded-[4px]">
                <span className="bg-[#006c4a] flex items-center justify-center rounded-[4px] shrink-0 size-[40px]"><Icon name="schedule" className="text-white" size={20} /></span>
                <div className="flex flex-col">
                  <p className="font-space font-bold text-[#006c4a] text-[12px] tracking-[0.96px] uppercase leading-[16px]">Radno vrijeme</p>
                  <p className="font-pub font-bold text-[#0f172a] text-[18px] leading-[26px]">08:00 – 16:00 sati</p>
                  <p className="font-pub text-[#334155] text-[13px] leading-[20px]">Ponedjeljak – Petak</p>
                </div>
              </div>
            </div>
            <div className="bg-white drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)] flex flex-col gap-[16px] p-[24px] rounded-[8px]">
              <h3 className="flex gap-[8px] items-center font-pub font-semibold text-[#002042] text-[18px] leading-[26px]"><Icon name="contact_phone" size={20} />Telefonski imenik</h3>
              <div className="flex flex-col gap-[8px]">
                {DIRECTORY.map((d) => (
                  <div key={d.label} className={`flex items-center justify-between gap-[8px] p-[8px] rounded-[2px] ${d.warn ? 'bg-[#fffbeb]' : d.hi ? 'bg-[#eff4ff]' : ''}`}>
                    <div className="flex flex-col min-w-0">
                      <span className="font-pub font-bold text-[#0f172a] text-[13px] leading-[20px]">{d.label}</span>
                      <span className={`font-pub text-[12px] leading-[20px] ${d.warn ? 'text-[#6e3900]' : 'text-[#737780]'}`}>{d.sub}</span>
                    </div>
                    <a href={tel(d.phone)} className="shrink-0 font-pub font-semibold text-[#002042] text-[14px] tracking-[0.14px] leading-[20px] hover:underline">{d.phone}</a>
                  </div>
                ))}
              </div>
              <a href="mailto:info@mtto.gov.ba" className="flex gap-[8px] items-center font-pub font-semibold text-[#002042] text-[14px] leading-[20px] hover:underline"><Icon name="mail" size={16} />info@mtto.gov.ba</a>
            </div>
          </div>
          <div className="lg:col-span-7 bg-white drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)] rounded-[8px] p-[16px] flex flex-col gap-[16px]">
            <div className="flex flex-wrap items-center justify-between gap-[8px] px-[4px]">
              <div className="flex gap-[8px] items-center">
                <Icon name="map" className="text-[#002042]" size={18} />
                <div className="flex flex-col">
                  <h3 className="font-pub font-semibold text-[#002042] text-[18px] leading-[26px]">Lokacija u Mostaru</h3>
                  <p className="font-pub text-[#737780] text-[13px] leading-[20px]">Braće Fejića bb, 88000 Mostar</p>
                </div>
              </div>
              <a href="https://www.google.com/maps/search/?api=1&query=Bra%C4%87e+Fej%C4%87a+bb%2C+Mostar" target="_blank" rel="noopener" className="bg-[#dce9ff] hover:bg-[#d3e4fe] flex gap-[4px] items-center px-[8px] py-[4px] rounded-[2px] font-pub font-semibold text-[#002042] text-[14px] tracking-[0.14px] leading-[20px]">Google karta<Icon name="open_in_new" size={13} /></a>
            </div>
            <div className="rounded-[8px] overflow-hidden min-h-[380px] flex-1">{map}</div>
          </div>
        </div>
      </section>

      {/* UPIT */}
      <section className="bg-white px-[16px] md:px-[32px] py-[40px] w-full">
        <div className="max-w-[896px] mx-auto flex flex-col gap-[40px] md:px-[32px]">
          <div className="flex flex-col gap-[4px] items-center text-center pt-[5px]">
            <Eyebrow>Građanski servis i transparentnost</Eyebrow>
            <h2 className="font-pub font-bold text-[#002042] text-[26px] md:text-[36px] tracking-[-0.54px] leading-[34px] md:leading-[44px] pt-[3px]">Izravni upit ili zahtjev za pristup informacijama</h2>
            <p className="font-pub text-[#334155] text-[15px] leading-[24px] max-w-[672px]">Pošaljite upit službenicima Ministarstva ili zahtjev u skladu sa Zakonom o slobodi pristupa informacijama u FBiH (ZOSPI).</p>
          </div>
          <InquiryForm />
        </div>
      </section>

      {/* BRZI PRISTUP */}
      <section className="bg-[#eff4ff] px-[16px] md:px-[32px] py-[24px] w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-[16px]">
          {[
            { href: '/propisi?docType=OBRAZAC#pravna-tablica', icon: 'description', bg: 'bg-[#ecfdf5] text-[#006c4a]', t: 'Obrasci i zahtjevi', s: 'Okolišne dozvole, kategorizacija, ispiti' },
            { href: '/vijesti?type=JAVNI_POZIV', icon: 'campaign', bg: 'bg-[#fffbeb] text-[#6e3900]', t: 'Javni pozivi i natječaji', s: 'Poticaji za turizam i eko-projekte' },
            { href: '/e-usluge/eko-prijava', icon: 'report', bg: 'bg-[#dce9ff] text-[#002042]', t: 'Eko-alarm: prijava onečišćenja', s: 'Dojava ekološkog incidenta' },
          ].map((l) => (
            <a key={l.t} href={l.href} className="bg-white drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)] hover:drop-shadow-[0px_4px_8px_rgba(0,0,0,0.08)] flex gap-[16px] items-center p-[16px] rounded-[8px]">
              <span className={`flex items-center justify-center rounded-[4px] shrink-0 size-[40px] ${l.bg}`}><Icon name={l.icon} size={20} /></span>
              <span className="flex flex-col min-w-0"><span className="font-pub font-semibold text-[#002042] text-[14px] tracking-[0.14px] leading-[20px]">{l.t}</span><span className="font-pub text-[#737780] text-[13px] leading-[20px]">{l.s}</span></span>
            </a>
          ))}
        </div>
      </section>
    </>
  );
}
