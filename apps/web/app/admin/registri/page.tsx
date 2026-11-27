'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { adminFetch, useCan, useSectors } from '@/lib/adminApi';
import type { Registry } from '@/lib/registry';
import { dateTime } from '@/lib/format';
import { Badge, Card, EmptyState, PageTitle, btnPrimary, td, th, tr, useToast } from '@/components/admin/ui';
import { ClipboardCheck, Code02, Database01, Plus } from '@untitledui/icons';

export default function RegistriesAdmin() {
  const canPublish = useCan('registri', 'publish');
  const sectors = useSectors();
  const [rows, setRows] = useState<Registry[] | null>(null);
  const toast = useToast();
  useEffect(() => { adminFetch<Registry[]>('/admin/registries').then(setRows).catch((e) => toast.err(e.message)); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const sectorName = (k: string | null) => (k ? sectors.find((s) => s.key === k)?.name ?? k : 'Svi sektori');

  return (
    <>
      <PageTitle kicker="Jedan alat za sve javne registre: polja, unos, uvoz iz Excela, javna pretraga, karta i otvoreni podaci." crumbs={['Javni registri']} title="Javni registri">
        <a className="inline-flex h-10 items-center gap-1.5 rounded-[8px] px-3.5 text-[14px] font-semibold text-[#525252] hover:bg-[#fafafa]" href="/api/registries" target="_blank" rel="noopener"><Code02 size={20} className="text-[#a3a3a3]" />Javni API</a>
        {canPublish && <Link href="/admin/registri/novi" className={btnPrimary}><Plus />Novi registar</Link>}
      </PageTitle>

      <Card className="overflow-hidden">
        {!rows ? <div className="m-6 h-40 animate-pulse rounded-[12px] bg-[#f5f5f5]" /> : rows.length === 0 ? (
          <EmptyState icon={Database01} title="Još nema registara" action={canPublish ? <Link href="/admin/registri/novi" className={btnPrimary}><Plus />Novi registar</Link> : undefined}>Registar se pravi bez programiranja: definišete polja, a portal dobija pretragu, filtere, CSV i API.</EmptyState>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr><th className={th}>Registar</th><th className={th}>Sektor</th><th className={th}>Zapisi</th><th className={th}>Portal</th><th className={th}>Posljednja izmjena</th></tr></thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className={tr}>
                    <td className={td}>
                      <Link href={`/admin/registri/${r.id}`} className="font-medium text-[#171717] hover:underline">{r.name}</Link>
                      {r.isDemo && <Badge tone="warning" className="ml-2">Demo podaci</Badge>}
                      <p className="text-[14px] text-[#737373]">{r.fields.length} polja{r.geo ? ' · s lokacijom' : ''}</p>
                    </td>
                    <td className={td}>{sectorName(r.sector)}</td>
                    <td className={`${td} tabular-nums`}>{r.count ?? 0}</td>
                    <td className={td}>{r.public ? <a href={`/registri/${r.slug}`} target="_blank" rel="noopener"><Badge tone="success" dot>Objavljen</Badge></a> : <Badge tone="gray">Interni</Badge>}</td>
                    <td className={`${td} whitespace-nowrap`}>{dateTime(r.lastEntryAt ?? r.updatedAt)}</td>
                  </tr>
                ))}
                <tr className={tr}>
                  <td className={td}><Link href="/admin/registri/okolisne-dozvole" className="font-medium text-[#171717] hover:underline"><ClipboardCheck size={16} className="mr-1.5 inline text-[#a3a3a3]" />Okolišne dozvole</Link><p className="text-[14px] text-[#737373]">Namjenski registar s dokumentima i rokovima obnove</p></td>
                  <td className={td}>Zaštita okoliša</td><td className={td}>—</td>
                  <td className={td}><a href="/registri/okolisne-dozvole" target="_blank" rel="noopener"><Badge tone="success" dot>Objavljen</Badge></a></td><td className={td}>—</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </Card>
      {toast.node}
    </>
  );
}
