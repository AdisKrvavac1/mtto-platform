import Link from 'next/link';
import { apiSafe, type Doc } from '@/lib/api';
import { DOC_TYPE, dateLong, dateShort, fileExt, fileSize } from '@/lib/format';
import { PropisiBody } from '@/components/figma/Propisi';

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

  const fmtBtn = (d: Doc, primary: boolean) => (
    <a key={d.id} href={`/api/documents/${d.id}/file`} target="_blank" rel="noopener" className={`flex flex-1 gap-[8px] items-center justify-center px-[12px] py-[4px] rounded-[8px] font-pub font-semibold text-[12px] tracking-[0.14px] leading-[20px] ${primary ? 'bg-[#002042] text-white hover:bg-[#062343]' : 'bg-white text-[#002042] hover:bg-[#dce9ff]'}`}>
      <span aria-hidden className="material-symbols-outlined text-[16px]">{fileExt(d.fileName) === 'PDF' ? 'picture_as_pdf' : 'description'}</span>{fileExt(d.fileName)} {fileSize(d.size)}
    </a>
  );
  return (
    <PropisiBody
      updated={dateLong(latest || new Date())}
      n={{ zakoni: count('ZAKON'), pravilnici: count('PRAVILNIK') + count('ODLUKA'), obrasci: count('OBRAZAC') }}
      forms={forms.slice(0, 5).map((d, i) => (
        <div key={d.id} className="bg-white drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)] flex flex-col justify-between p-[24px] rounded-[8px] gap-[16px]">
          <div className="flex flex-col gap-[4px]">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="bg-[#ecfdf5] px-[10px] py-[4px] rounded-[2px] font-pub font-bold text-[#006c4a] text-[11px] tracking-[0.44px] leading-[14px] uppercase">Obrazac {String(i + 1).padStart(2, '0')} • {d.sector.split(' ')[0]}</span>
              <span className="font-pub text-[#737780] text-[13px] leading-[20px]">{d.number || ''}</span>
            </div>
            <h3 className="font-pub font-semibold text-[#002042] text-[18px] leading-[24.75px] pt-[3px]">{d.title}{d.isDemo && <span className="ml-2 align-middle inline-flex px-1.5 rounded bg-[#fffde6] border border-[#fadc12] text-[#786000] text-[10px] font-bold uppercase">Demo</span>}</h3>
            <p className="font-pub text-[#334155] text-[13px] leading-[20px]">{d.description || 'Standardizirani obrazac za podnošenje zahtjeva Ministarstvu.'}</p>
          </div>
          <div className="bg-[#eff4ff] flex items-center justify-between gap-2 p-[8px] rounded-[4px] flex-wrap">
            <span className="font-pub font-bold text-[#002042] text-[11px] tracking-[0.44px] leading-[14px]">Dostupni formati:</span>
            <div className="flex flex-1 gap-[4px] items-center min-w-[140px]">{fmtBtn(d, true)}</div>
          </div>
        </div>
      ))}
      tabs={
        <div className="flex gap-[8px] items-center overflow-x-auto py-[8px] w-full [scrollbar-width:none]">
          {TABS.map((t) => (
            <Link key={t.key} href={`/propisi?docType=${t.key}#pravna-tablica`} scroll={false} className={`drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)] flex gap-[8px] items-center px-[16px] py-[10px] rounded-[2px] shrink-0 font-pub font-semibold text-[14px] tracking-[0.14px] leading-[20px] whitespace-nowrap ${tab === t.key ? 'bg-[#002042] text-white' : 'bg-white text-[#43474f] hover:text-[#002042]'}`}>
              <span aria-hidden className="material-symbols-outlined text-[18px]">{t.icon}</span>{t.label} <span className="opacity-70 text-[12px]">({count(t.key)})</span>
            </Link>
          ))}
        </div>
      }
      search={
        <form action="/propisi#pravna-tablica" className="bg-white border border-[rgba(195,198,208,0.4)] flex items-center gap-2 h-[38px] px-[12px] rounded-[8px] w-full md:w-[320px] focus-within:border-[#00abeb]">
          <input type="hidden" name="docType" value={tab} />
          <span aria-hidden className="material-symbols-outlined text-[18px] text-[#9ca3af]">search</span>
          <input name="q" defaultValue={sp.q} aria-label="Pretraga propisa" placeholder="Pretraži po nazivu, broju glasnika..." className="flex-1 min-w-0 bg-transparent border-0 p-0 focus:ring-0 focus:outline-none font-pub text-[13px] text-[#191c1f] placeholder:text-[#9ca3af]" />
        </form>
      }
      rows={rows.length === 0 ? <p className="p-[16px] font-pub text-[13px] text-[#737780]">Nema dokumenata u ovoj cjelini.</p> : rows.map((d) => (
        <div key={d.id} className="grid grid-cols-1 lg:grid-cols-[minmax(0,359fr)_minmax(0,194fr)_minmax(0,186fr)_minmax(0,323fr)_167px] border-b border-[#e5eeff] last:border-0 hover:bg-[#f8f9ff]">
          <div className="flex flex-col gap-[3px] px-[16px] pt-[16px] lg:pb-[16px]">
            <span className="font-pub font-bold text-[#002042] text-[15px] leading-[24px]">{d.title}</span>
            <span className="font-pub font-bold text-[#737780] text-[11px] tracking-[0.44px] uppercase leading-[14px]">{DOC_TYPE[d.docType]} · {d.status === 'VAZECI' ? 'važeći' : 'arhiviran'}{d.isDemo ? ' · demo' : ''}</span>
          </div>
          <div className="px-[16px] pt-[8px] lg:pt-[14px]"><span className="inline-flex bg-[#e5eeff] px-[10px] py-[1.5px] rounded-[2px] font-pub font-bold text-[#002042] text-[13px] leading-[20px]">{d.number || '—'}</span></div>
          <div className="px-[16px] pt-[8px] lg:pt-[15.5px] font-pub text-[#737780] text-[13px] leading-[20px]">{dateShort(d.issuedAt)}</div>
          <div className="px-[16px] py-[8px] lg:py-[16px] font-pub text-[#334155] text-[13px] leading-[20px]">{d.description || d.sector}</div>
          <div className="px-[16px] pb-[16px] lg:pt-[16px] lg:text-right">
            <a href={`/api/documents/${d.id}/file`} target="_blank" rel="noopener" className="inline-flex bg-[#002042] hover:bg-[#062343] gap-[4px] items-center px-[12px] py-[6px] rounded-[8px] font-pub font-semibold text-[14px] text-white tracking-[0.14px] leading-[20px]"><span aria-hidden className="material-symbols-outlined text-[15px]">download</span>{fileExt(d.fileName)} ({fileSize(d.size)})</a>
          </div>
        </div>
      ))}
      countText={`Prikazano je ${rows.length} dokumenata u odabranoj cjelini.`}
    />
  );
}
