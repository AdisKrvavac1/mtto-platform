import Link from 'next/link';
import { Badge, Card, Container, FeaturedIcon, GRAD, HB1, HB2, Head, PageHero } from '@/components/uui';
import { Camera01, Image01, Map01, PlayCircle } from '@untitledui/icons';
import ShareButtons from '@/components/uui/ShareButtons';

export const metadata = { title: 'Foto album: Park prirode Hutovo blato' };

const OTHER = [
  ['Park prirode Blidinje', 'Planinski plato između Čvrsnice i Vran planine', '/fig/pa-blidinje.jpg'],
  ['Kanjon Neretve', 'Riječni koridor od Konjica do Čapljine', '/fig/tile-neretva.jpg'],
  ['Prenj i Rujišta', 'Visokogorje iznad doline Neretve', '/fig/tile-prenj.jpg'],
];

export default function Page() {
  return (
    <>
      <PageHero
        crumbs={[{ label: 'Naslovna', href: '/' }, { label: 'Turizam i baština', href: '/turizam-i-bastina' }, { label: 'Foto album Hutovo blato' }]}
        eyebrow="Ramsarsko područje · zaštićena prirodna baština"
        title="Park prirode Hutovo blato"
        actions={<><Link href="/mapa" className={HB1}><Map01 size={20} />Prikaži na karti</Link><Link href="/zastita-okolisa#podrucja" className={HB2}>Zaštićena područja</Link></>}
        aside={<div className="hidden w-[360px] overflow-hidden rounded-[16px] ring-1 ring-white/20 lg:block"><img src="/fig/tile-hutovo.jpg" alt="Hutovo blato" className="aspect-[4/3] w-full object-cover" /></div>}
      >
        Močvarno stanište uz donji tok Neretve, jedno od najvažnijih zimovališta ptica u regiji. Album prikazuje krajolik, staništa i posjetiteljsku infrastrukturu parka.
      </PageHero>

      <section className="bg-white py-16 md:py-20">
        <Container>
          <Head k="Galerija" t="Fotografije iz parka" s="Fotografije u punoj rezoluciji dodaje Ministarstvo kroz CMS. Do tada je objavljena naslovna fotografija." action={<ShareButtons url="https://mtto-platform.onrender.com/foto-albumi/hutovo-blato" title="Foto album: Park prirode Hutovo blato" compact />} />
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            <figure className="group relative overflow-hidden rounded-[16px] md:col-span-2 md:row-span-2"><img src="/fig/tile-hutovo.jpg" alt="Krajolik Hutova blata" className="size-full min-h-[280px] object-cover transition-transform duration-700 group-hover:scale-[1.03]" /><figcaption className="absolute bottom-3 left-3 rounded-[8px] bg-black/40 px-2.5 py-1 text-[12px] font-semibold text-white backdrop-blur-md">Hutovo blato · MTTO HNK</figcaption></figure>
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="flex aspect-[4/3] flex-col items-center justify-center gap-2 rounded-[16px] bg-[#fafafa] text-center border-2 border-dashed border-[#d4d4d4]"><Image01 size={24} className="text-[#a3a3a3]" /><span className="text-[14px] font-medium text-[#737373]">Fotografija iz arhive</span><Badge tone="gray">Faza 2</Badge></div>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-[#fafafa] py-16 md:py-20">
        <Container className="grid gap-6 lg:grid-cols-[1fr_380px]">
          <div className={`relative flex aspect-video items-center justify-center overflow-hidden rounded-[16px] text-white ${GRAD}`}>
            <div className="text-center"><span className="mx-auto flex size-16 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/25 backdrop-blur-md"><PlayCircle size={32} /></span><p className="mt-4 text-[18px] font-semibold">Promotivni video parka</p><p className="text-[14px] text-[var(--br-100)]">Objavljuje se u Fazi 2</p></div>
          </div>
          <Card className="self-start p-6">
            <FeaturedIcon icon={Camera01} tone="brand" size="md" ripple={false} />
            <h3 className="mt-5 text-[18px] font-semibold text-[#171717]">Fotografije za medije</h3>
            <p className="mt-2 text-[14px] text-[#525252]">Za fotografije u punoj rezoluciji i izjave obratite se službi za odnose s javnošću.</p>
            <p className="mt-4 text-[14px] font-semibold text-[#171717]">036 552 922 · ministar@mtto.gov.ba</p>
          </Card>
        </Container>
      </section>

      <section className="bg-white py-16 md:py-20">
        <Container>
          <Head k="Albumi" t="Ostala zaštićena područja" />
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {OTHER.map(([t, s, img]) => (
              <Card key={t} className="group uui-lift overflow-hidden"><div className="relative aspect-[16/10] overflow-hidden"><img src={img} alt="" className="size-full object-cover transition-transform duration-700 group-hover:scale-[1.05]" /><span className="absolute left-3 top-3"><Badge tone="gray">Album · Faza 2</Badge></span></div><div className="p-5"><h3 className="text-[18px] font-semibold text-[#171717]">{t}</h3><p className="mt-1 text-[14px] text-[#525252]">{s}</p></div></Card>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
