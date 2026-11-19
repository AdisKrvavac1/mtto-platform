import Link from 'next/link';
import { notFound } from 'next/navigation';
import { api, type Permit } from '@/lib/api';
import { DocRow, DemoBadge } from '@/components/site/ui';
import { PERMIT_STATUS, dateLong, daysUntil } from '@/lib/format';
import MapSection from '@/components/site/MapSection';

export const dynamic = 'force-dynamic';

export default async function PermitDossier({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let p: Permit;
  try {
    p = await api<Permit>(`/permits/${encodeURIComponent(id)}`);
  } catch (e: any) {
    if (e.status === 404) notFound();
    throw e;
  }
  const st = PERMIT_STATUS[p.status] ?? PERMIT_STATUS.VAZECA;
  const left = daysUntil(p.validUntil)!;

  return (
    <>
      <div className="w-full bg-surface-container-low py-space-sm">
        <nav className="max-w-7xl mx-auto px-margin-mobile md:px-margin flex items-center gap-space-xs font-body-sm text-body-sm text-on-surface-variant flex-wrap" aria-label="Putanja">
          <Link className="hover:text-primary" href="/">Naslovna</Link>
          <span className="material-symbols-outlined text-[14px] text-outline">chevron_right</span>
          <Link className="hover:text-primary" href="/registri/okolisne-dozvole">Registar okolišnih dozvola</Link>
          <span className="material-symbols-outlined text-[14px] text-outline">chevron_right</span>
          <span className="text-on-surface font-semibold">{p.registerNumber}</span>
        </nav>
      </div>
      <section className="max-w-7xl mx-auto px-margin-mobile md:px-margin py-space-xl space-y-space-lg">
        <div className="bg-surface-container-lowest rounded-xl shadow-md p-space-md md:p-space-lg border-t-[3px] border-eko-green">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-space-md">
            <div className="space-y-space-xs">
              <div className="flex flex-wrap items-center gap-space-xs">
                <span className="font-label-kicker text-label-kicker text-secondary uppercase tracking-wider">Dosje okolišne dozvole</span>
                <span className={`px-2.5 py-0.5 rounded-full font-label-badge text-label-badge font-bold ${st.cls}`}>{st.label}</span>
                <DemoBadge show={p.isDemo} />
              </div>
              <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary font-bold">{p.operator}</h1>
              <p className="font-body-lead text-body-lead text-text-body">{p.facility}</p>
              <p className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">location_on</span>{p.address || p.municipality}</p>
            </div>
            <div className="flex flex-wrap gap-space-sm">
              {p.documents?.[0] && (
                <a href={`/api/documents/${p.documents[0].id}/file`} target="_blank" rel="noopener" className="inline-flex items-center gap-space-xs px-space-md py-2 rounded bg-mtto-primary text-white font-button text-button"><span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>Preuzmi rješenje</a>
              )}
              <Link href="/registri/okolisne-dozvole" className="inline-flex items-center gap-space-xs px-space-md py-2 rounded border-[1.5px] border-mtto-primary text-mtto-primary font-button text-button"><span className="material-symbols-outlined text-[18px]">arrow_back</span>Registar</Link>
            </div>
          </div>
          <div className="mt-space-lg grid grid-cols-2 lg:grid-cols-5 gap-space-md">
            {[
              ['Broj rješenja', p.registerNumber, 'font-mono'],
              ['Datum izdavanja', dateLong(p.issuedAt), ''],
              ['Važi do', dateLong(p.validUntil), ''],
              ['Preostalo', left >= 0 ? `${left} dana` : 'Isteklo', left < 60 ? 'text-error' : 'text-eko-green'],
              ['Djelatnost', p.activity, ''],
            ].map(([k, v, cls]) => (
              <div key={k} className="p-space-sm rounded-lg bg-slate-surface border border-slate-border">
                <p className="font-label-badge text-label-badge uppercase text-[#80807e]">{k}</p>
                <p className={`font-title-md text-[15px] font-bold text-primary ${cls}`}>{v}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
          <div className="lg:col-span-7 space-y-space-lg">
            <div className="bg-surface-container-lowest rounded-xl shadow-md p-space-lg space-y-space-sm">
              <h2 className="font-headline-sm text-headline-sm font-bold text-primary flex items-center gap-2"><span className="material-symbols-outlined text-primary">factory</span>Opis postrojenja</h2>
              <p className="font-body-regular text-body-regular text-text-body whitespace-pre-line">{p.description || 'Opis nije unesen.'}</p>
            </div>
            <div className="bg-surface-container-lowest rounded-xl shadow-md p-space-lg space-y-space-md">
              <h2 className="font-headline-sm text-headline-sm font-bold text-primary flex items-center gap-2"><span className="material-symbols-outlined text-primary">folder_open</span>Rješenja i dokumentacija</h2>
              {p.documents?.length ? <div className="grid gap-space-sm">{p.documents.map((d) => <DocRow key={d.id} d={d} />)}</div> : <p className="font-body-sm text-body-sm text-on-surface-variant">Nema priloženih dokumenata.</p>}
            </div>
          </div>
          <div className="lg:col-span-5 space-y-space-lg">
            {p.lat && p.lng ? (
              <MapSection title={false} compact height={320} points={[{ id: p.id, layer: 'DOZVOLA', name: p.operator, description: p.facility, lat: p.lat, lng: p.lng, link: null }]} />
            ) : null}
            <div className="bg-institutional-navy-deep text-on-primary rounded-xl shadow-md p-space-lg space-y-space-sm">
              <span className="font-label-kicker text-label-kicker text-secondary-fixed uppercase tracking-wider">Nadležno tijelo</span>
              <h3 className="font-title-md text-title-md font-bold">Sektor za zaštitu prirode i okoliša</h3>
              <p className="font-body-sm text-body-sm text-surface-container-high">Ministarstvo trgovine, turizma i zaštite okoliša HNK</p>
              <a href="tel:036551324" className="block font-body-sm text-body-sm">036 551 324</a>
              <a href="mailto:okolis@mtto.gov.ba" className="block font-body-sm text-body-sm underline">okolis@mtto.gov.ba</a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
