'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { adminFetch, useCan } from '@/lib/adminApi';
import { AUDIENCE } from '@/lib/lifeEvents';
import { dateShort } from '@/lib/format';
import { Badge, Card, EmptyState, PageTitle, btnPrimary, td, th, tr, useToast } from '@/components/admin/ui';
import { Compass03, Plus } from '@untitledui/icons';

type Row = { id: string; slug: string; audience: 'GRADJANI' | 'PRIVREDA'; title: string; icon: string; sector: string | null; published: boolean; verified: boolean; position: number; updatedAt: string; stepCount: number };

export default function LifeEventsAdmin() {
  const toast = useToast();
  const router = useRouter();
  const canWrite = useCan('objave', 'write');
  const [rows, setRows] = useState<Row[] | null>(null);
  useEffect(() => { adminFetch<Row[]>('/admin/life-events').then(setRows).catch((e) => toast.err(e.message)); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  async function create() {
    try { const e = await adminFetch<{ id: string }>('/admin/life-events', { method: 'POST', body: JSON.stringify({ title: 'Nova životna situacija', audience: 'GRADJANI', icon: 'help' }) }); router.push(`/admin/zivotne-situacije/${e.id}`); }
    catch (e: any) { toast.err(e.message); }
  }
  return (
    <>
      <PageTitle kicker="Vodiči „korak po korak“ za građane i privredu: povezuju obrasce, propise, registre i kontakte. Neprovjereni sadržaj na portalu nosi oznaku „u pripremi“." crumbs={['Životne situacije']} title="Životne situacije">
        {canWrite && <button type="button" className={btnPrimary} onClick={create}><Plus />Nova situacija</button>}
      </PageTitle>
      <Card className="overflow-hidden">
        {!rows ? <div className="m-6 h-40 animate-pulse rounded-[12px] bg-[#f5f5f5]" /> : rows.length === 0 ? <EmptyState icon={Compass03} title="Još nema situacija" /> : (
          <div className="overflow-x-auto"><table className="w-full min-w-[760px]">
            <thead><tr><th className={th}>Situacija</th><th className={th}>Za</th><th className={th}>Koraka</th><th className={th}>Stanje</th><th className={th}>Izmijenjeno</th></tr></thead>
            <tbody>{rows.map((r) => (
              <tr key={r.id} className={tr}>
                <td className={td}><Link href={`/admin/zivotne-situacije/${r.id}`} className="flex items-center gap-3 font-medium text-[#171717] hover:underline"><span aria-hidden className="material-symbols-outlined text-[22px] text-[#7f56d9]">{r.icon}</span>{r.title}</Link></td>
                <td className={td}>{AUDIENCE[r.audience]}</td>
                <td className={`${td} tabular-nums`}>{r.stepCount}</td>
                <td className={td}><span className="flex flex-wrap gap-1.5">{r.published ? <Badge tone="success" dot>Na portalu</Badge> : <Badge tone="gray" dot>Skriveno</Badge>}{r.verified ? <Badge tone="brand">Provjereno</Badge> : <Badge tone="warning">U pripremi</Badge>}</span></td>
                <td className={`${td} whitespace-nowrap`}>{dateShort(r.updatedAt)}</td>
              </tr>
            ))}</tbody>
          </table></div>
        )}
      </Card>
      {toast.node}
    </>
  );
}
