'use client';
// F2-05: e-pisarnica – predmeti iz elektronskih obrazaca.
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { adminFetch, useCan } from '@/lib/adminApi';
import { Due } from '@/components/admin/CaseBits';
import { CASE_STATUS, type CaseStatus, type CmsForm, daysLeft } from '@/lib/cases';
import { dateShort } from '@/lib/format';
import { Badge, Card, EmptyState, MetricCard, PageTitle, Tabs, btnSecondary, input, td, th, tr, useToast } from '@/components/admin/ui';
import { File06, Inbox01, SearchLg } from '@untitledui/icons';

type Item = { id: string; number: string; status: CaseStatus; applicantName: string; routedTo: string | null; anonymous: boolean; protectIdentity: boolean; receivedAt: string; dueAt: string; closedAt: string | null; formTitle: string; assigneeName: string | null; isDemo: boolean; lastSupplementAt: string | null; updatedAt: string };
type Res = { items: Item[]; total: number; counts: Partial<Record<CaseStatus, number>>; overdue: number };
type Tab = 'OTVORENI' | 'MOJI' | 'ROK' | 'ZATVORENI' | 'SVI';

export default function CasesInbox() {
  const toast = useToast();
  const canForms = useCan('predmeti', 'publish');
  const [tab, setTab] = useState<Tab>('OTVORENI');
  const [q, setQ] = useState('');
  const [form, setForm] = useState('');
  const [forms, setForms] = useState<CmsForm[]>([]);
  const [res, setRes] = useState<Res | null>(null);

  useEffect(() => { adminFetch<CmsForm[]>('/admin/forms').then(setForms).catch(() => {}); }, []);
  useEffect(() => {
    const p = new URLSearchParams({ limit: '100' });
    p.set('status', tab === 'MOJI' || tab === 'ROK' ? 'OTVORENI' : tab);
    if (tab === 'MOJI') p.set('mine', '1');
    if (tab === 'ROK') p.set('overdue', '1');
    if (q) p.set('q', q);
    if (form) p.set('form', form);
    const t = setTimeout(() => adminFetch<Res>(`/admin/cases?${p}`).then(setRes).catch((e) => toast.err(e.message)), q ? 250 : 0);
    return () => clearTimeout(t);
  }, [tab, q, form]); // eslint-disable-line react-hooks/exhaustive-deps

  const c = res?.counts ?? {};
  const open = (c.ZAPRIMLJEN ?? 0) + (c.U_OBRADI ?? 0) + (c.DOPUNA ?? 0);
  return (
    <>
      <PageTitle kicker="Zahtjevi podneseni elektronskim obrascima: prijem, obrada, dopune i rješenja, s rokovima i historijom." crumbs={['E-pisarnica']} title="E-pisarnica">
        <Link href="/admin/predmeti/obrasci" className={btnSecondary}><File06 />{canForms ? 'Obrasci' : 'Pregled obrazaca'}</Link>
      </PageTitle>

      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MetricCard title="Novi (zaprimljeni)" value={c.ZAPRIMLJEN ?? 0} footer="Čekaju referenta" />
        <MetricCard title="U obradi" value={c.U_OBRADI ?? 0} footer={`${c.DOPUNA ?? 0} čeka dopunu`} />
        <MetricCard title="Rok istekao" value={res?.overdue ?? 0} footer={res?.overdue ? <span className="text-[#b42318]">Potrebna hitna obrada</span> : 'Svi u roku'} />
        <MetricCard title="Zatvoreno" value={(c.RIJESEN ?? 0) + (c.ODBIJEN ?? 0) + (c.PROSLIJEDJEN ?? 0)} footer={`${c.ODBIJEN ?? 0} odbijeno · ${c.PROSLIJEDJEN ?? 0} proslijeđeno`} />
      </div>

      <div className="mb-4">
        <Tabs<Tab> value={tab} onChange={setTab} items={[
          { value: 'OTVORENI', label: 'Otvoreni', count: open },
          { value: 'MOJI', label: 'Moji' },
          { value: 'ROK', label: 'Rok istekao', count: res?.overdue },
          { value: 'ZATVORENI', label: 'Zatvoreni' },
          { value: 'SVI', label: 'Svi' },
        ]} />
      </div>

      <Card className="overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-[#e5e5e5] px-4 py-4 md:flex-row md:px-6">
          <label className="relative flex-1"><span className="sr-only">Pretraga predmeta</span><SearchLg size={20} className="pointer-events-none absolute left-3 top-2.5 text-[#a3a3a3]" />
            <input className={`${input} pl-10`} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Broj predmeta, podnosilac ili sadržaj" /></label>
          <select aria-label="Obrazac" className={`${input} md:w-[300px]`} value={form} onChange={(e) => setForm(e.target.value)}>
            <option value="">Svi obrasci</option>{forms.map((f) => <option key={f.id} value={f.id}>{f.title}</option>)}
          </select>
        </div>
        {!res ? <div className="m-6 h-40 animate-pulse rounded-[12px] bg-[#f5f5f5]" /> : res.items.length === 0 ? (
          <EmptyState icon={Inbox01} title={tab === 'MOJI' ? 'Nemate dodijeljenih otvorenih predmeta' : tab === 'ROK' ? 'Nema predmeta s isteklim rokom' : 'Nema predmeta'}>
            {tab === 'OTVORENI' && !q ? 'Predmeti nastaju kad građanin podnese obrazac na portalu (E-usluge → Elektronski zahtjevi).' : null}
          </EmptyState>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr><th className={th}>Predmet</th><th className={th}>Podnosilac</th><th className={th}>Status</th><th className={th}>Rok</th><th className={th}>Referent</th><th className={th}>Zaprimljen</th></tr></thead>
              <tbody>
                {res.items.map((i) => (
                  <tr key={i.id} className={tr}>
                    <td className={`${td} min-w-[260px]`}>
                      <Link href={`/admin/predmeti/${i.id}`} className="font-medium text-[#171717] hover:underline">{i.number}</Link>
                      {i.isDemo && <Badge tone="warning" className="ml-2">Demo</Badge>}
                      <p className="text-[14px] text-[#737373]">{i.formTitle}{i.routedTo ? ` · ${i.routedTo}` : ''}</p>
                    </td>
                    <td className={`${td} ${i.anonymous || i.protectIdentity ? 'italic text-[#737373]' : ''}`}>{i.applicantName}</td>
                    <td className={`${td} whitespace-nowrap`}>
                      <Badge tone={CASE_STATUS[i.status].tone} dot>{CASE_STATUS[i.status].label}</Badge>
                      {i.status === 'DOPUNA' && i.lastSupplementAt && <p className="mt-1 text-[12px] font-medium text-[#067647]">Dopuna stigla {dateShort(i.lastSupplementAt)}</p>}
                    </td>
                    <td className={`${td} whitespace-nowrap`}><Due c={i} /></td>
                    <td className={td}>{i.assigneeName ?? <span className="text-[#a3a3a3]">Nije dodijeljen</span>}</td>
                    <td className={`${td} whitespace-nowrap`}>{dateShort(i.receivedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
      {toast.node}
    </>
  );
}
