'use client';
import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { adminFetch, useCan } from '@/lib/adminApi';
import { Badge, Card, CardHeader, EmptyState, F2Badge, Field, MetricCard, PageTitle, ProgressBar, StatusChip, btnPrimary, btnSecondary, iconBtn, input, td, th, tr, useToast } from '@/components/admin/ui';
import { Archive, Clock, Download01, Edit01, Folder, FolderClosed, Globe01, SearchLg, ShieldTick, Trash01, UploadCloud02, XClose } from '@untitledui/icons';
import { DOC_TYPE, dateShort, dateTime, fileExt, fileSize } from '@/lib/format';

type Doc = { id: string; title: string; docType: string; sector: string; number: string | null; issuedAt: string | null; status: string; fileName: string; mimeType: string; size: number; downloads: number; postId: string | null; permitId: string | null; createdAt: string; isDemo: boolean };
const SECTORS = ['Turizam i ugostiteljstvo', 'Zaštita okoliša', 'Trgovina', 'Opće'];
const EMPTY = { title: '', docType: 'ZAKON', sector: 'Opće', number: '', issuedAt: '', status: 'VAZECI', description: '' };
const FOLDERS: [string, string][] = [['ZAKON', '01_Zakoni'], ['PRAVILNIK', '02_Pravilnici'], ['OBRAZAC', '03_Obrasci_zahtjeva'], ['ODLUKA', '04_Rjesenja_i_odluke'], ['UPUTSTVO', '05_Uputstva'], ['IZVJESTAJ', '06_Izvjestaji_i_strategije'], ['OSTALO', '07_Ostalo']];
const EXT_BG: Record<string, string> = { PDF: 'bg-[#d92d20]', DOC: 'bg-[#155eef]', DOCX: 'bg-[#155eef]', XLS: 'bg-[#079455]', XLSX: 'bg-[#079455]' };

export default function DocumentsAdmin() {
  const canEdit = useCan('dokumenti', 'write');
  const [all, setAll] = useState<Doc[] | null>(null);
  const [folder, setFolder] = useState('');
  const [quick, setQuick] = useState('');
  const [q, setQ] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [meta, setMeta] = useState(EMPTY);
  const [edit, setEdit] = useState<(typeof EMPTY & { id: string }) | null>(null);
  const [busy, setBusy] = useState(false);
  const [drag, setDrag] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const toast = useToast();

  const load = () => adminFetch<Doc[]>('/admin/documents').then(setAll).catch((e) => toast.err(e.message));
  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const weekAgo = Date.now() - 7 * 864e5;
  const rows = useMemo(() => (all ?? []).filter((d) => (!folder || d.docType === folder) && (!q || d.title.toLowerCase().includes(q.toLowerCase()) || d.fileName.toLowerCase().includes(q.toLowerCase())) && (quick !== 'recent' || new Date(d.createdAt).getTime() > weekAgo) && (quick !== 'public' || (d.status === 'VAZECI' && !d.postId && !d.permitId)) && (quick !== 'archive' || d.status === 'ARHIVIRAN')), [all, folder, q, quick, weekAgo]);
  const total = (all ?? []).reduce((s, r) => s + r.size, 0);
  const byExt = (e: string[]) => (all ?? []).filter((d) => e.includes(fileExt(d.fileName))).length;
  const quota = 1024 * 1024 * 1024;
  const pct = Math.min(100, (total / quota) * 100);

  function pick(f: File | undefined) {
    if (!f) return;
    if (f.size > 10 * 1024 * 1024) { toast.err('Datoteka je veća od 10 MB'); return; }
    setFile(f);
    setMeta((m) => ({ ...m, docType: folder || m.docType, title: m.title || f.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ') }));
  }
  async function upload(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    setBusy(true);
    const fd = new FormData();
    fd.append('file', file);
    Object.entries(meta).forEach(([k, v]) => v && fd.append(k, v));
    try {
      await adminFetch('/admin/documents', { method: 'POST', body: fd });
      toast.ok('Dokument je objavljen u biblioteci propisa');
      setFile(null); setMeta(EMPTY); load();
    } catch (e: any) { toast.err(e.message); } finally { setBusy(false); }
  }
  async function saveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!edit) return;
    const { id, ...body } = edit;
    try { await adminFetch(`/admin/documents/${id}`, { method: 'PATCH', body: JSON.stringify(body) }); toast.ok('Izmjene spremljene'); setEdit(null); load(); } catch (e: any) { toast.err(e.message); }
  }
  async function remove(d: Doc) {
    if (!confirm(`Trajno obrisati dokument „${d.title}”? Ova radnja se ne može poništiti.`)) return;
    try { await adminFetch(`/admin/documents/${d.id}`, { method: 'DELETE' }); toast.ok('Dokument obrisan'); load(); } catch (e: any) { toast.err(e.message); }
  }
  const FileIcon = ({ name }: { name: string }) => { const e = fileExt(name); return <span className="relative flex h-10 w-8 shrink-0 items-end justify-center rounded-[4px] bg-white ring-1 ring-inset ring-[#d4d4d4]"><span className={`mb-1 rounded-[2px] px-0.5 text-[9px] font-bold leading-[12px] text-white ${EXT_BG[e] ?? 'bg-[#525252]'}`}>{e}</span></span>; };
  const navItem = (on: boolean) => `flex w-full items-center justify-between gap-2 rounded-[6px] px-3 py-2 text-left text-[14px] font-semibold ${on ? 'bg-[#fafafa] text-[#262626]' : 'text-[#404040] hover:bg-[#fafafa]'}`;
  const cnt = (n: number | null) => n === null ? <F2Badge /> : <span className="rounded-full bg-[#fafafa] px-2 text-[12px] leading-[18px] font-medium text-[#404040] ring-1 ring-inset ring-[#e5e5e5]">{n}</span>;
  const current = folder ? DOC_TYPE[folder] ?? folder : quick === 'recent' ? 'Nedavno učitano' : quick === 'public' ? 'Javno u biblioteci' : quick === 'archive' ? 'Arhivirano' : 'Svi dokumenti';

  return (
    <>
      <PageTitle kicker="Zakoni, pravilnici, obrasci i prilozi objava na jednom mjestu." crumbs={['Dokumenti i propisi']} title="Dokumenti i propisi">
        <a href="/admin/korisnici#audit" className={btnSecondary}><ShieldTick />Dnevnik</a>
        {canEdit && <button type="button" onClick={() => fileInput.current?.click()} className={btnPrimary}><UploadCloud02 />Učitaj dokument</button>}
      </PageTitle>

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Ukupno dokumenata" value={all?.length ?? '–'} footer={`${(all ?? []).filter((d) => d.status === 'VAZECI').length} važećih`} />
        <MetricCard title="PDF" value={byExt(['PDF'])} footer="Akti i rješenja" />
        <MetricCard title="Word i Excel" value={byExt(['DOC', 'DOCX', 'XLS', 'XLSX'])} footer="Obrasci i tablice" />
        <Card className="flex flex-col p-5 md:p-6">
          <h3 className="text-[16px] font-semibold text-[#171717]">Prostor</h3>
          <p className="mt-5 text-[30px] leading-[38px] font-semibold tracking-[-0.02em] text-[#171717]">{fileSize(total)}</p>
          <div className="mt-3"><ProgressBar value={pct} /></div>
          <p className="mt-2 text-[14px] text-[#525252]">{pct < 1 ? '<1' : pct.toFixed(0)}% od 1 GB</p>
        </Card>
      </div>

      <div className="mt-8 grid items-start gap-6 lg:grid-cols-[260px_1fr]">
        <div className="flex flex-col gap-6 lg:sticky lg:top-6">
          <Card className="p-3">
            <p className="px-3 pb-1 pt-2 text-[12px] font-semibold text-[#737373]">Mape</p>
            <button type="button" onClick={() => { setFolder(''); setQuick(''); }} className={navItem(!folder && !quick)}><span className="flex items-center gap-2"><Folder size={20} className="text-[#a3a3a3]" />Svi dokumenti</span>{cnt(all?.length ?? 0)}</button>
            {FOLDERS.map(([k]) => <button key={k} type="button" onClick={() => { setFolder(k); setQuick(''); }} className={navItem(folder === k && !quick)}><span className="flex min-w-0 items-center gap-2"><FolderClosed size={20} className="shrink-0 text-[#a3a3a3]" /><span className="truncate">{DOC_TYPE[k] ?? k}</span></span>{cnt((all ?? []).filter((d) => d.docType === k).length)}</button>)}
            <p className="px-3 pb-1 pt-4 text-[12px] font-semibold text-[#737373]">Brzi filteri</p>
            {([['recent', Clock, 'Nedavno učitano', (all ?? []).filter((d) => new Date(d.createdAt).getTime() > weekAgo).length], ['public', Globe01, 'Javno u biblioteci', (all ?? []).filter((d) => d.status === 'VAZECI' && !d.postId && !d.permitId).length], ['archive', Archive, 'Arhivirano', (all ?? []).filter((d) => d.status === 'ARHIVIRAN').length]] as const).map(([k, I, l, n]) => (
              <button key={k} type="button" onClick={() => { setQuick(quick === k ? '' : k); setFolder(''); }} className={navItem(quick === k)}><span className="flex items-center gap-2"><I size={20} className="text-[#a3a3a3]" />{l}</span>{cnt(n)}</button>
            ))}
          </Card>
          <div className="rounded-[12px] bg-[#fafafa] p-4">
            <p className="flex items-center gap-2 text-[14px] font-semibold text-[#171717]"><ShieldTick size={16} className="text-[#7f56d9]" />Pravila arhiviranja</p>
            <p className="mt-1 text-[14px] leading-5 text-[#525252]">Svako učitavanje, izmjena i brisanje bilježi se u dnevnik. Provjera e-potpisa dolazi u Fazi 2.</p>
          </div>
        </div>

        <div className="flex min-w-0 flex-col gap-6">
          <form onSubmit={upload}
            onDragOver={(e) => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)} onDrop={(e) => { e.preventDefault(); setDrag(false); pick(e.dataTransfer.files?.[0]); }}
            className={`rounded-[12px] bg-white ring-inset transition-shadow ${drag ? 'ring-2 ring-[#7f56d9]' : 'ring-1 ring-[#e5e5e5]'} ${file ? 'p-5' : 'px-6 py-4'}`}>
            <input ref={fileInput} type="file" className="hidden" accept=".pdf,.doc,.docx,.xls,.xlsx" onChange={(e) => { pick(e.target.files?.[0]); e.target.value = ''; }} />
            {!file ? (
              <button type="button" onClick={() => fileInput.current?.click()} className="flex w-full flex-col items-center gap-3 text-center">
                <span className="flex size-10 items-center justify-center rounded-[8px] text-[#525252] ring-1 ring-inset ring-[#d4d4d4] shadow-[0_1px_2px_rgba(10,13,18,0.05)]"><UploadCloud02 size={20} /></span>
                <span className="text-[14px] text-[#525252]"><b className="font-semibold text-[#6941c6]">Kliknite za učitavanje</b> ili prevucite datoteku</span>
                <span className="text-[12px] text-[#737373]">PDF, DOC, DOCX, XLS ili XLSX do 10 MB</span>
              </button>
            ) : (
              <div className="flex flex-col gap-5">
                <div className="flex items-center gap-3 rounded-[12px] p-4 ring-1 ring-inset ring-[#e5e5e5]"><FileIcon name={file.name} /><div className="min-w-0 flex-1"><p className="truncate text-[14px] font-medium text-[#404040]">{file.name}</p><p className="text-[14px] text-[#525252]">{fileSize(file.size)} · spremno za učitavanje</p></div><button type="button" onClick={() => setFile(null)} className={iconBtn} aria-label="Ukloni"><XClose /></button></div>
                <div className="grid gap-4 md:grid-cols-12">
                  <div className="md:col-span-6"><Field label="Naziv dokumenta" required><input required className={input} value={meta.title} onChange={(e) => setMeta({ ...meta, title: e.target.value })} /></Field></div>
                  <div className="md:col-span-3"><Field label="Vrsta"><select className={input} value={meta.docType} onChange={(e) => setMeta({ ...meta, docType: e.target.value })}>{Object.entries(DOC_TYPE).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></Field></div>
                  <div className="md:col-span-3"><Field label="Resor"><select className={input} value={meta.sector} onChange={(e) => setMeta({ ...meta, sector: e.target.value })}>{SECTORS.map((s) => <option key={s}>{s}</option>)}</select></Field></div>
                  <div className="md:col-span-4"><Field label="Broj akta / glasnika"><input className={input} value={meta.number} onChange={(e) => setMeta({ ...meta, number: e.target.value })} placeholder="npr. SN HNK 6/12" /></Field></div>
                  <div className="md:col-span-3"><Field label="Datum"><input type="date" className={input} value={meta.issuedAt} onChange={(e) => setMeta({ ...meta, issuedAt: e.target.value })} /></Field></div>
                  <div className="md:col-span-2"><Field label="Status"><select className={input} value={meta.status} onChange={(e) => setMeta({ ...meta, status: e.target.value })}><option value="VAZECI">Važeći</option><option value="ARHIVIRAN">Arhiviran</option></select></Field></div>
                  <div className="flex items-end md:col-span-3"><button disabled={busy} className={`${btnPrimary} w-full`}><UploadCloud02 />{busy ? 'Učitavanje…' : 'Objavi'}</button></div>
                </div>
              </div>
            )}
          </form>

          <Card className="overflow-hidden">
            <CardHeader title={current} badge={<Badge tone="brand">{rows.length} dokumenata</Badge>} actions={<label className="relative w-full md:w-[280px]"><span className="sr-only">Pretraga</span><SearchLg size={20} className="pointer-events-none absolute left-3 top-2.5 text-[#a3a3a3]" /><input className={`${input} pl-10`} placeholder="Pretraži" value={q} onChange={(e) => setQ(e.target.value)} /></label>} />
            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px]">
                <thead><tr><th className={th}>Naziv</th><th className={th}>Vrsta</th><th className={th}>Veličina</th><th className={th}>Učitano</th><th className={th}>Status</th><th className={th}><span className="sr-only">Radnje</span></th></tr></thead>
                <tbody>
                  {all === null && <tr><td colSpan={6} className={td}><div className="h-20 animate-pulse rounded-[8px] bg-[#f5f5f5]" /></td></tr>}
                  {all && rows.length === 0 && <tr><td colSpan={6}><EmptyState icon={Folder} title="Mapa je prazna">Nema dokumenata za odabrani filter.</EmptyState></td></tr>}
                  {rows.map((d) => (
                    <Fragment key={d.id}>
                      <tr className={tr}>
                        <td className={td}>
                          <div className="flex items-center gap-3">
                            <FileIcon name={d.fileName} />
                            <div className="min-w-[260px] max-w-[420px]"><span className="block line-clamp-1 font-medium text-[#171717]">{d.title}</span><span className="flex items-center gap-2"><span className="line-clamp-1">{d.number || d.fileName}</span>{d.isDemo && <Badge tone="warning">Demo</Badge>}</span></div>
                          </div>
                        </td>
                        <td className={td}><Badge tone="gray">{DOC_TYPE[d.docType] ?? d.docType}</Badge><span className="mt-1 block text-[12px]">{d.postId ? 'Prilog objave' : d.permitId ? 'Dosje dozvole' : d.sector}</span></td>
                        <td className={`${td} whitespace-nowrap`}>{fileSize(d.size)}</td>
                        <td className={`${td} whitespace-nowrap`}>{dateShort(d.createdAt)}<span className="block text-[12px]">{d.downloads} preuzimanja</span></td>
                        <td className={td}><StatusChip status={d.status} /></td>
                        <td className={`${td} whitespace-nowrap text-right`}>
                          <a href={`/api/documents/${d.id}/file`} target="_blank" rel="noopener" className={iconBtn} title="Preuzmi"><Download01 /></a>
                          <button type="button" onClick={() => remove(d)} className={`${iconBtn} hover:!text-[#d92d20]`} title="Obriši"><Trash01 /></button>
                          <button type="button" onClick={() => setEdit(edit?.id === d.id ? null : { id: d.id, title: d.title, docType: d.docType, sector: d.sector, number: d.number ?? '', issuedAt: d.issuedAt?.slice(0, 10) ?? '', status: d.status, description: '' })} className={iconBtn} title="Uredi"><Edit01 /></button>
                        </td>
                      </tr>
                      {edit?.id === d.id && (
                        <tr className="bg-[#fafafa]">
                          <td colSpan={6} className="border-b border-[#e5e5e5] px-6 py-4">
                            <form onSubmit={saveEdit} className="grid items-end gap-4 md:grid-cols-12">
                              <div className="md:col-span-4"><Field label="Naziv"><input required className={input} value={edit.title} onChange={(e) => setEdit({ ...edit, title: e.target.value })} /></Field></div>
                              <div className="md:col-span-2"><Field label="Vrsta"><select className={input} value={edit.docType} onChange={(e) => setEdit({ ...edit, docType: e.target.value })}>{Object.entries(DOC_TYPE).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></Field></div>
                              <div className="md:col-span-2"><Field label="Broj akta"><input className={input} value={edit.number} onChange={(e) => setEdit({ ...edit, number: e.target.value })} /></Field></div>
                              <div className="md:col-span-2"><Field label="Status"><select className={input} value={edit.status} onChange={(e) => setEdit({ ...edit, status: e.target.value })}><option value="VAZECI">Važeći</option><option value="ARHIVIRAN">Arhiviran</option></select></Field></div>
                              <div className="flex gap-2 md:col-span-2"><button type="button" onClick={() => setEdit(null)} className={btnSecondary}>Odustani</button><button className={btnPrimary}>Spremi</button></div>
                            </form>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
      {toast.node}
    </>
  );
}
