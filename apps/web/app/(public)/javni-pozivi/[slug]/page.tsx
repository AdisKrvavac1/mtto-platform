import Link from 'next/link';
import { notFound } from 'next/navigation';
import { api } from '@/lib/api';
import { PHASE, daysLeft, km, type CallDetail } from '@/lib/calls';
import { dateLong, dateShort } from '@/lib/format';
import { Badge, Container, HB1, HB2, PageHero } from '@/components/uui';
import { Calendar, CheckCircle, Download01, File06, Mail01, SearchLg, Send01 } from '@untitledui/icons';

export const dynamic = 'force-dynamic';

async function load(slug: string) {
  try { return await api<CallDetail>(`/calls/${encodeURIComponent(slug)}`); } catch (e: any) { if (e.status === 404) notFound(); throw e; }
}
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const c = await load((await params).slug);
  return { title: c.title, description: c.summary };
}

export default async function CallPage({ params }: { params: Promise<{ slug: string }> }) {
  const c = await load((await params).slug);
  const p = PHASE[c.phase];
  const left = daysLeft(c.closesAt);
  const canApply = c.phase === 'OTVOREN' && !!c.form;
  const paras = (t: string) => t.split(/\n{2,}/).map((x, i) => <p key={i} className="whitespace-pre-line">{x}</p>);

  return (
    <>
      <PageHero
        crumbs={[{ label: 'Naslovna', href: '/' }, { label: 'Javni pozivi', href: '/javni-pozivi' }, { label: c.title }]}
        eyebrow={c.sector ?? 'Javni poziv'} title={c.title}
        stats={[
          { label: 'Status', value: p.label },
          { label: c.phase === 'NAJAVLJEN' ? 'Prijave od' : 'Rok za prijave', value: dateShort(c.phase === 'NAJAVLJEN' ? c.opensAt : c.closesAt) },
          { label: 'Ukupno sredstava', value: km(c.budget) },
          c.phase === 'REZULTATI' ? { label: 'Dodijeljeno', value: km(c.awarded) } : { label: 'Najviše po projektu', value: km(c.maxAmount) },
        ]}
        actions={canApply ? <><Link href={`/e-usluge/obrasci/${c.form!.slug}`} className={HB1}><Send01 size={20} />Prijavi se online</Link><Link href="/e-usluge/status" className={HB2}><SearchLg size={20} />Status prijave</Link></>
          : c.phase === 'REZULTATI' ? <a href={`/api/calls/${c.slug}/korisnici.csv`} className={HB1}><Download01 size={20} />Lista korisnika (CSV)</a> : undefined}
      >
        {c.summary}
      </PageHero>

      <section className="bg-white py-12 md:py-16">
        <Container>
          {c.isDemo && <p className="mb-8 flex items-start gap-2 rounded-[12px] bg-[#fffcf5] p-4 text-[14px] text-[#b54708] ring-1 ring-inset ring-[#fedf89]"><Badge tone="warning">Primjer</Badge>Ovaj poziv služi za prikaz modula. Iznosi, rokovi i korisnici nisu stvarni.</p>}
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_340px]">
            <div className="min-w-0 space-y-10">
              {c.phase === 'REZULTATI' && (
                <div>
                  <h2 className="text-[24px] font-semibold text-[#171717]">Lista korisnika</h2>
                  {c.resultsNote && <div className="mt-2 space-y-3 text-[16px] leading-6 text-[#525252]">{paras(c.resultsNote)}</div>}
                  <div className="mt-6 overflow-x-auto rounded-[12px] ring-1 ring-inset ring-[#e5e5e5]">
                    <table className="w-full min-w-[600px] text-left text-[14px]">
                      <caption className="sr-only">Korisnici sredstava i iznosi</caption>
                      <thead className="bg-[#fafafa] text-[12px] font-medium text-[#525252]"><tr><th className="w-12 px-4 py-3">R. br.</th><th className="px-4 py-3">Korisnik</th><th className="px-4 py-3">Općina</th><th className="px-4 py-3">Projekat</th><th className="px-4 py-3 text-right">Iznos</th></tr></thead>
                      <tbody className="divide-y divide-[#e5e5e5]">
                        {c.awards.map((a, i) => (
                          <tr key={i}><td className="px-4 py-3 tabular-nums text-[#737373]">{i + 1}.</td><td className="px-4 py-3 font-medium text-[#171717]">{a.beneficiary}</td><td className="px-4 py-3 text-[#525252]">{a.municipality ?? '—'}</td><td className="px-4 py-3 text-[#525252]">{a.project || '—'}</td><td className="px-4 py-3 text-right font-medium tabular-nums text-[#171717]">{km(a.amount)}</td></tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-[#fafafa] font-semibold text-[#171717]"><tr><td className="px-4 py-3" colSpan={4}>Ukupno {c.awards.length} korisnika</td><td className="px-4 py-3 text-right tabular-nums">{km(c.awarded)}</td></tr></tfoot>
                    </table>
                  </div>
                  {c.awards.some((a) => a.beneficiaryType === 'FIZICKO') && <p className="mt-2 text-[12px] text-[#737373]">Fizička lica se zbog zaštite ličnih podataka prikazuju bez imena.</p>}
                </div>
              )}
              <div>
                <h2 className="text-[24px] font-semibold text-[#171717]">O pozivu</h2>
                <div className="mt-4 space-y-4 text-[16px] leading-7 text-[#404040]">{paras(c.body)}</div>
              </div>
              {c.eligibility && (
                <div>
                  <h2 className="text-[24px] font-semibold text-[#171717]">Ko se može prijaviti</h2>
                  <div className="mt-4 space-y-4 text-[16px] leading-7 text-[#404040]">{paras(c.eligibility)}</div>
                </div>
              )}
              {c.documents.length > 0 && (
                <div>
                  <h2 className="text-[24px] font-semibold text-[#171717]">Dokumenti</h2>
                  <ul className="mt-4 divide-y divide-[#e5e5e5] rounded-[12px] ring-1 ring-inset ring-[#e5e5e5]">
                    {c.documents.map((d) => <li key={d.url}><a href={d.url} className="flex items-center gap-3 px-5 py-4 text-[14px] font-medium text-[#171717] hover:bg-[#fafafa]" target={d.url.startsWith('http') ? '_blank' : undefined} rel="noopener"><File06 size={20} className="text-[#737373]" />{d.title}<Download01 size={18} className="ml-auto text-[#a3a3a3]" /></a></li>)}
                  </ul>
                </div>
              )}
            </div>

            <aside className="space-y-4 text-[14px] text-[#525252] lg:sticky lg:top-24 lg:self-start">
              <div className="rounded-[12px] bg-white p-5 ring-1 ring-inset ring-[#e5e5e5]">
                <Badge tone={p.tone} dot>{p.label}</Badge>
                <dl className="mt-4 space-y-3">
                  <div className="flex gap-3"><Calendar size={18} className="mt-0.5 shrink-0 text-[#a3a3a3]" /><div><dt className="text-[12px] text-[#737373]">Prijave</dt><dd className="font-medium text-[#171717]">{dateLong(c.opensAt)} – {dateLong(c.closesAt)}</dd>
                    {c.phase === 'OTVOREN' && <dd className={left <= 7 ? 'font-medium text-[#b54708]' : 'text-[#067647]'}>{left <= 0 ? 'Rok ističe danas' : `Još ${left} ${left === 1 ? 'dan' : 'dana'}`}</dd>}</div></div>
                  {c.contact && <div className="flex gap-3"><Mail01 size={18} className="mt-0.5 shrink-0 text-[#a3a3a3]" /><div><dt className="text-[12px] text-[#737373]">Kontakt</dt><dd className="text-[#171717]">{c.contact}</dd></div></div>}
                </dl>
                {canApply ? (
                  <>
                    <Link href={`/e-usluge/obrasci/${c.form!.slug}`} className="mt-5 flex h-11 items-center justify-center gap-1.5 rounded-[8px] bg-[var(--br-600)] text-[16px] font-semibold text-white hover:bg-[var(--br-700)]"><Send01 size={20} />Prijavi se online</Link>
                    {c.form!.attachments !== 'NE' && c.form!.attachmentHint && <p className="mt-3 text-[12px]">Pripremite: {c.form!.attachmentHint}.</p>}
                  </>
                ) : c.phase === 'NAJAVLJEN' ? <p className="mt-5 rounded-[8px] bg-[#eff8ff] p-3 text-[#175cd3]">Online prijava otvara se {dateLong(c.opensAt)}</p>
                  : c.phase === 'ZATVOREN' ? <p className="mt-5 rounded-[8px] bg-[#fafafa] p-3">Rok za prijave je istekao. Prijave se ocjenjuju; lista korisnika bit će objavljena ovdje.</p>
                  : c.phase === 'REZULTATI' ? <p className="mt-5 flex items-center gap-2 text-[#067647]"><CheckCircle size={18} />Rezultati su objavljeni.</p> : null}
              </div>
              <div className="rounded-[12px] bg-[#fafafa] p-5 ring-1 ring-inset ring-[#e5e5e5]">
                <p className="font-semibold text-[#171717]">Kako teče prijava</p>
                <ol className="mt-3 list-decimal space-y-2 pl-5">
                  <li>Popunite obrazac i priložite dokumente.</li>
                  <li>Odmah dobijate broj predmeta i kod za praćenje.</li>
                  <li>Komisija ocjenjuje prijave nakon isteka roka.</li>
                  <li>Lista korisnika s iznosima objavljuje se na ovoj stranici.</li>
                </ol>
              </div>
              {c.legalBasis && <p>Pravni osnov: {c.legalBasis}</p>}
            </aside>
          </div>
        </Container>
      </section>
    </>
  );
}
