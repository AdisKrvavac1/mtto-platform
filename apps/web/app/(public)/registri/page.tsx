import Link from 'next/link';
import { apiSafe } from '@/lib/api';
import type { PublicRegistry } from '@/lib/registry';
import { dateShort } from '@/lib/format';
import { Badge, Container, PageHero } from '@/components/uui';
import { ArrowRight, ClipboardCheck, Code02, Database01, Trash03 } from '@untitledui/icons';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Javni registri', description: 'Javni registri Ministarstva: pretraga, karta, CSV i otvoreni podaci.' };

type Item = { href: string; name: string; text: string; count?: number; updated?: string; demo?: boolean; icon: typeof Database01 };

export default async function RegistriesIndex() {
  const regs = await apiSafe<PublicRegistry[]>('/registries', []);
  const items: Item[] = [
    ...regs.map((r) => ({ href: `/registri/${r.slug}`, name: r.name, text: r.description, count: r.count, updated: r.updatedAt, demo: r.isDemo, icon: Database01 })),
    { href: '/registri/okolisne-dozvole', name: 'Okolišne dozvole', text: 'Izdate okolišne dozvole s rješenjima, rokovima važenja i lokacijama postrojenja.', icon: ClipboardCheck },
    { href: '/registri/upravljanje-otpadom', name: 'Upravljanje otpadom', text: 'Evidencija dozvola i operatera za upravljanje otpadom.', icon: Trash03 },
  ];
  return (
    <>
      <PageHero crumbs={[{ label: 'Naslovna', href: '/' }, { label: 'Registri' }]} eyebrow="Otvoreni podaci" title="Javni registri">
        Evidencije koje Ministarstvo vodi po zakonu, na jednom mjestu. Svaki registar ima pretragu, preuzimanje za Excel i podatke za aplikacije.
      </PageHero>
      <section className="bg-white py-12 md:py-16">
        <Container>
          <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {items.map((i) => (
              <li key={i.href}>
                <Link href={i.href} className="group flex h-full flex-col rounded-[16px] bg-white p-6 ring-1 ring-inset ring-[#e5e5e5] transition-shadow hover:shadow-[0_12px_16px_-4px_rgba(10,13,18,0.08)]">
                  <span className="flex size-12 items-center justify-center rounded-[10px] bg-[var(--br-50)] text-[var(--br-700)]"><i.icon size={24} /></span>
                  <span className="mt-5 flex flex-wrap items-center gap-2 text-[20px] font-semibold leading-[30px] text-[#171717]">{i.name}{i.demo && <Badge tone="warning">Demo</Badge>}</span>
                  <span className="mt-2 flex-1 text-[16px] leading-6 text-[#525252]">{i.text}</span>
                  <span className="mt-6 flex items-center justify-between text-[14px] text-[#737373]">
                    <span>{i.count !== undefined ? `${i.count.toLocaleString('bs-BA')} zapisa · ažurirano ${dateShort(i.updated)}` : 'Namjenski registar'}</span>
                    <ArrowRight size={20} className="text-[var(--br-600)] transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-10 flex items-start gap-2 text-[14px] text-[#525252]"><Code02 size={20} className="shrink-0 text-[#a3a3a3]" />Popis registara za aplikacije: <a className="font-medium text-[var(--br-700)] underline" href="/api/registries">/api/registries</a> (JSON, bez prijave).</p>
        </Container>
      </section>
    </>
  );
}
