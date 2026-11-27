'use client';
import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { adminFetch, getUser, inMySectors, useCan, useSectors } from '@/lib/adminApi';
import { Badge, Card, CardHeader, EmptyState, F2Badge, Field, MetricCard, PageTitle, ProgressBar, StatusChip, btnPrimary, btnSecondary, iconBtn, input, td, th, tr, useToast } from '@/components/admin/ui';
import { AlertTriangle, Archive, Clock, ClockRewind, Download01, Edit01, Folder, FolderClosed, Globe01, Lock01, SearchLg, ShieldTick, Trash01, UploadCloud02, XClose } from '@untitledui/icons';
import { DOC_TYPE, dateShort, dateTime, fileExt, fileSize } from '@/lib/format';

type Doc = {
  id: string; title: string; docType: string; sector: string; number: string | null; issuedAt: string | null; status: string; fileName: string; mimeType: string; size: number;
  downloads: number; postId: string | null; permitId: string | null; createdAt: string; isDemo: boolean; description?: string;
  publisher?: string | null; gazette?: string | null; validFrom?: string | null; validUntil?: string | null; keywords?: string[]; language?: string;
  accessLevel?: 'JAVNO' | 'INTERNO'; replacedById?: string | null; version?: number; retentionClass?: string; retainUntil?: string | null; legalHold?: boolean;
  disposedAt?: string | null; disposalNote?: string | null; sha256?: string | null; versionCount?: number;
};
type Full = Doc & { versions: { version: number; fileName: string; size: number; sha256: string | null; userName: string; note: string | null; createdAt: string }[]; replaces: { id: string; title: string; number: string | null }[] };
const RETENTION: Record<string, string> = { TRAJNO: 'Trajno', GODINA_10: '10 godina', GODINA_5: '5 godina', GODINA_2: '2 godine' };
const DEFAULT_RETENTION: Record<string, string> = { ZAKON: 'TRAJNO', PRAVILNIK: 'TRAJNO', ODLUKA: 'TRAJNO', IZVJESTAJ: 'GODINA_10', UPUTSTVO: 'GODINA_10', OBRAZAC: 'GODINA_5', OSTALO: 'GODINA_10' };
const STATUS_OPT: [string, string][] = [['VAZECI', 'Važeći'], ['STAVLJEN_VAN_SNAGE', 'Stavljen van snage'], ['ZAMIJENJEN', 'Zamijenjen'], ['ARHIVIRAN', 'Arhiviran']];
const today = () => new Date().toISOString().slice(0, 10);
const isDue = (d: Doc) => !!d.retainUntil && d.retainUntil <= today() && !d.disposedAt && !d.legalHold;
const EMPTY = { title: '', docType: 'ZAKON', sector: 'Opće', number: '', issuedAt: '', status: 'VAZECI', description: '', accessLevel: 'JAVNO', retentionClass: '' };
const FOLDERS: [string, string][] = [['ZAKON', '01_Zakoni'], ['PRAVILNIK', '02_Pravilnici'], ['OBRAZAC', '03_Obrasci_zahtjeva'], ['ODLUKA', '04_Rjesenja_i_odluke'], ['UPUTSTVO', '05_Uputstva'], ['IZVJESTAJ', '06_Izvjestaji_i_strategije'], ['OSTALO', '07_Ostalo']];
const EXT_BG: Record<string, string> = { PDF: 'bg-[#d92d20]', DOC: 'bg-[#155eef]', DOCX: 'bg-[#155eef]', XLS: 'bg-[#079455]', XLSX: 'bg-[#079455]' };

export default function DocumentsAdmin() {
  const canEdit = useCan('dokumenti', 'write');
  const sectorList = useSectors();
  const mySectorNames = sectorList.filter((x) => x.active && inMySectors(getUser(), x.key)).map((x) => x.name);
  const [all, setAll] = useState<Doc[] | null>(null);
  const [folder, setFolder] = useState('');
  const [quick, setQuick] = useState('');
  const [q, setQ] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [meta, setMeta] = useState(EMPTY);
  const [open, setOpen] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [drag, setDrag] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const toast = useToast();

  const load = () => adminFetch<Doc[]>('/admin/documents').then(setAll).catch((e) => toast.err(e.message));
  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const weekAgo = Date.now() - 7 * 864e5;
  const rows = useMemo(() => (all ?? []).filter((d) => (!folder || d.docType === folder) && (!q || d.title.toLowerCase().includes(q.toLowerCase()) || d.fileName.toLowerCase().includes(q.toLowerCase())) && (quick !== 'recent' || new Date(d.createdAt).getTime() > weekAgo) && (quick !== 'public' || (d.status === 'VAZECI' && !d.postId && !d.permitId)) && (quick !== 'archive' || d.status === 'ARHIVIRAN') && (quick !== 'due' || isDue(d)) && (quick !== 'internal' || d.accessLevel === 'INTERNO')), [all, folder, q, quick, weekAgo]);
  const total = (all ?? []).reduce((s, r) => s + r.size, 0);
  const byExt = (e: string[]) => (all ?? []).filter((d) => e.includes(fileExt(d.fileName))).length;
  const quota = 1024 * 1024 * 1024;
  const pct = Math.min(100, (total / quota) * 100);

  function pick(f: File | undefined) {
    if (!f) return;
    if (mySectorNames.length && !mySectorNames.includes(meta.sector)) setMeta((m) => ({ ...m, sector: mySectorNames[0] }));
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
    Object.entries({ ...meta, retentionClass: meta.retentionClass || DEFAULT_RETENTION[meta.docType] }).forEach(([k, v]) => v && fd.append(k, v));
    try {
      await adminFetch('/admin/documents', { method: 'POST', body: fd });
      toast.ok('Dokument je objavljen u biblioteci propisa');
      setFile(null); setMeta(EMPTY); load();
    } catch (e: any) { toast.err(e.message); } finally { setBusy(false); }
  }
  async function remove(d: Doc) {
    if (!confirm(`Trajno obrisati dokument „${d.title}”? Ova radnja se ne može poništiti.`)) return;
    try { await adminFetch(`/admin/documents/${d.id}`, { method: 'DELETE' }); toast.ok('Dokument obrisan'); load(); } catch (e: any) { toast.err(e.message); }
  }
  const FileIcon = ({ name }: { name: string }) => { const e = fileExt(name); return <span className="relative flex h-10 w-8 shrink-0 items-end justify-center rounded-[4px] bg-white ring-1 ring-inset ring-[#d4d4d4]"><span className={`mb-1 rounded-[2px] px-0.5 text-[9px] font-bold leading-[12px] text-white ${EXT_BG[e] ?? 'bg-[#525252]'}`}>{e}</span></span>; };
  const navItem = (on: boolean) => `flex w-full items-center justify-between gap-2 rounded-[6px] px-3 py-2 text-left text-[14px] font-semibold ${on ? 'bg-[#fafafa] text-[#262626]' : 'text-[#404040] hover:bg-[#fafafa]'}`;
  const cnt = (n: number | null) => n === null ? <F2Badge /> : <span className="rounded-full bg-[#fafafa] px-2 text-[12px] leading-[18px] font-medium text-[#404040] ring-1 ring-inset ring-[#e5e5e5]">{n}</span>;
  const current = folder ? DOC_TYPE[folder] ?? folder : ({ recent: 'Nedavno učitano', public: 'Javno u biblioteci', archive: 'Arhivirano', due: 'Istekao rok čuvanja', internal: 'Interni dokumenti' } as Record<string, string>)[quick] ?? 'Svi dokumenti';
  const dueCount = (all ?? []).filter(isDue).length;

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
            {([['recent', Clock, 'Nedavno učitano', (all ?? []).filter((d) => new Date(d.createdAt).getTime() > weekAgo).length], ['public', Globe01, 'Javno u biblioteci', (all ?? []).filter((d) => d.status === 'VAZECI' && d.accessLevel !== 'INTERNO' && !d.postId && !d.permitId).length], ['internal', Lock01, 'Interni', (all ?? []).filter((d) => d.accessLevel === 'INTERNO').length], ['due', AlertTriangle, 'Istekao rok čuvanja', dueCount], ['archive', Archive, 'Arhivirano', (all ?? []).filter((d) => d.status === 'ARHIVIRAN').length]] as const).map(([k, I, l, n]) => (
              <button key={k} type="button" onClick={() => { setQuick(quick === k ? '' : k); setFolder(''); }} className={navItem(quick === k)}><span className="flex items-center gap-2"><I size={20} className="text-[#a3a3a3]" />{l}</span>{cnt(n)}</button>
            ))}
          </Card>
          <div className="rounded-[12px] bg-[#fafafa] p-4">
            <p className="flex items-center gap-2 text-[14px] font-semibold text-[#171717]"><ShieldTick size={16} className="text-[#7f56d9]" />Rokovi čuvanja</p>
            <p className="mt-1 text-[14px] leading-5 text-[#525252]">Zakoni, pravilnici i odluke čuvaju se trajno, ostalo 2 do 10 godina od prestanka važenja. Istekli rok ništa ne briše: dokument ide na listu za pregled, a izlučuje se ručno uz zapisnik komisije.</p>
            {dueCount > 0 && <button type="button" onClick={() => { setQuick('due'); setFolder(''); }} className="mt-3 text-[14px] font-semibold text-[#b54708] hover:underline">{dueCount} čeka pregled</button>}
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
                  <div className="md:col-span-3"><Field label="Resor"><select className={input} value={meta.sector} onChange={(e) => setMeta({ ...meta, sector: e.target.value })}>{(mySectorNames.length ? mySectorNames : ['Opće']).map((x) => <option key={x}>{x}</option>)}</select></Field></div>
                  <div className="md:col-span-4"><Field label="Broj akta / glasnika"><input className={input} value={meta.number} onChange={(e) => setMeta({ ...meta, number: e.target.value })} placeholder="npr. SN HNK 6/12" /></Field></div>
                  <div className="md:col-span-3"><Field label="Datum"><input type="date" className={input} value={meta.issuedAt} onChange={(e) => setMeta({ ...meta, issuedAt: e.target.value })} /></Field></div>
                  <div className="md:col-span-2"><Field label="Status"><select className={input} value={meta.status} onChange={(e) => setMeta({ ...meta, status: e.target.value })}>{STATUS_OPT.map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></Field></div>
                  <div className="md:col-span-3"><Field label="Pristup"><select className={input} value={meta.accessLevel} onChange={(e) => setMeta({ ...meta, accessLevel: e.target.value })}><option value="JAVNO">Javno na portalu</option><option value="INTERNO">Interno (samo CMS)</option></select></Field></div>
                  <div className="md:col-span-3"><Field label="Rok čuvanja"><select className={input} value={meta.retentionClass || DEFAULT_RETENTION[meta.docType]} onChange={(e) => setMeta({ ...meta, retentionClass: e.target.value })}>{Object.entries(RETENTION).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></Field></div>
                  <div className="flex items-end md:col-span-3 md:col-start-10"><button disabled={busy} className={`${btnPrimary} w-full`}><UploadCloud02 />{busy ? 'Učitavanje…' : 'Objavi'}</button></div>
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
                        <td className={td}><span className="flex flex-wrap items-center gap-1.5"><StatusChip status={d.status} />{d.accessLevel === 'INTERNO' && <Badge tone="gray"><Lock01 size={12} className="mr-1" />Interno</Badge>}{(d.version ?? 1) > 1 && <Badge tone="brand">v{d.version}</Badge>}{isDue(d) && <Badge tone="warning">Rok istekao</Badge>}{d.disposedAt && <Badge tone="gray">Izlučen</Badge>}</span></td>
                        <td className={`${td} whitespace-nowrap text-right`}>
                          {!d.disposedAt && <a href={`/api/admin/documents/${d.id}/file`} className={iconBtn} title="Preuzmi" aria-label={`Preuzmi: ${d.title}`}><Download01 /></a>}
                          {canEdit && !d.disposedAt && <button type="button" onClick={() => remove(d)} className={`${iconBtn} hover:!text-[#d92d20]`} title="Obriši (samo greške pri unosu)" aria-label={`Obriši: ${d.title}`}><Trash01 /></button>}
                          <button type="button" onClick={() => setOpen(d.id)} className={iconBtn} title="Detalji, verzije i rok čuvanja" aria-label={`Detalji: ${d.title}`}><Edit01 /></button>
                        </td>
                      </tr>
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
      {open && <DocDrawer id={open} all={all ?? []} canEdit={canEdit} onClose={() => setOpen(null)} onChanged={load} toast={toast} />}
      {toast.node}
    </>
  );
}

/** Detalji dokumenta: metapodaci, verzije datoteke, rok čuvanja i izlučivanje (F2-03). */
function DocDrawer({ id, all, canEdit, onClose, onChanged, toast }: { id: string; all: Doc[]; canEdit: boolean; onClose: () => void; onChanged: () => void; toast: ReturnType<typeof useToast> }) {
  const [d, setD] = useState<Full | null>(null);
  const [f, setF] = useState<Record<string, any>>({});
  const [busy, setBusy] = useState(false);
  const verInput = useRef<HTMLInputElement>(null);
  const admin = getUser()?.role === 'ADMIN';
  const load = () => adminFetch<Full>(`/admin/documents/${id}`).then((x) => {
    setD(x);
    setF({ title: x.title, docType: x.docType, sector: x.sector, number: x.number ?? '', issuedAt: x.issuedAt?.slice(0, 10) ?? '', status: x.status, description: x.description ?? '',
      publisher: x.publisher ?? '', gazette: x.gazette ?? '', validFrom: x.validFrom ?? '', validUntil: x.validUntil ?? '', keywords: (x.keywords ?? []).join(', '),
      accessLevel: x.accessLevel ?? 'JAVNO', retentionClass: x.retentionClass ?? 'GODINA_10', replacedById: x.replacedById ?? '' });
  }).catch((e) => toast.err(e.message));
  useEffect(() => { load(); }, [id]); // eslint-disable-line react-hooks/exhaustive-deps
  const locked = !canEdit || !!d?.disposedAt;
  const set = (k: string, v: any) => setF((s) => ({ ...s, [k]: v }));

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try { await adminFetch(`/admin/documents/${id}`, { method: 'PATCH', body: JSON.stringify(f) }); toast.ok('Metapodaci spremljeni'); load(); onChanged(); } catch (err: any) { toast.err(err.message); } finally { setBusy(false); }
  }
  async function newVersion(file: File) {
    const note = prompt('Šta je promijenjeno u novoj verziji? (upisuje se u historiju)') ?? '';
    const fd = new FormData(); fd.append('file', file); if (note) fd.append('note', note);
    setBusy(true);
    try { await adminFetch(`/admin/documents/${id}/file`, { method: 'POST', body: fd }); toast.ok('Nova verzija učitana; prethodna je sačuvana'); load(); onChanged(); } catch (err: any) { toast.err(err.message); } finally { setBusy(false); }
  }
  async function hold(v: boolean) {
    try { await adminFetch(`/admin/documents/${id}`, { method: 'PATCH', body: JSON.stringify({ legalHold: v }) }); toast.ok(v ? 'Zabrana izlučivanja postavljena' : 'Zabrana izlučivanja uklonjena'); load(); onChanged(); } catch (err: any) { toast.err(err.message); }
  }
  async function dispose() {
    const note = prompt('Izlučivanje briše datoteku i sve verzije; zapis o dokumentu ostaje. Upišite osnov (npr. broj zapisnika komisije):')?.trim();
    if (!note) return;
    try { await adminFetch(`/admin/documents/${id}/dispose`, { method: 'POST', body: JSON.stringify({ note }) }); toast.ok('Dokument je izlučen'); load(); onChanged(); } catch (err: any) { toast.err(err.message); }
  }

  const fld = (label: string, k: string, type = 'text', span = 'md:col-span-6', extra: Record<string, any> = {}) => (
    <div className={span}><Field label={label}><input type={type} className={input} value={f[k] ?? ''} onChange={(e) => set(k, e.target.value)} disabled={locked} {...extra} /></Field></div>
  );
  return (
    <>
      <div className="fixed inset-0 z-[55] bg-[#0a0d12]/70 backdrop-blur-[2px]" onClick={onClose} />
      <div role="dialog" aria-modal="true" aria-labelledby="doc-dlg" className="fixed inset-y-0 right-0 z-[56] flex w-full max-w-[720px] flex-col bg-white shadow-[0_24px_48px_-12px_rgba(10,13,18,0.18)]">
        <div className="flex items-start justify-between gap-4 border-b border-[#e5e5e5] px-6 py-5">
          <div className="min-w-0"><h2 id="doc-dlg" className="truncate text-[18px] font-semibold leading-7 text-[#171717]">{d?.title ?? 'Dokument'}</h2>
            {d && <p className="text-[14px] text-[#525252]">{d.fileName} · {fileSize(d.size)} · verzija {d.version ?? 1}{d.sha256 ? ` · sha256 ${d.sha256.slice(0, 12)}…` : ''}</p>}</div>
          <button type="button" className={iconBtn} aria-label="Zatvori" onClick={onClose}><XClose /></button>
        </div>
        {!d ? <div className="m-6 h-64 animate-pulse rounded-[12px] bg-[#f5f5f5]" /> : (
          <div className="flex-1 space-y-8 overflow-y-auto px-6 py-6">
            {d.disposedAt && <p className="flex items-start gap-2 rounded-[8px] bg-[#fafafa] p-3 text-[14px] text-[#404040] ring-1 ring-inset ring-[#e5e5e5]"><Archive size={20} className="shrink-0 text-[#737373]" />Izlučen {dateTime(d.disposedAt)}. Osnov: {d.disposalNote}. Datoteka je obrisana, zapis ostaje.</p>}
            <form id="doc-meta" onSubmit={save} className="grid gap-4 md:grid-cols-12">
              {fld('Naziv', 'title', 'text', 'md:col-span-12', { required: true })}
              <div className="md:col-span-4"><Field label="Vrsta"><select className={input} value={f.docType} disabled={locked} onChange={(e) => set('docType', e.target.value)}>{Object.entries(DOC_TYPE).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></Field></div>
              <div className="md:col-span-4"><Field label="Status"><select className={input} value={f.status} disabled={locked} onChange={(e) => set('status', e.target.value)}>{STATUS_OPT.map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></Field></div>
              <div className="md:col-span-4"><Field label="Pristup"><select className={input} value={f.accessLevel} disabled={locked} onChange={(e) => set('accessLevel', e.target.value)}><option value="JAVNO">Javno na portalu</option><option value="INTERNO">Interno (samo CMS)</option></select></Field></div>
              {fld('Broj akta', 'number', 'text', 'md:col-span-4')}
              {fld('Službeno glasilo', 'gazette', 'text', 'md:col-span-4', { placeholder: 'npr. SN HNK 6/2024' })}
              {fld('Izdavač / donosilac', 'publisher', 'text', 'md:col-span-4', { placeholder: 'npr. Skupština HNK' })}
              {fld('Datum donošenja', 'issuedAt', 'date', 'md:col-span-4')}
              {fld('Važi od', 'validFrom', 'date', 'md:col-span-4')}
              {fld('Važi do', 'validUntil', 'date', 'md:col-span-4')}
              {fld('Ključne riječi (odvojene zarezom)', 'keywords', 'text', 'md:col-span-12', { placeholder: 'turizam, boravišna taksa, kategorizacija' })}
              <div className="md:col-span-12"><Field label="Zamijenjen dokumentom" hint="Postavlja status Zamijenjen"><select className={input} value={f.replacedById} disabled={locked} onChange={(e) => set('replacedById', e.target.value)}><option value="">—</option>{all.filter((x) => x.id !== d.id && !x.disposedAt).map((x) => <option key={x.id} value={x.id}>{x.title}{x.number ? ` (${x.number})` : ''}</option>)}</select></Field></div>
              <div className="md:col-span-12"><Field label="Opis"><textarea className={input} rows={3} value={f.description} disabled={locked} onChange={(e) => set('description', e.target.value)} /></Field></div>
              {d.replaces.length > 0 && <p className="md:col-span-12 text-[14px] text-[#525252]">Ovaj dokument zamjenjuje: {d.replaces.map((r) => r.title).join(', ')}</p>}
            </form>

            <section>
              <div className="mb-3 flex items-center justify-between gap-3"><h3 className="text-[16px] font-semibold text-[#171717]">Datoteka i verzije</h3>
                {!locked && <><button type="button" className={btnSecondary} disabled={busy} onClick={() => verInput.current?.click()}><UploadCloud02 />Nova verzija</button><input ref={verInput} type="file" className="hidden" accept=".pdf,.doc,.docx,.xls,.xlsx" onChange={(e) => { const x = e.target.files?.[0]; if (x) newVersion(x); e.target.value = ''; }} /></>}</div>
              <ol className="divide-y divide-[#e5e5e5] rounded-[12px] ring-1 ring-inset ring-[#e5e5e5]">
                <li className="flex items-center gap-3 px-4 py-3"><Badge tone="success">v{d.version ?? 1} · trenutna</Badge><span className="min-w-0 flex-1 truncate text-[14px] text-[#404040]">{d.fileName}</span>{!d.disposedAt && <a className={iconBtn} href={`/api/admin/documents/${d.id}/file`} aria-label="Preuzmi trenutnu verziju"><Download01 /></a>}</li>
                {d.versions.map((v) => (
                  <li key={v.version} className="flex items-center gap-3 px-4 py-3"><Badge tone="gray">v{v.version}</Badge>
                    <span className="min-w-0 flex-1"><span className="block truncate text-[14px] text-[#404040]">{v.fileName} · {fileSize(v.size)}</span><span className="block text-[12px] text-[#525252]">Zamijenio/la {v.userName}, {dateTime(v.createdAt)}{v.note ? ` · ${v.note}` : ''}</span></span>
                    <a className={iconBtn} href={`/api/admin/documents/${d.id}/versions/${v.version}/file`} aria-label={`Preuzmi verziju ${v.version}`}><Download01 /></a></li>
                ))}
              </ol>
            </section>

            <section>
              <h3 className="mb-3 text-[16px] font-semibold text-[#171717]">Rok čuvanja</h3>
              <div className="grid gap-4 md:grid-cols-12">
                <div className="md:col-span-6"><Field label="Klasa čuvanja"><select className={input} form="doc-meta" value={f.retentionClass} disabled={locked} onChange={(e) => set('retentionClass', e.target.value)}>{Object.entries(RETENTION).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></Field></div>
                <div className="md:col-span-6"><p className="text-[14px] font-medium text-[#404040]">Čuva se do</p><p className="mt-2 text-[16px] font-semibold text-[#171717]">{d.retentionClass === 'TRAJNO' ? 'Trajno' : d.retainUntil ? dateShort(d.retainUntil) : '—'}</p><p className="text-[12px] text-[#525252]">Od datuma „Važi do“, inače od datuma donošenja.</p></div>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                {d.legalHold ? <Badge tone="error"><Lock01 size={12} className="mr-1" />Zabrana izlučivanja</Badge> : null}
                {admin && !d.disposedAt && <button type="button" className={btnSecondary} onClick={() => hold(!d.legalHold)}>{d.legalHold ? 'Ukloni zabranu izlučivanja' : 'Zabrani izlučivanje (spor, revizija)'}</button>}
                {canEdit && isDue(d) && <button type="button" className={`${btnSecondary} !text-[#b42318] [&_svg]:!text-[#d92d20]`} onClick={dispose}><ClockRewind />Izluči dokument</button>}
              </div>
            </section>
          </div>
        )}
        {d && !locked && <div className="flex justify-end gap-3 border-t border-[#e5e5e5] px-6 py-4"><button type="button" className={btnSecondary} onClick={onClose}>Zatvori</button><button form="doc-meta" className={btnPrimary} disabled={busy}>Spremi metapodatke</button></div>}
      </div>
    </>
  );
}
