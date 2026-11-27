'use client';
// F2-05: uređivanje elektronskog obrasca (polja kao u registry builderu, plus rok i prilozi).
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { adminFetch, useSectors } from '@/lib/adminApi';
import type { CmsForm } from '@/lib/cases';
import FieldsEditor, { type Draft, type Flag, draft, toFields } from '@/components/admin/FieldsEditor';
import { Badge, Card, CardHeader, Field, btnPrimary, btnTertiary, input, useToast } from '@/components/admin/ui';

const FLAGS: Flag[] = [{ k: 'required', label: 'Obavezno', hint: 'Zahtjev se ne može poslati bez ove vrijednosti' }];

export default function FormSettings({ form, canPublish, onSaved }: { form?: CmsForm; canPublish: boolean; onSaved?: (f: CmsForm) => void }) {
  const router = useRouter();
  const toast = useToast();
  const sectors = useSectors();
  const [s, setS] = useState({
    title: form?.title ?? '', description: form?.description ?? '', legalBasis: form?.legalBasis ?? '', sector: form?.sector ?? '',
    slaDays: form?.slaDays ?? 30, attachments: form?.attachments ?? 'OPCIONO', attachmentHint: form?.attachmentHint ?? '', active: form?.active ?? false,
  });
  const [fields, setFields] = useState<Draft[]>(() => form?.fields.map((f) => draft(f, true)) ?? [draft({ key: '', label: '', type: 'text', required: true }, false)]);
  const [busy, setBusy] = useState(false);
  const locked = !canPublish;
  const set = (k: keyof typeof s, v: any) => setS((x) => ({ ...x, [k]: v }));

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const body = JSON.stringify({ ...s, sector: s.sector || null, fields: toFields(fields) });
      const f = form ? await adminFetch<CmsForm>(`/admin/forms/${form.id}`, { method: 'PATCH', body }) : await adminFetch<CmsForm>('/admin/forms', { method: 'POST', body });
      toast.ok(form ? 'Obrazac spremljen' : 'Obrazac kreiran');
      if (form) { setFields(f.fields.map((x) => draft(x, true))); onSaved?.(f); } else router.push(`/admin/predmeti/obrasci/${f.id}`);
    } catch (err: any) { toast.err(err.message); } finally { setBusy(false); }
  }

  return (
    <form onSubmit={save} className="space-y-6">
      <Card>
        <CardHeader title="Obrazac" description="Naslov i opis vidi građanin na portalu prije popunjavanja." />
        <div className="grid gap-4 p-6 md:grid-cols-12">
          <div className="md:col-span-8"><Field label="Naziv" required><input className={input} value={s.title} required minLength={3} disabled={locked} onChange={(e) => set('title', e.target.value)} placeholder="npr. Zahtjev za izdavanje licence turističkog vodiča" /></Field></div>
          <div className="md:col-span-4"><Field label="Sektor" hint="Predmete obrađuju referenti sektora"><select className={input} value={s.sector} disabled={locked} onChange={(e) => set('sector', e.target.value)}><option value="">Svi sektori</option>{sectors.filter((x) => x.active || x.key === s.sector).map((x) => <option key={x.id} value={x.key}>{x.name}</option>)}</select></Field></div>
          <div className="md:col-span-12"><Field label="Opis za građane"><textarea className={input} rows={3} value={s.description} disabled={locked} onChange={(e) => set('description', e.target.value)} placeholder="Ko podnosi zahtjev, šta je potrebno i šta slijedi nakon podnošenja" /></Field></div>
          <div className="md:col-span-8"><Field label="Pravni osnov"><input className={input} value={s.legalBasis} disabled={locked} onChange={(e) => set('legalBasis', e.target.value)} /></Field></div>
          <div className="md:col-span-4"><Field label="Rok za rješavanje (dana)" hint="Od prijema; miruje dok se čeka dopuna"><input type="number" min={1} max={365} className={input} value={s.slaDays} disabled={locked} onChange={(e) => set('slaDays', Number(e.target.value))} /></Field></div>
          <div className="md:col-span-4"><Field label="Prilozi"><select className={input} value={s.attachments} disabled={locked} onChange={(e) => set('attachments', e.target.value)}><option value="NE">Bez priloga</option><option value="OPCIONO">Neobavezni</option><option value="OBAVEZNO">Obavezni</option></select></Field></div>
          <div className="md:col-span-8"><Field label="Koji prilozi" hint="PDF ili fotografija, do 5 datoteka po 5 MB"><input className={input} value={s.attachmentHint} disabled={locked || s.attachments === 'NE'} onChange={(e) => set('attachmentHint', e.target.value)} placeholder="npr. Kopija lične karte i uvjerenje o položenom ispitu" /></Field></div>
          <label className="md:col-span-12 flex items-start gap-3 text-[14px] text-[#404040]">
            <input type="checkbox" className="mt-0.5 size-4 accent-[#7f56d9]" checked={s.active} disabled={locked} onChange={(e) => set('active', e.target.checked)} />
            <span><span className="font-medium">Aktivan na portalu</span><span className="block text-[#525252]">Građani mogu podnositi zahtjev. Isključite kad se obrazac mijenja ili postupak više ne vodi elektronski.</span></span>
          </label>
        </div>
      </Card>
      <Card>
        <CardHeader title="Polja" badge={<Badge tone="gray">{fields.length}</Badge>} description="Ime, kontakt i saglasnost za obradu podataka dodaju se automatski na kraju obrasca." />
        <FieldsEditor fields={fields} setFields={setFields} locked={locked} flags={FLAGS} />
      </Card>
      {!locked && (
        <div className="sticky bottom-0 -mx-4 flex justify-end gap-3 border-t border-[#e5e5e5] bg-white/95 px-4 py-4 backdrop-blur md:mx-0 md:rounded-[12px] md:border md:px-6">
          {!form && <button type="button" className={btnTertiary} onClick={() => router.push('/admin/predmeti/obrasci')}>Odustani</button>}
          <button className={btnPrimary} disabled={busy}>{form ? 'Spremi obrazac' : 'Kreiraj obrazac'}</button>
        </div>
      )}
      {toast.node}
    </form>
  );
}
