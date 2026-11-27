import Link from 'next/link';
import { apiSafe } from '@/lib/api';
import type { PublicForm } from '@/lib/cases';
import { Badge, Container, PageHero } from '@/components/uui';
import { ArrowRight, Clock, File06, SearchLg } from '@untitledui/icons';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Elektronski zahtjevi', description: 'Podnesite zahtjev Ministarstvu elektronski i pratite status predmeta.' };

export default async function FormsIndex() {
  const forms = await apiSafe<PublicForm[]>('/forms', []);
  return (
    <>
      <PageHero crumbs={[{ label: 'Naslovna', href: '/' }, { label: 'E-usluge', href: '/e-usluge' }, { label: 'Elektronski zahtjevi' }]} eyebrow="E-uprava" title="Elektronski zahtjevi"
        actions={<Link href="/e-usluge/status" className="inline-flex h-11 items-center justify-center gap-1.5 rounded-[8px] bg-white/10 px-4 text-[16px] font-semibold text-white ring-1 ring-inset ring-white/25 hover:bg-white/15"><SearchLg size={20} />Status predmeta</Link>}>
        Zahtjev podnosite bez dolaska u Ministarstvo. Odmah dobijate broj predmeta i kod kojim pratite status i dostavljate dopune.
      </PageHero>
      <section className="bg-white py-12 md:py-16">
        <Container>
          {forms.length === 0 ? <p className="text-[16px] text-[#525252]">Trenutno nema aktivnih elektronskih obrazaca.</p> : (
            <ul className="grid gap-6 md:grid-cols-2">
              {forms.map((f) => (
                <li key={f.slug}>
                  <Link href={`/e-usluge/obrasci/${f.slug}`} className="group flex h-full flex-col rounded-[16px] p-6 ring-1 ring-inset ring-[#e5e5e5] transition-shadow hover:shadow-[0_12px_16px_-4px_rgba(10,13,18,0.08)]">
                    <span className="flex size-12 items-center justify-center rounded-[10px] bg-[var(--br-50)] text-[var(--br-700)]"><File06 size={24} /></span>
                    <span className="mt-5 flex flex-wrap items-center gap-2 text-[20px] font-semibold leading-[30px] text-[#171717]">{f.title}{f.isDemo && <Badge tone="warning">Probni</Badge>}</span>
                    <span className="mt-2 flex-1 text-[16px] leading-6 text-[#525252]">{f.description}</span>
                    <span className="mt-6 flex items-center justify-between text-[14px] text-[#737373]"><span className="flex items-center gap-1.5"><Clock size={16} />Rok: {f.slaDays} dana</span><ArrowRight size={20} className="text-[var(--br-600)] transition-transform group-hover:translate-x-0.5" /></span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Container>
      </section>
    </>
  );
}
