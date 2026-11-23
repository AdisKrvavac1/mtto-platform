/* Footer po MTTO Figma kosturu (logo i opis + Resori, Brzi pristup, Sjedište i kontakt) u Untitled stilu. */
import Link from 'next/link';
import { Clock, Mail01, MarkerPin02, Phone01 } from '@untitledui/icons';

const COLS: { title: string; links: [string, string][] }[] = [
  { title: 'Resori i područja', links: [['Unutarnja trgovina', '/trgovina'], ['Turizam i ugostiteljstvo', '/turizam-i-bastina'], ['Zaštita okoliša i prirode', '/zastita-okolisa'], ['Okolišne dozvole', '/registri/okolisne-dozvole'], ['Eko-rizik HNK', '/eko-rizik']] },
  { title: 'Brzi pristup', links: [['Javni pozivi i natječaji', '/vijesti?type=JAVNI_POZIV'], ['Propisi i obrasci', '/propisi'], ['Turistički vodiči', '/turisticki-vodici'], ['Eko-alarm prijava incidenta', '/eko-rizik/prijava'], ['Slobodan pristup informacijama', '/o-nama#upit']] },
];

export default function SiteFooter() {
  return (
    <footer className="border-t border-[#e5e5e5] bg-[#fafafa] pt-12 pb-10 md:pt-16">
      <div className="mx-auto w-full max-w-[1376px] px-4 md:px-8">
        <div className="grid gap-12 md:grid-cols-2 xl:grid-cols-[1.4fr_1fr_1fr_1.1fr]">
          <div className="flex flex-col gap-6">
            <img src="/mtto-logo.svg" alt="Ministarstvo trgovine, turizma i zaštite okoliša HNK" className="h-12 w-auto self-start" />
            <p className="max-w-[380px] text-[16px] leading-6 text-[#525252]">Službeni portal Ministarstva nadležnog za unutarnju trgovinu, razvoj održivog turizma i očuvanje prirodne baštine sliva Neretve i jadranskog primorja.</p>
          </div>
          {COLS.map((c) => (
            <div key={c.title}>
              <h4 className="text-[14px] leading-5 font-semibold text-[var(--br-700)]">{c.title}</h4>
              <ul className="mt-4 flex flex-col gap-3">{c.links.map(([l, h]) => <li key={l}><Link href={h} className="text-[16px] leading-6 font-medium text-[#525252] transition-colors hover:text-[#171717]">{l}</Link></li>)}</ul>
            </div>
          ))}
          <div>
            <h4 className="text-[14px] leading-5 font-semibold text-[var(--br-700)]">Sjedište i kontakt</h4>
            <ul className="mt-4 flex flex-col gap-3 text-[16px] leading-6 text-[#525252]">
              <li className="flex gap-2"><MarkerPin02 size={20} className="mt-0.5 shrink-0 text-[#a3a3a3]" />Braće Fejića bb, 88000 Mostar, BiH</li>
              <li><a href="tel:+38736551823" className="flex gap-2 hover:text-[#171717]"><Phone01 size={20} className="mt-0.5 shrink-0 text-[#a3a3a3]" />+387 36 551 823</a></li>
              <li><a href="mailto:info@mtto.gov.ba" className="flex gap-2 hover:text-[#171717]"><Mail01 size={20} className="mt-0.5 shrink-0 text-[#a3a3a3]" />info@mtto.gov.ba</a></li>
              <li className="flex gap-2"><Clock size={20} className="mt-0.5 shrink-0 text-[#a3a3a3]" />Pon – pet, 08:00 – 16:00</li>
            </ul>
          </div>
        </div>
        <div className="mt-12 flex flex-col-reverse gap-4 border-t border-[#e5e5e5] pt-8 md:flex-row md:items-center md:justify-between">
          <p className="text-[14px] leading-5 text-[#737373]">© {new Date().getFullYear()} Ministarstvo trgovine, turizma i zaštite okoliša HNK. Sva prava zadržana.</p>
          <ul className="flex flex-wrap gap-5 text-[14px] leading-5 text-[#737373]">
            <li><Link href="/o-nama" className="hover:text-[#525252]">Uvjeti korištenja</Link></li>
            <li><Link href="/o-nama" className="hover:text-[#525252]">Politika privatnosti</Link></li>
            <li><Link href="/mapa" className="hover:text-[#525252]">Karta portala</Link></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
