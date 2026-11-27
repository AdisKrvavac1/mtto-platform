import CaseStatusLookup from '@/components/site/CaseStatus';
import { Container, PageHero } from '@/components/uui';

export const metadata = { title: 'Status predmeta', robots: { index: false } };

export default function StatusPage() {
  return (
    <>
      <PageHero crumbs={[{ label: 'Naslovna', href: '/' }, { label: 'E-usluge', href: '/e-usluge' }, { label: 'Status predmeta' }]} eyebrow="E-uprava" title="Status predmeta">
        Unesite broj predmeta i kod s potvrde o prijemu. Vidite gdje je zahtjev, rok i poruke Ministarstva, a kad se traži dopuna, ovdje je i dostavljate.
      </PageHero>
      <section className="bg-[#fafafa] py-12 md:py-16"><Container><div className="mx-auto max-w-[880px]"><CaseStatusLookup /></div></Container></section>
    </>
  );
}
