import { notFound } from 'next/navigation';
import { api } from '@/lib/api';
import type { PublicForm } from '@/lib/cases';
import CaseForm from '@/components/site/CaseForm';
import Link from 'next/link';
import { dateLong } from '@/lib/format';
import { Badge, Container, PageHero } from '@/components/uui';

export const dynamic = 'force-dynamic';

async function load(slug: string) {
  try { return await api<PublicForm>(`/forms/${encodeURIComponent(slug)}`); } catch (e: any) { if (e.status === 404) notFound(); throw e; }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const f = await load((await params).slug);
  return { title: f.title, description: f.description };
}

export default async function FormPage({ params }: { params: Promise<{ slug: string }> }) {
  const f = await load((await params).slug);
  const call = f.call;
  const closed = !!call && call.phase !== 'OTVOREN';
  const crumbs = call
    ? [{ label: 'Naslovna', href: '/' }, { label: 'Javni pozivi', href: '/javni-pozivi' }, { label: call.title, href: `/javni-pozivi/${call.slug}` }, { label: 'Prijava' }]
    : [{ label: 'Naslovna', href: '/' }, { label: 'E-usluge', href: '/e-usluge' }, { label: 'Zahtjevi', href: '/e-usluge/obrasci' }, { label: f.title }];
  return (
    <>
      <PageHero crumbs={crumbs} eyebrow={call ? `Rok za prijave: ${dateLong(call.closesAt)}` : `Rok za rješavanje: ${f.slaDays} dana`} title={f.title}>
        {f.description}
      </PageHero>
      <section className="bg-[#fafafa] py-12 md:py-16">
        <Container>
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
            {closed ? (
              <div className="rounded-[12px] bg-white p-8 ring-1 ring-inset ring-[#e5e5e5]">
                <p className="text-[18px] font-semibold text-[#171717]">{call!.phase === 'NAJAVLJEN' ? `Prijave se primaju od ${dateLong(call!.opensAt)}` : 'Rok za prijave je istekao'}</p>
                <p className="mt-2 text-[16px] text-[#525252]">Obrazac je dostupan samo dok je javni poziv otvoren. <Link href={`/javni-pozivi/${call!.slug}`} className="font-semibold text-[var(--br-700)]">Pogledajte poziv</Link></p>
              </div>
            ) : <CaseForm form={f} />}
            <aside className="space-y-4 text-[14px] text-[#525252] lg:sticky lg:top-24 lg:self-start">
              {f.isDemo && <p className="rounded-[12px] bg-[#fffcf5] p-4 text-[#b54708] ring-1 ring-inset ring-[#fedf89]"><Badge tone="warning" className="mr-2">Probni</Badge>Obrazac je u probnom radu; sadržaj se usklađuje s Ministarstvom.</p>}
              <div className="rounded-[12px] bg-white p-5 ring-1 ring-inset ring-[#e5e5e5]">
                <p className="font-semibold text-[#171717]">Šta slijedi</p>
                <ol className="mt-3 list-decimal space-y-2 pl-5">
                  <li>Odmah dobijate broj predmeta i kod za praćenje.</li>
                  <li>Predmet preuzima referent nadležnog sektora.</li>
                  <li>Ako nešto nedostaje, tražimo dopunu; dostavljate je putem stranice za status.</li>
                  <li>Ishod vidite na stranici za status, a službenik vas kontaktira e-mailom ili telefonom.</li>
                </ol>
              </div>
              {f.legalBasis && <p>Pravni osnov: {f.legalBasis}</p>}
            </aside>
          </div>
        </Container>
      </section>
    </>
  );
}
