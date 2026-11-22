import Link from 'next/link';
import { apiSafe, type PostListItem } from '@/lib/api';
import { TurizamBody } from '@/components/figma/Turizam';
import { dateTime } from '@/lib/format';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Turizam i baština' };

type Stats = { calls: number; facilities: number };
type List = { items: PostListItem[] };

function FeaturedCall({ p }: { p: PostListItem }) {
  const open = !p.deadline || new Date(p.deadline) > new Date();
  return (
    <article className="bg-white border-t-4 border-[#006c4a] rounded-[8px] p-[20px] md:p-[24px] flex flex-col gap-[12px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] w-full">
      <div className="flex flex-wrap gap-2 items-center justify-between">
        <span className={`px-[8px] py-[2px] rounded-[2px] font-rmono font-semibold text-[12px] tracking-[0.3px] ${open ? 'bg-[#a3f4be] text-[#00522e]' : 'bg-[#eaedff] text-[#444651]'}`}>{open ? 'OTVORENI JAVNI POZIV' : 'ZATVOREN POZIV'}</span>
        {p.deadline && <span className="flex items-center gap-1 font-rmono font-semibold text-[#ba1a1a] text-[12px]"><span aria-hidden className="material-symbols-outlined text-[16px]">alarm</span>Rok za prijavu: {dateTime(p.deadline)} h</span>}
      </div>
      <h3 className="font-rob font-bold text-[#131b2e] text-[20px] md:text-[24px] leading-[1.3]"><Link href={`/vijesti/${p.slug}`} className="hover:text-[#006c4a]">{p.title}</Link></h3>
      {p.excerpt && <p className="font-rob text-[#444651] text-[15px] leading-[24px]">{p.excerpt}</p>}
      <div className="flex flex-wrap gap-[12px] pt-[4px]">
        <Link href={`/vijesti/${p.slug}#dokumenti`} className="bg-[#006c4a] hover:bg-[#005339] text-white px-[16px] py-[10px] rounded-[2px] font-rmono font-semibold text-[12px] flex items-center gap-2"><span aria-hidden className="material-symbols-outlined text-[16px]">description</span>Tekst poziva i obrasci</Link>
        {open && <Link href={`/vijesti/${p.slug}#prijava`} className="bg-[#eaedff] hover:bg-[#dce1ff] text-[#002e7c] px-[16px] py-[10px] rounded-[2px] font-rmono font-semibold text-[12px] flex items-center gap-2"><span aria-hidden className="material-symbols-outlined text-[16px]">edit_document</span>Prijava</Link>}
      </div>
    </article>
  );
}

export default async function TurizamPage() {
  const [stats, calls] = await Promise.all([
    apiSafe<Stats>('/stats', { calls: 0, facilities: 0 }),
    apiSafe<List>(`/posts?type=JAVNI_POZIV&category=Turizam&limit=1`, { items: [] }),
  ]);
  const call = calls.items[0];
  return (
    <TurizamBody
      n={{ facilities: stats.facilities }}
      updated={dateTime(new Date())}
      callsBadge={stats.calls ? `${stats.calls} OTVOREN${stats.calls === 1 ? '' : 'A'}` : 'ARHIVA'}
      guides={<div className="p-[24px] flex items-center gap-3 font-rob text-[14px] text-[#444651]"><span aria-hidden className="material-symbols-outlined text-[#002e7c]">schedule</span>Javni registar licenciranih turističkih vodiča povezuje se s evidencijom Sektora za turizam u Fazi 2.</div>}
      call={call ? <FeaturedCall p={call} /> : <p className="font-rob text-[14px] text-[#444651]">Trenutno nema objavljenih poziva iz oblasti turizma.</p>}
      cta={null}
    />
  );
}
