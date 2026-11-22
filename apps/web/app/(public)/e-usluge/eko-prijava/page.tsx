import Link from 'next/link';
import EcoReportForm from '@/components/risk/EcoReportForm';

export const metadata = { title: 'Eko-prijava – prijava ekološkog incidenta' };

export default function Page() {
  return (
    <div className="bg-[#f8f9ff] w-full">
      <section className="bg-[#062343] px-[16px] md:px-[32px] pt-[40px] pb-[72px]">
        <div className="max-w-[880px] flex flex-col gap-[12px]">
          <p className="font-space font-bold text-[#85f8c4] text-[12px] tracking-[1.2px] uppercase leading-[16px]">Eko-alarm · prijava građana</p>
          <h1 className="font-pub font-bold text-white text-[32px] md:text-[44px] tracking-[-0.9px] leading-[1.15]">Prijavite ekološki incident</h1>
          <p className="font-pub text-[#d3e4fe] text-[16px] md:text-[18px] leading-[28px]">Požar, divlja deponija, zagađenje vode ili zraka, klizište ili bujica. Prijava stiže direktno službenicima Ministarstva i, nakon provjere, na <Link href="/eko-rizik" className="underline text-white">kartu Eko-rizik HNK</Link>.</p>
        </div>
      </section>
      <section className="px-[16px] md:px-[32px] -mt-[40px] pb-[48px]">
        <div className="max-w-[880px]"><EcoReportForm /></div>
      </section>
    </div>
  );
}
