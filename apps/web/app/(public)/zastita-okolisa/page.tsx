import Link from 'next/link';
import { apiSafe, type Permit, type PostListItem, type MapPoint } from '@/lib/api';
import MapSection from '@/components/site/MapSection';
import { OkolisBody } from '@/components/figma/Okolis';
import { PermitRows, ConsultationItems } from '@/components/figma/OkolisParts';
import { dateTime } from '@/lib/format';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Zaštita okoliša' };

type Stats = { posts: number; calls: number; documents: number; permits: number; permitsRenewal: number; facilities: number; locations: number };
type List = { items: PostListItem[] };

export default async function OkolisPage() {
  const [stats, permits, envPosts, calls, points] = await Promise.all([
    apiSafe<Stats>('/stats', { posts: 0, calls: 0, documents: 0, permits: 0, permitsRenewal: 0, facilities: 0, locations: 0 }),
    apiSafe<Permit[]>('/permits', []),
    apiSafe<List>(`/posts?category=${encodeURIComponent('Zaštita okoliša')}&limit=3`, { items: [] }),
    apiSafe<List>('/posts?type=JAVNI_POZIV&limit=3', { items: [] }),
    apiSafe<MapPoint[]>('/map', []),
  ]);
  const openCall = calls.items.find((c) => !c.deadline || new Date(c.deadline) > new Date());
  return (
    <OkolisBody
      n={{ permits: stats.permits, docs: stats.documents, locations: stats.locations + stats.permits + stats.facilities }}
      updated={dateTime(new Date())}
      callsBadge={stats.calls ? `${stats.calls} OTVOREN${stats.calls === 1 ? '' : 'A'}` : 'ARHIVA'}
      map={<div className="w-full p-[16px]"><MapSection points={points} compact title={false} /></div>}
      uvidi={<ConsultationItems items={envPosts.items} />}
      rows={<PermitRows rows={permits.slice(0, 6)} />}
      cta={openCall ? (
        <div className="bg-gradient-to-r from-[#002042] to-[#062343] rounded-[8px] p-[24px] md:p-[40px] flex flex-col lg:flex-row gap-[24px] lg:items-center lg:justify-between w-full">
          <div className="flex flex-col gap-[12px] max-w-[720px]">
            <span className="self-start bg-[#85f8c4] px-[8px] py-[2px] rounded-[2px] font-rob font-bold text-[#002114] text-[11px] tracking-[0.44px] uppercase leading-[14px]">Otvoren javni poziv</span>
            <h2 className="font-rob font-bold text-[22px] md:text-[28px] text-white leading-[1.3]">{openCall.title}</h2>
            {openCall.excerpt && <p className="font-rob text-[#dce9ff] text-[15px] leading-[24px]">{openCall.excerpt}</p>}
          </div>
          <div className="flex flex-col gap-[12px] shrink-0">
            <Link href={`/vijesti/${openCall.slug}#prijava`} className="bg-[#006c4a] hover:bg-[#005339] px-[24px] py-[12px] rounded-[4px] font-pub font-semibold text-[14px] text-white text-center">Prijavi se online</Link>
            <Link href={`/vijesti/${openCall.slug}#dokumenti`} className="bg-[rgba(255,255,255,0.12)] hover:bg-[rgba(255,255,255,0.2)] px-[24px] py-[12px] rounded-[4px] font-pub font-semibold text-[14px] text-white text-center">Kriteriji i upute (PDF)</Link>
          </div>
        </div>
      ) : null}
    />
  );
}
