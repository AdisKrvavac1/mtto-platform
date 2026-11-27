'use client';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { adminFetch, useSectors } from '@/lib/adminApi';
import { type RegField, type Registry, typeLabel } from '@/lib/registry';
import FieldsEditor, { type Draft, type Flag, draft, toFields } from '@/components/admin/FieldsEditor';
import { Badge, Card, CardHeader, Field, btnPrimary, btnTertiary, input, useToast } from '@/components/admin/ui';

const FLAGS: Flag[] = [
  { k: 'required', label: 'Obavezno', hint: 'Zapis se ne može spremiti bez ove vrijednosti' },
  { k: 'public', label: 'Javno', hint: 'Prikazuje se na portalu, u javnom CSV-u i API-ju' },
  { k: 'list', label: 'U tabeli', hint: 'Kolona u listi zapisa' },
  { k: 'search', label: 'Pretraga', hint: 'Pretraga po pojmu traži i u ovom polju' },
  { k: 'filter', label: 'Filter', hint: 'Javni filter (padajuća lista)', types: ['select', 'boolean'] },
  { k: 'unique', label: 'Jedinstveno', hint: 'Ne smije se ponoviti; po njemu uvoz ažurira postojeće zapise', types: ['text', 'integer', 'email', 'url'] },
];

export default function RegistrySettings({ registry, canPublish, onSaved }: { registry?: Registry; canPublish: boolean; onSaved?: (r: Registry) => void }) {
  const router = useRouter();
  const toast = useToast();
  const sectors = useSectors();
  const [s, setS] = useState({
    name: registry?.name ?? '', slug: registry?.slug ?? '', description: registry?.description ?? '', legalBasis: registry?.legalBasis ?? '',
    sector: registry?.sector ?? '', geo: registry?.geo ?? false, public: registry?.public ?? false, titleField: registry?.titleField ?? '',
  });
  const [fields, setFields] = useState<Draft[]>(() => registry?.fields.map((f) => draft(f, true)) ?? [draft({ key: 'naziv', label: 'Naziv', type: 'text', required: true, public: true, search: true, list: true }, false)]);
  const [busy, setBusy] = useState(false);
  const locked = !canPublish;
  const set = (k: keyof typeof s, v: any) => setS((x) => ({ ...x, [k]: v }));
  const textFields = useMemo(() => fields.filter((f) => f.key && ['text', 'select', 'integer'].includes(f.type)), [fields]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const body = {
      ...s, sector: s.sector || null,
      fields: toFields(fields),
    };
    try {
      const r = registry
        ? await adminFetch<Registry>(`/admin/registries/${registry.id}`, { method: 'PATCH', body: JSON.stringify(body) })
        : await adminFetch<Registry>('/admin/registries', { method: 'POST', body: JSON.stringify(body) });
      toast.ok(registry ? 'Postavke registra spremljene' : 'Registar je kreiran. Dodajte zapise ili uvezite CSV.');
      if (registry) { setFields(r.fields.map((f) => draft(f, true))); onSaved?.(r); } else router.push(`/admin/registri/${r.id}`);
    } catch (err: any) { toast.err(err.message); } finally { setBusy(false); }
  }

  const removed = registry?.fields.filter((f) => !fields.some((d) => d.key === f.key)) ?? [];

  return (
    <form onSubmit={save} className="space-y-6">
      <Card>
        <CardHeader title="Osnovno" description="Naziv i opis prikazuju se na vrhu javne stranice registra." />
        <div className="grid gap-4 p-6 md:grid-cols-12">
          <div className="md:col-span-8"><Field label="Naziv registra" required><input className={input} value={s.name} required minLength={3} disabled={locked} onChange={(e) => set('name', e.target.value)} placeholder="npr. Registar turističkih vodiča" /></Field></div>
          <div className="md:col-span-4"><Field label="Sektor" hint="Zapise mijenjaju samo korisnici tog sektora"><select className={input} value={s.sector} disabled={locked} onChange={(e) => set('sector', e.target.value)}><option value="">Svi sektori</option>{sectors.filter((x) => x.active || x.key === s.sector).map((x) => <option key={x.id} value={x.key}>{x.name}</option>)}</select></Field></div>
          <div className="md:col-span-12"><Field label="Opis"><textarea className={input} rows={2} value={s.description} disabled={locked} onChange={(e) => set('description', e.target.value)} placeholder="Šta registar sadrži i kome je namijenjen" /></Field></div>
          <div className="md:col-span-8"><Field label="Pravni osnov" hint="Zakon ili pravilnik po kojem se registar vodi"><input className={input} value={s.legalBasis} disabled={locked} onChange={(e) => set('legalBasis', e.target.value)} /></Field></div>
          <div className="md:col-span-4">
            <Field label="Adresa na portalu" hint={registry ? 'Ne mijenja se nakon kreiranja' : 'Prazno = iz naziva'}>
              <div className="flex items-center rounded-[8px] ring-1 ring-inset ring-[#d4d4d4] bg-[#fafafa] text-[14px]"><span className="pl-3 text-[#737373]">/registri/</span>
                <input className="h-10 min-w-0 flex-1 rounded-r-[8px] bg-white px-2 text-[16px] outline-none disabled:bg-[#fafafa]" value={s.slug} disabled={!!registry || locked} onChange={(e) => set('slug', e.target.value)} /></div>
            </Field>
          </div>
          <div className="md:col-span-12 grid gap-3 sm:grid-cols-2">
            <Toggle checked={s.public} disabled={locked} onChange={(v) => set('public', v)} title="Objavljen na portalu" text="Javna polja vidljiva su na portalu, u CSV-u i u javnom API-ju." />
            <Toggle checked={s.geo} disabled={locked} onChange={(v) => set('geo', v)} title="Zapisi imaju lokaciju" text="Unos koordinata i prikaz zapisa na karti." />
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader title="Polja" badge={<Badge tone="gray">{fields.length}</Badge>} description="Redoslijed polja je redoslijed u formi, tabeli i CSV-u. Ključ polja se ne mijenja nakon spremanja." />
        <FieldsEditor fields={fields} setFields={setFields} locked={locked} flags={FLAGS} />
      </Card>

      <Card>
        <CardHeader title="Prikaz" description="Naslov zapisa u tabeli, dosjeu i na karti." />
        <div className="grid gap-4 p-6 md:grid-cols-2">
          <Field label="Naslovno polje"><select className={input} value={s.titleField} disabled={locked} onChange={(e) => set('titleField', e.target.value)}><option value="">Prvo tekstualno polje</option>{textFields.map((f) => <option key={f._id} value={f.key}>{f.label}</option>)}</select></Field>
          <div className="text-[14px] text-[#525252]">
            <p><span className="font-medium text-[#404040]">{fields.filter((f) => f.public).length}</span> javnih i <span className="font-medium text-[#404040]">{fields.filter((f) => !f.public).length}</span> internih polja. Interna polja (napomene, kontakt podnosioca) vidi samo CMS.</p>
            {removed.length > 0 && <p className="mt-2 text-[#b54708]">Uklanjate: {removed.map((f) => `${f.label} (${typeLabel(f.type)})`).join(', ')}. Postojeće vrijednosti ostaju u bazi i internom izvozu, ali se više ne prikazuju.</p>}
          </div>
        </div>
      </Card>

      {!locked && (
        <div className="sticky bottom-0 -mx-4 flex justify-end gap-3 border-t border-[#e5e5e5] bg-white/95 px-4 py-4 backdrop-blur md:mx-0 md:rounded-[12px] md:border md:px-6">
          {!registry && <button type="button" className={btnTertiary} onClick={() => router.push('/admin/registri')}>Odustani</button>}
          <button className={btnPrimary} disabled={busy}>{registry ? 'Spremi postavke' : 'Kreiraj registar'}</button>
        </div>
      )}
      {toast.node}
    </form>
  );
}

function Toggle({ checked, onChange, title, text, disabled }: { checked: boolean; onChange: (v: boolean) => void; title: string; text: string; disabled?: boolean }) {
  return (
    <label className={`flex cursor-pointer items-start gap-3 rounded-[12px] p-4 ring-1 ring-inset ${checked ? 'bg-[#f9f5ff] ring-[#d6bbfb]' : 'ring-[#e5e5e5]'} ${disabled ? 'cursor-default opacity-70' : ''}`}>
      <input type="checkbox" role="switch" className="peer sr-only" checked={checked} disabled={disabled} onChange={(e) => onChange(e.target.checked)} />
      <span aria-hidden className={`mt-0.5 flex h-5 w-9 shrink-0 items-center rounded-full p-0.5 transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-[#9e77ed] ${checked ? 'bg-[#7f56d9]' : 'bg-[#e5e5e5]'}`}><span className={`size-4 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-4' : ''}`} /></span>
      <span><span className="block text-[14px] font-medium text-[#404040]">{title}</span><span className="block text-[14px] text-[#525252]">{text}</span></span>
    </label>
  );
}
