'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { adminFetch, useCan } from '@/lib/adminApi';
import type { CmsForm } from '@/lib/cases';
import { Badge, Card, EmptyState, PageTitle, btnPrimary, td, th, tr, useToast } from '@/components/admin/ui';
import { File06, LinkExternal01, Plus } from '@untitledui/icons';

export default function FormsAdmin() {
  const canPublish = useCan('predmeti', 'publish');
  const toast = useToast();
  const [rows, setRows] = useState<CmsForm[] | null>(null);
  useEffect(() => { adminFetch<CmsForm[]>('/admin/forms').then(setRows).catch((e) => toast.err(e.message)); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <>
      <PageTitle kicker="Elektronski zahtjevi koje građani podnose na portalu. Svaki podneseni obrazac postaje predmet u e-pisarnici." crumbs={['E-pisarnica', 'Obrasci']} title="Elektronski obrasci">
        {canPublish && <Link href="/admin/predmeti/obrasci/novi" className={btnPrimary}><Plus />Novi obrazac</Link>}
      </PageTitle>
      <Card className="overflow-hidden">
        {!rows ? <div className="m-6 h-40 animate-pulse rounded-[12px] bg-[#f5f5f5]" /> : rows.length === 0 ? <EmptyState icon={File06} title="Još nema obrazaca" /> : (
          <div className="overflow-x-auto"><table className="w-full">
            <thead><tr><th className={th}>Obrazac</th><th className={th}>Rok</th><th className={th}>Predmeta</th><th className={th}>Otvorenih</th><th className={th}>Portal</th><th className={th}><span className="sr-only">Radnje</span></th></tr></thead>
            <tbody>{rows.map((f) => (
              <tr key={f.id} className={tr}>
                <td className={`${td} min-w-[280px]`}><Link href={`/admin/predmeti/obrasci/${f.id}`} className="font-medium text-[#171717] hover:underline">{f.title}</Link>{f.isDemo && <Badge tone="warning" className="ml-2">Probni</Badge>}<p className="text-[14px] text-[#737373]">{f.fields.length} polja · prilozi: {f.attachments === 'NE' ? 'ne' : f.attachments === 'OBAVEZNO' ? 'obavezni' : 'neobavezni'}</p></td>
                <td className={`${td} whitespace-nowrap`}>{f.slaDays} dana</td>
                <td className={`${td} tabular-nums`}>{f.caseCount ?? 0}</td>
                <td className={`${td} tabular-nums`}>{f.openCount ?? 0}</td>
                <td className={td}>{f.active ? <Badge tone="success" dot>Aktivan</Badge> : <Badge tone="gray">Isključen</Badge>}</td>
                <td className={`${td} text-right`}>{f.active && <a className="inline-flex rounded-[8px] p-2 text-[#a3a3a3] hover:bg-[#fafafa] hover:text-[#525252]" href={`/e-usluge/obrasci/${f.slug}`} target="_blank" rel="noopener" title="Otvori na portalu"><LinkExternal01 size={20} /></a>}</td>
              </tr>
            ))}</tbody>
          </table></div>
        )}
      </Card>
      {toast.node}
    </>
  );
}
