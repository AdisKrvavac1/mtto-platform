import Link from 'next/link';
import { apiSafe, type Facility } from '@/lib/api';
import { PageHero, EmptyState, DemoBadge } from '@/components/site/ui';
import { dateShort } from '@/lib/format';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Registar kategoriziranih ugostiteljskih objekata' };

const KINDS = ['Hotel', 'Motel', 'Pansion', 'Apartmani', 'Kamp'];
const MUNICIPALITIES = ['Blagaj', 'Čapljina', 'Čitluk', 'Jablanica', 'Konjic', 'Mostar', 'Neum', 'Prozor-Rama', 'Ravno', 'Stolac'];

export default async function FacilitiesPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const qs = new URLSearchParams();
  for (const k of ['q', 'kind', 'municipality', 'stars']) if (sp[k]) qs.set(k, sp[k]!);
  const [rows, all] = await Promise.all([apiSafe<Facility[]>(`/facilities?${qs}`, []), apiSafe<Facility[]>('/facilities', [])]);
  const rooms = all.reduce((s, f) => s + (f.rooms || 0), 0);
  const beds = all.reduce((s, f) => s + (f.beds || 0), 0);
  const field = 'w-full h-10 rounded border border-[#cbd5e1] bg-white font-body-sm text-body-sm focus:border-mtto-primary focus:ring-[3px] focus:ring-[rgba(0,171,235,0.25)]';

  return (
    <>
      <PageHero kicker="Javni informacijski servis · Sektor za turizam" title="Registar kategoriziranih ugostiteljskih objekata" lead="Evidencija rješenja o kategorizaciji objekata za smještaj na području kantona." crumbs={[{ href: '/', label: 'Naslovna' }, { label: 'Službeni registri' }, { label: 'Ugostiteljski objekti' }]}>
        <div className="mt-space-lg grid grid-cols-3 gap-space-md max-w-2xl">
          {[[all.length, 'Kategoriziranih objekata'], [rooms, 'Smještajnih jedinica'], [beds, 'Ukupno ležajeva']].map(([n, l]) => (
            <div key={l as string} className="p-space-sm rounded-lg bg-surface-container-lowest/10">
              <p className="font-display text-headline-lg font-bold">{(n as number).toLocaleString('bs-BA')}</p>
              <p className="font-body-sm text-body-sm text-surface-variant">{l}</p>
            </div>
          ))}
        </div>
      </PageHero>
      <section className="max-w-7xl mx-auto px-margin-mobile md:px-margin py-space-xl space-y-space-lg">
        {all.some((f) => f.isDemo) && (
          <div className="flex items-start gap-space-sm p-space-md rounded-lg bg-herzeg-gold-soft border border-herzeg-gold text-[#786000] font-body-sm text-body-sm">
            <span className="material-symbols-outlined">science</span>
            <span>Prikazani su <strong>demo</strong> objekti. Stvarni popis kategoriziranih objekata uvozi se iz evidencije Sektora za turizam prilikom migracije.</span>
          </div>
        )}
        <form action="/registri/ugostiteljski-objekti" className="bg-surface-container-lowest rounded-xl shadow-md p-space-md md:p-space-lg grid grid-cols-1 md:grid-cols-5 gap-space-md items-end">
          <div className="md:col-span-2"><label htmlFor="q" className="block font-label-badge text-label-badge uppercase text-on-surface-variant mb-1">Naziv objekta</label><input id="q" name="q" defaultValue={sp.q} className={field} placeholder="Pretraži objekte..." /></div>
          <div><label htmlFor="kind" className="block font-label-badge text-label-badge uppercase text-on-surface-variant mb-1">Vrsta</label><select id="kind" name="kind" defaultValue={sp.kind ?? ''} className={field}><option value="">Sve vrste</option>{KINDS.map((k) => <option key={k}>{k}</option>)}</select></div>
          <div><label htmlFor="municipality" className="block font-label-badge text-label-badge uppercase text-on-surface-variant mb-1">Mjesto</label><select id="municipality" name="municipality" defaultValue={sp.municipality ?? ''} className={field}><option value="">Sva mjesta</option>{MUNICIPALITIES.map((k) => <option key={k}>{k}</option>)}</select></div>
          <div className="flex gap-space-xs"><button className="flex-1 h-10 rounded bg-mtto-primary text-white font-button text-button inline-flex items-center justify-center gap-1"><span className="material-symbols-outlined text-[18px]">search</span>Traži</button><Link href="/registri/ugostiteljski-objekti" className="h-10 px-3 rounded border border-mtto-primary text-mtto-primary inline-flex items-center" title="Poništi"><span className="material-symbols-outlined text-[18px]">restart_alt</span></Link></div>
        </form>
        <div className="flex items-center gap-space-xs overflow-x-auto">
          <span className="font-label-kicker text-label-kicker uppercase text-on-surface-variant mr-1">Kategorija:</span>
          {[undefined, '5', '4', '3', '2'].map((s) => {
            const p = new URLSearchParams(qs); if (s) p.set('stars', s); else p.delete('stars');
            return <Link key={s ?? 'all'} href={`/registri/ugostiteljski-objekti?${p}`} className={`px-3 py-1.5 rounded-lg font-button text-button whitespace-nowrap ${sp.stars === s || (!s && !sp.stars) ? 'bg-primary-container text-on-primary' : 'bg-surface-container-lowest text-on-surface-variant border border-slate-border'}`}>{s ? `${'★'.repeat(+s)}` : 'Sve kategorije'}</Link>;
          })}
        </div>
        {rows.length === 0 ? <EmptyState title="Nema objekata za odabrane kriterije" /> : (
          <div className="bg-surface-container-lowest rounded-xl shadow-md overflow-x-auto">
            <table className="w-full min-w-[820px] text-left">
              <thead><tr className="border-b-2 border-mtto-primary">{['Objekt', 'Vrsta', 'Kategorija', 'Mjesto', 'Jedinica / ležajeva', 'Rješenje'].map((h) => <th key={h} className="px-space-md py-3 font-label-badge text-label-badge uppercase tracking-wider text-[#80807e]">{h}</th>)}</tr></thead>
              <tbody>
                {rows.map((f, i) => (
                  <tr key={f.id} className={`${i % 2 ? 'bg-slate-surface' : ''} hover:bg-[rgba(0,171,235,0.05)]`}>
                    <td className="px-space-md py-3"><span className="font-title-md text-[15px] font-bold text-primary">{f.name}</span><span className="block font-body-sm text-body-sm text-on-surface-variant">{f.address}</span><DemoBadge show={f.isDemo} className="mt-1" /></td>
                    <td className="px-space-md py-3 font-body-sm text-body-sm">{f.kind}</td>
                    <td className="px-space-md py-3 text-herzeg-gold text-[18px] tracking-wider" aria-label={`${f.stars ?? 0} zvjezdica`}><span className="text-[#c9a400]">{'★'.repeat(f.stars || 0)}</span><span className="text-slate-border">{'★'.repeat(5 - (f.stars || 0))}</span></td>
                    <td className="px-space-md py-3 font-body-sm text-body-sm">{f.municipality}</td>
                    <td className="px-space-md py-3 font-mono text-[13px]">{f.rooms ?? '—'} / {f.beds ?? '—'}</td>
                    <td className="px-space-md py-3"><span className="font-mono text-[13px] font-bold">{f.decisionNumber ?? '—'}</span><span className="block font-body-sm text-body-sm text-on-surface-variant">{dateShort(f.decisionDate)}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="bg-surface-container-lowest rounded-xl shadow-md p-space-lg grid grid-cols-1 md:grid-cols-3 gap-space-md">
          {[['Zahtjev', 'Investitor podnosi zahtjev za kategorizaciju s propisanom dokumentacijom.'], ['Komisija', 'Stručna komisija vrši uvid u objekt i minimalno-tehničke uvjete.'], ['Rješenje', 'Ministarstvo izdaje rješenje o kategoriji koje se upisuje u registar.']].map(([t, d], i) => (
            <div key={t} className="flex gap-space-sm"><span className="w-8 h-8 shrink-0 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold">{i + 1}</span><div><p className="font-title-md text-title-md font-bold text-primary">{t}</p><p className="font-body-sm text-body-sm text-text-body">{d}</p></div></div>
          ))}
        </div>
      </section>
    </>
  );
}
