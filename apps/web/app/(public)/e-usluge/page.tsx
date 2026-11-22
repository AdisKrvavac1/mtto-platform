import Link from 'next/link';
import { apiSafe, type Doc, type Facility, type Permit, type PostListItem } from '@/lib/api';
import { EUslugeBody } from '@/components/figma/EUsluge';
import { ConsultationItems } from '@/components/figma/OkolisParts';
import { fileExt, fileSize } from '@/lib/format';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'E-usluge i registri' };

type Stats = { documents: number; permits: number; facilities: number };
type List = { items: PostListItem[]; total?: number };

const KIND: Record<string, string> = { HOTEL: 'Hoteli', MOTEL: 'Moteli', PANSION: 'Pansioni', KAMP: 'Kampovi', APARTMAN: 'Apartmani', SOBA: 'Sobe', KUCA: 'Kuće za odmor' };

function countBy<T>(rows: T[], key: (r: T) => string) {
  const m = new Map<string, number>();
  rows.forEach((r) => { const k = key(r); if (k) m.set(k, (m.get(k) || 0) + 1); });
  return [...m.entries()].sort((a, b) => b[1] - a[1]);
}

export default async function EUslugePage() {
  const [stats, permits, facilities, docs, env] = await Promise.all([
    apiSafe<Stats>('/stats', { documents: 0, permits: 0, facilities: 0 }),
    apiSafe<Permit[]>('/permits', []),
    apiSafe<Facility[]>('/facilities', []),
    apiSafe<Doc[]>('/documents', []),
    apiSafe<List>(`/posts?category=${encodeURIComponent('Zaštita okoliša')}&limit=3`, { items: [] }),
  ]);
  const towns = countBy(permits, (p) => p.municipality).slice(0, 4);
  const kinds = countBy(facilities, (f) => f.kind).slice(0, 3);
  const forms = [...docs].sort((a, b) => (a.docType === 'OBRAZAC' ? -1 : 0) - (b.docType === 'OBRAZAC' ? -1 : 0)).slice(0, 5);
  const latestYear = docs.reduce((y, d) => Math.max(y, new Date(d.createdAt).getFullYear()), 0);

  return (
    <EUslugeBody
      n={{ permits: stats.permits, docs: stats.documents, facilities: stats.facilities, uvidi: env.total ?? env.items.length }}
      search={
        <form action="/registri/okolisne-dozvole" className="bg-white flex flex-col md:flex-row gap-[8px] p-[8px] rounded-[4px] w-full shadow-[0px_1px_2px_rgba(0,0,0,0.05)]">
          <label className="flex flex-1 items-center gap-[8px] px-[12px] h-[44px] bg-[#f8f9ff] rounded-[2px] focus-within:ring-2 focus-within:ring-[#00abeb]">
            <span aria-hidden className="material-symbols-outlined text-[20px] text-[#737780]">search</span>
            <input name="q" aria-label="Pretraga registara i dokumenata" placeholder="Pretraži dozvole po operateru, broju rješenja ili lokaciji…" className="flex-1 min-w-0 bg-transparent border-0 p-0 focus:ring-0 focus:outline-none font-pub text-[14px] text-[#191c1f] placeholder:text-[#737780]" />
          </label>
          <button className="bg-[#002042] hover:bg-[#062343] text-white px-[24px] h-[44px] rounded-[2px] font-pub font-semibold text-[14px] flex items-center justify-center gap-2"><span aria-hidden className="material-symbols-outlined text-[18px]">manage_search</span>Pretraži</button>
        </form>
      }
      towns={
        <div className="flex flex-wrap gap-[6px] w-full">
          {towns.length === 0 ? <span className="font-rob text-[13px] text-[#737780]">Nema upisanih dozvola.</span> : towns.map(([t, c]) => (
            <Link key={t} href={`/registri/okolisne-dozvole?municipality=${encodeURIComponent(t)}`} className="bg-[#eff4ff] hover:bg-[#dce9ff] px-[10px] py-[4px] rounded-[2px] font-rob font-medium text-[#002042] text-[12px] leading-[16px]">{t} ({c})</Link>
          ))}
        </div>
      }
      facilityTypes={
        <div className="flex flex-col gap-[6px] w-full">
          {kinds.map(([k, c]) => (
            <div key={k} className="flex justify-between gap-2 border-b border-[#eff4ff] pb-[6px] font-rob text-[13px] leading-[20px]">
              <span className="text-[#444651]">{KIND[k] || k}</span><span className="font-bold text-[#002042]">{c} {c === 1 ? 'objekt' : 'objekata'}</span>
            </div>
          ))}
        </div>
      }
      uvidi={<ConsultationItems items={env.items} />}
      formsYear={latestYear ? `AŽURNO ${latestYear}` : 'AŽURNO'}
      forms={forms.length === 0 ? <p className="font-rob text-[13px] text-[#737780] p-[12px]">Obrasci se objavljuju u rubrici Propisi.</p> : forms.map((d) => (
        <a key={d.id} href={`/api/documents/${d.id}/file`} target="_blank" rel="noopener" className="bg-[#eff4ff] hover:bg-[#dce9ff] flex items-start justify-between gap-[10px] p-[12px] rounded-[2px] w-full">
          <span className="flex gap-[10px] items-start min-w-0">
            <span className="bg-[#dce9ff] flex items-center justify-center rounded-[2px] shrink-0 size-[28px] font-pub font-bold text-[#002042] text-[9px]">{fileExt(d.fileName).slice(0, 4)}</span>
            <span className="flex flex-col min-w-0">
              <span className="font-pub font-semibold text-[#002042] text-[13px] leading-[20px]">{d.title}{d.isDemo && <span className="ml-1.5 align-middle inline-flex px-1 rounded bg-[#fffde6] border border-[#fadc12] text-[#786000] text-[9px] font-bold uppercase">Demo</span>}</span>
              <span className="font-pub text-[#737780] text-[11px] leading-[16.5px]">{d.sector} • {fileSize(d.size)}{d.number ? ` • ${d.number}` : ''}</span>
            </span>
          </span>
          <span aria-hidden className="material-symbols-outlined text-[20px] text-[#002042] shrink-0">download</span>
        </a>
      ))}
    />
  );
}
