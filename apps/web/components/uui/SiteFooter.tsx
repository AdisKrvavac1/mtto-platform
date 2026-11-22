/* Untitled UI "Footer" – logo i opis, kolone linkova, donja traka s autorskim pravima. */
import Link from 'next/link';
import { Mail01, MarkerPin02, Phone01 } from '@untitledui/icons';

const COLS: { title: string; links: [string, string][] }[] = [
  { title: 'Portal', links: [['Vijesti', '/vijesti'], ['Javni pozivi', '/vijesti?type=JAVNI_POZIV'], ['O nama', '/o-nama'], ['Kontakt', '/o-nama#kontakt']] },
  { title: 'E-usluge', links: [['Centar e-usluga', '/e-usluge'], ['Okolišne dozvole', '/registri/okolisne-dozvole'], ['Ugostiteljski objekti', '/registri/ugostiteljski-objekti'], ['Propisi i obrasci', '/propisi']] },
  { title: 'Resori', links: [['Turizam i baština', '/turizam-i-bastina'], ['Zaštita okoliša', '/zastita-okolisa'], ['Eko-rizik HNK', '/eko-rizik'], ['Turistički vodiči', '/turisticki-vodici']] },
  { title: 'Pomoć', links: [['Prijavi incident', '/eko-rizik/prijava'], ['Pristup informacijama', '/o-nama#upit'], ['Mapa', '/mapa'], ['CMS prijava', '/admin/prijava']] },
];

export default function SiteFooter() {
  return (
    <footer className="bg-white border-t border-[#e5e5e5] pt-12 pb-12 md:pt-16">
      <div className="mx-auto w-full max-w-[1280px] px-4 md:px-8">
        <div className="flex flex-col gap-12 xl:flex-row xl:gap-16">
          <div className="flex flex-col gap-6 xl:max-w-[320px]">
            <img src="/mtto-logo.svg" alt="Ministarstvo trgovine, turizma i zaštite okoliša HNK" className="h-11 w-auto self-start" />
            <p className="text-[16px] leading-6 text-[#525252]">Službeni portal Ministarstva trgovine, turizma i zaštite okoliša Hercegovačko-neretvanskog kantona.</p>
            <ul className="flex flex-col gap-3 text-[14px] leading-5 text-[#525252]">
              <li className="flex items-start gap-2"><MarkerPin02 size={20} className="text-[#a3a3a3] shrink-0" />Braće Fejića bb, 88000 Mostar</li>
              <li><a href="tel:+38736551823" className="flex items-center gap-2 hover:text-[#262626]"><Phone01 size={20} className="text-[#a3a3a3]" />+387 36 551 823</a></li>
              <li><a href="mailto:info@mtto.gov.ba" className="flex items-center gap-2 hover:text-[#262626]"><Mail01 size={20} className="text-[#a3a3a3]" />info@mtto.gov.ba</a></li>
            </ul>
          </div>
          <div className="grid flex-1 grid-cols-2 gap-8 md:grid-cols-4">
            {COLS.map((c) => (
              <div key={c.title}>
                <h4 className="text-[14px] leading-5 font-semibold text-[#737373]">{c.title}</h4>
                <ul className="mt-4 flex flex-col gap-3">
                  {c.links.map(([l, h]) => <li key={h}><Link href={h} className="text-[16px] leading-6 font-semibold text-[#525252] hover:text-[#262626]">{l}</Link></li>)}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-12 md:mt-16 flex flex-col-reverse gap-6 border-t border-[#e5e5e5] pt-8 md:flex-row md:items-center md:justify-between">
          <p className="text-[16px] leading-6 text-[#737373]">© {new Date().getFullYear()} Ministarstvo trgovine, turizma i zaštite okoliša HNK. Sva prava zadržana.</p>
          <ul className="flex gap-4 text-[16px] leading-6 text-[#737373]">
            <li><Link href="/o-nama" className="hover:text-[#525252]">Uvjeti korištenja</Link></li>
            <li><Link href="/o-nama" className="hover:text-[#525252]">Privatnost</Link></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
