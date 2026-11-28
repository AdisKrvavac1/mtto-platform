'use client';
// F2-07: šta građani traže na portalu i šta ne nalaze (zbirno po danu, bez IP-a i korisnika).
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { adminFetch } from '@/lib/adminApi';
import { Badge, Card, CardHeader } from '@/components/admin/ui';

type Row = { query: string; count: number; hits?: number };
type Stats = { days: number; top: Row[]; zero: Row[]; total: { searches: number; distinct: number; zero: number }; index: { builtAt: string; docs: number } | null };

export function SearchStats() {
  const [s, setS] = useState<Stats | null>(null);
  useEffect(() => { adminFetch<Stats>('/admin/search/stats?days=30').then(setS).catch(() => {}); }, []);
  if (!s) return null;
  const List = ({ rows, empty, zero }: { rows: Row[]; empty: string; zero?: boolean }) => rows.length ? (
    <ol className="divide-y divide-[#f0f0f0]">
      {rows.slice(0, 10).map((r) => (
        <li key={r.query} className="flex items-center gap-3 px-4 py-2.5 text-[14px] md:px-6">
          <Link href={`/pretraga?q=${encodeURIComponent(r.query)}`} target="_blank" className="min-w-0 flex-1 truncate font-medium text-[#171717] hover:underline">{r.query}</Link>
          {!zero && r.hits === 0 && <Badge tone="warning">bez rezultata</Badge>}
          <span className="tabular-nums text-[#525252]">{r.count}×</span>
        </li>
      ))}
    </ol>
  ) : <p className="px-4 py-6 text-[14px] text-[#525252] md:px-6">{empty}</p>;
  return (
    <Card className="mt-6 overflow-hidden">
      <CardHeader title="Pretraga portala" description={`Zadnjih ${s.days} dana: ${s.total.searches} pretraga, ${s.total.zero} bez rezultata. Upiti bez rezultata pokazuju sadržaj koji građanima nedostaje.`}
        badge={s.index ? <Badge tone="gray">{s.index.docs} stavki u indeksu</Badge> : undefined} />
      <div className="grid divide-y divide-[#e5e5e5] lg:grid-cols-2 lg:divide-x lg:divide-y-0">
        <div><p className="px-4 pt-4 text-[14px] font-semibold text-[#404040] md:px-6">Najčešće traženo</p><List rows={s.top} empty="Još nema pretraga." /></div>
        <div><p className="px-4 pt-4 text-[14px] font-semibold text-[#404040] md:px-6">Traženo, a nije pronađeno</p><List rows={s.zero} empty="Sve pretrage su imale rezultate." zero /></div>
      </div>
    </Card>
  );
}
