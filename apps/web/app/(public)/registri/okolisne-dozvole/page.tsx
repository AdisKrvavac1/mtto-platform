import Link from 'next/link';
import { apiSafe, type Permit } from '@/lib/api';
import { PageHero, EmptyState, DemoBadge } from '@/components/site/ui';
import { PERMIT_STATUS, dateShort, daysUntil } from '@/lib/format';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Registar okolišnih dozvola' };

const MUNICIPALITIES = ['Čapljina', 'Čitluk', 'Jablanica', 'Konjic', 'Mostar', 'Neum', 'Prozor-Rama', 'Ravno', 'Stolac'];
const ACTIVITIES: Record<string, string> = { Industrija: 'factory', Energetika: 'bolt', Otpad: 'recycling', Turizam: 'holiday_village', Ostalo: 'category' };

function remaining(validUntil: string) {
  const d = daysUntil(validUntil)!;
  if (d < 0) return 'Isteklo';
  if (d < 60) return `Ističe za ${d} dana`;
  const months = Math.round(d / 30.4);
  return months >= 12 ? `Preostalo ${Math.floor(months / 12)} god. ${months % 12} mj.` : `Preostalo ${months} mj.`;
}

export default async function PermitsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const qs = new URLSearchParams();
  for (const k of ['q', 'municipality', 'activity', 'status']) if (sp[k]) qs.set(k, sp[k]!);
  const [rows, all] = await Promise.all([apiSafe<Permit[]>(`/permits?${qs}`, []), apiSafe<Permit[]>('/permits', [])]);
  const by = (k: string) => all.filter((p) => p.activity === k).length;
  const anyDemo = all.some((p) => p.isDemo);
  const select = 'w-full h-10 rounded border border-[#cbd5e1] bg-white font-body-sm text-body-sm focus:border-mtto-primary focus:ring-[3px] focus:ring-[rgba(0,171,235,0.25)]';

  return (
    <>
      <PageHero kicker="Službena evidencija · Sektor za zaštitu okoliša" title="Registar izdatih okolišnih dozvola" lead="Javni uvid u pogone i postrojenja koja posjeduju okolišnu dozvolu: operater, lokacija, rok važenja i rješenje za preuzimanje." crumbs={[{ href: '/', label: 'Naslovna' }, { label: 'Službeni registri' }, { label: 'Okolišne dozvole' }]}>
        <div className="mt-space-lg grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-space-sm">
          <div className="p-space-sm rounded-lg bg-surface-container-lowest/10">
            <span className="material-symbols-outlined text-secondary-fixed">verified</span>
            <p className="font-display text-headline-lg font-bold">{all.length}</p>
            <p className="font-body-sm text-body-sm text-surface-variant">Ukupno dozvola</p>
          </div>
          {Object.entries(ACTIVITIES).map(([k, icon]) => (
            <Link key={k} href={`/registri/okolisne-dozvole?activity=${encodeURIComponent(k)}`} className="p-space-sm rounded-lg bg-surface-container-lowest/5 hover:bg-surface-container-lowest/15">
              <span className="material-symbols-outlined text-surface-variant">{icon}</span>
              <p className="font-display text-headline-lg font-bold">{by(k)}</p>
              <p className="font-body-sm text-body-sm text-surface-variant">{k}</p>
            </Link>
          ))}
        </div>
      </PageHero>

      <section className="max-w-7xl mx-auto px-margin-mobile md:px-margin py-space-xl space-y-space-lg">
        {anyDemo && (
          <div className="flex items-start gap-space-sm p-space-md rounded-lg bg-herzeg-gold-soft border border-herzeg-gold text-[#786000] font-body-sm text-body-sm">
            <span className="material-symbols-outlined">science</span>
            <span>Zapisi označeni kao <strong>Demo</strong> su izmišljeni primjeri za prezentaciju. Stvarne dozvole unosi Sektor za zaštitu okoliša kroz CMS.</span>
          </div>
        )}
        <form action="/registri/okolisne-dozvole" className="bg-surface-container-lowest rounded-xl shadow-md p-space-md md:p-space-lg grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-space-md items-end">
          <div className="lg:col-span-4">
            <label className="block font-label-badge text-label-badge uppercase text-on-surface-variant mb-1" htmlFor="q">Operater / broj rješenja / postrojenje</label>
            <input id="q" name="q" defaultValue={sp.q} className={select} placeholder="npr. UPI/05-23 ili naziv firme" />
          </div>
          <div className="lg:col-span-2">
            <label className="block font-label-badge text-label-badge uppercase text-on-surface-variant mb-1" htmlFor="municipality">Općina / grad</label>
            <select id="municipality" name="municipality" defaultValue={sp.municipality ?? ''} className={select}>
              <option value="">Sve (9)</option>
              {MUNICIPALITIES.map((m) => <option key={m}>{m}</option>)}
            </select>
          </div>
          <div className="lg:col-span-2">
            <label className="block font-label-badge text-label-badge uppercase text-on-surface-variant mb-1" htmlFor="activity">Djelatnost</label>
            <select id="activity" name="activity" defaultValue={sp.activity ?? ''} className={select}>
              <option value="">Sve djelatnosti</option>
              {Object.keys(ACTIVITIES).map((a) => <option key={a}>{a}</option>)}
            </select>
          </div>
          <div className="lg:col-span-2">
            <label className="block font-label-badge text-label-badge uppercase text-on-surface-variant mb-1" htmlFor="status">Status</label>
            <select id="status" name="status" defaultValue={sp.status ?? ''} className={select}>
              <option value="">Svi statusi</option>
              {Object.entries(PERMIT_STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>
          <div className="lg:col-span-2 flex gap-space-xs">
            <button className="flex-1 h-10 rounded bg-mtto-primary text-white font-button text-button hover:bg-mtto-navy inline-flex items-center justify-center gap-1"><span className="material-symbols-outlined text-[18px]">search</span>Pretraži</button>
            <Link href="/registri/okolisne-dozvole" className="h-10 px-3 rounded border border-mtto-primary text-mtto-primary inline-flex items-center" title="Poništi filtere"><span className="material-symbols-outlined text-[18px]">restart_alt</span></Link>
          </div>
        </form>

        <div className="flex items-center justify-between">
          <h2 className="font-headline-sm text-headline-sm font-bold text-primary">Izdane okolišne dozvole</h2>
          <span className="font-body-sm text-body-sm text-on-surface-variant">Prikazano {rows.length} od {all.length}</span>
        </div>

        {rows.length === 0 ? (
          <EmptyState title="Nema dozvola za odabrane kriterije" />
        ) : (
          <div className="bg-surface-container-lowest rounded-xl shadow-md overflow-x-auto">
            <table className="w-full min-w-[900px] text-left">
              <thead>
                <tr className="border-b-2 border-mtto-primary">
                  {['Broj i datum', 'Operater i postrojenje', 'Lokacija', 'Djelatnost', 'Rok važenja', 'Status', ''].map((h) => (
                    <th key={h} className="px-space-md py-3 font-label-badge text-label-badge uppercase tracking-wider text-[#80807e]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((p, i) => {
                  const st = PERMIT_STATUS[p.status] ?? PERMIT_STATUS.VAZECA;
                  return (
                    <tr key={p.id} className={`${i % 2 ? 'bg-slate-surface' : ''} hover:bg-[rgba(0,171,235,0.05)] align-top`}>
                      <td className="px-space-md py-3">
                        <Link href={`/registri/okolisne-dozvole/${p.id}`} className="font-mono text-[13px] font-bold text-mtto-primary hover:underline">{p.registerNumber}</Link>
                        <span className="block font-body-sm text-body-sm text-on-surface-variant">{dateShort(p.issuedAt)}</span>
                      </td>
                      <td className="px-space-md py-3">
                        <span className="font-title-md text-[15px] font-bold text-primary">{p.operator}</span>
                        <span className="block font-body-sm text-body-sm text-on-surface-variant">{p.facility}</span>
                        <DemoBadge show={p.isDemo} className="mt-1" />
                      </td>
                      <td className="px-space-md py-3 font-body-sm text-body-sm">{p.municipality}</td>
                      <td className="px-space-md py-3"><span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-neretva-cyan-light text-[#007ba8] font-label-badge text-label-badge"><span className="material-symbols-outlined text-[14px]">{ACTIVITIES[p.activity] ?? 'category'}</span>{p.activity}</span></td>
                      <td className="px-space-md py-3">
                        <span className="font-mono text-[13px] font-bold">{dateShort(p.validUntil)}</span>
                        <span className="block font-body-sm text-body-sm text-on-surface-variant">{remaining(p.validUntil)}</span>
                      </td>
                      <td className="px-space-md py-3"><span className={`px-2.5 py-0.5 rounded-full font-label-badge text-label-badge font-bold ${st.cls}`}>{st.label}</span></td>
                      <td className="px-space-md py-3 text-right">
                        <Link href={`/registri/okolisne-dozvole/${p.id}`} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-surface-container-high text-primary font-button text-button whitespace-nowrap hover:bg-primary hover:text-on-primary">Dosje<span className="material-symbols-outlined text-[16px]">arrow_forward</span></Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-space-lg pt-space-lg">
          <div className="bg-surface-container-lowest rounded-xl shadow-md p-space-lg space-y-space-sm">
            <span className="font-label-kicker text-label-kicker text-secondary uppercase tracking-wider">Prava građana</span>
            <h3 className="font-headline-sm text-headline-sm font-bold text-primary">Javni uvid i Aarhuška konvencija</h3>
            <p className="font-body-regular text-body-regular text-text-body">Građani i nevladine organizacije imaju pravo na uvid u studije, elaborate i izvještaje o praćenju. Zahtjev za pristup informacijama šalje se Ministarstvu.</p>
            <a href="mailto:okolis@mtto.gov.ba?subject=Zahtjev%20za%20pristup%20informacijama" className="inline-flex items-center gap-1 font-button text-button text-mtto-primary font-bold">Pošalji zahtjev<span className="material-symbols-outlined text-[18px]">arrow_forward</span></a>
          </div>
          <div className="bg-institutional-navy-deep text-on-primary rounded-xl shadow-md p-space-lg space-y-space-md">
            <span className="font-label-kicker text-label-kicker text-secondary-fixed uppercase tracking-wider">Otvoreni podaci</span>
            <h3 className="font-headline-sm text-headline-sm font-bold">Preuzmite cijeli registar</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm">
              <a href="/registri/okolisne-dozvole/izvoz?format=csv" className="flex items-center gap-space-sm p-space-sm rounded-lg bg-surface-container-lowest/10 hover:bg-surface-container-lowest/20"><span className="material-symbols-outlined text-secondary-fixed">table_chart</span><span><span className="block font-title-md text-[15px] font-bold">Dataset CSV</span><span className="font-body-sm text-body-sm text-surface-variant">Excel, UTF-8</span></span></a>
              <a href="/registri/okolisne-dozvole/izvoz?format=json" className="flex items-center gap-space-sm p-space-sm rounded-lg bg-surface-container-lowest/10 hover:bg-surface-container-lowest/20"><span className="material-symbols-outlined text-secondary-fixed">api</span><span><span className="block font-title-md text-[15px] font-bold">JSON API</span><span className="font-body-sm text-body-sm text-surface-variant">Za programske integracije</span></span></a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
