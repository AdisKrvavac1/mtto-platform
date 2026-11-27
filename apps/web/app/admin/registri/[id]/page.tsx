'use client';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { adminFetch, getUser, inMySectors, useCan } from '@/lib/adminApi';
import type { Registry } from '@/lib/registry';
import { Badge, PageTitle, Tabs, btnDanger, btnSecondary, useToast } from '@/components/admin/ui';
import RegistryEntries from '@/components/admin/RegistryEntries';
import RegistryImport from '@/components/admin/RegistryImport';
import RegistrySettings from '@/components/admin/RegistrySettings';
import { Download01, LinkExternal01, Trash01 } from '@untitledui/icons';

type Tab = 'zapisi' | 'uvoz' | 'postavke';

export default function RegistryPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const toast = useToast();
  const [reg, setReg] = useState<Registry | null>(null);
  const [tab, setTab] = useState<Tab>('zapisi');
  const [count, setCount] = useState<number | undefined>();
  const canPublish = useCan('registri', 'publish');
  const canWrite = useCan('registri', 'write');
  const canDelete = useCan('registri', 'delete');
  const inScope = reg ? inMySectors(getUser(), reg.sector) : true;

  const load = () => adminFetch<Registry>(`/admin/registries/${id}`).then(setReg).catch((e) => toast.err(e.message));
  const loadCount = () => adminFetch<{ total: number }>(`/admin/registries/${id}/entries?limit=1&status=AKTIVAN`).then((r) => setCount(r.total)).catch(() => {});
  useEffect(() => { load(); loadCount(); }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  async function remove() {
    if (!reg || !confirm(`Obrisati registar „${reg.name}“? Moguće samo kad nema zapisa.`)) return;
    try { await adminFetch(`/admin/registries/${reg.id}`, { method: 'DELETE' }); toast.ok('Registar obrisan'); router.push('/admin/registri'); } catch (e: any) { toast.err(e.message); }
  }

  if (!reg) return <div className="h-64 animate-pulse rounded-[12px] bg-[#f5f5f5]" />;
  const editable = canWrite && inScope;
  return (
    <>
      <PageTitle
        kicker={reg.description || 'Registar bez opisa'} crumbs={['Javni registri', reg.name]} title={reg.name}
        badge={<>{reg.public ? <Badge tone="success" dot>Objavljen</Badge> : <Badge tone="gray">Interni</Badge>}{reg.isDemo && <Badge tone="warning">Demo podaci</Badge>}</>}
      >
        <a className={btnSecondary} href={`/api/admin/registries/${reg.id}/export.csv`}><Download01 />Izvoz CSV</a>
        {reg.public && <a className={btnSecondary} href={`/registri/${reg.slug}`} target="_blank" rel="noopener"><LinkExternal01 />Na portalu</a>}
        {canPublish && count === 0 && <button type="button" className={btnDanger} onClick={remove}><Trash01 />Obriši</button>}
      </PageTitle>
      {!inScope && canWrite && <p className="mb-6 rounded-[8px] bg-[#fafafa] p-3 text-[14px] text-[#404040] ring-1 ring-inset ring-[#e5e5e5]">Registar pripada sektoru „{reg.sector}“. Zapise možete pregledati, a mijenjaju ih korisnici tog sektora.</p>}
      <div className="mb-6">
        <Tabs<Tab> value={tab} onChange={setTab} items={[
          { value: 'zapisi', label: 'Zapisi', count },
          ...(editable ? [{ value: 'uvoz' as Tab, label: 'Uvoz CSV' }] : []),
          { value: 'postavke', label: canPublish ? 'Polja i postavke' : 'Polja' },
        ]} />
      </div>
      {tab === 'zapisi' && <RegistryEntries reg={reg} canEdit={editable} canDelete={canDelete && inScope} toast={toast} onChanged={loadCount} />}
      {tab === 'uvoz' && editable && <RegistryImport reg={reg} toast={toast} onDone={loadCount} />}
      {tab === 'postavke' && <RegistrySettings key={reg.updatedAt} registry={reg} canPublish={canPublish} onSaved={setReg} />}
      {toast.node}
    </>
  );
}
