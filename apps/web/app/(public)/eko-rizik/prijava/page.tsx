import Link from 'next/link';
import EcoReportForm from '@/components/risk/EcoReportForm';
import { Card, Container, FeaturedIcon, PageHeader } from '@/components/uui';
import { AlertTriangle, ArrowRight, Edit05, FileSearch02, Map01, PhoneCall01 } from '@untitledui/icons';

export const metadata = { title: 'Prijava incidenta – Eko-rizik HNK', description: 'Prijavite požar, divlju deponiju, zagađenje, klizište ili bujicu na području Hercegovačko-neretvanskog kantona.' };

const STEPS = [
  [Edit05, 'Pošaljete prijavu', 'Dobijete broj prijave (npr. EKO-2026-0012).'],
  [FileSearch02, 'Službenik provjerava', 'Sektor za zaštitu okoliša pregleda prijavu i po potrebi obavještava nadležne službe.'],
  [Map01, 'Objava na karti', 'Potvrđene prijave prikazuju se na karti Eko-rizik, bez ličnih podataka.'],
] as const;

export default function PrijavaIncidentaPage() {
  return (
    <>
      <PageHeader crumbs={[{ label: 'Naslovna', href: '/' }, { label: 'Eko-rizik HNK', href: '/eko-rizik' }, { label: 'Prijava incidenta' }]} eyebrow="Eko-alarm · prijava građana" title="Prijavite ekološki incident">
        Požar, divlja deponija, zagađenje vode ili zraka, klizište ili bujica. Prijava stiže direktno službenicima Ministarstva i, nakon provjere, na kartu Eko-rizik HNK.
      </PageHeader>

      <section className="bg-white pb-16 md:pb-24">
        <Container>
          <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
            <div className="min-w-0 lg:col-span-8"><EcoReportForm /></div>
            <aside className="flex flex-col gap-6 lg:sticky lg:top-[112px] lg:col-span-4">
              <div className="rounded-[12px] bg-[#fef3f2] p-5 ring-1 ring-inset ring-[#fecdca]">
                <p className="flex items-center gap-2 text-[16px] font-semibold text-[#b42318]"><PhoneCall01 size={20} />Hitni slučaj?</p>
                <p className="mt-1 text-[14px] leading-5 text-[#b42318]">Ako je u toku požar ili je ugrožen život ili imovina, prvo pozovite hitne službe.</p>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {[['123', 'Vatrogasci'], ['121', 'Civilna zaštita'], ['124', 'Hitna pomoć'], ['122', 'Policija']].map(([n, l]) => (
                    <a key={n} href={`tel:${n}`} className="flex flex-col rounded-[8px] bg-white px-3 py-2 ring-1 ring-inset ring-[#fecdca] hover:bg-[#fffbfa]"><span className="text-[20px] leading-[30px] font-semibold text-[#171717]">{n}</span><span className="text-[12px] text-[#525252]">{l}</span></a>
                  ))}
                </div>
              </div>
              <Card className="p-5">
                <p className="text-[16px] font-semibold text-[#171717]">Šta se dešava s prijavom</p>
                <ol className="mt-4 flex flex-col gap-4">
                  {STEPS.map(([I, t, d], k) => (
                    <li key={t} className="flex gap-3">
                      <FeaturedIcon icon={I} size="md" />
                      <span><b className="block text-[14px] font-semibold text-[#171717]">{k + 1}. {t}</b><span className="text-[14px] leading-5 text-[#525252]">{d}</span></span>
                    </li>
                  ))}
                </ol>
              </Card>
              <Link href="/eko-rizik" className="group flex items-center gap-3 rounded-[12px] bg-white p-4 ring-1 ring-inset ring-[#e5e5e5] shadow-[0_1px_2px_rgba(10,13,18,0.05)] hover:bg-[#fafafa]">
                <FeaturedIcon icon={AlertTriangle} tone="brand" size="md" />
                <span className="flex flex-col"><span className="text-[16px] font-semibold text-[#171717]">Karta rizika HNK</span><span className="text-[14px] text-[#525252]">Požari, upozorenja, protok Neretve, klizišta</span></span>
                <ArrowRight size={20} className="ml-auto text-[#a3a3a3] group-hover:text-[var(--br-700)]" />
              </Link>
            </aside>
          </div>
        </Container>
      </section>
    </>
  );
}
