'use client';
import { use, useCallback, useEffect, useState } from 'react';
import { adminFetch } from '@/lib/adminApi';
import type { CmsCallDetail } from '@/lib/calls';
import { PageTitle, Tabs, useToast } from '@/components/admin/ui';
import { AwardsEditor, CallSettings, PublishBar } from '@/components/admin/CallEditor';

export default function CallAdmin({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const toast = useToast();
  const [c, setC] = useState<CmsCallDetail | null>(null);
  const [tab, setTab] = useState<'korisnici' | 'postavke'>('korisnici');
  const [v, setV] = useState(0);
  const load = useCallback(() => adminFetch<CmsCallDetail>(`/admin/calls/${id}`).then((x) => { setC(x); setV((n) => n + 1); }).catch((e) => toast.err(e.message)), [id]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, [load]);
  if (!c) return <div className="h-64 animate-pulse rounded-[12px] bg-[#f5f5f5]">{toast.node}</div>;
  return (
    <>
      <PageTitle kicker={c.summary || 'Javni poziv'} crumbs={['Javni pozivi', c.title]} title={c.title} />
      <PublishBar call={c} onSaved={load} />
      <div className="mt-8"><Tabs value={tab} onChange={setTab} items={[{ value: 'korisnici', label: 'Prijave i korisnici', count: c.applications.length }, { value: 'postavke', label: 'Sadržaj i rok' }]} /></div>
      {tab === 'korisnici' ? <AwardsEditor key={v} call={c} onSaved={load} /> : <div className="mt-6"><CallSettings key={v} call={c} onSaved={load} /></div>}
      {toast.node}
    </>
  );
}
