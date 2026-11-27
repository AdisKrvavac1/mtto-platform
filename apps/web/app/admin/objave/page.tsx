'use client';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { adminFetch, useCan } from '@/lib/adminApi';
import { dateShort, POST_TYPE } from '@/lib/format';
import { Announcement01, ArrowLeft, ArrowRight, Download01, Edit01, Eye, LinkExternal01, Plus, SearchLg, Trash01, UploadCloud02, Archive } from '@untitledui/icons';
import { Badge, Card, CardHeader, EmptyState, MetricCard, PageTitle, StatusChip, Tabs, btnPrimary, btnSecondary, iconBtn, input, td, th, tr, useToast } from '@/components/admin/ui';

type Row = { id: string; slug: string; title: string; excerpt: string; status: string; type: string; category: string; publishedAt: string | null; updatedAt: string; views: number; authorName: string; coverImage: string | null; isDemo: boolean };
const CATS = ['Zaštita okoliša', 'Turizam', 'Trgovina', 'Opće'];
const PAGE = 10;
type St = '' | 'OBJAVLJENO' | 'NACRT' | 'ZAKAZANO';

export default function PostsAdmin() {
  const canPost = useCan('objave', 'write');
  const [all, setAll] = useState<Row[] | null>(null);
  const [status, setStatus] = useState<St>('');
  const [type, setType] = useState('');
  const [cat, setCat] = useState('');
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const toast = useToast();

  const load = () => adminFetch<Row[]>('/admin/posts').then(setAll).catch((e) => toast.err(e.message));
  useEffect(() => { setQ(new URLSearchParams(window.location.search).get('q') ?? ''); load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => setPage(1), [status, type, cat, q]);

  const rows = useMemo(() => (all ?? []).filter((r) => (!status || r.status === status) && (!type || r.type === type) && (!cat || r.category === cat) && (!q || r.title.toLowerCase().includes(q.toLowerCase()))), [all, status, type, cat, q]);
  const pages = Math.max(1, Math.ceil(rows.length / PAGE));
  const shown = rows.slice((page - 1) * PAGE, page * PAGE);
  const n = (s: string) => (all ?? []).filter((r) => r.status === s).length;
  const views = (all ?? []).reduce((s, r) => s + r.views, 0);

  async function setStatusOf(ids: string[], s: string) {
    try {
      await Promise.all(ids.map((id) => adminFetch(`/admin/posts/${id}`, { method: 'PATCH', body: JSON.stringify({ status: s }) })));
      toast.ok(s === 'OBJAVLJENO' ? 'Objavljeno na portalu' : 'Vraćeno u nacrt');
      setPicked(new Set());
      load();
    } catch (e: any) { toast.err(e.message); }
  }
  async function removeMany(ids: string[]) {
    if (!ids.length || !confirm(`Trajno obrisati ${ids.length} objav${ids.length === 1 ? 'u' : 'e'}? Ova radnja se ne može poništiti.`)) return;
    try {
      await Promise.all(ids.map((id) => adminFetch(`/admin/posts/${id}`, { method: 'DELETE' })));
      toast.ok('Obrisano');
      setPicked(new Set());
      load();
    } catch (e: any) { toast.err(e.message); }
  }
  function exportCsv() {
    const esc = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const lines = [['Naslov', 'Vrsta', 'Resor', 'Status', 'Objavljeno', 'Pregleda'].join(';'), ...rows.map((r) => [r.title, POST_TYPE[r.type], r.category, r.status, dateShort(r.publishedAt), r.views].map(esc).join(';'))];
    const url = URL.createObjectURL(new Blob(['﻿' + lines.join('\n')], { type: 'text/csv;charset=utf-8' }));
    Object.assign(document.createElement('a'), { href: url, download: 'mtto-objave.csv' }).click();
    URL.revokeObjectURL(url);
  }
  const toggle = (id: string) => setPicked((s) => { const x = new Set(s); x.has(id) ? x.delete(id) : x.add(id); return x; });
  const allPicked = shown.length > 0 && shown.every((r) => picked.has(r.id));
  const check = 'size-4 rounded-[4px] border-[#d4d4d4] text-[#7f56d9] focus:ring-[#9e77ed] cursor-pointer';

  return (
    <>
      <PageTitle kicker="Vijesti, javni pozivi i saopćenja objavljeni na portalu." crumbs={['Objave i vijesti']} title="Objave i vijesti">
        <button type="button" onClick={exportCsv} className={btnSecondary}><Download01 />Izvoz CSV</button>
        {canPost && <Link href="/admin/objave/nova" className={btnPrimary}><Plus />Nova objava</Link>}
      </PageTitle>

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Objavljeno" value={n('OBJAVLJENO')} footer="Vidljivo na portalu" />
        <MetricCard title="Nacrti" value={n('NACRT')} footer="Čeka uređivanje" />
        <MetricCard title="Zakazano" value={n('ZAKAZANO')} footer="Automatsko objavljivanje" />
        <MetricCard title="Pregledi" value={views.toLocaleString('bs-BA')} footer="Ukupno od pokretanja" />
      </div>

      <Card className="mt-8 overflow-hidden">
        <CardHeader title="Sve objave" badge={<Badge tone="brand">{rows.length} zapisa</Badge>} description="Uredite, objavite ili povucite objave. Svaka izmjena se bilježi u dnevnik." />
        <div className="flex flex-col gap-4 px-4 pt-4 md:px-6">
          <Tabs<St> value={status} onChange={setStatus} items={[{ value: '', label: 'Sve', count: all?.length ?? 0 }, { value: 'OBJAVLJENO', label: 'Objavljeno', count: n('OBJAVLJENO') }, { value: 'NACRT', label: 'Nacrti', count: n('NACRT') }, { value: 'ZAKAZANO', label: 'Zakazano', count: n('ZAKAZANO') }]} />
          <div className="flex flex-col gap-3 pb-4 lg:flex-row lg:items-center lg:justify-between">
            <label className="relative w-full lg:max-w-[320px]"><span className="sr-only">Pretraga</span><SearchLg size={20} className="pointer-events-none absolute left-3 top-2.5 text-[#a3a3a3]" /><input className={`${input} pl-10`} placeholder="Pretraži naslove" value={q} onChange={(e) => setQ(e.target.value)} /></label>
            <div className="flex flex-wrap gap-3">
              <select className={`${input} !w-auto min-w-[160px]`} value={type} onChange={(e) => setType(e.target.value)} aria-label="Vrsta"><option value="">Sve vrste</option>{Object.entries(POST_TYPE).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
              <select className={`${input} !w-auto min-w-[160px]`} value={cat} onChange={(e) => setCat(e.target.value)} aria-label="Resor"><option value="">Svi resori</option>{CATS.map((c) => <option key={c}>{c}</option>)}</select>
            </div>
          </div>
        </div>

        {picked.size > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-y border-[#e9d7fe] bg-[#f9f5ff] px-4 py-3 md:px-6">
            <span className="text-[14px] font-semibold text-[#6941c6]">Odabrano: {picked.size}</span>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => setStatusOf([...picked], 'OBJAVLJENO')} className={btnSecondary}><UploadCloud02 />Objavi</button>
              <button type="button" onClick={() => setStatusOf([...picked], 'NACRT')} className={btnSecondary}><Archive />U nacrt</button>
              <button type="button" onClick={() => removeMany([...picked])} className={`${btnSecondary} !text-[#b42318] [&_svg]:!text-[#d92d20]`}><Trash01 />Obriši</button>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px]">
            <thead><tr>
              <th className={`${th} w-12 !pr-0`}><input type="checkbox" className={check} checked={allPicked} onChange={() => setPicked(allPicked ? new Set() : new Set(shown.map((r) => r.id)))} aria-label="Označi sve" /></th>
              <th className={th}>Naslov</th><th className={th}>Vrsta</th><th className={th}>Status</th><th className={th}>Objavljeno</th><th className={th}>Pregledi</th><th className={th}><span className="sr-only">Radnje</span></th>
            </tr></thead>
            <tbody>
              {all === null && <tr><td colSpan={7} className={td}><div className="h-24 animate-pulse rounded-[8px] bg-[#f5f5f5]" /></td></tr>}
              {all && rows.length === 0 && <tr><td colSpan={7}><EmptyState icon={Announcement01} title="Nema objava" action={canPost ? <Link href="/admin/objave/nova" className={btnPrimary}><Plus />Nova objava</Link> : undefined}>Nijedna objava ne odgovara filterima.</EmptyState></td></tr>}
              {shown.map((r) => (
                <tr key={r.id} className={tr}>
                  <td className={`${td} !pr-0`}><input type="checkbox" className={check} checked={picked.has(r.id)} onChange={() => toggle(r.id)} aria-label={`Označi ${r.title}`} /></td>
                  <td className={td}>
                    <div className="flex items-center gap-3">
                      {r.coverImage ? <img src={r.coverImage} alt="" className="hidden h-10 w-14 shrink-0 rounded-[6px] object-cover ring-1 ring-inset ring-black/10 xl:block" /> : <span className="hidden size-10 shrink-0 items-center justify-center rounded-full bg-[#f9f5ff] text-[#7f56d9] xl:flex"><Announcement01 size={20} /></span>}
                      <div className="min-w-0 max-w-[520px]">
                        <Link href={`/admin/objave/${r.id}`} className="line-clamp-1 font-medium text-[#171717] hover:text-[#6941c6]">{r.title}</Link>
                        <span className="flex items-center gap-2 text-[#525252]">{r.category}{r.isDemo && <Badge tone="warning">Demo</Badge>}</span>
                      </div>
                    </div>
                  </td>
                  <td className={td}><Badge tone="gray">{POST_TYPE[r.type]}</Badge></td>
                  <td className={td}><StatusChip status={r.status} /></td>
                  <td className={`${td} whitespace-nowrap`}>{dateShort(r.publishedAt)}</td>
                  <td className={td}>{r.views.toLocaleString('bs-BA')}</td>
                  <td className={`${td} whitespace-nowrap text-right`}>
                    {r.status === 'OBJAVLJENO' && <a href={`/vijesti/${r.slug}`} target="_blank" rel="noopener" className={iconBtn} title="Otvori na portalu"><LinkExternal01 /></a>}
                    <button type="button" onClick={() => setStatusOf([r.id], r.status === 'OBJAVLJENO' ? 'NACRT' : 'OBJAVLJENO')} className={iconBtn} title={r.status === 'OBJAVLJENO' ? 'Povuci u nacrt' : 'Objavi'}>{r.status === 'OBJAVLJENO' ? <Archive /> : <Eye />}</button>
                    <button type="button" onClick={() => removeMany([r.id])} className={`${iconBtn} hover:!text-[#d92d20]`} title="Obriši"><Trash01 /></button>
                    <Link href={`/admin/objave/${r.id}`} className={iconBtn} title="Uredi"><Edit01 /></Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between gap-3 border-t border-[#e5e5e5] px-4 pb-4 pt-3 md:px-6">
          <button type="button" disabled={page <= 1} onClick={() => setPage(page - 1)} className={btnSecondary}><ArrowLeft /><span className="hidden sm:inline">Prethodna</span></button>
          <span className="text-[14px] font-medium text-[#404040]">Stranica {page} od {pages}</span>
          <button type="button" disabled={page >= pages} onClick={() => setPage(page + 1)} className={btnSecondary}><span className="hidden sm:inline">Sljedeća</span><ArrowRight /></button>
        </div>
      </Card>
      {toast.node}
    </>
  );
}
