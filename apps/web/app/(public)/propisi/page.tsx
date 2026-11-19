import Link from 'next/link';
import { apiSafe, type Doc } from '@/lib/api';
import { DemoBadge } from '@/components/site/ui';
import { DOC_TYPE, dateLong, dateShort, fileExt, fileSize } from '@/lib/format';
import { PropisiHero, PropisiForms, PropisiTable, PropisiHowTo, PropisiContact } from '@/components/stitch/Propisi';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Propisi, zakoni i obrasci' };

const TABS = [
  { key: 'ZAKON', icon: 'balance', label: '1. Zakoni i uredbe' },
  { key: 'PRAVILNIK', icon: 'rule', label: '2. Podzakonski akti i pravilnici' },
  { key: 'OBRAZAC', icon: 'assignment', label: '3. Službeni obrasci zahtjeva' },
  { key: 'IZVJESTAJ', icon: 'trending_up', label: '4. Strategije, planovi i izvještaji' },
  { key: 'ODLUKA', icon: 'gavel', label: '5. Odluke i rješenja' },
];
const SECTOR_BADGE: Record<string, string> = { 'Zaštita okoliša': 'badge-env', 'Turizam i ugostiteljstvo': 'badge-hospitality', Trgovina: 'badge-trade' };

export default async function PropisiPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const tab = sp.docType || 'ZAKON';
  const qs = new URLSearchParams({ docType: tab });
  if (sp.q) qs.set('q', sp.q);
  const [rows, all] = await Promise.all([apiSafe<Doc[]>(`/documents?${qs}`, []), apiSafe<Doc[]>('/documents', [])]);
  const forms = all.filter((d) => d.docType === 'OBRAZAC').slice(0, 3);
  const count = (t: string) => all.filter((d) => d.docType === t).length;
  const latest = all.reduce<string | null>((m, d) => (!m || d.createdAt > m ? d.createdAt : m), null);

  return (
    <>
      <PropisiHero updated={dateLong(latest || new Date())} n={{ zakoni: count('ZAKON'), pravilnici: count('PRAVILNIK') + count('ODLUKA'), obrasci: count('OBRAZAC') }} />
      <PropisiForms
        forms={
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-md">
            {forms.map((d, i) => (
              <div key={d.id} className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col justify-between hover:shadow-md transition-all border border-slate-border">
                <div>
                  <div className="flex items-center justify-between mb-space-sm">
                    <span className={`${SECTOR_BADGE[d.sector] ?? 'badge-trade'} px-2.5 py-1 font-label-badge rounded font-bold uppercase tracking-wider`}>OBRAZAC {String(i + 1).padStart(2, '0')} • {d.sector.split(' ')[0].toUpperCase()}</span>
                    <span className="condensed-text font-bold text-outline text-[13px]">{d.number}</span>
                  </div>
                  <h3 className="font-title-md text-title-md text-primary mb-space-xs leading-snug font-bold">{d.title}</h3>
                  <p className="font-body-sm text-body-sm text-text-body mb-space-md">{d.description || 'Standardizirani obrazac za podnošenje zahtjeva Ministarstvu.'} <DemoBadge show={d.isDemo} /></p>
                </div>
                <div className="pt-space-sm bg-surface-container-low p-space-sm rounded-lg flex items-center justify-between">
                  <span className="condensed-text font-bold text-primary text-[13px] uppercase">Dostupni formati:</span>
                  <a href={`/api/documents/${d.id}/file`} target="_blank" rel="noopener" className="px-3 py-1 download-accent-btn rounded font-button text-button inline-flex items-center gap-1 transition-colors condensed-text font-semibold">
                    <span className="material-symbols-outlined text-[16px]">picture_as_pdf</span> {fileExt(d.fileName)} {fileSize(d.size)}
                  </a>
                </div>
              </div>
            ))}
          </div>
        }
      />
      <PropisiTable
        tabs={
          <div className="flex items-center gap-2 overflow-x-auto pb-space-sm mb-space-md" id="tabContainer">
            {TABS.map((t) => (
              <Link key={t.key} href={`/propisi?docType=${t.key}#pravna-tablica`} scroll={false} className={`px-4 py-2.5 rounded font-button text-button shadow-sm whitespace-nowrap transition-all flex items-center gap-2 font-semibold ${tab === t.key ? 'bg-[#00abeb] text-white' : 'bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container'}`}>
                <span className="material-symbols-outlined text-[18px]">{t.icon}</span><span>{t.label}</span>
                <span className="font-label-badge text-label-badge opacity-80">({count(t.key)})</span>
              </Link>
            ))}
          </div>
        }
        search={
          <form action="/propisi#pravna-tablica">
            <input type="hidden" name="docType" value={tab} />
            <input name="q" defaultValue={sp.q} className="w-full sm:w-80 pl-10 pr-space-md py-2 bg-surface-container-lowest rounded text-on-surface font-body-sm text-body-sm shadow-sm border-0 focus:outline-none focus:ring-2 focus:ring-primary" id="propisSearch" placeholder="Pretraži po nazivu ili broju akta..." type="text" />
          </form>
        }
        rows={
          <tbody className="divide-y-0 text-text-body font-body-sm text-body-sm">
            {rows.length === 0 && <tr><td colSpan={5} className="py-8 px-space-md text-center text-outline">Nema dokumenata u ovoj cjelini.</td></tr>}
            {rows.map((d, i) => (
              <tr key={d.id} className={`law-row hover:bg-surface-container-low transition-colors border-b border-slate-border ${i % 2 ? 'bg-surface-bright' : ''}`}>
                <td className="py-4 px-space-md align-top">
                  <div className="font-bold text-primary text-body-regular">{d.title}</div>
                  <span className="text-outline font-label-badge uppercase condensed-text">{DOC_TYPE[d.docType]} · {d.status === 'VAZECI' ? 'Važeći' : 'Arhiviran'}</span> <DemoBadge show={d.isDemo} />
                </td>
                <td className="py-4 px-space-md align-top whitespace-nowrap"><span className="px-2.5 py-1 bg-surface-container rounded font-bold text-primary condensed-text text-[13px]">{d.number || '—'}</span></td>
                <td className="py-4 px-space-md align-top whitespace-nowrap text-outline condensed-text">{dateShort(d.issuedAt)}</td>
                <td className="py-4 px-space-md align-top max-w-md">{d.description || d.sector}</td>
                <td className="py-4 px-space-md align-top text-right whitespace-nowrap">
                  <a href={`/api/documents/${d.id}/file`} target="_blank" rel="noopener" className="px-3 py-1.5 btn-primary-ds rounded font-button text-button inline-flex items-center gap-1 transition-colors shadow-sm condensed-text font-semibold">
                    <span className="material-symbols-outlined text-[16px]">download</span> {fileExt(d.fileName)} ({fileSize(d.size)})
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        }
      />
      <PropisiHowTo />
      <PropisiContact />
    </>
  );
}
