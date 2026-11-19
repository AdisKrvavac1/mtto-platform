import Link from 'next/link';
import { apiSafe, type Permit } from '@/lib/api';
import { DemoBadge } from '@/components/site/ui';
import { dateShort, dateTime, daysUntil } from '@/lib/format';
import { PermitsCrumb, PermitsHero, PermitsFilter, PermitsTable, PermitsRights, PermitsOpenData } from '@/components/stitch/Permits';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Registar okolišnih dozvola' };

const MUNICIPALITIES = ['Čapljina', 'Čitluk', 'Jablanica', 'Konjic', 'Mostar', 'Neum', 'Prozor-Rama', 'Ravno', 'Stolac'];
const ACTIVITY = ['Industrija', 'Energetika', 'Otpad', 'Turizam', 'Ostalo'];
const STATUS: Record<string, { label: string; cls: string; dot: string }> = {
  VAZECA: { label: 'Važeća', cls: 'bg-emerald-light text-secondary', dot: 'bg-secondary' },
  U_OBNOVI: { label: 'U obnovi', cls: 'bg-amber-light text-[#7a6100]', dot: 'bg-herzeg-gold' },
  ISTEKLA: { label: 'Istekla', cls: 'bg-error-container text-on-error-container', dot: 'bg-error' },
};

function remaining(validUntil: string) {
  const d = daysUntil(validUntil)!;
  if (d < 0) return { t: 'Istekla', c: 'text-error' };
  if (d < 60) return { t: `Ističe za ${d} dana`, c: 'text-error' };
  const m = Math.round(d / 30.4);
  return { t: m >= 12 ? `Preostalo ${Math.floor(m / 12)} god. ${m % 12} mj.` : `Preostalo ${m} mj.`, c: 'text-secondary' };
}

export default async function PermitsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const qs = new URLSearchParams();
  for (const k of ['q', 'municipality', 'activity', 'status']) if (sp[k]) qs.set(k, sp[k]!);
  const [rows0, all] = await Promise.all([apiSafe<Permit[]>(`/permits?${qs}`, []), apiSafe<Permit[]>('/permits', [])]);
  const sort = sp.sort || 'newest';
  const rows = [...rows0].sort((a, b) => sort === 'expiry' ? a.validUntil.localeCompare(b.validUntil) : sort === 'operator' ? a.operator.localeCompare(b.operator, 'bs') : sort === 'municipality' ? a.municipality.localeCompare(b.municipality, 'bs') : b.issuedAt.localeCompare(a.issuedAt));
  const by = (k: string) => all.filter((p) => p.activity === k).length;
  const pct = (k: string) => `${all.length ? Math.round((by(k) / all.length) * 100) : 0}%`;
  const sel = 'w-full bg-slate-surface rounded-lg pl-3 pr-8 py-2.5 font-body-regular text-body-regular text-on-surface border-0 focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary appearance-none cursor-pointer';
  const lbl = 'font-label-kicker text-label-kicker text-on-surface-variant uppercase';
  const pills = Object.entries({ q: 'Pojam', municipality: 'Teritorij', activity: 'Djelatnost', status: 'Status' }).filter(([k]) => sp[k]);
  const without = (k: string) => { const p = new URLSearchParams(qs); p.delete(k); return `/registri/okolisne-dozvole?${p}`; };

  return (
    <>
      <PermitsCrumb updated={dateTime(new Date())} />
      <PermitsHero
        n={{ total: all.length, Industrija: by('Industrija'), Energetika: by('Energetika'), Otpad: by('Otpad'), Turizam: by('Turizam'), renewal: String(all.filter((p) => p.status === 'U_OBNOVI').length).padStart(2, '0') }}
        pct={{ Industrija: pct('Industrija'), Energetika: pct('Energetika'), Otpad: pct('Otpad'), Turizam: pct('Turizam') }}
      />
      {all.some((p) => p.isDemo) && (
        <div className="max-w-7xl mx-auto px-margin w-full -mt-space-md mb-space-md">
          <div className="flex items-start gap-space-sm p-space-md rounded-lg bg-herzeg-gold-soft border border-herzeg-gold text-[#786000] font-body-sm text-body-sm">
            <span className="material-symbols-outlined">science</span>
            <span>Zapisi označeni kao <strong>Demo</strong> su izmišljeni primjeri za prezentaciju. Stvarne dozvole unosi Sektor za zaštitu okoliša kroz CMS.</span>
          </div>
        </div>
      )}
      <PermitsFilter
        form={
          <form action="/registri/okolisne-dozvole" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-space-md" id="filterForm">
            <div className="flex flex-col gap-1.5 lg:col-span-2">
              <label className={lbl} htmlFor="searchQuery">Naziv subjekta / broj UPI rješenja / postrojenje</label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3 text-outline text-[20px]">search</span>
                <input name="q" defaultValue={sp.q} className="w-full bg-slate-surface rounded-lg pl-10 pr-4 py-2.5 font-body-regular text-body-regular text-on-surface border-0 placeholder:text-outline focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary shadow-inner" id="searchQuery" placeholder="Npr. UPI/05-23 ili naziv operatera" type="text" />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={lbl} htmlFor="m">Općina / grad HNK</label>
              <select id="m" name="municipality" defaultValue={sp.municipality ?? ''} className={sel}><option value="">Sve općine / gradovi (9)</option>{MUNICIPALITIES.map((m) => <option key={m}>{m}</option>)}</select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={lbl} htmlFor="a">Kategorija djelatnosti</label>
              <select id="a" name="activity" defaultValue={sp.activity ?? ''} className={sel}><option value="">Sve djelatnosti</option>{ACTIVITY.map((m) => <option key={m}>{m}</option>)}</select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={lbl} htmlFor="s">Status važenja dozvole</label>
              <select id="s" name="status" defaultValue={sp.status ?? ''} className={sel}><option value="">Svi statusi</option><option value="VAZECA">Samo važeće (aktivne)</option><option value="U_OBNOVI">U postupku obnove</option><option value="ISTEKLA">Istekle / arhiva</option></select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={lbl} htmlFor="o">Sortiranje rezultata</label>
              <select id="o" name="sort" defaultValue={sort} className={sel}><option value="newest">Najnovije izdano rješenje</option><option value="expiry">Rok važenja (hronološki)</option><option value="operator">Naziv operatera (A-Ž)</option><option value="municipality">Općina / lokacija</option></select>
            </div>
            <div className="flex items-end gap-space-xs lg:col-span-2">
              <button className="flex-1 bg-primary hover:bg-institutional-navy-deep text-on-primary font-button text-button py-2.5 px-space-md rounded-lg flex items-center justify-center gap-space-xs transition-colors shadow-sm condensed-text" style={{ backgroundColor: '#234696' }} type="submit"><span className="material-symbols-outlined text-[18px]">filter_alt</span><span>Primijeni filtere</span></button>
              <Link className="bg-surface-container hover:bg-surface-container-high text-on-surface font-button text-button py-2.5 px-space-md rounded-lg flex items-center justify-center gap-space-xs transition-colors" href="/registri/okolisne-dozvole"><span className="material-symbols-outlined text-[18px]">restart_alt</span><span>Poništi</span></Link>
            </div>
          </form>
        }
        pills={
          <div className="flex items-center gap-space-xs flex-wrap pt-2">
            <span className="font-label-badge text-label-badge text-outline uppercase tracking-wider condensed-text">Aktivni filtri:</span>
            {pills.length === 0 && <span className="inline-flex items-center gap-1 bg-[#eff6ff] text-[#234696] border border-[#00abeb]/30 px-space-sm py-1 rounded-lg font-label-badge text-label-badge condensed-text">Cijeli kanton ({all.length})</span>}
            {pills.map(([k, l]) => (
              <span key={k} className="inline-flex items-center gap-1 bg-[#eff6ff] text-[#234696] border border-[#00abeb]/30 px-space-sm py-1 rounded-lg font-label-badge text-label-badge condensed-text">{l}: {k === 'status' ? STATUS[sp[k]!]?.label : sp[k]}<Link className="hover:text-error ml-1 leading-none" title="Ukloni filter" href={without(k)}>✕</Link></span>
            ))}
            {pills.length > 0 && <Link className="text-[#00abeb] text-body-sm font-semibold hover:underline ml-2 condensed-text" href="/registri/okolisne-dozvole">Očisti sve</Link>}
          </div>
        }
      />
      <PermitsTable
        shown={rows.length}
        total={all.length}
        rows={
          <tbody className="divide-y divide-surface-container-low font-body-regular text-body-regular text-text-body">
            {rows.length === 0 && <tr><td colSpan={8} className="py-10 text-center text-outline">Nema dozvola za odabrane kriterije.</td></tr>}
            {rows.map((p) => {
              const st = STATUS[p.status] ?? STATUS.VAZECA;
              const r = remaining(p.validUntil);
              const doc = p.documents?.[0];
              return (
                <tr key={p.id} className="hover:bg-surface-container-low/60 transition-colors">
                  <td className="py-4 px-4 align-top"><div className="flex flex-col"><Link href={`/registri/okolisne-dozvole/${p.id}`} className="font-title-md text-body-regular font-bold text-primary hover:underline upi-number">{p.registerNumber}</Link><span className="text-body-sm text-outline flex items-center gap-1 mt-0.5"><span className="material-symbols-outlined text-[14px]">calendar_today</span> {dateShort(p.issuedAt)}</span></div></td>
                  <td className="py-4 px-4 align-top"><div className="flex flex-col max-w-xs"><span className="font-title-md text-body-regular font-bold text-text-heading">{p.operator}</span><span className="text-body-sm text-on-surface-variant">{p.facility}</span><DemoBadge show={p.isDemo} className="mt-1 w-max" /></div></td>
                  <td className="py-4 px-4 align-top"><div className="flex flex-col"><span className="font-bold text-on-surface">{p.municipality}</span><span className="text-body-sm text-outline">{p.address}</span></div></td>
                  <td className="py-4 px-4 align-top"><div className="flex flex-col"><span className="font-semibold text-primary">{p.activity}</span><span className="inline-block mt-1 text-[11px] bg-surface-container text-on-surface-variant px-1.5 py-0.5 rounded font-label-badge uppercase w-max">Kantonalna nadl.</span></div></td>
                  <td className="py-4 px-4 align-top"><div className="flex flex-col"><span className="font-bold text-text-heading">{dateShort(p.validUntil)}</span><span className={`text-body-sm font-semibold ${r.c}`}>{r.t}</span></div></td>
                  <td className="py-4 px-4 align-top"><div className="flex flex-wrap gap-1 max-w-[200px]">{(p.activity === 'Energetika' ? ['Protok', 'Buka (dB)'] : p.activity === 'Otpad' ? ['Plan otpada', 'Otpadne vode'] : p.activity === 'Turizam' ? ['Otpadne vode', 'Buka (dB)'] : ['Zrak', 'Otpadne vode', 'Buka (dB)']).map((t) => <span key={t} className="bg-surface-container px-1.5 py-0.5 rounded text-[11px] font-label-badge text-on-surface-variant">{t}</span>)}</div></td>
                  <td className="py-4 px-4 align-top text-center"><span className={`inline-flex items-center gap-1 font-label-badge text-label-badge px-2.5 py-1 rounded-full uppercase ${st.cls}`}><span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />{st.label}</span></td>
                  <td className="py-4 px-4 align-top text-right"><div className="flex items-center justify-end gap-1">
                    <Link className="p-1.5 text-primary hover:bg-surface-container rounded-lg" title="Rješenje i dokumentacija" href={`/registri/okolisne-dozvole/${p.id}#dokumenti`}><span className="material-symbols-outlined text-[18px]">picture_as_pdf</span></Link>
                    <Link className="p-1.5 text-secondary hover:bg-surface-container rounded-lg" title="Lokacija na mapi" href="/mapa"><span className="material-symbols-outlined text-[18px]">location_on</span></Link>
                    <Link className="p-1.5 text-primary-container hover:bg-surface-container-high rounded-lg" title="Otvori detaljan uvid" href={`/registri/okolisne-dozvole/${p.id}`}><span className="material-symbols-outlined text-[18px]">visibility</span></Link>
                  </div></td>
                </tr>
              );
            })}
          </tbody>
        }
      />
      <PermitsRights />
      <PermitsOpenData />
    </>
  );
}
