'use client';
import { useEffect, useRef, useState } from 'react';
import { adminFetch } from '@/lib/adminApi';
import { Card, Field, PageTitle, btnPrimary, input, useToast } from '@/components/admin/ui';
import { DOC_TYPE, dateShort, fileExt, fileSize } from '@/lib/format';

type Doc = { id: string; title: string; docType: string; sector: string; number: string | null; issuedAt: string | null; status: string; fileName: string; mimeType: string; size: number; downloads: number; postId: string | null; permitId: string | null; createdAt: string; isDemo: boolean };
const SECTORS = ['Turizam i ugostiteljstvo', 'Zaštita okoliša', 'Trgovina', 'Opće'];
const EMPTY = { title: '', docType: 'ZAKON', sector: 'Opće', number: '', issuedAt: '', status: 'VAZECI', description: '' };

export default function DocumentsAdmin() {
  const [rows, setRows] = useState<Doc[]>([]);
  const [filter, setFilter] = useState('');
  const [q, setQ] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [meta, setMeta] = useState(EMPTY);
  const [busy, setBusy] = useState(false);
  const [drag, setDrag] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const toast = useToast();

  const load = () => adminFetch<Doc[]>(`/admin/documents?${new URLSearchParams({ ...(filter ? { docType: filter } : {}), ...(q ? { q } : {}) })}`).then(setRows).catch((e) => toast.err(e.message));
  useEffect(() => { load(); }, [filter]); // eslint-disable-line react-hooks/exhaustive-deps

  function pick(f: File | undefined) {
    if (!f) return;
    if (f.size > 10 * 1024 * 1024) { toast.err('Datoteka je veća od 10 MB'); return; }
    setFile(f);
    setMeta((m) => ({ ...m, title: m.title || f.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ') }));
  }

  async function upload(e: React.FormEvent) {
    e.preventDefault();
    if (!file) { toast.err('Odaberite datoteku'); return; }
    setBusy(true);
    const fd = new FormData();
    fd.append('file', file);
    Object.entries(meta).forEach(([k, v]) => v && fd.append(k, v));
    try {
      await adminFetch('/admin/documents', { method: 'POST', body: fd });
      toast.ok('Dokument je objavljen u biblioteci propisa');
      setFile(null);
      setMeta(EMPTY);
      load();
    } catch (e: any) {
      toast.err(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function remove(d: Doc) {
    if (!confirm(`Obrisati dokument „${d.title}”?`)) return;
    try { await adminFetch(`/admin/documents/${d.id}`, { method: 'DELETE' }); toast.ok('Dokument obrisan'); load(); } catch (e: any) { toast.err(e.message); }
  }

  const total = rows.reduce((s, r) => s + r.size, 0);

  return (
    <>
      <PageTitle kicker="Službeni digitalni arhiv" title="Repozitorij dokumenata i datoteka" />
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-space-lg items-start">
        <form onSubmit={upload} className="xl:col-span-4 space-y-space-md xl:sticky xl:top-20">
          <Card className="p-space-md md:p-space-lg space-y-space-md">
            <h2 className="font-title-md text-title-md font-bold text-text-heading flex items-center gap-2"><span className="material-symbols-outlined text-mtto-primary">upload_file</span>Učitaj novi dokument</h2>
            <div
              onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
              onDragLeave={() => setDrag(false)}
              onDrop={(e) => { e.preventDefault(); setDrag(false); pick(e.dataTransfer.files?.[0]); }}
              onClick={() => fileInput.current?.click()}
              className={`cursor-pointer rounded-lg border-2 border-dashed p-space-lg text-center transition-colors ${drag ? 'border-neretva-cyan bg-neretva-cyan-light' : 'border-[#cbd5e1] hover:border-mtto-primary'}`}
            >
              <span className="material-symbols-outlined text-[36px] text-mtto-primary">cloud_upload</span>
              {file ? (
                <p className="font-button text-button text-text-heading">{file.name}<span className="block font-body-sm text-[12px] text-on-surface-variant">{fileSize(file.size)}</span></p>
              ) : (
                <p className="font-body-sm text-body-sm text-on-surface-variant">Prevucite datoteku ovdje ili kliknite<br /><span className="text-[12px]">PDF, DOC, DOCX, XLS, XLSX · do 10 MB</span></p>
              )}
              <input ref={fileInput} type="file" className="hidden" accept=".pdf,.doc,.docx,.xls,.xlsx" onChange={(e) => pick(e.target.files?.[0])} />
            </div>
            <Field label="Naziv dokumenta" required><input className={input} value={meta.title} onChange={(e) => setMeta({ ...meta, title: e.target.value })} /></Field>
            <div className="grid grid-cols-2 gap-space-sm">
              <Field label="Vrsta"><select className={input} value={meta.docType} onChange={(e) => setMeta({ ...meta, docType: e.target.value })}>{Object.entries(DOC_TYPE).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></Field>
              <Field label="Status"><select className={input} value={meta.status} onChange={(e) => setMeta({ ...meta, status: e.target.value })}><option value="VAZECI">Važeći</option><option value="ARHIVIRAN">Arhiviran</option></select></Field>
            </div>
            <Field label="Resor"><select className={input} value={meta.sector} onChange={(e) => setMeta({ ...meta, sector: e.target.value })}>{SECTORS.map((s) => <option key={s}>{s}</option>)}</select></Field>
            <div className="grid grid-cols-2 gap-space-sm">
              <Field label="Broj akta"><input className={input} value={meta.number} onChange={(e) => setMeta({ ...meta, number: e.target.value })} placeholder="npr. 05-23-..." /></Field>
              <Field label="Datum"><input type="date" className={input} value={meta.issuedAt} onChange={(e) => setMeta({ ...meta, issuedAt: e.target.value })} /></Field>
            </div>
            <button className={`${btnPrimary} w-full`} disabled={busy || !file}><span className="material-symbols-outlined text-[18px]">publish</span>{busy ? 'Učitavanje…' : 'Objavi dokument'}</button>
            <p className="font-body-sm text-[12px] text-on-surface-variant flex gap-1"><span className="material-symbols-outlined text-[16px] text-eko-green">verified_user</span>Sistem provjerava format i sadržaj datoteke prije objave.</p>
          </Card>
        </form>

        <Card className="xl:col-span-8 overflow-hidden">
          <div className="p-space-md flex flex-col md:flex-row gap-space-sm md:items-center border-b border-slate-border">
            <form onSubmit={(e) => { e.preventDefault(); load(); }} className="flex-1 relative">
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-outline text-[18px]">search</span>
              <input className={`${input} pl-9`} placeholder="Pretraži spise po nazivu..." value={q} onChange={(e) => setQ(e.target.value)} />
            </form>
            <select className={`${input} md:w-48`} value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="">Sve vrste</option>
              {Object.entries(DOC_TYPE).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div className="px-space-md py-2 bg-slate-surface border-b border-slate-border font-body-sm text-[12px] text-on-surface-variant">{rows.length} datoteka · {fileSize(total)} ukupno</div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left">
              <thead><tr className="border-b-2 border-mtto-primary">{['Datoteka', 'Vrsta', 'Veza', 'Datum', 'Preuzimanja', ''].map((h) => <th key={h} className="px-space-md py-2 font-label-badge text-label-badge uppercase text-[#80807e]">{h}</th>)}</tr></thead>
              <tbody>
                {rows.map((d, i) => (
                  <tr key={d.id} className={`${i % 2 ? 'bg-slate-surface' : ''} hover:bg-[rgba(0,171,235,0.05)]`}>
                    <td className="px-space-md py-2">
                      <div className="flex items-center gap-space-sm">
                        <span className={`w-9 h-9 shrink-0 rounded flex items-center justify-center font-label-badge text-[10px] font-bold ${fileExt(d.fileName) === 'PDF' ? 'bg-error-container text-on-error-container' : 'bg-surface-container-high text-mtto-primary'}`}>{fileExt(d.fileName)}</span>
                        <span className="min-w-0"><span className="block font-button text-button font-bold text-text-heading line-clamp-1">{d.title}</span><span className="font-body-sm text-[12px] text-on-surface-variant">{fileSize(d.size)}{d.isDemo ? ' · demo' : ''}</span></span>
                      </div>
                    </td>
                    <td className="px-space-md py-2 font-body-sm text-body-sm">{DOC_TYPE[d.docType] ?? d.docType}</td>
                    <td className="px-space-md py-2 font-body-sm text-[12px] text-on-surface-variant">{d.postId ? 'Prilog objave' : d.permitId ? 'Dosje dozvole' : 'Biblioteka propisa'}</td>
                    <td className="px-space-md py-2 font-mono text-[12px]">{dateShort(d.issuedAt || d.createdAt)}</td>
                    <td className="px-space-md py-2 font-mono text-[12px]">{d.downloads}</td>
                    <td className="px-space-md py-2">
                      <div className="flex gap-1 justify-end">
                        <a href={`/api/documents/${d.id}/file`} target="_blank" rel="noopener" className="w-8 h-8 rounded bg-surface-container-high text-mtto-primary inline-flex items-center justify-center" title="Otvori"><span className="material-symbols-outlined text-[18px]">visibility</span></a>
                        <button type="button" onClick={() => remove(d)} className="w-8 h-8 rounded bg-error-container text-on-error-container inline-flex items-center justify-center" title="Obriši"><span className="material-symbols-outlined text-[18px]">delete</span></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
      {toast.node}
    </>
  );
}
