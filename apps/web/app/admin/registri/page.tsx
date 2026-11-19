'use client';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { adminFetch } from '@/lib/adminApi';
import { Card, Field, PageTitle, btnGreen, btnPrimary, btnSecondary, input, useToast } from '@/components/admin/ui';
import { PERMIT_STATUS, dateShort, daysUntil } from '@/lib/format';

const LocationPicker = dynamic(() => import('@/components/admin/LocationPicker'), { ssr: false, loading: () => <div className="h-[260px] rounded-lg bg-surface-container-low animate-pulse" /> });

type Permit = { id: string; registerNumber: string; operator: string; facility: string; activity: string; municipality: string; address: string; issuedAt: string; validUntil: string; status: string; description: string; lat: number | null; lng: number | null; isDemo: boolean; documentCount: number };
const MUNICIPALITIES = ['Čapljina', 'Čitluk', 'Jablanica', 'Konjic', 'Mostar', 'Neum', 'Prozor-Rama', 'Ravno', 'Stolac'];
const ACTIVITIES = ['Industrija', 'Energetika', 'Otpad', 'Turizam', 'Ostalo'];
const EMPTY = { id: '', registerNumber: '', operator: '', facility: '', activity: 'Industrija', municipality: 'Mostar', address: '', issuedAt: '', validUntil: '', status: 'VAZECA', description: '', lat: null as number | null, lng: null as number | null };

export default function RegistryAdmin() {
  const [rows, setRows] = useState<Permit[]>([]);
  const [form, setForm] = useState<typeof EMPTY | null>(null);
  const [busy, setBusy] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const toast = useToast();
  const load = () => adminFetch<Permit[]>('/admin/permits').then(setRows).catch((e) => toast.err(e.message));
  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const set = (k: keyof typeof EMPTY, v: any) => setForm((f) => (f ? { ...f, [k]: v } : f));

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    setBusy(true);
    const { id, ...body } = form;
    try {
      const saved = id
        ? await adminFetch<Permit>(`/admin/permits/${id}`, { method: 'PATCH', body: JSON.stringify(body) })
        : await adminFetch<Permit>('/admin/permits', { method: 'POST', body: JSON.stringify({ ...body, isDemo: false }) });
      if (file) {
        const fd = new FormData();
        fd.append('file', file);
        fd.append('title', `Rješenje o okolišnoj dozvoli ${saved.registerNumber}`);
        fd.append('docType', 'ODLUKA');
        fd.append('sector', 'Zaštita okoliša');
        fd.append('number', saved.registerNumber);
        fd.append('issuedAt', body.issuedAt);
        fd.append('permitId', saved.id);
        await adminFetch('/admin/documents', { method: 'POST', body: fd });
      }
      toast.ok(id ? 'Dozvola ažurirana' : 'Dozvola dodana u javni registar i na mapu');
      setForm(null);
      setFile(null);
      load();
    } catch (e: any) {
      toast.err(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function remove(p: Permit) {
    if (!confirm(`Obrisati dozvolu ${p.registerNumber} iz registra?`)) return;
    try { await adminFetch(`/admin/permits/${p.id}`, { method: 'DELETE' }); toast.ok('Dozvola obrisana'); load(); } catch (e: any) { toast.err(e.message); }
  }

  const expiring = rows.filter((r) => { const d = daysUntil(r.validUntil)!; return d >= 0 && d <= 60; }).length;

  return (
    <>
      <PageTitle kicker="Registri · Sektor za zaštitu okoliša" title="Registar okolišnih dozvola">
        <a href="/registri/okolisne-dozvole" target="_blank" rel="noopener" className={btnSecondary}><span className="material-symbols-outlined text-[18px]">public</span>Javni prikaz</a>
        <button type="button" onClick={() => setForm({ ...EMPTY })} className={btnPrimary}><span className="material-symbols-outlined text-[18px]">add</span>Novi unos u registar</button>
      </PageTitle>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-space-md mb-space-lg">
        {[['Ukupno dozvola', rows.length, 'verified', 'text-eko-green'], ['Važećih', rows.filter((r) => r.status === 'VAZECA').length, 'check_circle', 'text-eko-green'], ['U obnovi', rows.filter((r) => r.status === 'U_OBNOVI').length, 'history', 'text-[#b45309]'], ['Ističe u 60 dana', expiring, 'warning', 'text-error']].map(([l, n, i, c]) => (
          <Card key={l as string} className="p-space-md flex items-center justify-between"><div><p className="font-display text-[30px] font-bold text-text-heading leading-none">{n}</p><p className="font-body-sm text-body-sm text-on-surface-variant">{l}</p></div><span className={`material-symbols-outlined text-[28px] ${c}`}>{i}</span></Card>
        ))}
      </div>

      {form && (
        <Card className="p-space-md md:p-space-lg mb-space-lg border-t-[3px] border-t-eko-green">
          <form onSubmit={save} className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
            <div className="lg:col-span-7 space-y-space-md">
              <h2 className="font-title-md text-title-md font-bold text-text-heading">{form.id ? `Uređivanje: ${form.registerNumber}` : 'Novi unos u registar'}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-space-sm">
                <Field label="Broj rješenja (UPI)" required><input className={input} value={form.registerNumber} onChange={(e) => set('registerNumber', e.target.value)} placeholder="UPI/05-23-.../26" required /></Field>
                <Field label="Status"><select className={input} value={form.status} onChange={(e) => set('status', e.target.value)}>{Object.entries(PERMIT_STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}</select></Field>
                <Field label="Operater" required><input className={input} value={form.operator} onChange={(e) => set('operator', e.target.value)} required /></Field>
                <Field label="Postrojenje / pogon" required><input className={input} value={form.facility} onChange={(e) => set('facility', e.target.value)} required /></Field>
                <Field label="Djelatnost"><select className={input} value={form.activity} onChange={(e) => set('activity', e.target.value)}>{ACTIVITIES.map((a) => <option key={a}>{a}</option>)}</select></Field>
                <Field label="Općina / grad"><select className={input} value={form.municipality} onChange={(e) => set('municipality', e.target.value)}>{MUNICIPALITIES.map((m) => <option key={m}>{m}</option>)}</select></Field>
                <Field label="Datum izdavanja" required><input type="date" className={input} value={form.issuedAt} onChange={(e) => set('issuedAt', e.target.value)} required /></Field>
                <Field label="Važi do" required><input type="date" className={input} value={form.validUntil} onChange={(e) => set('validUntil', e.target.value)} required /></Field>
              </div>
              <Field label="Adresa"><input className={input} value={form.address} onChange={(e) => set('address', e.target.value)} /></Field>
              <Field label="Opis postrojenja"><textarea className={`${input} h-auto py-2`} rows={3} value={form.description} onChange={(e) => set('description', e.target.value)} /></Field>
              <Field label="Rješenje (PDF)" hint="opciono"><input type="file" accept="application/pdf" className="block font-body-sm text-body-sm" onChange={(e) => setFile(e.target.files?.[0] ?? null)} /></Field>
            </div>
            <div className="lg:col-span-5 space-y-space-md">
              <Field label="Lokacija na mapi" hint={form.lat ? `${form.lat}, ${form.lng}` : 'nije postavljena'}><div /></Field>
              <LocationPicker lat={form.lat} lng={form.lng} onChange={(la, lo) => setForm((f) => (f ? { ...f, lat: la, lng: lo } : f))} />
              <div className="flex gap-space-sm justify-end pt-space-sm">
                <button type="button" className={btnSecondary} onClick={() => { setForm(null); setFile(null); }}>Odustani</button>
                <button className={btnGreen} disabled={busy}><span className="material-symbols-outlined text-[18px]">save</span>{busy ? 'Spremanje…' : form.id ? 'Sačuvaj izmjene' : 'Upiši u registar'}</button>
              </div>
            </div>
          </form>
        </Card>
      )}

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left">
            <thead><tr className="border-b-2 border-mtto-primary">{['Broj', 'Operater i postrojenje', 'Općina', 'Važi do', 'Status', 'Mapa', 'Dok.', ''].map((h) => <th key={h} className="px-space-md py-2 font-label-badge text-label-badge uppercase text-[#80807e]">{h}</th>)}</tr></thead>
            <tbody>
              {rows.map((p, i) => {
                const st = PERMIT_STATUS[p.status] ?? PERMIT_STATUS.VAZECA;
                const d = daysUntil(p.validUntil)!;
                return (
                  <tr key={p.id} className={`${i % 2 ? 'bg-slate-surface' : ''} hover:bg-[rgba(0,171,235,0.05)]`}>
                    <td className="px-space-md py-2 font-mono text-[12px] font-bold text-mtto-primary">{p.registerNumber}</td>
                    <td className="px-space-md py-2"><span className="font-button text-button font-bold text-text-heading">{p.operator}</span><span className="block font-body-sm text-[12px] text-on-surface-variant">{p.facility}{p.isDemo ? ' · demo' : ''}</span></td>
                    <td className="px-space-md py-2 font-body-sm text-body-sm">{p.municipality}</td>
                    <td className={`px-space-md py-2 font-mono text-[12px] ${d >= 0 && d <= 60 ? 'text-error font-bold' : ''}`}>{dateShort(p.validUntil)}</td>
                    <td className="px-space-md py-2"><span className={`px-2 py-0.5 rounded-full font-label-badge text-label-badge font-bold ${st.cls}`}>{st.label}</span></td>
                    <td className="px-space-md py-2">{p.lat ? <span className="material-symbols-outlined text-eko-green text-[20px]">location_on</span> : <span className="material-symbols-outlined text-outline text-[20px]">location_off</span>}</td>
                    <td className="px-space-md py-2 font-mono text-[12px]">{p.documentCount}</td>
                    <td className="px-space-md py-2">
                      <div className="flex gap-1 justify-end">
                        <button type="button" onClick={() => { setForm({ id: p.id, registerNumber: p.registerNumber, operator: p.operator, facility: p.facility, activity: p.activity, municipality: p.municipality, address: p.address, issuedAt: p.issuedAt.slice(0, 10), validUntil: p.validUntil.slice(0, 10), status: p.status, description: p.description, lat: p.lat, lng: p.lng }); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="w-8 h-8 rounded bg-surface-container-high text-mtto-primary inline-flex items-center justify-center" title="Uredi"><span className="material-symbols-outlined text-[18px]">edit</span></button>
                        <a href={`/registri/okolisne-dozvole/${p.id}`} target="_blank" rel="noopener" className="w-8 h-8 rounded bg-surface-container-high text-mtto-primary inline-flex items-center justify-center" title="Javni dosje"><span className="material-symbols-outlined text-[18px]">open_in_new</span></a>
                        <button type="button" onClick={() => remove(p)} className="w-8 h-8 rounded bg-error-container text-on-error-container inline-flex items-center justify-center" title="Obriši"><span className="material-symbols-outlined text-[18px]">delete</span></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
      {toast.node}
    </>
  );
}
