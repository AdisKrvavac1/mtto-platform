import Link from 'next/link';
import { apiSafe, type PostListItem, type MapPoint } from '@/lib/api';
import { PostCard, PostCardLarge, CallItem, EmptyState } from '@/components/site/ui';
import MapSection from '@/components/site/MapSection';
import { HomeHero, HomeServices, HomeNews, HomeEko, HomeNature } from '@/components/stitch/Home';
import { dateTime } from '@/lib/format';

export const dynamic = 'force-dynamic';

type Stats = { posts: number; calls: number; documents: number; permits: number; permitsRenewal: number; facilities: number; locations: number };

export default async function HomePage() {
  const [news, calls, stats, points] = await Promise.all([
    apiSafe<{ items: PostListItem[] }>('/posts?limit=6', { items: [] }),
    apiSafe<{ items: PostListItem[] }>('/posts?type=JAVNI_POZIV&limit=3', { items: [] }),
    apiSafe<Stats>('/stats', { posts: 0, calls: 0, documents: 0, permits: 0, permitsRenewal: 0, facilities: 0, locations: 0 }),
    apiSafe<MapPoint[]>('/map', []),
  ]);
  const ordered = news.items.filter((p) => p.type !== 'JAVNI_POZIV').concat(news.items.filter((p) => p.type === 'JAVNI_POZIV'));
  const [lead, ...rest] = ordered;
  const openCall = calls.items.find((c) => !c.deadline || new Date(c.deadline) > new Date());

  return (
    <div className="flex flex-col w-full">
      <HomeHero updated={dateTime(new Date())} />
      <HomeServices callsBadge={stats.calls ? `${stats.calls} OTVOREN${stats.calls === 1 ? '' : 'A'}` : 'ARHIVA'} />
      <HomeNews
        lead={lead ? <PostCardLarge p={lead} /> : <EmptyState title="Još nema objava" />}
        cards={rest.length ? <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">{rest.slice(0, 4).map((p) => <PostCard key={p.id} p={p} />)}</div> : null}
        calls={calls.items.length ? calls.items.map((c) => <CallItem key={c.id} p={c} />) : <p className="font-body-sm text-body-sm text-outline">Trenutno nema otvorenih poziva.</p>}
      />
      <HomeEko />
      <HomeNature
        map={<div id="gis-eko-karta"><MapSection points={points} /></div>}
        cta={openCall ? (
          <div className="bg-gradient-to-r from-primary to-institutional-navy-deep text-on-primary rounded-xl p-space-xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-space-lg">
            <div className="space-y-space-xs max-w-2xl">
              <span className="px-2.5 py-0.5 rounded bg-secondary-fixed text-on-secondary-fixed font-label-badge text-label-badge uppercase font-bold">Otvoren javni poziv</span>
              <h3 className="font-headline-md text-headline-md font-bold text-on-primary">{openCall.title}</h3>
              <p className="font-body-regular text-body-regular text-surface-container-high">{openCall.excerpt}</p>
            </div>
            <div className="shrink-0 flex flex-col sm:flex-row items-center gap-space-md">
              <Link className="px-space-lg py-3 rounded-lg bg-secondary text-on-secondary font-button text-button shadow-md hover:bg-secondary/90 transition-all text-center" href={`/vijesti/${openCall.slug}`}>Prijavi se online</Link>
              <Link className="px-space-lg py-3 rounded-lg bg-surface-container-lowest/15 backdrop-blur-sm text-on-primary font-button text-button hover:bg-surface-container-lowest/25 transition-all text-center" href={`/vijesti/${openCall.slug}#dokumenti`}>Kriteriji i upute (PDF)</Link>
            </div>
          </div>
        ) : null}
      />
    </div>
  );
}
