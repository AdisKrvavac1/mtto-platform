'use client';
import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { adminFetch } from '@/lib/adminApi';
import { F2Badge, PageTitle, useToast } from '@/components/admin/ui';
import { DOC_TYPE, dateShort, dateTime, fileExt, fileSize } from '@/lib/format';

type Doc = { id: string; title: string; docType: string; sector: string; number: string | null; issuedAt: string | null; status: string; fileName: string; mimeType: string; size: number; downloads: number; postId: string | null; permitId: string | null; createdAt: string; isDemo: boolean };
const SECTORS = ['Turizam i ugostiteljstvo', 'Zaštita okoliša', 'Trgovina', 'Opće'];
const EMPTY = { title: '', docType: 'ZAKON', sector: 'Opće', number: '', issuedAt: '', status: 'VAZECI', description: '' };
const FOLDERS: [string, string][] = [['ZAKON', '01_Zakoni'], ['PRAVILNIK', '02_Pravilnici'], ['OBRAZAC', '03_Obrasci_zahtjeva'], ['ODLUKA', '04_Rjesenja_i_odluke'], ['UPUTSTVO', '05_Uputstva'], ['IZVJESTAJ', '06_Izvjestaji_i_strategije'], ['OSTALO', '07_Ostalo']];
const field = 'w-full px-3 py-2 rounded-lg bg-surface-container-low border-0 text-text-heading font-body-sm text-body-sm focus:bg-surface-container-lowest focus:outline-none focus:ring-1 focus:ring-primary-container';
const kick = 'font-label-kicker text-label-kicker uppercase tracking-wider text-outline';
const EXT_CLS: Record<string, string> = { PDF: 'bg-error-container/50 text-error', DOC: 'bg-surface-container-highest text-primary-container', DOCX: 'bg-surface-container-highest text-primary-container', XLS: 'bg-emerald-light text-secondary', XLSX: 'bg-emerald-light text-secondary' };

export default function DocumentsAdmin() {
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
  const folderBtn = (key: string, label: string, n: number, icon = 'folder') => (
    <button key={key} type="button" onClick={() => { setFolder(key); setQuick(''); }} className={`w-full flex items-center justify-between gap-2 px-2 py-1.5 rounded-lg text-left transition-colors ${folder === key && !quick ? 'bg-surface-container-high text-primary font-semibold' : 'text-text-body hover:bg-surface-container-low'}`}>
      <span className="flex items-center gap-2 min-w-0"><span className={`material-symbols-outlined text-[18px] ${folder === key && !quick ? 'text-primary' : 'text-outline'}`}>{folder === key && !quick ? 'folder_open' : icon}</span><span className="font-body-sm text-body-sm truncate font-mono">{label}</span></span>
      <span className="font-label-badge text-label-badge text-outline">{n}</span>
    </button>
  );
  const quickBtn = (key: string, icon: string, label: string, n: number | null) => (
    <button key={key} type="button" disabled={n === null} onClick={() => { setQuick(quick === key ? '' : key); setFolder(''); }} className={`w-full flex items-center justify-between gap-2 px-2 py-1.5 rounded-lg text-left transition-colors ${quick === key ? 'bg-surface-container-high text-primary font-semibold' : n === null ? 'text-outline cursor-not-allowed' : 'text-text-body hover:bg-surface-container-low'}`}>
      <span className="flex items-center gap-2"><span className="material-symbols-outlined text-[18px]">{icon}</span><span className="font-body-sm text-body-sm">{label}</span></span>
      {n === null ? <span className="font-label-badge text-[10px] uppercase">Faza 2</span> : <span className="font-label-badge text-label-badge text-outline">{n}</span>}
    </button>
  );

  return (
    <>
      <PageTitle kicker="Dokumenti i datoteke" crumbs={['Dokumenti i datoteke', 'Centralni repozitorij']} title="Repozitorij dokumenata i datoteka" badge={<span className="px-2 py-0.5 rounded bg-surface-container-high text-on-primary-fixed-variant font-label-badge text-label-badge uppercase">MTTO HNK</span>}>
        <a href="/admin/korisnici#audit" className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-container-low hover:bg-surface-container text-text-heading font-button text-button transition-colors"><span className="material-symbols-outlined text-[18px]">verified_user</span><span>Sigurnosni audit</span></a>
        <button type="button" disabled title="Sinkronizacija s e-pisarnicom: Faza 2" className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-container-low text-outline font-button text-button cursor-not-allowed"><span className="material-symbols-outlined text-[18px]">sync</span><span>Sinkronizacija s e-pisarnicom</span></button>
        <button type="button" onClick={() => fileInput.current?.click()} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary hover:bg-institutional-navy-deep text-on-primary font-button text-button shadow-sm transition-colors"><span className="material-symbols-outlined text-[18px]">upload_file</span><span>Učitaj novu datoteku</span></button>
      </PageTitle>

      <div className="flex flex-col gap-space-lg">
        <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-space-md">
          <div className="flex items-center gap-4 w-full lg:w-1/4">
            <div className="relative w-14 h-14 flex items-center justify-center shrink-0 rounded-full" style={{ background: `conic-gradient(#234696 ${pct * 3.6}deg, #e6eaf2 0)` }}><div className="w-11 h-11 rounded-full bg-surface-container-lowest flex items-center justify-center font-label-badge text-label-badge text-primary">{pct < 1 ? '<1' : pct.toFixed(0)}%</div></div>
            <div className="flex flex-col min-w-0"><span className={kick}>Iskorišteni prostor</span><span className="font-title-md text-title-md text-text-heading font-bold">{fileSize(total)} / 1 GB</span><span className="font-body-sm text-body-sm text-outline">PostgreSQL · Render</span></div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-4 w-full lg:w-1/2 bg-surface-container-low px-4 py-2.5 rounded-lg">
            <div className="flex flex-col"><span className={kick}>Ukupno spisa</span><span className="font-headline-sm text-headline-sm text-text-heading font-bold">{all?.length ?? '–'}</span></div>
            <div className="h-8 w-px bg-slate-border" />
            {[['PDF formati', ['PDF'], 'bg-error'], ['DOCX obrasci', ['DOC', 'DOCX'], 'bg-primary-container'], ['XLSX tablice', ['XLS', 'XLSX'], 'bg-secondary']].map(([l, e, c]) => (
              <div key={l as string} className="flex items-center gap-2"><span className={`w-2.5 h-2.5 rounded-full ${c}`} /><div className="flex flex-col"><span className="font-body-sm text-[12px] text-outline">{l as string}</span><span className="font-button text-button font-bold text-text-heading">{byExt(e as string[])}</span></div></div>
            ))}
          </div>
          <div className="flex items-center gap-3 w-full lg:w-1/4 bg-emerald-light px-4 py-2.5 rounded-lg">
            <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center shrink-0"><span className="material-symbols-outlined text-on-secondary-container">workspace_premium</span></div>
            <div className="flex flex-col"><span className="font-button text-button font-bold text-on-secondary-container flex items-center gap-1">Kvalificirani e-pečat <F2Badge /></span><span className="font-body-sm text-[12px] text-on-secondary-container">Provjera PDF potpisa pri učitavanju</span></div>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-space-lg items-start">
          <div className="col-span-12 lg:col-span-3 flex flex-col gap-space-md lg:sticky lg:top-20">
            <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-1">
              <div className="flex items-center justify-between pb-space-xs"><span className="font-title-md text-title-md text-text-heading font-bold">Struktura repozitorija</span><span className="material-symbols-outlined text-outline text-[18px]">account_tree</span></div>
              {folderBtn('', 'Svi dokumenti (root)', all?.length ?? 0, 'folder_open')}
              <div className="pl-3 flex flex-col gap-0.5 border-l border-surface-container ml-3">{FOLDERS.map(([k, l]) => folderBtn(k, l, (all ?? []).filter((d) => d.docType === k).length))}</div>
            </div>
            <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-1">
              <span className={`${kick} pb-space-xs`}>Brzi filtri</span>
              {quickBtn('recent', 'schedule', 'Nedavno učitano', (all ?? []).filter((d) => new Date(d.createdAt).getTime() > weekAgo).length)}
              {quickBtn('public', 'public', 'Javno u biblioteci propisa', (all ?? []).filter((d) => d.status === 'VAZECI' && !d.postId && !d.permitId).length)}
              {quickBtn('archive', 'inventory_2', 'Arhivirano', (all ?? []).filter((d) => d.status === 'ARHIVIRAN').length)}
              {quickBtn('sign', 'draw', 'Čeka e-potpis', null)}
            </div>
            <div className="bg-surface-container-low rounded-xl p-space-md flex gap-space-sm">
              <span className="material-symbols-outlined text-primary">policy</span>
              <div><h4 className="font-button text-button font-bold text-text-heading">Pravila arhiviranja</h4><p className="font-body-sm text-body-sm text-outline">Svaka datoteka dobija SHA-256 sažetak i vremenski žig. Svako učitavanje i brisanje bilježi se u dnevnik revizije.</p></div>
            </div>
          </div>

          <div className="col-span-12 lg:col-span-9 flex flex-col gap-space-md">
            <div className="bg-surface-container-lowest rounded-xl p-space-sm shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-space-sm">
              <div className="flex items-center gap-2 px-2 font-mono text-body-sm text-outline min-w-0"><span className="material-symbols-outlined text-[18px] text-primary">folder</span><span className="truncate">/ {folder ? FOLDERS.find(([k]) => k === folder)?.[1] : quick ? 'brzi filtar' : 'root'}</span><span className="font-label-badge text-label-badge px-2 py-0.5 rounded bg-surface-container text-primary shrink-0">{rows.length} spisa</span></div>
              <div className="relative flex items-center md:w-80"><span className="material-symbols-outlined absolute left-3 text-outline text-[18px]">search</span><input className={`${field} pl-9`} placeholder="Pretraži po nazivu datoteke..." value={q} onChange={(e) => setQ(e.target.value)} /></div>
            </div>

            <form onSubmit={upload}
              onDragOver={(e) => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)} onDrop={(e) => { e.preventDefault(); setDrag(false); pick(e.dataTransfer.files?.[0]); }}
              className={`rounded-xl border-2 border-dashed transition-colors ${drag ? 'border-neretva-cyan bg-neretva-cyan-light' : 'border-outline-variant bg-surface-container-lowest'} ${file ? 'p-space-md' : 'p-space-lg'}`}>
              <input ref={fileInput} type="file" className="hidden" accept=".pdf,.doc,.docx,.xls,.xlsx" onChange={(e) => { pick(e.target.files?.[0]); e.target.value = ''; }} />
              {!file ? (
                <button type="button" onClick={() => fileInput.current?.click()} className="w-full flex flex-col items-center gap-1 text-center">
                  <span className="material-symbols-outlined text-[36px] text-primary-container">cloud_upload</span>
                  <span className="font-button text-button text-text-heading">Povucite datoteku ovdje ili kliknite za odabir s računala</span>
                  <span className="font-body-sm text-body-sm text-outline">PDF, DOC, DOCX, XLS, XLSX do 10 MB. Sadržaj datoteke se provjerava prije objave.</span>
                </button>
              ) : (
                <div className="flex flex-col gap-space-sm">
                  <div className="flex items-center gap-3"><span className={`w-10 h-10 rounded-lg flex items-center justify-center font-label-badge text-[11px] font-bold ${EXT_CLS[fileExt(file.name)] ?? 'bg-surface-container-high text-primary'}`}>{fileExt(file.name)}</span><div className="flex-1 min-w-0"><p className="font-button text-button font-bold text-text-heading truncate">{file.name}</p><p className="font-body-sm text-body-sm text-outline">{fileSize(file.size)} · spremno za učitavanje</p></div><button type="button" onClick={() => setFile(null)} className="p-2 rounded-lg text-outline hover:text-error"><span className="material-symbols-outlined">close</span></button></div>
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-space-sm">
                    <label className="md:col-span-6 flex flex-col gap-1"><span className={kick}>Naziv dokumenta *</span><input required className={field} value={meta.title} onChange={(e) => setMeta({ ...meta, title: e.target.value })} /></label>
                    <label className="md:col-span-3 flex flex-col gap-1"><span className={kick}>Mapa / vrsta</span><select className={field} value={meta.docType} onChange={(e) => setMeta({ ...meta, docType: e.target.value })}>{Object.entries(DOC_TYPE).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></label>
                    <label className="md:col-span-3 flex flex-col gap-1"><span className={kick}>Resor</span><select className={field} value={meta.sector} onChange={(e) => setMeta({ ...meta, sector: e.target.value })}>{SECTORS.map((s) => <option key={s}>{s}</option>)}</select></label>
                    <label className="md:col-span-4 flex flex-col gap-1"><span className={kick}>Broj akta / glasnika</span><input className={field} value={meta.number} onChange={(e) => setMeta({ ...meta, number: e.target.value })} placeholder="npr. SN HNK 6/12" /></label>
                    <label className="md:col-span-3 flex flex-col gap-1"><span className={kick}>Datum</span><input type="date" className={field} value={meta.issuedAt} onChange={(e) => setMeta({ ...meta, issuedAt: e.target.value })} /></label>
                    <label className="md:col-span-2 flex flex-col gap-1"><span className={kick}>Status</span><select className={field} value={meta.status} onChange={(e) => setMeta({ ...meta, status: e.target.value })}><option value="VAZECI">Važeći</option><option value="ARHIVIRAN">Arhiviran</option></select></label>
                    <div className="md:col-span-3 flex items-end"><button disabled={busy} className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary hover:bg-institutional-navy-deep text-on-primary font-button text-button shadow-sm disabled:opacity-50"><span className="material-symbols-outlined text-[18px]">publish</span>{busy ? 'Učitavanje…' : 'Objavi dokument'}</button></div>
                  </div>
                </div>
              )}
            </form>

            <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[860px]">
                  <thead><tr className="bg-surface-container-low text-outline font-label-kicker text-[11px] uppercase tracking-wider">{['Naziv datoteke i format', 'Kategorija', 'Veličina', 'Zadnja izmjena', 'Dijeljenje', ''].map((h) => <th key={h} className="p-space-md">{h}</th>)}</tr></thead>
                  <tbody>
                    {all === null && <tr><td colSpan={6} className="p-space-lg"><div className="h-20 rounded-lg bg-surface-container-low animate-pulse" /></td></tr>}
                    {all && rows.length === 0 && <tr><td colSpan={6} className="p-space-lg text-center text-outline">Nema dokumenata u ovoj mapi.</td></tr>}
                    {rows.map((d) => (
                      <Fragment key={d.id}>
                        <tr className="hover:bg-surface-container-low/60 transition-colors group">
                          <td className="p-space-md">
                            <div className="flex items-center gap-3">
                              <span className={`w-10 h-10 shrink-0 rounded-lg flex items-center justify-center font-label-badge text-[11px] font-bold ${EXT_CLS[fileExt(d.fileName)] ?? 'bg-surface-container-high text-primary'}`}>{fileExt(d.fileName)}</span>
                              <div className="min-w-0"><span className="block font-button text-button font-bold text-text-heading line-clamp-2 min-w-[220px]">{d.title}</span><span className="font-mono text-[12px] text-outline line-clamp-1">{d.fileName}{d.number ? ` • ${d.number}` : ''}</span>{d.isDemo && <span className="inline-flex font-label-badge text-[10px] text-[#786000] bg-herzeg-gold-soft px-1.5 rounded uppercase">Demo</span>}</div>
                            </div>
                          </td>
                          <td className="p-space-md"><span className="font-label-badge text-label-badge px-2 py-0.5 rounded bg-surface-container text-primary uppercase">{DOC_TYPE[d.docType] ?? d.docType}</span><span className="block font-body-sm text-[12px] text-outline mt-0.5">{d.sector} · {d.postId ? 'prilog objave' : d.permitId ? 'dosje dozvole' : 'biblioteka'}</span></td>
                          <td className="p-space-md font-mono text-body-sm whitespace-nowrap">{fileSize(d.size)}</td>
                          <td className="p-space-md font-mono text-body-sm text-outline whitespace-nowrap">{dateTime(d.createdAt)}</td>
                          <td className="p-space-md">{d.status === 'VAZECI' ? <span className="inline-flex items-center gap-1 font-label-badge text-label-badge text-secondary"><span className="material-symbols-outlined text-[16px]">globe</span>Javno na portalu</span> : <span className="inline-flex items-center gap-1 font-label-badge text-label-badge text-outline"><span className="material-symbols-outlined text-[16px]">inventory_2</span>Arhivirano</span>}<span className="block font-body-sm text-[12px] text-outline">{d.downloads} preuzimanja</span></td>
                          <td className="p-space-md text-right">
                            <div className="flex gap-1 justify-end">
                              <a href={`/api/documents/${d.id}/file`} target="_blank" rel="noopener" className="p-1.5 rounded-lg text-outline hover:text-primary hover:bg-surface-container" title="Preuzmi"><span className="material-symbols-outlined text-[19px]">download</span></a>
                              <button type="button" onClick={() => setEdit(edit?.id === d.id ? null : { id: d.id, title: d.title, docType: d.docType, sector: d.sector, number: d.number ?? '', issuedAt: d.issuedAt?.slice(0, 10) ?? '', status: d.status, description: '' })} className="p-1.5 rounded-lg text-outline hover:text-primary hover:bg-surface-container" title="Uredi metapodatke"><span className="material-symbols-outlined text-[19px]">edit</span></button>
                              <button type="button" onClick={() => remove(d)} className="p-1.5 rounded-lg text-outline hover:text-error hover:bg-error-container/40" title="Obriši"><span className="material-symbols-outlined text-[19px]">delete</span></button>
                            </div>
                          </td>
                        </tr>
                        {edit?.id === d.id && (
                          <tr className="bg-surface-container-low/60">
                            <td colSpan={6} className="p-space-md">
                              <form onSubmit={saveEdit} className="grid grid-cols-1 md:grid-cols-12 gap-space-sm items-end">
                                <label className="md:col-span-4 flex flex-col gap-1"><span className={kick}>Naziv</span><input required className={field} value={edit.title} onChange={(e) => setEdit({ ...edit, title: e.target.value })} /></label>
                                <label className="md:col-span-2 flex flex-col gap-1"><span className={kick}>Vrsta</span><select className={field} value={edit.docType} onChange={(e) => setEdit({ ...edit, docType: e.target.value })}>{Object.entries(DOC_TYPE).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></label>
                                <label className="md:col-span-2 flex flex-col gap-1"><span className={kick}>Broj akta</span><input className={field} value={edit.number} onChange={(e) => setEdit({ ...edit, number: e.target.value })} /></label>
                                <label className="md:col-span-2 flex flex-col gap-1"><span className={kick}>Status</span><select className={field} value={edit.status} onChange={(e) => setEdit({ ...edit, status: e.target.value })}><option value="VAZECI">Važeći</option><option value="ARHIVIRAN">Arhiviran</option></select></label>
                                <div className="md:col-span-2 flex gap-1"><button className="flex-1 px-3 py-2 rounded-lg bg-primary text-on-primary font-button text-button">Spremi</button><button type="button" onClick={() => setEdit(null)} className="px-3 py-2 rounded-lg bg-surface-container text-text-heading font-button text-button">Odustani</button></div>
                              </form>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
      {toast.node}
    </>
  );
}
