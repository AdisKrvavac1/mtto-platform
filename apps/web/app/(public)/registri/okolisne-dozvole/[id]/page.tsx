import Link from 'next/link';
import { notFound } from 'next/navigation';
import { api, type Permit } from '@/lib/api';
import { DemoBadge } from '@/components/site/ui';
import { PERMIT_STATUS, dateLong, dateShort, dateTime, daysUntil, fileExt, fileSize } from '@/lib/format';
import MapSection from '@/components/site/MapSection';
import StitchTabs from '@/components/stitch/StitchTabs';
import { DossierBody } from '@/components/stitch/Dossier';

export const dynamic = 'force-dynamic';

const chip = 'inline-flex items-center gap-1 px-space-sm py-1 rounded font-label-badge text-label-badge uppercase tracking-wider';

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
  const m = Math.max(0, Math.round(left / 30.4));
  const docs = p.documents ?? [];
  const stat = (k: string, v: string, note: string, cls = 'text-text-heading') => (
    <div key={k} className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col justify-between">
      <span className="font-label-kicker text-label-kicker text-on-surface-variant uppercase">{k}</span>
      <div className="my-space-xs"><span className={`font-headline-sm text-headline-sm font-bold ${cls}`}>{v}</span></div>
      <span className="font-body-sm text-body-sm text-outline">{note}</span>
    </div>
  );

  return (
    <>
      <StitchTabs buttons="#monitoringTabs button" panels={{ air: 'tab-air', water: 'tab-water', noise: 'tab-noise' }} on={['bg-surface-container-lowest', 'text-primary', 'shadow-sm']} off={['text-on-surface-variant']} />
      <DossierBody
        reg={p.registerNumber}
        updated={dateTime(new Date())}
        title={<>{p.operator} – {p.facility}</>}
        badges={
          <div className="flex flex-wrap items-center gap-space-xs">
            <span className={`${chip} shadow-sm ${st.cls}`}><span className="material-symbols-outlined text-[14px]">check_circle</span>{st.label} (do {dateShort(p.validUntil)})</span>
            <span className={`${chip} bg-surface-container-high text-institutional-navy-deep`}><span className="material-symbols-outlined text-[14px]">factory</span>{p.activity}</span>
            {p.lat != null && <span className={`${chip} bg-surface-container-low text-primary`}><span className="material-symbols-outlined text-[14px]">pin_drop</span>Lokacija na mapi</span>}
            <DemoBadge show={p.isDemo} />
          </div>
        }
        meta={
          <p className="font-body-regular text-body-regular text-text-body flex flex-wrap items-center gap-y-1 gap-x-space-md pt-1">
            <span className="inline-flex items-center gap-1"><span className="material-symbols-outlined text-[16px] text-primary">location_city</span>{p.address ? `${p.address}, ` : ''}{p.municipality}</span>
            {p.description && <><span className="text-outline-variant">•</span><span>{p.description}</span></>}
          </p>
        }
        actions={
          <div className="pt-space-sm flex flex-wrap items-center gap-space-sm" id="dokumenti">
            {docs.map((d, i) => (
              <a key={d.id} href={`/api/documents/${d.id}/file`} target="_blank" rel="noopener" className={`inline-flex items-center gap-space-xs px-space-md py-2.5 rounded font-button text-button transition-all ${i === 0 ? 'bg-primary text-on-primary hover:bg-institutional-navy-deep shadow-sm hover:-translate-y-0.5' : 'bg-surface-container-high text-institutional-navy-deep hover:bg-surface-container-highest'}`}>
                <span className="material-symbols-outlined text-[18px]">{i === 0 ? 'download' : 'menu_book'}</span><span>{d.title} ({fileExt(d.fileName)} • {fileSize(d.size)})</span>
              </a>
            ))}
            <Link className="inline-flex items-center gap-space-xs px-space-md py-2.5 bg-surface-container-low text-primary hover:bg-surface-container rounded font-button text-button transition-all" href="/registri/okolisne-dozvole"><span className="material-symbols-outlined text-[18px]">list</span><span>Svi zapisi registra</span></Link>
            <Link className="inline-flex items-center gap-space-xs px-space-md py-2.5 bg-error text-on-error hover:bg-on-error-container rounded font-button text-button ml-auto transition-all shadow-sm" href="/e-usluge/eko-prijava"><span className="material-symbols-outlined text-[18px]">notification_important</span><span>Prijavi nepravilnost</span></Link>
          </div>
        }
        stats={
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-space-sm mb-space-xl">
            {stat('Broj rješenja', p.registerNumber, 'Upravni postupak MTTO', 'text-institutional-navy-deep')}
            {stat('Datum izdavanja', dateLong(p.issuedAt), 'Proveden javni uvid')}
            {stat('Rok važenja', dateLong(p.validUntil), left < 0 ? 'Istekla' : `Preostalo: ${Math.floor(m / 12)} god. ${m % 12} mj.`, left < 60 ? 'text-error' : 'text-secondary')}
            {stat('Djelatnost', p.activity, p.facility)}
            {stat('Nadležno tijelo', 'MTTO HNK', 'Sektor za zaštitu okoliša', 'text-primary')}
          </div>
        }
        intro={
          <div className="flex items-start gap-space-sm p-space-md rounded-lg bg-herzeg-gold-soft border border-herzeg-gold text-[#786000] font-body-sm text-body-sm">
            <span className="material-symbols-outlined">science</span>
            <span>Sekcije 01–04 pokazuju strukturu punog dosjea (tehnologija, emisije, otpad, inspekcija) s primjerom podataka. Povezivanje s monitoringom i inspekcijom je dio Faze 2.</span>
          </div>
        }
        map={
          <div className="bg-surface-container-lowest p-space-md md:p-space-lg rounded-xl shadow-sm space-y-space-md">
            <div className="flex items-center justify-between">
              <h3 className="font-title-md text-title-md text-institutional-navy-deep flex items-center gap-2"><span className="material-symbols-outlined text-secondary">explore</span><span>Lokacija postrojenja</span></h3>
              <span className="font-label-badge text-label-badge px-2 py-0.5 bg-surface-container text-primary rounded">GIS</span>
            </div>
            {p.lat != null && p.lng != null ? (
              <>
                <MapSection compact title={false} height={210} points={[{ id: p.id, layer: 'DOZVOLA', name: p.operator, description: p.facility, lat: p.lat, lng: p.lng, link: null }]} />
                <div className="flex items-center gap-1 font-mono text-[12px] text-on-surface-variant"><span className="material-symbols-outlined text-[16px] text-secondary">my_location</span>{p.lat.toFixed(4)}° N, {p.lng.toFixed(4)}° E</div>
              </>
            ) : <p className="font-body-sm text-body-sm text-outline">Lokacija nije unesena.</p>}
            <Link className="w-full inline-flex items-center justify-center gap-space-xs px-space-md py-2 bg-surface-container-high hover:bg-surface-container-highest text-institutional-navy-deep rounded font-button text-button transition-colors" href="/mapa"><span className="material-symbols-outlined text-[18px]">map</span><span>Otvori interaktivnu mapu</span></Link>
          </div>
        }
      />
    </>
  );
}
