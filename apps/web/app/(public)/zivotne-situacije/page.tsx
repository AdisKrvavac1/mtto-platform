// F2-08: ulaz po životnim situacijama: građanin bira šta mu treba, a ne koji sektor je nadležan.
import Link from 'next/link';
import { apiSafe } from '@/lib/api';
import { AUDIENCE, type LifeEventItem } from '@/lib/lifeEvents';
import { Container, HB1, HB2, PageHero } from '@/components/uui';
import { ArrowRight, SearchLg } from '@untitledui/icons';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Životne situacije', description: 'Šta trebate uraditi i kojim redom: koraci, obrasci, propisi i kontakti za građane i privredu.' };

function Group({ title, items, id }: { title: string; items: LifeEventItem[]; id: string }) {
  if (!items.length) return null;
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="text-[24px] font-semibold tracking-[-0.01em] text-[#171717] md:text-[30px]">{title}</h2>
      <ul className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((e) => (
          <li key={e.slug}>
            <Link href={`/zivotne-situacije/${e.slug}`} className="group flex h-full gap-4 rounded-[12px] bg-white p-5 ring-1 ring-inset ring-[#e5e5e5] transition-shadow hover:shadow-[0_4px_8px_-2px_rgba(10,13,18,0.1)]">
              <span aria-hidden className="material-symbols-outlined flex size-11 shrink-0 items-center justify-center rounded-[10px] bg-[var(--br-50)] text-[24px] text-[var(--br-700)]">{e.icon}</span>
              <span className="min-w-0">
                <span className="block text-[17px] font-semibold leading-6 text-[#171717] group-hover:text-[var(--br-700)]">{e.title}</span>
                <span className="mt-1 block text-[14px] leading-5 text-[#525252]">{e.summary}</span>
                <span className="mt-3 inline-flex items-center gap-1 text-[13px] font-semibold text-[var(--br-700)]">{e.stepCount} {e.stepCount === 1 ? 'korak' : e.stepCount < 5 ? 'koraka' : 'koraka'}<ArrowRight size={14} /></span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default async function LifeEvents() {
  const all = await apiSafe<LifeEventItem[]>('/life-events', []);
  const g = all.filter((e) => e.audience === 'GRADJANI'), p = all.filter((e) => e.audience === 'PRIVREDA');
  return (
    <>
      <PageHero crumbs={[{ label: 'Naslovna', href: '/' }, { label: 'Životne situacije' }]} eyebrow="Korak po korak" title="Šta vam treba?"
        stats={[{ label: 'Za građane', value: String(g.length) }, { label: 'Za privredu', value: String(p.length) }]}
        actions={<><Link href="#gradjani" className={HB1}>{AUDIENCE.GRADJANI}</Link><Link href="#privreda" className={HB2}>{AUDIENCE.PRIVREDA}</Link></>}>
        Odaberite situaciju u kojoj ste. Na jednom mjestu su koraci, obrasci, propisi i kontakti, bez traženja koji je sektor nadležan.
      </PageHero>
      <section className="bg-[#fafafa] py-16 md:py-20">
        <Container className="space-y-16">
          <Group id="gradjani" title={AUDIENCE.GRADJANI} items={g} />
          <Group id="privreda" title={AUDIENCE.PRIVREDA} items={p} />
          <div className="flex flex-col gap-4 rounded-[16px] bg-white p-6 ring-1 ring-inset ring-[#e5e5e5] md:flex-row md:items-center md:justify-between">
            <div><p className="text-[16px] font-semibold text-[#171717]">Niste pronašli svoju situaciju?</p><p className="mt-1 text-[14px] text-[#525252]">Pretražite portal ili pošaljite upit Ministarstvu.</p></div>
            <div className="flex flex-wrap gap-3">
              <Link href="/pretraga" className="inline-flex h-10 items-center gap-1.5 rounded-[8px] px-4 text-[14px] font-semibold text-[#404040] ring-1 ring-inset ring-[#d4d4d4] hover:bg-[#fafafa]"><SearchLg size={18} />Pretraga</Link>
              <Link href="/e-usluge/obrasci/upit-ministarstvu" className="inline-flex h-10 items-center rounded-[8px] bg-[var(--br-600)] px-4 text-[14px] font-semibold text-white hover:bg-[var(--br-700)]">Upit Ministarstvu</Link>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
