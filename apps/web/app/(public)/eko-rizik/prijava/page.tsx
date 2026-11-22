import Link from 'next/link';
import EcoReportForm from '@/components/risk/EcoReportForm';

export const metadata = { title: 'Prijava incidenta – Eko-rizik HNK', description: 'Prijavite požar, divlju deponiju, zagađenje, klizište ili bujicu na području Hercegovačko-neretvanskog kantona.' };

const Icon = ({ n, s = 20, c = '' }: { n: string; s?: number; c?: string }) => <span aria-hidden className={`material-symbols-outlined shrink-0 leading-none ${c}`} style={{ fontSize: s }}>{n}</span>;
const STEPS = [
  ['edit_note', 'Pošaljete prijavu', 'Dobijete broj prijave (npr. EKO-2026-0012).'],
  ['fact_check', 'Službenik provjerava', 'Sektor za zaštitu okoliša pregleda prijavu i po potrebi obavještava nadležne službe.'],
  ['map', 'Objava na karti', 'Potvrđene prijave prikazuju se na karti Eko-rizik, bez ličnih podataka.'],
];

export default function PrijavaIncidentaPage() {
  return (
    <div className="bg-[#f8f9ff] w-full">
      <section className="bg-[#062343] px-[16px] md:px-[32px] pt-[24px] pb-[72px]">
        <nav aria-label="Putanja" className="flex flex-wrap items-center gap-[6px] font-pub text-[13px] text-[#d3e4fe] mb-[24px]">
          <Link href="/" className="hover:text-white">Naslovna</Link><Icon n="chevron_right" s={16} />
          <Link href="/eko-rizik" className="hover:text-white">Eko-rizik HNK</Link><Icon n="chevron_right" s={16} />
          <span className="text-white font-semibold" aria-current="page">Prijava incidenta</span>
        </nav>
        <div className="flex flex-col gap-[12px] max-w-[760px]">
          <p className="font-space font-bold text-[#85f8c4] text-[12px] tracking-[1.2px] uppercase leading-[16px]">Eko-alarm · prijava građana</p>
          <h1 className="font-pub font-bold text-white text-[32px] md:text-[44px] tracking-[-0.9px] leading-[1.15]">Prijavite ekološki incident</h1>
          <p className="font-pub text-[#d3e4fe] text-[16px] md:text-[18px] leading-[28px]">Požar, divlja deponija, zagađenje vode ili zraka, klizište ili bujica. Prijava stiže direktno službenicima Ministarstva i, nakon provjere, na kartu Eko-rizik HNK.</p>
        </div>
      </section>

      <section className="px-[16px] md:px-[32px] -mt-[40px] pb-[48px]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-[24px] items-start">
          <div className="lg:col-span-8 min-w-0"><EcoReportForm /></div>
          <aside className="lg:col-span-4 flex flex-col gap-[16px] lg:sticky lg:top-[120px]">
            <div className="bg-[#ba1a1a] text-white rounded-[8px] p-[20px] flex flex-col gap-[12px] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1)]">
              <p className="flex items-center gap-[8px] font-pub font-bold text-[16px]"><Icon n="emergency" />Hitni slučaj?</p>
              <p className="font-pub text-[14px] leading-[22px] text-white/90">Ako je u toku požar ili je ugrožen život ili imovina, prvo pozovite hitne službe.</p>
              <div className="grid grid-cols-2 gap-[8px]">
                {[['123', 'Vatrogasci'], ['121', 'Civilna zaštita'], ['124', 'Hitna pomoć'], ['122', 'Policija']].map(([n, l]) => (
                  <a key={n} href={`tel:${n}`} className="bg-white/15 hover:bg-white/25 rounded-[4px] px-[12px] py-[8px] flex flex-col"><span className="font-rob font-extrabold text-[22px] leading-[26px]">{n}</span><span className="font-pub text-[12px] text-white/85">{l}</span></a>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-[8px] p-[20px] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] flex flex-col gap-[14px]">
              <p className="font-pub font-semibold text-[#002042] text-[16px]">Šta se dešava s prijavom</p>
              <ol className="flex flex-col gap-[12px]">
                {STEPS.map(([i, t, d], k) => (
                  <li key={t} className="flex gap-[12px]">
                    <span className="flex items-center justify-center size-[32px] rounded-[4px] bg-[#eff4ff] text-[#002042] shrink-0"><Icon n={i} s={18} /></span>
                    <span className="flex flex-col"><span className="font-pub font-semibold text-[14px] text-[#0f172a]">{k + 1}. {t}</span><span className="font-pub text-[13px] leading-[20px] text-[#43474f]">{d}</span></span>
                  </li>
                ))}
              </ol>
            </div>
            <Link href="/eko-rizik" className="bg-[#002042] hover:bg-[#062343] text-white rounded-[8px] p-[16px] flex items-center gap-[12px]">
              <Icon n="crisis_alert" s={24} c="text-[#85f8c4]" />
              <span className="flex flex-col"><span className="font-pub font-semibold text-[15px]">Karta rizika HNK</span><span className="font-pub text-[13px] text-[#d3e4fe]">Požari, upozorenja, protok Neretve, klizišta</span></span>
              <Icon n="arrow_forward" c="ml-auto" />
            </Link>
          </aside>
        </div>
      </section>
    </div>
  );
}
