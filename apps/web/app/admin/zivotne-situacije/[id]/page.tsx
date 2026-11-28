'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { use, useEffect, useState } from 'react';
import { adminFetch, useCan, useSectors } from '@/lib/adminApi';
import type { CmsLifeEvent, LELink, LEStep } from '@/lib/lifeEvents';
import { Card, CardHeader, Field, PageTitle, btnPrimary, btnSecondary, iconBtn, input, useToast } from '@/components/admin/ui';
import { ArrowDown, ArrowUp, LinkExternal01, Plus, Save01, Trash01 } from '@untitledui/icons';

const ICONS = ['help', 'restaurant', 'bed', 'storefront', 'payments', 'tour', 'factory', 'report', 'gavel', 'warning', 'eco', 'water_drop', 'forest', 'description', 'badge', 'local_shipping'];

function Links({ value, onChange, disabled }: { value: LELink[]; onChange: (v: LELink[]) => void; disabled?: boolean }) {
  return (
    <div className="space-y-2">
      {value.map((l, i) => (
        <div key={i} className="flex flex-wrap gap-2">
          <input aria-label="Naziv linka" className={`${input} !w-auto min-w-[160px] flex-1`} placeholder="Naziv, npr. Zahtjev za kategorizaciju" value={l.label} disabled={disabled} onChange={(e) => onChange(value.map((x, k) => k === i ? { ...x, label: e.target.value } : x))} />
          <input aria-label="Adresa" className={`${input} !w-auto min-w-[200px] flex-[1.4] font-mono text-[13px]`} placeholder="/e-usluge/obrasci/… ili https://" value={l.url} disabled={disabled} onChange={(e) => onChange(value.map((x, k) => k === i ? { ...x, url: e.target.value } : x))} />
          <button type="button" className={iconBtn} aria-label="Ukloni link" disabled={disabled} onClick={() => onChange(value.filter((_, k) => k !== i))}><Trash01 /></button>
        </div>
      ))}
      {!disabled && <button type="button" className="inline-flex items-center gap-1 text-[14px] font-semibold text-[#6941c6]" onClick={() => onChange([...value, { label: '', url: '' }])}><Plus className="size-4" />Dodaj link</button>}
    </div>
  );
}

export default function LifeEventEditor({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const toast = useToast();
  const sectors = useSectors();
  const canWrite = useCan('objave', 'write');
  const canVerify = useCan('objave', 'publish');
  const canDelete = useCan('objave', 'delete');
  const [e, setE] = useState<CmsLifeEvent | null>(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => { adminFetch<CmsLifeEvent>(`/admin/life-events/${id}`).then(setE).catch((x) => toast.err(x.message)); }, [id]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!e) return <div className="h-64 animate-pulse rounded-[12px] bg-[#f5f5f5]">{toast.node}</div>;
  const set = <K extends keyof CmsLifeEvent>(k: K, v: CmsLifeEvent[K]) => setE({ ...e, [k]: v });
  const setStep = (i: number, p: Partial<LEStep>) => set('steps', e.steps.map((s, k) => (k === i ? { ...s, ...p } : s)));
  const move = (i: number, d: number) => { const s = [...e.steps]; [s[i], s[i + d]] = [s[i + d], s[i]]; set('steps', s); };

  async function save(ev?: React.FormEvent) {
    ev?.preventDefault();
    setBusy(true);
    try {
      const { title, audience, icon, sector, summary, keywords, contact, steps, links, published, verified, position } = e!;
      setE(await adminFetch<CmsLifeEvent>(`/admin/life-events/${id}`, { method: 'PATCH', body: JSON.stringify({ title, audience, icon, sector, summary, keywords, contact, steps, links, published, verified, position }) }));
      toast.ok('Spremljeno');
    } catch (x: any) { toast.err(x.message); } finally { setBusy(false); }
  }
  async function remove() {
    if (!confirm(`Obrisati „${e!.title}“?`)) return;
    try { await adminFetch(`/admin/life-events/${id}`, { method: 'DELETE' }); router.push('/admin/zivotne-situacije'); } catch (x: any) { toast.err(x.message); }
  }
  const ro = !canWrite;

  return (
    <form onSubmit={save}>
      <PageTitle kicker={e.summary || 'Životna situacija'} crumbs={['Životne situacije', e.title]} title={e.title}>
        {e.published && <Link href={`/zivotne-situacije/${e.slug}`} target="_blank" className={btnSecondary}><LinkExternal01 />Na portalu</Link>}
        {canWrite && <button className={btnPrimary} disabled={busy}><Save01 />Spremi</button>}
      </PageTitle>
      <div className="grid items-start gap-6 xl:grid-cols-12">
        <div className="space-y-6 xl:col-span-8">
          <Card>
            <CardHeader title="Koraci" description="Redoslijed kojim građanin ili firma rješava situaciju. Uz korak dodajte linkove na obrasce, registre ili propise." />
            <ol className="divide-y divide-[#e5e5e5]">
              {e.steps.map((s, i) => (
                <li key={i} className="flex gap-4 p-4 md:p-6">
                  <span aria-hidden className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#f4ebff] text-[14px] font-semibold text-[#6941c6]">{i + 1}</span>
                  <div className="min-w-0 flex-1 space-y-3">
                    <input aria-label={`Naslov koraka ${i + 1}`} className={`${input} font-semibold`} value={s.title} disabled={ro} onChange={(x) => setStep(i, { title: x.target.value })} placeholder="Naslov koraka" />
                    <textarea aria-label={`Opis koraka ${i + 1}`} className={input} rows={3} value={s.text} disabled={ro} onChange={(x) => setStep(i, { text: x.target.value })} placeholder="Šta se radi, gdje i u kojem roku" />
                    <Links value={s.links ?? []} disabled={ro} onChange={(v) => setStep(i, { links: v })} />
                  </div>
                  {!ro && <div className="flex shrink-0 flex-col gap-1">
                    <button type="button" className={iconBtn} aria-label="Pomjeri gore" disabled={i === 0} onClick={() => move(i, -1)}><ArrowUp /></button>
                    <button type="button" className={iconBtn} aria-label="Pomjeri dolje" disabled={i === e.steps.length - 1} onClick={() => move(i, 1)}><ArrowDown /></button>
                    <button type="button" className={`${iconBtn} hover:!text-[#d92d20]`} aria-label="Ukloni korak" onClick={() => set('steps', e.steps.filter((_, k) => k !== i))}><Trash01 /></button>
                  </div>}
                </li>
              ))}
            </ol>
            {!ro && <div className="border-t border-[#e5e5e5] p-4 md:px-6"><button type="button" className={btnSecondary} onClick={() => set('steps', [...e.steps, { title: '', text: '', links: [] }])}><Plus />Dodaj korak</button></div>}
          </Card>
          <Card>
            <CardHeader title="Povezano" description="Dodatni linkovi uz situaciju (propisi, registri, druge stranice)." />
            <div className="p-4 md:p-6"><Links value={e.links} disabled={ro} onChange={(v) => set('links', v)} /></div>
          </Card>
        </div>
        <div className="space-y-6 xl:col-span-4">
          <Card>
            <CardHeader title="Osnovno" />
            <div className="space-y-5 p-4 md:p-6">
              <Field label="Naslov" required><input className={input} value={e.title} disabled={ro} onChange={(x) => set('title', x.target.value)} required /></Field>
              <Field label="Kratki opis"><textarea className={input} rows={3} value={e.summary} disabled={ro} onChange={(x) => set('summary', x.target.value)} /></Field>
              <Field label="Za koga"><select className={input} value={e.audience} disabled={ro} onChange={(x) => set('audience', x.target.value as CmsLifeEvent['audience'])}><option value="GRADJANI">Građane</option><option value="PRIVREDA">Privredu</option></select></Field>
              <Field label="Sektor"><select className={input} value={e.sector ?? ''} disabled={ro} onChange={(x) => set('sector', x.target.value || null)}><option value="">Više sektora</option>{sectors.map((s) => <option key={s.key} value={s.key}>{s.name}</option>)}</select></Field>
              <Field label="Nadležni (kontakt)"><input className={input} value={e.contact} disabled={ro} onChange={(x) => set('contact', x.target.value)} /></Field>
              <Field label="Ikona" hint="Naziv ikone Material Symbols.">
                <div className="flex flex-wrap gap-1.5">{ICONS.map((ic) => (
                  <button key={ic} type="button" disabled={ro} title={ic} aria-pressed={e.icon === ic} onClick={() => set('icon', ic)} className={`flex size-9 items-center justify-center rounded-[8px] ring-1 ring-inset ${e.icon === ic ? 'bg-[#f4ebff] ring-[#7f56d9] text-[#6941c6]' : 'ring-[#e5e5e5] text-[#525252] hover:bg-[#fafafa]'}`}><span aria-hidden className="material-symbols-outlined text-[20px]">{ic}</span></button>
                ))}</div>
              </Field>
              <Field label="Riječi za pretragu" hint="Kako ljudi to kažu: npr. „restoran, apartman, zvjezdice“."><input className={input} value={e.keywords} disabled={ro} onChange={(x) => set('keywords', x.target.value)} /></Field>
            </div>
          </Card>
          <Card>
            <CardHeader title="Objava" />
            <div className="space-y-4 p-4 md:p-6 text-[14px]">
              <label className="flex items-start gap-3"><input type="checkbox" className="mt-0.5 size-4 accent-[#7f56d9]" checked={e.published} disabled={ro} onChange={(x) => set('published', x.target.checked)} /><span><span className="font-medium text-[#171717]">Prikaži na portalu</span><span className="block text-[#525252]">Vidljivo u listi, na stranici i u pretrazi.</span></span></label>
              <label className="flex items-start gap-3"><input type="checkbox" className="mt-0.5 size-4 accent-[#7f56d9]" checked={e.verified} disabled={!canVerify} onChange={(x) => set('verified', x.target.checked)} /><span><span className="font-medium text-[#171717]">Sadržaj provjeren</span><span className="block text-[#525252]">Uklanja oznaku „u pripremi“. Potvrđuje urednik nakon provjere s nadležnim sektorom.</span></span></label>
              <Field label="Redoslijed u listi"><input type="number" min={0} className={`${input} !w-28`} value={e.position} disabled={ro} onChange={(x) => set('position', Number(x.target.value))} /></Field>
            </div>
          </Card>
          {canDelete && <button type="button" className={`${btnSecondary} w-full !text-[#b42318]`} onClick={remove}><Trash01 />Obriši situaciju</button>}
        </div>
      </div>
      {toast.node}
    </form>
  );
}
