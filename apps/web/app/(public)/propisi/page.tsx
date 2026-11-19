import Link from 'next/link';
import { apiSafe, type Doc } from '@/lib/api';
import { PageHero, EmptyState, DemoBadge } from '@/components/site/ui';
import { DOC_TYPE, dateShort, fileExt, fileSize } from '@/lib/format';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Propisi, zakoni i obrasci' };

const SECTORS = ['Turizam i ugostiteljstvo', 'Zaštita okoliša', 'Trgovina', 'Opće'];

export default async function PropisiPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const qs = new URLSearchParams();
  for (const k of ['docType', 'sector', 'q']) if (sp[k]) qs.set(k, sp[k]!);
  const [docs, all] = await Promise.all([apiSafe<Doc[]>(`/documents?${qs}`, []), apiSafe<Doc[]>('/documents', [])]);
  const forms = all.filter((d) => d.docType === 'OBRAZAC').slice(0, 3);
  const count = (t: string) => all.filter((d) => d.docType === t).length;
  const link = (patch: Record<string, string | undefined>) => {
    const p = new URLSearchParams();
    for (const [k, v] of Object.entries({ docType: sp.docType, sector: sp.sector, q: sp.q, ...patch })) if (v) p.set(k, v);
    const s = p.toString();
    return `/propisi${s ? `?${s}` : ''}`;
  };
  const chip = (on: boolean) => `px-3 py-1.5 rounded-lg font-button text-button whitespace-nowrap ${on ? 'bg-primary-container text-on-primary' : 'bg-surface-container-lowest text-on-surface-variant border border-slate-border hover:border-primary'}`;

  return (
    <>
      <PageHero kicker="Registri i dokumenti" title="Propisi, zakoni i obrasci zahtjeva" lead="Biblioteka normativnih akata, pravilnika i obrazaca za postupke pred Ministarstvom. Svaki dokument ima metapodatke, filtere i preuzimanje." crumbs={[{ href: '/', label: 'Naslovna' }, { label: 'Propisi i obrasci' }]}>
        <div className="mt-space-lg grid grid-cols-2 md:grid-cols-4 gap-space-md max-w-3xl">
          {[['ZAKON', 'Zakona'], ['PRAVILNIK', 'Pravilnika'], ['OBRAZAC', 'Obrazaca'], ['IZVJESTAJ', 'Izvještaja']].map(([k, l]) => (
            <Link key={k} href={link({ docType: k })} className="p-space-sm rounded-lg bg-surface-container-lowest/10 hover:bg-surface-container-lowest/20">
              <span className="font-display text-headline-lg font-bold text-on-primary">{count(k)}</span>
              <p className="font-body-sm text-body-sm text-surface-variant">{l}</p>
            </Link>
          ))}
        </div>
      </PageHero>

      <section className="max-w-7xl mx-auto px-margin-mobile md:px-margin py-space-xl space-y-space-xl">
        {forms.length > 0 && (
          <div className="space-y-space-md">
            <div>
              <span className="font-label-kicker text-label-kicker text-secondary uppercase tracking-wider">Za građane i privredu</span>
              <h2 className="font-headline-md text-headline-md text-primary font-bold">Najčešće traženi obrasci</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
              {forms.map((d) => (
                <div key={d.id} className="bg-surface-container-lowest rounded-xl shadow-md p-space-md flex flex-col justify-between gap-space-md border-t-[3px] border-neretva-cyan">
                  <div className="space-y-space-xs">
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2 py-0.5 rounded bg-neretva-cyan-light text-[#007ba8] font-label-badge text-label-badge uppercase">{d.sector}</span>
                      <DemoBadge show={d.isDemo} />
                    </div>
                    <h3 className="font-title-md text-title-md font-bold text-primary leading-snug">{d.title}</h3>
                    {d.number && <p className="font-label-badge text-label-badge text-on-surface-variant">Šifra: {d.number}</p>}
                  </div>
                  <a href={`/api/documents/${d.id}/file`} target="_blank" rel="noopener" className="inline-flex items-center justify-center gap-space-xs py-2 rounded-lg bg-primary-container text-on-primary font-button text-button hover:bg-institutional-navy-deep">
                    <span className="material-symbols-outlined text-[18px]">download</span>Preuzmi {fileExt(d.fileName)} · {fileSize(d.size)}
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-space-md">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-sm">
            <div>
              <span className="font-label-kicker text-label-kicker text-secondary uppercase tracking-wider">Normativna baza</span>
              <h2 className="font-headline-md text-headline-md text-primary font-bold">Službeni propisi po pravnim cjelinama</h2>
            </div>
            <form action="/propisi" className="flex items-center bg-surface-container-lowest border border-slate-border rounded-lg px-space-md py-2 w-full md:w-96">
              {sp.docType && <input type="hidden" name="docType" value={sp.docType} />}
              {sp.sector && <input type="hidden" name="sector" value={sp.sector} />}
              <span className="material-symbols-outlined text-outline text-[20px] mr-2">search</span>
              <input name="q" defaultValue={sp.q} aria-label="Pretraga propisa" placeholder="Naziv ili broj akta..." className="bg-transparent w-full border-0 p-0 focus:ring-0 font-body-regular text-body-regular" />
            </form>
          </div>
          <div className="flex items-center gap-space-xs overflow-x-auto pb-1">
            <Link href={link({ docType: undefined })} className={chip(!sp.docType)}>Sve vrste</Link>
            {Object.entries(DOC_TYPE).map(([k, v]) => <Link key={k} href={link({ docType: k })} className={chip(sp.docType === k)}>{v}</Link>)}
          </div>
          <div className="flex items-center gap-space-xs overflow-x-auto pb-1">
            <span className="font-label-kicker text-label-kicker uppercase text-on-surface-variant mr-1">Resor:</span>
            <Link href={link({ sector: undefined })} className={chip(!sp.sector)}>Svi</Link>
            {SECTORS.map((s) => <Link key={s} href={link({ sector: s })} className={chip(sp.sector === s)}>{s}</Link>)}
          </div>

          {docs.length === 0 ? (
            <EmptyState title="Nema dokumenata za odabrane filtere" />
          ) : (
            <div className="bg-surface-container-lowest rounded-xl shadow-md overflow-x-auto">
              <table className="w-full min-w-[760px] text-left">
                <thead>
                  <tr className="border-b-2 border-mtto-primary">
                    {['Naziv akta', 'Vrsta', 'Broj', 'Datum', 'Status', ''].map((h) => (
                      <th key={h} className="px-space-md py-3 font-label-badge text-label-badge uppercase tracking-wider text-[#80807e]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {docs.map((d, i) => (
                    <tr key={d.id} className={`${i % 2 ? 'bg-slate-surface' : ''} hover:bg-[rgba(0,171,235,0.05)]`}>
                      <td className="px-space-md py-3">
                        <span className="font-title-md text-[15px] font-bold text-primary">{d.title}</span>
                        <span className="block font-body-sm text-body-sm text-on-surface-variant">{d.sector} <DemoBadge show={d.isDemo} className="ml-1" /></span>
                      </td>
                      <td className="px-space-md py-3 font-body-sm text-body-sm">{DOC_TYPE[d.docType] ?? d.docType}</td>
                      <td className="px-space-md py-3 font-label-badge text-label-badge font-mono">{d.number || '—'}</td>
                      <td className="px-space-md py-3 font-body-sm text-body-sm whitespace-nowrap">{dateShort(d.issuedAt)}</td>
                      <td className="px-space-md py-3"><span className={`px-2 py-0.5 rounded font-label-badge text-label-badge ${d.status === 'VAZECI' ? 'bg-eko-green-light text-eko-green' : 'bg-surface-container-high text-outline'}`}>{d.status === 'VAZECI' ? 'Važeći' : 'Arhiviran'}</span></td>
                      <td className="px-space-md py-3 text-right">
                        <a href={`/api/documents/${d.id}/file`} target="_blank" rel="noopener" className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-error-container text-on-error-container font-label-badge text-label-badge font-bold whitespace-nowrap">
                          <span className="material-symbols-outlined text-[16px]">picture_as_pdf</span>{fileExt(d.fileName)} {fileSize(d.size)}
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-space-lg">
          <div className="bg-surface-container-lowest rounded-xl shadow-md p-space-lg space-y-space-md">
            <h3 className="font-headline-sm text-headline-sm font-bold text-primary">Kako podnijeti zahtjev Ministarstvu?</h3>
            <ol className="space-y-space-sm">
              {['Preuzmite odgovarajući obrazac iz biblioteke.', 'Popunite obrazac i pripremite tražene priloge.', 'Predajte zahtjev na protokol Ministarstva ili poštom.', 'Pratite status putem broja predmeta.'].map((t, i) => (
                <li key={i} className="flex gap-space-sm items-start">
                  <span className="w-7 h-7 shrink-0 rounded-full bg-primary text-on-primary flex items-center justify-center font-label-badge text-label-badge font-bold">{i + 1}</span>
                  <span className="font-body-regular text-body-regular text-text-body pt-0.5">{t}</span>
                </li>
              ))}
            </ol>
          </div>
          <div className="bg-institutional-navy-deep text-on-primary rounded-xl shadow-md p-space-lg space-y-space-sm">
            <span className="font-label-kicker text-label-kicker uppercase tracking-wider text-secondary-fixed">Pisarnica i rad sa strankama</span>
            <h3 className="font-headline-sm text-headline-sm font-bold">Braće Fejića bb, 88000 Mostar</h3>
            <p className="font-body-sm text-body-sm text-surface-container-high">Centrala: <a className="font-bold text-on-primary" href="tel:+38736551823">+387 36 551 823</a></p>
            <p className="font-body-sm text-body-sm text-surface-container-high">Faks: +387 36 552 806</p>
            <p className="font-body-sm text-body-sm text-surface-container-high">E-mail: <a className="font-bold text-on-primary underline" href="mailto:info@mtto.gov.ba">info@mtto.gov.ba</a></p>
          </div>
        </div>
      </section>
    </>
  );
}
