import Link from 'next/link';
import { notFound } from 'next/navigation';
import { api } from '@/lib/api';
import { AUDIENCE, type LifeEventDetail } from '@/lib/lifeEvents';
import { dateLong } from '@/lib/format';
import { Container } from '@/components/uui';
import { AlertCircle, ArrowRight, Building07, LinkExternal01 } from '@untitledui/icons';

export const dynamic = 'force-dynamic';
async function load(slug: string) {
  try { return await api<LifeEventDetail>(`/life-events/${encodeURIComponent(slug)}`); } catch (e: any) { if (e.status === 404) notFound(); throw e; }
}
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const e = await load((await params).slug);
  return { title: e.title, description: e.summary };
}

const LinkBtn = ({ l }: { l: { label: string; url: string } }) => {
  const ext = l.url.startsWith('http');
  return (
    <Link href={l.url} target={ext ? '_blank' : undefined} rel={ext ? 'noopener' : undefined}
      className="inline-flex min-h-9 items-center gap-1.5 rounded-[8px] bg-white px-3 py-1.5 text-[14px] font-semibold text-[var(--br-700)] ring-1 ring-inset ring-[var(--br-200)] hover:bg-[var(--br-25,#f5faff)]">
      {l.label}{ext ? <LinkExternal01 size={14} /> : <ArrowRight size={14} />}
    </Link>
  );
};

export default async function LifeEventPage({ params }: { params: Promise<{ slug: string }> }) {
  const e = await load((await params).slug);
  return (
    <section className="bg-white pb-20 pt-10 md:pt-14">
      <Container>
        <nav aria-label="Putanja" className="text-[14px] text-[#737373]"><Link href="/" className="hover:text-[#171717]">Naslovna</Link> / <Link href="/zivotne-situacije" className="hover:text-[#171717]">Životne situacije</Link> / <Link href={`/zivotne-situacije#${e.audience === 'PRIVREDA' ? 'privreda' : 'gradjani'}`} className="hover:text-[#171717]">{AUDIENCE[e.audience]}</Link></nav>
        <div className="mt-6 flex items-start gap-5">
          <span aria-hidden className="hidden size-14 shrink-0 items-center justify-center rounded-[14px] bg-[var(--br-50)] text-[var(--br-700)] sm:flex"><span className="material-symbols-outlined !text-[30px] !leading-none">{e.icon}</span></span>
          <div>
            <h1 className="text-[30px] font-semibold leading-tight tracking-[-0.02em] text-[#171717] md:text-[40px]">{e.title}</h1>
            <p className="mt-3 max-w-[720px] text-[18px] leading-7 text-[#525252]">{e.summary}</p>
          </div>
        </div>
        {!e.verified && <p className="mt-6 flex max-w-[760px] items-start gap-2 rounded-[8px] bg-[#fffcf5] p-3 text-[14px] text-[#b54708] ring-1 ring-inset ring-[#fedf89]"><AlertCircle size={18} className="mt-0.5 shrink-0" />Opis je u pripremi i Ministarstvo ga još potvrđuje. Za rokove i uslove provjerite propise ili pitajte nadležni sektor.</p>}

        <div className="mt-10 grid gap-12 lg:grid-cols-[minmax(0,1fr)_320px]">
          <ol className="relative space-y-0">
            {e.steps.map((s, i) => (
              <li key={i} className="relative flex gap-5 pb-10 last:pb-0">
                {i < e.steps.length - 1 && <span aria-hidden className="absolute left-[19px] top-11 bottom-1 w-px bg-[#e5e5e5]" />}
                <span aria-hidden className="relative flex size-10 shrink-0 items-center justify-center rounded-full bg-[var(--br-600)] text-[16px] font-semibold text-white">{i + 1}</span>
                <div className="min-w-0 pt-1.5">
                  <h2 className="text-[20px] font-semibold leading-7 text-[#171717]"><span className="sr-only">Korak {i + 1}: </span>{s.title}</h2>
                  {s.text && <p className="mt-2 max-w-[680px] whitespace-pre-line text-[16px] leading-7 text-[#404040]">{s.text}</p>}
                  {s.links.length > 0 && <div className="mt-4 flex flex-wrap gap-2">{s.links.map((l) => <LinkBtn key={l.url} l={l} />)}</div>}
                </div>
              </li>
            ))}
          </ol>
          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            {e.links.length > 0 && (
              <div className="rounded-[12px] bg-[#fafafa] p-5 ring-1 ring-inset ring-[#e5e5e5]">
                <p className="text-[14px] font-semibold text-[#171717]">Povezano</p>
                <ul className="mt-3 space-y-2 text-[14px]">{e.links.map((l) => <li key={l.url}><Link href={l.url} className="font-medium text-[var(--br-700)] hover:underline">{l.label}</Link></li>)}</ul>
              </div>
            )}
            {e.contact && <div className="flex gap-3 rounded-[12px] bg-white p-5 ring-1 ring-inset ring-[#e5e5e5]"><Building07 size={20} className="mt-0.5 shrink-0 text-[#a3a3a3]" /><div><p className="text-[12px] text-[#737373]">Nadležni</p><p className="text-[14px] font-medium text-[#171717]">{e.contact}</p><Link href="/o-nama" className="mt-1 inline-block text-[14px] font-semibold text-[var(--br-700)]">Kontakti</Link></div></div>}
            {e.related.length > 0 && (
              <div className="rounded-[12px] bg-white p-5 ring-1 ring-inset ring-[#e5e5e5]">
                <p className="text-[14px] font-semibold text-[#171717]">Slične situacije</p>
                <ul className="mt-3 space-y-2 text-[14px]">{e.related.map((r) => <li key={r.slug}><Link href={`/zivotne-situacije/${r.slug}`} className="flex items-center gap-2 font-medium text-[#404040] hover:text-[var(--br-700)]"><span aria-hidden className="material-symbols-outlined shrink-0 !text-[18px] !leading-none text-[#a3a3a3]">{r.icon}</span>{r.title}</Link></li>)}</ul>
              </div>
            )}
            <p className="text-[12px] text-[#737373]">Ažurirano {dateLong(e.updatedAt)}</p>
          </aside>
        </div>
      </Container>
    </section>
  );
}
