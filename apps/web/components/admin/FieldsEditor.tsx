'use client';
import { FIELD_TYPES, type RegField } from '@/lib/registry';
import { Badge, Field, btnSecondary, iconBtn, input } from '@/components/admin/ui';
import { ArrowDown, ArrowUp, ChevronDown, Plus, Trash01 } from '@untitledui/icons';

/** Editor polja: zajednički za registry builder (F2-04) i obrasce (F2-05). */
export type Draft = RegField & { _id: string; _saved: boolean; _open?: boolean; _opts?: string };
export type Flag = { k: keyof RegField; label: string; hint: string; types?: string[] };

export const keyFromLabel = (label: string) => {
  const map: Record<string, string> = { č: 'c', ć: 'c', đ: 'dj', š: 's', ž: 'z' };
  const w = label.toLowerCase().replace(/[čćđšž]/g, (c) => map[c]).replace(/[^a-z0-9]+/g, ' ').trim().split(' ').filter(Boolean);
  const k = w.map((x, i) => (i ? x[0].toUpperCase() + x.slice(1) : x)).join('').slice(0, 40);
  return /^[a-z]/.test(k) ? k : k ? `polje${k}` : '';
};
let seq = 0;
export const draft = (f: RegField, saved: boolean): Draft => ({ ...f, _id: `f${++seq}`, _saved: saved, _opts: (f.options ?? []).join('\n') });
export const toFields = (ds: Draft[]): RegField[] => ds.map(({ _id, _saved, _open, _opts, ...f }) => ({ ...f, options: f.type === 'select' ? (_opts ?? '').split('\n').map((o) => o.trim()).filter(Boolean) : undefined }));

export default function FieldsEditor({ fields, setFields, locked, flags }: { fields: Draft[]; setFields: React.Dispatch<React.SetStateAction<Draft[]>>; locked: boolean; flags: Flag[] }) {
  const upd = (id: string, patch: Partial<Draft>) => setFields((fs) => fs.map((f) => {
    if (f._id !== id) return f;
    const n = { ...f, ...patch };
    if (!f._saved && patch.label !== undefined && (!f.key || f.key === keyFromLabel(f.label))) n.key = keyFromLabel(patch.label);
    return n;
  }));
  const move = (i: number, d: number) => setFields((fs) => { const a = [...fs]; const [x] = a.splice(i, 1); a.splice(i + d, 0, x); return a; });
  const FLAGS = flags;
  return (
    <>
      <ol className="divide-y divide-[#e5e5e5]">
        {fields.map((f, i) => (
          <li key={f._id} className="px-4 py-3 md:px-6">
            <div className="flex flex-wrap items-center gap-2 md:flex-nowrap">
              <span className="w-6 shrink-0 text-right text-[14px] tabular-nums text-[#a3a3a3]">{i + 1}</span>
              <input aria-label={`Naziv polja ${i + 1}`} className={`${input} min-w-[180px] flex-1`} value={f.label} disabled={locked} required onChange={(e) => upd(f._id, { label: e.target.value })} placeholder="Naziv polja" />
              <select aria-label={`Vrsta polja ${i + 1}`} className={`${input} w-[170px] shrink-0`} value={f.type} disabled={locked} onChange={(e) => upd(f._id, { type: e.target.value as any, _open: e.target.value === 'select' ? true : f._open })}>
                {FIELD_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
              <div className="flex shrink-0 items-center">
                <button type="button" className={iconBtn} aria-label="Pomjeri gore" disabled={locked || i === 0} onClick={() => move(i, -1)}><ArrowUp /></button>
                <button type="button" className={iconBtn} aria-label="Pomjeri dolje" disabled={locked || i === fields.length - 1} onClick={() => move(i, 1)}><ArrowDown /></button>
                <button type="button" className={iconBtn} aria-label="Ukloni polje" disabled={locked || fields.length === 1} onClick={() => setFields((fs) => fs.filter((x) => x._id !== f._id))}><Trash01 /></button>
                <button type="button" className={iconBtn} aria-expanded={!!f._open} aria-label="Postavke polja" onClick={() => upd(f._id, { _open: !f._open })}><ChevronDown className={f._open ? 'rotate-180 transition-transform' : 'transition-transform'} /></button>
              </div>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-1.5 pl-8 text-[12px]">
              <code className="rounded-[4px] bg-[#f5f5f5] px-1.5 py-0.5 text-[#525252]">{f.key || '—'}</code>
              {FLAGS.filter((x) => f[x.k]).map((x) => <Badge key={x.k} tone={x.k === 'public' ? 'success' : 'gray'}>{x.label}</Badge>)}
              {!f.public && FLAGS.some((x) => x.k === 'public') && <Badge tone="warning">Interno</Badge>}
              {f.type === 'select' && <span className="text-[#737373]">{(f._opts ?? '').split('\n').filter((o) => o.trim()).length} opcija</span>}
            </div>
            {f._open && (
              <div className="mt-3 grid gap-4 rounded-[12px] bg-[#fafafa] p-4 pl-8 md:grid-cols-2">
                <fieldset className="space-y-2">
                  <legend className="mb-1 text-[14px] font-medium text-[#404040]">Ponašanje</legend>
                  {FLAGS.filter((x) => !x.types || x.types.includes(f.type)).map((x) => (
                    <label key={x.k} className="flex items-start gap-2 text-[14px] text-[#404040]">
                      <input type="checkbox" className="mt-0.5 size-4 accent-[var(--br-600,#7f56d9)]" checked={!!f[x.k]} disabled={locked} onChange={(e) => upd(f._id, { [x.k]: e.target.checked } as any)} />
                      <span><span className="font-medium">{x.label}</span><span className="block text-[12px] text-[#737373]">{x.hint}</span></span>
                    </label>
                  ))}
                </fieldset>
                <div className="space-y-4">
                  {f.type === 'select' && <Field label="Opcije" hint="Jedna opcija po redu"><textarea className={input} rows={5} value={f._opts} disabled={locked} onChange={(e) => upd(f._id, { _opts: e.target.value })} /></Field>}
                  <Field label="Pomoć pri unosu"><input className={input} value={f.help ?? ''} disabled={locked} onChange={(e) => upd(f._id, { help: e.target.value })} placeholder="npr. Broj iz rješenja Ministarstva" /></Field>
                  {!f._saved && <Field label="Ključ polja" hint="Koristi se u CSV-u i API-ju"><input className={`${input} font-mono`} value={f.key} disabled={locked} onChange={(e) => upd(f._id, { key: e.target.value })} /></Field>}
                  <p className="text-[12px] text-[#737373]">{FIELD_TYPES.find((t) => t.value === f.type)?.hint}</p>
                </div>
              </div>
            )}
          </li>
        ))}
      </ol>
      {!locked && <div className="border-t border-[#e5e5e5] px-6 py-4"><button type="button" className={btnSecondary} onClick={() => setFields((fs) => [...fs, { ...draft({ key: '', label: '', type: 'text', list: false }, false), _open: true }])}><Plus />Dodaj polje</button></div>}
    </>
  );
}
