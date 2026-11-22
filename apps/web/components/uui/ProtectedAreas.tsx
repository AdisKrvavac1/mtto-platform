/* Zaštićena područja + GIS registar (kostur MTTO Figme). */
import Link from 'next/link';
import type { ReactNode } from 'react';
import type { MapPoint } from '@/lib/api';
import MapSection from '@/components/site/MapSection';
import { ArrowRight, Download01, Map01, MarkerPin02 } from '@untitledui/icons';
import { Badge, Card, FeaturedIcon, Head } from './index';

const btn = 'inline-flex items-center justify-center gap-1.5 rounded-[8px] font-semibold whitespace-nowrap transition-colors';
const skeu = 'border-2 border-white/10 shadow-[0_1px_2px_rgba(10,13,18,0.05),inset_0_-2px_0_rgba(10,13,18,0.05),inset_0_0_0_1px_rgba(10,13,18,0.18)]';
const More = ({ href, children }: { href: string; children: ReactNode }) => (
  <Link href={href} className="inline-flex shrink-0 items-center gap-1.5 text-[16px] font-semibold text-[var(--br-700)] hover:text-[var(--br-800)] [&>svg]:transition-transform hover:[&>svg]:translate-x-1">{children}<ArrowRight size={20} /></Link>
);

export default function ProtectedAreas({ points, more = true }: { points: MapPoint[]; more?: boolean }) {
  return (
    <>
          <Head k="Resor zaštite okoliša i prirode" t="Zaštićena područja i prirodni rezervati" s="Čuvarske službe, valorizacija kraških fenomena i planovi upravljanja zaštićenim krajolicima." action={more ? <More href="/zastita-okolisa">Zaštita okoliša</More> : undefined} />
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[['Park prirode', 'Blidinje i Čvrsnica', '/fig/pa-blidinje.jpg', 'Planinski plato i nekropola stećaka.', '/zastita-okolisa'], ['Ramsar lokalitet', 'Hutovo blato', '/fig/tile-hutovo.jpg', 'Submediteranska močvara i stanište ptica.', '/foto-albumi/hutovo-blato'], ['Kulturni krajolik', 'Vrelo Bune, Blagaj', '/hero/blagaj-m.jpg', 'Krško vrelo i tekija pod liticom.', '/turizam-i-bastina'], ['Hidrološki spomenik', 'Kanjon Neretve', '/hero/neretva-m.jpg', 'Riječni koridor od Konjica do Čapljine.', '/zastita-okolisa']].map(([k, t, img, d, href]) => (
              <Link key={t} href={href} className="group uui-lift flex flex-col overflow-hidden rounded-[12px] bg-white ring-1 ring-inset ring-[#e5e5e5] shadow-[0_1px_2px_rgba(10,13,18,0.05)]">
                <span className="relative block aspect-[4/3] overflow-hidden"><img src={img} alt="" className="size-full object-cover transition-transform duration-700 group-hover:scale-[1.05]" /><span className="absolute left-3 top-3"><Badge tone="brand">{k}</Badge></span></span>
                <span className="flex flex-1 flex-col p-5"><span className="text-[18px] font-semibold text-[#171717]">{t}</span><span className="mt-1 text-[14px] text-[#525252]">{d}</span><span className="mt-auto flex items-center justify-between pt-4 text-[14px] font-semibold text-[var(--br-700)]">Detalji<ArrowRight size={18} className="transition-transform group-hover:translate-x-1" /></span></span>
              </Link>
            ))}
          </div>

          {/* GIS */}
          <Card className="mt-10 overflow-hidden">
            <div className="flex flex-col gap-4 border-b border-[#e5e5e5] px-5 py-5 md:flex-row md:items-center md:justify-between md:px-6">
              <div className="flex items-center gap-3"><FeaturedIcon icon={Map01} size="md" /><div><p className="flex flex-wrap items-center gap-2 text-[18px] font-semibold text-[#171717]">GIS registar zaštićenih područja<Badge tone="brand">WGS-84</Badge></p><p className="text-[14px] text-[#525252]">Dozvole, ugostiteljski objekti, zaštićena područja i projekti na jednoj karti.</p></div></div>
              <Badge tone="success" dot>{points.length} lokacija</Badge>
            </div>
            <div className="grid lg:grid-cols-[1.4fr_1fr]">
              <div className="p-2"><div className="overflow-hidden rounded-[8px]"><MapSection points={points} compact title={false} height={460} /></div></div>
              <div className="border-t border-[#e5e5e5] p-5 md:p-6 lg:border-l lg:border-t-0">
                <Badge tone="success">Park prirode</Badge>
                <p className="mt-3 text-[24px] font-semibold text-[#171717]">Blidinje i Masna Luka</p>
                <p className="mt-2 text-[14px] text-[#525252]">Planinski plato između Čvrsnice i Vran planine, stanište munike i nekropole stećaka.</p>
                <img src="/fig/pa-blidinje.jpg" alt="Park prirode Blidinje" className="mt-4 aspect-[16/8] w-full rounded-[12px] object-cover" />
                <dl className="mt-4 grid grid-cols-2 gap-3 text-[14px]">{[['Površina', '364 km²'], ['Općine', 'Posušje, Tomislavgrad, Jablanica']].map(([a, b]) => <div key={a} className="rounded-[8px] bg-[#fafafa] p-3"><dt className="text-[12px] text-[#737373]">{a}</dt><dd className="font-semibold text-[#171717]">{b}</dd></div>)}</dl>
                <Link href="/mapa" className={`${btn} ${skeu} mt-4 h-11 w-full bg-[var(--br-600)] text-[16px] text-white hover:bg-[var(--br-700)]`}><MarkerPin02 size={20} />Otvori punu GIS kartu</Link>
                <p className="mt-3 flex items-center justify-center gap-1.5 text-[12px] text-[#737373]"><Download01 size={14} />Preuzimanje KML sloja – Faza 2</p>
              </div>
            </div>
          </Card>

    </>
  );
}
