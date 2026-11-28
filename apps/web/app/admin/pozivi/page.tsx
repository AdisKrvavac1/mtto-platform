'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { adminFetch, useCan } from '@/lib/adminApi';
import { PHASE, km, type CmsCall } from '@/lib/calls';
import { dateShort } from '@/lib/format';
import { Badge, Card, EmptyState, MetricCard, PageTitle, btnPrimary, td, th, tr, useToast } from '@/components/admin/ui';
import { Plus, Ticket01 } from '@untitledui/icons';

export default function CallsAdmin() {
  const toast = useToast();
  const canWrite = useCan('pozivi', 'write');
  const [rows, setRows] = useState<CmsCall[] | null>(null);
  useEffect(() => { adminFetch<CmsCall[]>('/admin/calls').then(setRows).catch((e) => toast.err(e.message)); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const open = (rows ?? []).filter((c) => c.phase === 'OTVOREN');
  return (
    <>
      <PageTitle kicker="Javni pozivi za sufinansiranje: rok, online prijava kroz e-pisarnicu i objava liste korisnika s iznosima." crumbs={['Javni pozivi']} title="Javni pozivi">
        {canWrite && <Link href="/admin/pozivi/novi" className={btnPrimary}><Plus />Novi poziv</Link>}
      </PageTitle>
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Otvoreni pozivi" value={open.length} footer={km(open.reduce((t, c) => t + (c.budget ?? 0), 0))} />
        <MetricCard title="Prijave u otvorenim" value={open.reduce((t, c) => t + (c.applications ?? 0), 0)} footer="kroz e-pisarnicu" />
        <MetricCard title="Čeka listu korisnika" value={(rows ?? []).filter((c) => c.phase === 'ZATVOREN').length} footer="zatvoreni, bez objavljene liste" />
        <MetricCard title="Dodijeljeno ukupno" value={km((rows ?? []).filter((c) => c.resultsPublished).reduce((t, c) => t + (c.awarded ?? 0), 0))} footer="objavljene liste" />
      </div>
      <Card className="mt-8 overflow-hidden">
        {!rows ? <div className="m-6 h-40 animate-pulse rounded-[12px] bg-[#f5f5f5]" /> : rows.length === 0 ? <EmptyState icon={Ticket01} title="Još nema poziva" /> : (
          <div className="overflow-x-auto"><table className="w-full min-w-[880px]">
            <thead><tr><th className={th}>Poziv</th><th className={th}>Status</th><th className={th}>Rok</th><th className={`${th} text-right`}>Sredstva</th><th className={`${th} text-right`}>Prijava</th><th className={`${th} text-right`}>Korisnika</th></tr></thead>
            <tbody>{rows.map((c) => (
              <tr key={c.id} className={tr}>
                <td className={`${td} min-w-[300px]`}><Link href={`/admin/pozivi/${c.id}`} className="font-medium text-[#171717] hover:underline">{c.title}</Link>{c.isDemo && <Badge tone="warning" className="ml-2">Primjer</Badge>}<p className="text-[14px] text-[#737373]">{c.sector ?? 'Bez sektora'}{c.formTitle ? ' · online prijava' : ''}</p></td>
                <td className={td}><Badge tone={PHASE[c.phase].tone} dot>{PHASE[c.phase].label}</Badge></td>
                <td className={`${td} whitespace-nowrap`}>{dateShort(c.opensAt)} – {dateShort(c.closesAt)}</td>
                <td className={`${td} text-right tabular-nums`}>{km(c.budget)}</td>
                <td className={`${td} text-right tabular-nums`}>{c.applications ?? 0}</td>
                <td className={`${td} text-right tabular-nums`}>{c.awards ?? 0}{c.awarded ? <span className="block text-[12px] text-[#737373]">{km(c.awarded)}</span> : null}</td>
              </tr>
            ))}</tbody>
          </table></div>
        )}
      </Card>
      {toast.node}
    </>
  );
}
