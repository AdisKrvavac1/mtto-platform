import { apiSafe, type Facility } from '@/lib/api';
import { DemoBadge } from '@/components/site/ui';
import { dateShort, dateLong } from '@/lib/format';
import { FacHero, FacStats, FacFilter, FacTable, FacGuide } from '@/components/stitch/Facilities';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Registar kategoriziranih ugostiteljskih objekata' };

const KINDS = ['Hotel', 'Motel', 'Pansion', 'Apartmani', 'Kamp'];
const MUNICIPALITIES = ['Čapljina', 'Čitluk', 'Jablanica', 'Konjic', 'Mostar', 'Neum', 'Prozor-Rama', 'Ravno', 'Stolac'];
const sel = 'w-full py-2.5 px-3 rounded bg-surface-container-low text-on-surface font-body-sm text-body-sm focus:outline-none focus:ring-2 focus:ring-primary appearance-none cursor-pointer pr-8';
const fmt = (n: number) => n.toLocaleString('bs-BA');

export default async function FacilitiesPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const qs = new URLSearchParams();
  for (const k of ['q', 'kind', 'municipality', 'stars']) if (sp[k]) qs.set(k, sp[k]!);
  const [rows, all] = await Promise.all([apiSafe<Facility[]>(`/facilities?${qs}`, []), apiSafe<Facility[]>('/facilities', [])]);
  const beds = all.reduce((s, f) => s + (f.beds || 0), 0);

  return (
    <>
      <FacHero />
      <FacStats n={{ total: fmt(all.length), beds: fmt(beds), hotels: all.filter((f) => f.kind === 'Hotel' && (f.stars ?? 0) >= 4).length, motels: all.filter((f) => ['Motel', 'Pansion'].includes(f.kind)).length, private: all.filter((f) => ['Apartmani', 'Kamp'].includes(f.kind)).length }} />
      {all.some((f) => f.isDemo) && (
        <div className="max-w-7xl mx-auto px-gutter w-full mt-space-md">
          <div className="flex items-start gap-space-sm p-space-md rounded-lg bg-herzeg-gold-soft border border-herzeg-gold text-[#786000] font-body-sm text-body-sm">
            <span className="material-symbols-outlined">science</span>
            <span>Prikazani su <strong>demo</strong> objekti. Stvarni popis kategoriziranih objekata uvozi se iz evidencije Sektora za turizam pri migraciji.</span>
          </div>
        </div>
      )}
      <FacFilter
        shown={rows.length}
        total={all.length}
        updated={dateLong(new Date())}
        form={
          <form action="/registri/ugostiteljski-objekti" className="flex flex-col md:flex-row items-center justify-between gap-space-md">
            <div className="w-full md:w-1/3 relative">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-outline text-[20px]">search</span>
              <input name="q" defaultValue={sp.q} className="w-full pl-11 pr-space-md py-2.5 rounded bg-surface-container-low text-on-surface font-body-regular text-body-regular placeholder:text-outline focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary transition-all" placeholder="Pretraži po nazivu objekta..." type="text" />
            </div>
            <div className="flex flex-wrap items-center gap-space-sm w-full md:w-2/3 justify-end">
              <div className="relative min-w-[170px]"><select name="municipality" defaultValue={sp.municipality ?? ''} className={sel}><option value="">Sve općine/gradovi (9)</option>{MUNICIPALITIES.map((m) => <option key={m}>{m}</option>)}</select><span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-outline pointer-events-none text-[18px]">expand_more</span></div>
              <div className="relative min-w-[150px]"><select name="stars" defaultValue={sp.stars ?? ''} className={sel}><option value="">Sve zvjezdice</option>{[5, 4, 3, 2].map((n) => <option key={n} value={n}>{n} zvjezdic{n === 5 ? 'a' : 'e'} {'★'.repeat(n)}</option>)}</select><span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-outline pointer-events-none text-[18px]">expand_more</span></div>
              <div className="relative min-w-[160px]"><select name="kind" defaultValue={sp.kind ?? ''} className={sel}><option value="">Sve vrste objekata</option>{KINDS.map((m) => <option key={m}>{m}</option>)}</select><span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-outline pointer-events-none text-[18px]">expand_more</span></div>
              <button type="submit" className="px-space-md py-2.5 rounded bg-primary text-on-primary font-button text-button hover:bg-institutional-navy-deep transition-colors flex items-center gap-1"><span className="material-symbols-outlined text-[18px]">filter_alt</span>Primijeni</button>
              <a className="p-2.5 rounded bg-surface-container text-on-surface hover:bg-surface-container-high transition-colors" href="/registri/ugostiteljski-objekti" title="Poništi filtere"><span className="material-symbols-outlined text-[18px]">restart_alt</span></a>
            </div>
          </form>
        }
      />
      <FacTable
        rows={
          <tbody className="text-on-surface">
            {rows.length === 0 && <tr><td colSpan={7} className="py-10 text-center text-outline">Nema objekata za odabrane kriterije.</td></tr>}
            {rows.map((f, i) => (
              <tr key={f.id} className={`hover:bg-surface-container-high/40 transition-colors ${i % 2 ? 'bg-surface-container-low/30' : ''}`}>
                <td className="py-space-md px-space-md"><div className="flex flex-col"><span className="font-title-md text-title-md text-primary font-bold">{f.name}</span><div className="flex items-center gap-space-xs font-body-sm text-body-sm text-outline"><span className="font-label-badge text-label-badge bg-surface-container px-1.5 py-0.5 rounded text-primary">Reg: HNK-UG-{String(i + 1).padStart(3, '0')}</span><DemoBadge show={f.isDemo} /></div></div></td>
                <td className="py-space-md px-space-md"><div className="flex flex-col font-body-sm text-body-sm"><span className="font-bold text-on-surface">{f.municipality}</span><span className="text-outline">{f.address}</span></div></td>
                <td className="py-space-md px-space-md"><div className="flex flex-col gap-0.5"><div className="flex text-[14px]">{[1, 2, 3, 4, 5].map((n) => <span key={n} className={`material-symbols-outlined text-[16px] ${n <= (f.stars ?? 0) ? 'text-on-tertiary-container' : 'text-outline-variant'}`} style={n <= (f.stars ?? 0) ? { fontVariationSettings: "'FILL' 1" } : undefined}>star</span>)}</div><span className="font-label-badge text-label-badge uppercase text-primary-container font-semibold">{f.kind}{f.stars ? ` (${f.stars} zvjezdic${f.stars === 5 ? 'a' : 'e'})` : ''}</span></div></td>
                <td className="py-space-md px-space-md"><div className="flex flex-col font-body-sm text-body-sm"><span className="font-semibold text-primary">{f.rooms ?? '—'} jedinica</span><span className="text-outline">{f.beds ?? '—'} ležaja</span></div></td>
                <td className="py-space-md px-space-md font-body-sm text-body-sm"><div className="flex flex-col"><span className="font-semibold text-on-surface">{f.decisionNumber || '—'}</span><span className="text-outline">Izdano: {dateShort(f.decisionDate)}</span></div></td>
                <td className="py-space-md px-space-md"><span className="px-2 py-0.5 rounded font-label-badge text-label-badge bg-secondary-container text-on-secondary-container font-bold">AKTIVNO</span></td>
                <td className="py-space-md px-space-md text-right"><div className="flex items-center justify-end gap-1">{f.lat != null && <a className="p-1.5 rounded hover:bg-surface-container text-primary transition-colors" title="Prikaži na mapi" href="/mapa"><span className="material-symbols-outlined text-[18px]">location_on</span></a>}</div></td>
              </tr>
            ))}
          </tbody>
        }
      />
      <FacGuide />
    </>
  );
}
