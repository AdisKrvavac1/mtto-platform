import Link from 'next/link';
import { apiSafe, type PostListItem, type MapPoint } from '@/lib/api';
import MapSection from '@/components/site/MapSection';
import { HomeBody } from '@/components/figma/Home';
import { LeadNewsCard, NewsCard, CallCard } from '@/components/figma/cards';
import { dateTime } from '@/lib/format';

export const dynamic = 'force-dynamic';

type Stats = { posts: number; calls: number; documents: number; permits: number; permitsRenewal: number; facilities: number; locations: number };

export default async function HomePage() {
  const [news, calls, stats, points] = await Promise.all([
    apiSafe<{ items: PostListItem[] }>('/posts?limit=8', { items: [] }),
    apiSafe<{ items: PostListItem[] }>('/posts?type=JAVNI_POZIV&limit=3', { items: [] }),
    apiSafe<Stats>('/stats', { posts: 0, calls: 0, documents: 0, permits: 0, permitsRenewal: 0, facilities: 0, locations: 0 }),
    apiSafe<MapPoint[]>('/map', []),
  ]);
  const regular = news.items.filter((p) => p.type !== 'JAVNI_POZIV');
  const [lead, ...rest] = regular.length ? regular : news.items;
  const openCall = calls.items.find((c) => !c.deadline || new Date(c.deadline) > new Date());

  return (
    <HomeBody
      callsBadge={stats.calls ? `${stats.calls} OTVOREN${stats.calls === 1 ? '' : 'A'}` : 'ARHIVA'}
      lead={lead ? <LeadNewsCard p={lead} /> : <p className="font-rob text-[#43474f]">Još nema objavljenih vijesti.</p>}
      cards={rest.slice(0, 2).map((p) => <NewsCard key={p.id} p={p} className="lg:flex-[1_1_0%] min-w-0" />)}
      calls={calls.items.length ? calls.items.map((c) => <CallCard key={c.id} p={c} />) : <p className="font-rob text-[13px] text-[#43474f]">Trenutno nema otvorenih poziva.</p>}
      mapUpdated={dateTime(new Date())}
      map={<div className="w-full p-[16px]"><MapSection points={points} /></div>}
      cta={openCall ? (
        <div className="bg-gradient-to-r flex flex-col lg:flex-row from-[#002042] lg:items-center lg:justify-between gap-[24px] p-[24px] md:p-[40px] relative rounded-[8px] to-[#062343] w-full shadow-[0px_20px_25px_-5px_rgba(0,0,0,0.1),0px_8px_10px_-6px_rgba(0,0,0,0.1)]">
          <div className="flex flex-col gap-[12px] items-start max-w-[672px]">
            <span className="bg-[#85f8c4] px-[8px] py-[2px] rounded-[2px] font-rob font-bold text-[#002114] text-[11px] tracking-[0.44px] uppercase leading-[14px]">Otvoren javni poziv</span>
            <h3 className="font-rob font-bold text-[20px] md:text-[24px] text-white tracking-[-0.24px] leading-[1.4]">{openCall.title}</h3>
            {openCall.excerpt && <p className="font-rob text-[#dce9ff] text-[15px] leading-[24px]">{openCall.excerpt}</p>}
          </div>
          <div className="flex gap-[16px] items-center flex-wrap shrink-0">
            <Link href={`/vijesti/${openCall.slug}#prijava`} className="bg-[#006c4a] px-[24px] py-[12px] rounded-[8px] font-pub font-semibold text-[14px] text-white tracking-[0.14px] leading-[20px] hover:bg-[#005339]">Prijavi se online</Link>
            <Link href={`/vijesti/${openCall.slug}#dokumenti`} className="backdrop-blur-[4px] bg-[rgba(255,255,255,0.15)] px-[24px] py-[12px] rounded-[8px] font-pub font-semibold text-[14px] text-white tracking-[0.14px] leading-[20px] hover:bg-[rgba(255,255,255,0.25)]">Kriteriji i upute (PDF)</Link>
          </div>
        </div>
      ) : null}
    />
  );
}
