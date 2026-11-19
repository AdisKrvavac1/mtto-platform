'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { adminFetch } from '@/lib/adminApi';
import { Card, PageTitle, StatusChip, btnPrimary, input, useToast } from '@/components/admin/ui';
import { dateShort, POST_TYPE } from '@/lib/format';

type Row = { id: string; slug: string; title: string; status: string; type: string; category: string; publishedAt: string | null; updatedAt: string; views: number; authorName: string; coverImage: string | null; isDemo: boolean };

export default function PostsAdmin() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [status, setStatus] = useState('');
  const [q, setQ] = useState('');
  const toast = useToast();

  const load = () => {
    const p = new URLSearchParams();
    if (status) p.set('status', status);
    if (q) p.set('q', q);
    adminFetch<Row[]>(`/admin/posts?${p}`).then(setRows).catch((e) => toast.err(e.message));
  };
  useEffect(load, [status]); // eslint-disable-line react-hooks/exhaustive-deps

  async function quickPublish(r: Row) {
    try {
      await adminFetch(`/admin/posts/${r.id}`, { method: 'PATCH', body: JSON.stringify({ status: r.status === 'OBJAVLJENO' ? 'NACRT' : 'OBJAVLJENO' }) });
      toast.ok(r.status === 'OBJAVLJENO' ? 'Objava povučena u nacrt' : 'Objavljeno na portalu');
      load();
    } catch (e: any) {
      toast.err(e.message);
    }
  }

  const counts = (s: string) => rows?.filter((r) => r.status === s).length ?? 0;
  const tab = (v: string, label: string) => (
    <button type="button" onClick={() => setStatus(v)} className={`px-3 py-1.5 rounded-lg font-button text-button ${status === v ? 'bg-mtto-primary text-white' : 'bg-surface-container-lowest border border-slate-border text-on-surface-variant'}`}>{label}</button>
  );

  return (
    <>
      <PageTitle kicker="CMS redakcija" title="Objave, vijesti i javni pozivi">
        <Link href="/admin/objave/nova" className={btnPrimary}><span className="material-symbols-outlined text-[18px]">add</span>Nova objava</Link>
      </PageTitle>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-space-md mb-space-lg">
        {[['Objavljeno', 'OBJAVLJENO', 'check_circle', 'text-eko-green'], ['Nacrti', 'NACRT', 'edit_note', 'text-[#b45309]'], ['Zakazano', 'ZAKAZANO', 'schedule', 'text-neretva-cyan']].map(([l, s, i, c]) => (
          <Card key={s} className="p-space-md flex items-center justify-between">
            <div><p className="font-display text-[30px] font-bold text-text-heading leading-none">{status ? '–' : counts(s)}</p><p className="font-body-sm text-body-sm text-on-surface-variant">{l}</p></div>
            <span className={`material-symbols-outlined text-[28px] ${c}`}>{i}</span>
          </Card>
        ))}
        <Card className="p-space-md flex items-center justify-between">
          <div><p className="font-display text-[30px] font-bold text-text-heading leading-none">{(rows ?? []).reduce((s, r) => s + r.views, 0).toLocaleString('bs-BA')}</p><p className="font-body-sm text-body-sm text-on-surface-variant">Pregleda</p></div>
          <span className="material-symbols-outlined text-[28px] text-mtto-primary">trending_up</span>
        </Card>
      </div>
      <Card className="overflow-hidden">
        <div className="p-space-md flex flex-col md:flex-row gap-space-sm md:items-center border-b border-slate-border">
          <form onSubmit={(e) => { e.preventDefault(); load(); }} className="flex-1 relative">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-outline text-[18px]">search</span>
            <input className={`${input} pl-9`} placeholder="Pretraži po naslovu..." value={q} onChange={(e) => setQ(e.target.value)} />
          </form>
          <div className="flex gap-space-xs overflow-x-auto">{tab('', 'Sve')}{tab('OBJAVLJENO', 'Objavljeno')}{tab('NACRT', 'Nacrti')}{tab('ZAKAZANO', 'Zakazano')}</div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left">
            <thead><tr className="border-b-2 border-mtto-primary">{['', 'Naslov', 'Vrsta / resor', 'Status', 'Objavljeno', 'Pregleda', 'Radnje'].map((h) => <th key={h} className="px-space-md py-2 font-label-badge text-label-badge uppercase text-[#80807e]">{h}</th>)}</tr></thead>
            <tbody>
              {(rows ?? []).map((r, i) => (
                <tr key={r.id} className={`${i % 2 ? 'bg-slate-surface' : ''} hover:bg-[rgba(0,171,235,0.05)]`}>
                  <td className="pl-space-md py-2 w-16"><div className="w-14 h-10 rounded bg-surface-container bg-cover bg-center" style={r.coverImage ? { backgroundImage: `url('${r.coverImage}')` } : undefined} /></td>
                  <td className="px-space-md py-2"><Link href={`/admin/objave/${r.id}`} className="font-button text-button font-bold text-mtto-primary hover:underline line-clamp-2">{r.title}</Link><span className="font-body-sm text-[12px] text-on-surface-variant">{r.authorName}</span></td>
                  <td className="px-space-md py-2 font-body-sm text-body-sm">{POST_TYPE[r.type]}<span className="block text-on-surface-variant">{r.category}</span></td>
                  <td className="px-space-md py-2"><StatusChip status={r.status} /></td>
                  <td className="px-space-md py-2 font-mono text-[12px]">{dateShort(r.publishedAt)}</td>
                  <td className="px-space-md py-2 font-mono text-[12px]">{r.views}</td>
                  <td className="px-space-md py-2">
                    <div className="flex items-center gap-1">
                      <Link href={`/admin/objave/${r.id}`} className="w-8 h-8 rounded bg-surface-container-high text-mtto-primary inline-flex items-center justify-center" title="Uredi"><span className="material-symbols-outlined text-[18px]">edit</span></Link>
                      {r.status === 'OBJAVLJENO' && <a href={`/vijesti/${r.slug}`} target="_blank" rel="noopener" className="w-8 h-8 rounded bg-surface-container-high text-mtto-primary inline-flex items-center justify-center" title="Otvori na portalu"><span className="material-symbols-outlined text-[18px]">open_in_new</span></a>}
                      <button type="button" onClick={() => quickPublish(r)} className={`h-8 px-2 rounded font-label-badge text-label-badge font-bold ${r.status === 'OBJAVLJENO' ? 'bg-surface-container-high text-on-surface-variant' : 'bg-eko-green text-white'}`}>{r.status === 'OBJAVLJENO' ? 'Povuci' : 'Objavi'}</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows && rows.length === 0 && <p className="p-space-lg text-center text-on-surface-variant">Nema objava.</p>}
        </div>
      </Card>
      {toast.node}
    </>
  );
}
