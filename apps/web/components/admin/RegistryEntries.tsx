'use client';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { adminFetch } from '@/lib/adminApi';
import { type RegEntry, type RegField, type Registry, listFields, show, titleOf } from '@/lib/registry';
import { dateShort, dateTime } from '@/lib/format';
import { Badge, Card, EmptyState, Field, btnDanger, btnPrimary, btnSecondary, iconBtn, input, td, th, tr, type useToast } from '@/components/admin/ui';
import { Archive, Database01, Edit01, LinkExternal01, MarkerPin02, Plus, SearchLg, Trash01, XClose } from '@untitledui/icons';

const LocationPicker = dynamic(() => import('@/components/admin/LocationPicker'), { ssr: false, loading: () => <div className="h-[260px] rounded-lg bg-[#f5f5f5] animate-pulse" /> });

type Page = { items: RegEntry[]; total: number; page: number; limit: number };

export default function RegistryEntries({ reg, canEdit, canDelete, toast, onChanged }: { reg: Registry; canEdit: boolean; canDelete: boolean; toast: ReturnType<typeof useToast>; onChanged: () => void }) {
  const [res, setRes] = useState<Page | null>(null);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('AKTIVAN');
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState<RegEntry | 'new' | null>(null);
  const cols = listFields(reg.fields);

  const load = () => {
    const p = new URLSearchParams({ page: String(page), limit: '50' });
    if (q) p.set('q', q);
    if (status) p.set('status', status);
    return adminFetch<Page>(`/admin/registries/${reg.id}/entries?${p}`).then(setRes).catch((e) => toast.err(e.message));
  };
  useEffect(() => { const t = setTimeout(load, q ? 250 : 0); return () => clearTimeout(t); }, [q, status, page, reg.id]); // eslint-disable-line react-hooks/exhaustive-deps
  const pages = res ? Math.max(1, Math.ceil(res.total / res.limit)) : 1;

  return (
    <>
      <Card className="overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-[#e5e5e5] px-4 py-4 md:flex-row md:items-center md:px-6">
          <label className="relative flex-1"><span className="sr-only">Pretraga zapisa</span><SearchLg size={20} className="pointer-events-none absolute left-3 top-2.5 text-[#a3a3a3]" />
            <input className={`${input} pl-10`} value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder={`Pretraga: ${reg.fields.filter((f) => f.search || f.unique || f.key === reg.titleField).map((f) => f.label.toLowerCase()).slice(0, 3).join(', ')}`} /></label>
          <select aria-label="Status zapisa" className={`${input} md:w-[180px]`} value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
            <option value="AKTIVAN">Aktivni</option><option value="ARHIVIRAN">Arhivirani</option><option value="">Svi</option>
          </select>
          {canEdit && <button type="button" className={btnPrimary} onClick={() => setOpen('new')}><Plus />Novi zapis</button>}
        </div>
        {!res ? <div className="m-6 h-48 animate-pulse rounded-[12px] bg-[#f5f5f5]" /> : res.items.length === 0 ? (
          <EmptyState icon={Database01} title={q ? 'Nema zapisa za ovu pretragu' : 'Registar još nema zapisa'}>{canEdit && !q ? 'Dodajte prvi zapis ili uvezite postojeću evidenciju iz Excela (kartica Uvoz CSV).' : null}</EmptyState>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr>{cols.map((f) => <th key={f.key} className={`${th} ${['number', 'integer'].includes(f.type) ? 'text-right' : ''}`}>{f.label}</th>)}<th className={th}>Izmijenjeno</th><th className={th}><span className="sr-only">Radnje</span></th></tr></thead>
              <tbody>
                {res.items.map((e) => (
                  <tr key={e.id} className={tr}>
                    {cols.map((f, i) => (
                      <td key={f.key} className={`${td} ${i === 0 ? 'min-w-[260px] font-medium text-[#171717]' : 'whitespace-nowrap'} ${['number', 'integer'].includes(f.type) ? 'text-right tabular-nums' : ''}`}>
                        {i === 0 ? <button type="button" className="text-left hover:underline" onClick={() => setOpen(e)}>{show(f, e.data[f.key])}</button> : show(f, e.data[f.key])}
                        {i === 0 && reg.geo && e.lat != null && <MarkerPin02 size={14} aria-label="Na karti" className="ml-1.5 inline text-[#a3a3a3]" />}
                        {i === 0 && e.isDemo && <Badge tone="warning" className="ml-2">Demo</Badge>}
                        {i === 0 && e.status === 'ARHIVIRAN' && <Badge tone="gray" className="ml-2">Arhiviran</Badge>}
                      </td>
                    ))}
                    
                    <td className={`${td} whitespace-nowrap`}>{dateShort(e.updatedAt)}</td>
                    <td className={`${td} text-right whitespace-nowrap`}>
                      {reg.public && e.status === 'AKTIVAN' && <a className={iconBtn} href={`/registri/${reg.slug}/${e.id}`} target="_blank" rel="noopener" title="Javni prikaz"><LinkExternal01 /></a>}
                      <button type="button" className={iconBtn} title={canEdit ? 'Uredi' : 'Pregled'} onClick={() => setOpen(e)}><Edit01 /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {res && res.total > res.limit && (
          <div className="flex items-center justify-between border-t border-[#e5e5e5] px-6 py-3 text-[14px] text-[#525252]">
            <span>Stranica {page} od {pages} · {res.total} zapisa</span>
            <span className="flex gap-2"><button type="button" className={btnSecondary} disabled={page <= 1} onClick={() => setPage(page - 1)}>Prethodna</button><button type="button" className={btnSecondary} disabled={page >= pages} onClick={() => setPage(page + 1)}>Sljedeća</button></span>
          </div>
        )}
      </Card>
      {open && <EntryDrawer reg={reg} entry={open === 'new' ? null : open} canEdit={canEdit} canDelete={canDelete} toast={toast} onClose={() => setOpen(null)} onSaved={() => { setOpen(null); load(); onChanged(); }} />}
    </>
  );
}

function EntryDrawer({ reg, entry, canEdit, canDelete, toast, onClose, onSaved }: { reg: Registry; entry: RegEntry | null; canEdit: boolean; canDelete: boolean; toast: ReturnType<typeof useToast>; onClose: () => void; onSaved: () => void }) {
  const [data, setData] = useState<Record<string, any>>(() => {
    const d: Record<string, any> = {};
    for (const f of reg.fields) { const v = entry?.data[f.key]; d[f.key] = v === undefined || v === null ? '' : f.type === 'boolean' ? (v ? 'da' : 'ne') : String(v); }
    return d;
  });
  const [lat, setLat] = useState<number | null>(entry?.lat ?? null);
  const [lng, setLng] = useState<number | null>(entry?.lng ?? null);
  const [errs, setErrs] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const locked = !canEdit;

  useEffect(() => { const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose(); window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k); }, [onClose]);

  async function call(body: any, msg: string) {
    setBusy(true); setErrs({});
    try {
      await adminFetch(entry ? `/admin/registries/${reg.id}/entries/${entry.id}` : `/admin/registries/${reg.id}/entries`, { method: entry ? 'PATCH' : 'POST', body: JSON.stringify(body) });
      toast.ok(msg); onSaved();
    } catch (e: any) {
      // greške po polju (INVALID_ENTRY) prikazuju se uz polja
      const m: Record<string, string> = {};
      for (const part of String(e.message).split('; ')) { const f = reg.fields.find((x) => part.startsWith(`${x.label}:`)); if (f) m[f.key] = part.slice(f.label.length + 1).trim(); }
      setErrs(m); toast.err(Object.keys(m).length ? 'Provjerite označena polja' : e.message);
    } finally { setBusy(false); }
  }
  const save = (e: React.FormEvent) => { e.preventDefault(); call({ data, ...(reg.geo ? { lat, lng } : {}) }, entry ? 'Zapis spremljen' : reg.public ? 'Zapis dodan i vidljiv na portalu' : 'Zapis dodan'); };
  async function del() {
    if (!entry || !confirm('Trajno obrisati zapis? Za uklanjanje s portala uz čuvanje historije koristite Arhiviraj.')) return;
    try { await adminFetch(`/admin/registries/${reg.id}/entries/${entry.id}`, { method: 'DELETE' }); toast.ok('Zapis obrisan'); onSaved(); } catch (e: any) { toast.err(e.message); }
  }

  const control = (f: RegField) => {
    const p = { id: `f-${f.key}`, className: `${input} ${errs[f.key] ? 'border-[#fda29b] ring-1 ring-[#fda29b]' : ''}`, value: data[f.key] ?? '', disabled: locked, required: f.required, 'aria-invalid': !!errs[f.key] || undefined, onChange: (e: any) => setData((d) => ({ ...d, [f.key]: e.target.value })) };
    switch (f.type) {
      case 'longtext': return <textarea {...p} rows={3} />;
      case 'select': return <select {...p}><option value="">—</option>{f.options?.map((o) => <option key={o}>{o}</option>)}</select>;
      case 'boolean': return <select {...p}><option value="">—</option><option value="da">Da</option><option value="ne">Ne</option></select>;
      case 'date': return <input {...p} type="date" />;
      case 'integer': return <input {...p} type="number" step={1} inputMode="numeric" />;
      case 'number': return <input {...p} type="number" step="any" inputMode="decimal" />;
      case 'url': return <input {...p} type="url" placeholder="https://" />;
      case 'email': return <input {...p} type="email" />;
      default: return <input {...p} />;
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-[55] bg-[#0a0d12]/70 backdrop-blur-[2px]" onClick={onClose} />
      <div role="dialog" aria-modal="true" aria-labelledby="entry-dlg" className="fixed inset-y-0 right-0 z-[56] flex w-full max-w-[640px] flex-col bg-white shadow-[0_24px_48px_-12px_rgba(10,13,18,0.18)]">
        <div className="flex items-start justify-between gap-4 border-b border-[#e5e5e5] px-6 py-5">
          <div className="min-w-0"><h2 id="entry-dlg" className="truncate text-[18px] font-semibold leading-7 text-[#171717]">{entry ? titleOf(reg, entry) : 'Novi zapis'}</h2>
            <p className="text-[14px] text-[#525252]">{reg.name}{entry ? ` · izmijenjeno ${dateTime(entry.updatedAt)}` : ''}</p></div>
          <button type="button" className={iconBtn} aria-label="Zatvori" onClick={onClose}><XClose /></button>
        </div>
        <form id="entry-form" onSubmit={save} className="flex-1 space-y-5 overflow-y-auto px-6 py-6">
          {entry?.status === 'ARHIVIRAN' && <p className="rounded-[8px] bg-[#fafafa] p-3 text-[14px] text-[#404040] ring-1 ring-inset ring-[#e5e5e5]">Zapis je arhiviran i ne prikazuje se na portalu.</p>}
          <div className="grid gap-4 md:grid-cols-2">
            {reg.fields.map((f) => (
              <div key={f.key} className={f.type === 'longtext' || f.type === 'text' && f.key === reg.titleField ? 'md:col-span-2' : ''}>
                <Field label={f.public ? f.label : `${f.label} (interno)`} required={f.required} hint={f.help}>
                  {control(f)}
                </Field>
                {errs[f.key] && <p className="mt-1.5 text-[14px] text-[#d92d20]" role="alert">{errs[f.key]}</p>}
              </div>
            ))}
          </div>
          {reg.geo && (
            <div>
              <p className="mb-1.5 text-[14px] font-medium text-[#404040]">Lokacija {lat != null && <button type="button" className="ml-2 text-[12px] font-semibold text-[#6941c6] hover:underline" disabled={locked} onClick={() => { setLat(null); setLng(null); }}>Ukloni</button>}</p>
              {locked ? <p className="text-[14px] text-[#525252]">{lat != null ? `${lat.toFixed(5)}, ${lng?.toFixed(5)}` : 'Nije unesena'}</p> : <LocationPicker lat={lat} lng={lng} onChange={(a, b) => { setLat(a); setLng(b); }} />}
            </div>
          )}
        </form>
        {canEdit && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#e5e5e5] px-6 py-4">
            <span className="flex gap-2">
              {entry && <button type="button" className={btnSecondary} disabled={busy} onClick={() => call({ status: entry.status === 'ARHIVIRAN' ? 'AKTIVAN' : 'ARHIVIRAN' }, entry.status === 'ARHIVIRAN' ? 'Zapis vraćen' : 'Zapis arhiviran')}><Archive />{entry.status === 'ARHIVIRAN' ? 'Vrati iz arhive' : 'Arhiviraj'}</button>}
              {entry && canDelete && <button type="button" className={btnDanger} disabled={busy} onClick={del}><Trash01 />Obriši</button>}
            </span>
            <button form="entry-form" className={btnPrimary} disabled={busy}>{entry ? 'Spremi izmjene' : 'Dodaj zapis'}</button>
          </div>
        )}
      </div>
    </>
  );
}
