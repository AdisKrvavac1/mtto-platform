'use client';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { adminFetch } from '@/lib/adminApi';
import { F2Badge, Field, PageTitle, useToast } from '@/components/admin/ui';
import type { MapPoint } from '@/lib/api';
import { PERMIT_STATUS, dateShort, daysUntil } from '@/lib/format';

const MapSection = dynamic(() => import('@/components/site/MapSection'), { ssr: false });
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
  const [fq, setFq] = useState('');
  const [fm, setFm] = useState('');
  const [fs, setFs] = useState('');
  const [fa, setFa] = useState('');
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

  const expiring = rows.filter((r) => { const d = daysUntil(r.validUntil)!; return d >= 0 && d <= 90; });
  const shown = rows.filter((r) => (!fq || `${r.operator} ${r.facility} ${r.registerNumber}`.toLowerCase().includes(fq.toLowerCase())) && (!fm || r.municipality === fm) && (!fs || r.status === fs) && (!fa || r.activity === fa));
  const points: MapPoint[] = rows.filter((r) => r.lat != null && r.lng != null).map((r) => ({ id: r.id, layer: 'DOZVOLA', name: r.operator, description: `${r.facility} · ${r.municipality}`, lat: r.lat!, lng: r.lng!, link: `/registri/okolisne-dozvole/${r.id}` }));
  const input = 'w-full px-3 py-2 rounded-lg bg-surface-container-low border-0 text-text-heading font-body-sm text-body-sm focus:bg-surface-container-lowest focus:outline-none focus:ring-1 focus:ring-primary-container';
  const sel = `${input} appearance-none cursor-pointer`;
  const kick = 'font-label-kicker text-label-kicker uppercase tracking-wider text-outline';
  const edit = (p: Permit) => setForm({ id: p.id, registerNumber: p.registerNumber, operator: p.operator, facility: p.facility, activity: p.activity, municipality: p.municipality, address: p.address, issuedAt: p.issuedAt.slice(0, 10), validUntil: p.validUntil.slice(0, 10), status: p.status, description: p.description, lat: p.lat, lng: p.lng });
  const byMuni = MUNICIPALITIES.map((m) => [m, rows.filter((r) => r.municipality === m).length] as const).filter(([, n]) => n > 0).sort((a, b) => b[1] - a[1]).slice(0, 4);
  const initials = (s: string) => s.replace(/[^A-Za-zČĆŽŠĐčćžšđ ]/g, '').split(' ').filter(Boolean).map((w) => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <>
      <PageTitle kicker="Registar okoliša i otpada" crumbs={['Registar okoliša i otpada', 'Administracija dozvola i pogona']} title="Registar okolišnih dozvola i operatera">
        <a href="/admin/mapa" className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-container-low hover:bg-surface-container text-text-heading font-button text-button transition-colors"><span className="material-symbols-outlined text-[18px]">share_location</span><span>Lokacije na mapi</span></a>
        <button type="button" disabled title="Masovni uvoz iz postojeće evidencije: Faza 2" className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-container-low text-outline font-button text-button cursor-not-allowed"><span className="material-symbols-outlined text-[18px]">upload_file</span><span>Masovni uvoz (XML/JSON)</span></button>
        <a href="/registri/okolisne-dozvole/izvoz?format=csv" className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-container-low hover:bg-surface-container text-text-heading font-button text-button transition-colors"><span className="material-symbols-outlined text-[18px]">download</span><span>Izvoz CSV</span></a>
        <button type="button" onClick={() => setForm({ ...EMPTY })} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary text-on-secondary hover:brightness-110 font-button text-button shadow-sm"><span className="material-symbols-outlined text-[19px]">add_circle</span><span>Nova okolišna dozvola (UPI)</span></button>
      </PageTitle>

      <div className="space-y-space-lg">
        <div className="relative overflow-hidden rounded-xl bg-surface-container-lowest shadow-sm p-space-lg">
          <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-secondary-container/20 blur-3xl pointer-events-none" />
          <div className="relative z-10 grid grid-cols-1 xl:grid-cols-12 gap-space-lg items-center">
            <div className="xl:col-span-7 space-y-space-xs">
              <span className="font-label-kicker text-label-kicker uppercase tracking-widest text-secondary">Zakonski okvir i valjanost registra</span>
              <h2 className="font-headline-sm text-headline-sm text-text-heading">Usklađeno sa Zakonom o zaštiti okoliša HNK</h2>
              <p className="font-body-regular text-body-regular text-text-body">Službena baza podataka Sektora za zaštitu okoliša MTTO. Svaki unos se odmah prikazuje u javnom registru, u dosjeu dozvole i na interaktivnoj mapi.</p>
              <p className="font-body-sm text-body-sm text-outline flex items-center gap-1 pt-1"><span className="material-symbols-outlined text-[16px] text-secondary">cloud_done</span>Javni portal sinkroniziran · Referent: Sektor za zaštitu okoliša</p>
            </div>
            <div className="xl:col-span-5 grid grid-cols-3 gap-space-sm">
              {[['Okolišne dozvole', 'verified', rows.length, `${rows.filter((r) => r.status === 'VAZECA').length} važećih`, 'text-primary'], ['U obnovi', 'history', rows.filter((r) => r.status === 'U_OBNOVI').length, 'postupak u toku', 'text-on-tertiary-container'], ['Upozorenja', 'warning', expiring.length, 'ističe < 90 dana', 'text-error']].map(([l, ic, n, sub, c]) => (
                <div key={l as string} className="p-space-sm rounded-xl bg-surface-container-low">
                  <div className="flex items-center justify-between"><span className="font-label-badge text-label-badge uppercase text-outline">{l}</span><span className={`material-symbols-outlined text-[18px] ${c}`}>{ic}</span></div>
                  <div className="font-headline-md text-headline-md text-text-heading font-bold">{n}</div>
                  <span className="font-body-sm text-[12px] text-outline">{sub}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-md">
          <div className="lg:col-span-8 rounded-xl bg-surface-container-lowest shadow-sm p-space-md flex flex-col gap-space-sm">
            <div className="flex items-center justify-between"><div><h3 className="font-title-md text-title-md font-bold text-text-heading">Geografski i ekološki nadzor HNK</h3><p className="font-body-sm text-body-sm text-outline">Lokacije postrojenja s okolišnom dozvolom</p></div><span className="font-label-badge text-label-badge px-2 py-0.5 rounded bg-surface-container text-primary">{points.length} na mapi</span></div>
            <MapSection points={points} height={300} compact title={false} />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">{byMuni.map(([m, n]) => <div key={m} className="px-3 py-2 rounded-lg bg-surface-container-low"><span className="block font-button text-button font-bold text-text-heading">{m}</span><span className="font-body-sm text-[12px] text-outline">{n} subjek{n === 1 ? 't' : 'ata'}</span></div>)}</div>
          </div>
          <div className="lg:col-span-4 rounded-xl bg-surface-container-lowest shadow-sm p-space-md flex flex-col gap-space-sm">
            <div className="flex items-center justify-between"><h3 className="font-title-md text-title-md font-bold text-text-heading">Senzorski telemetrijski status</h3><span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-herzeg-gold-soft text-[#786000] border border-herzeg-gold font-label-badge text-label-badge uppercase"><span className="material-symbols-outlined text-[13px]">science</span>Demo</span></div>
            <p className="font-body-sm text-body-sm text-outline">Prosječne vrijednosti u industrijskim zonama (GVE prag = 100%). Povezivanje mjernih stanica: Faza 2.</p>
            {[['Fluoridi (HF)', '0.42 mg/m³', 42, 'bg-secondary'], ['PM10 čestice', '38.4 µg/m³', 76, 'bg-on-tertiary-container'], ['Recipijent Neretva (BPK5)', '2.1 mg O₂/l', 30, 'bg-primary-container']].map(([l, v, p, c]) => (
              <div key={l as string} className="space-y-1"><div className="flex justify-between font-body-sm text-body-sm"><span className="text-text-body">{l}</span><strong className="text-text-heading">{v}</strong></div><div className="h-1.5 rounded-full bg-surface-container-low overflow-hidden"><div className={`h-full rounded-full ${c}`} style={{ width: `${p}%` }} /></div></div>
            ))}
          </div>
        </div>

        <div className="rounded-xl bg-surface-container-lowest shadow-sm p-space-lg space-y-space-md">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-sm">
            <div><h3 className="font-title-md text-title-md font-bold text-text-heading">Upravljanje registrom i inspekcijskim nadzorom</h3><p className="font-body-sm text-body-sm text-outline">Unos, izmjena i objava dozvola. Prikaz: {shown.length} od {rows.length} zapisa</p></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-space-sm">
            <label className="lg:col-span-2 flex flex-col gap-1"><span className={kick}>Općina / grad</span><select className={sel} value={fm} onChange={(e) => setFm(e.target.value)}><option value="">Sve općine HNK</option>{MUNICIPALITIES.map((m) => <option key={m}>{m}</option>)}</select></label>
            <label className="lg:col-span-2 flex flex-col gap-1"><span className={kick}>Djelatnost</span><select className={sel} value={fa} onChange={(e) => setFa(e.target.value)}><option value="">Sve djelatnosti</option>{ACTIVITIES.map((m) => <option key={m}>{m}</option>)}</select></label>
            <label className="lg:col-span-2 flex flex-col gap-1"><span className={kick}>Status dozvole</span><select className={sel} value={fs} onChange={(e) => setFs(e.target.value)}><option value="">Svi statusi</option>{Object.entries(PERMIT_STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}</select></label>
            <label className="lg:col-span-2 flex flex-col gap-1"><span className={kick}>Inspekcijski status</span><select className={`${sel} text-outline`} disabled title="Faza 2"><option>Sve vrste uviđaja</option></select></label>
            <label className="lg:col-span-4 flex flex-col gap-1"><span className={kick}>Brza pretraga</span><div className="relative flex items-center"><span className="material-symbols-outlined absolute left-3 text-outline text-[18px]">search</span><input className={`${input} pl-9`} placeholder="Operater, postrojenje ili UPI broj..." value={fq} onChange={(e) => setFq(e.target.value)} /></div></label>
          </div>
          <div className="overflow-x-auto rounded-lg">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead><tr className="bg-surface-container-low text-outline font-label-kicker text-[11px] uppercase tracking-wider">{['Subjekt i UPI predmet', 'Lokacija i općina', 'Karakteristike', 'Status dozvole', 'Ekološki nadzor', 'Akcije referenta'].map((h) => <th key={h} className="p-space-md">{h}</th>)}</tr></thead>
              <tbody>
                {shown.length === 0 && <tr><td colSpan={6} className="p-space-lg text-center text-outline">Nema zapisa za odabrane filtre.</td></tr>}
                {shown.map((p) => {
                  const st = PERMIT_STATUS[p.status] ?? PERMIT_STATUS.VAZECA;
                  const d = daysUntil(p.validUntil)!;
                  return (
                    <tr key={p.id} className="hover:bg-surface-container-low/60 transition-colors align-top">
                      <td className="p-space-md"><div className="flex items-start gap-3"><div className="w-10 h-10 rounded-lg bg-primary-container text-on-primary flex items-center justify-center font-bold text-[13px] shrink-0">{initials(p.operator)}</div><div><span className="block font-button text-button font-bold text-text-heading">{p.operator}</span><span className="font-mono text-[12px] text-primary">{p.registerNumber}</span>{p.isDemo && <span className="ml-1 font-label-badge text-[10px] text-[#786000] bg-herzeg-gold-soft px-1.5 rounded uppercase">Demo</span>}</div></div></td>
                      <td className="p-space-md"><span className="block font-body-sm text-body-sm text-text-heading">{p.address || '—'}</span><span className="font-body-sm text-body-sm font-semibold text-on-surface-variant">{p.municipality}</span></td>
                      <td className="p-space-md"><span className="block font-body-sm text-body-sm text-text-heading">{p.facility}</span><span className="font-label-badge text-label-badge px-1.5 py-0.5 rounded bg-surface-container text-primary">{p.activity}</span></td>
                      <td className="p-space-md"><span className={`inline-flex px-2 py-0.5 rounded-full font-label-badge text-label-badge font-bold ${st.cls}`}>{st.label}</span><span className={`block font-body-sm text-[12px] mt-1 ${d >= 0 && d <= 90 ? 'text-error font-semibold' : 'text-outline'}`}>do {dateShort(p.validUntil)}{d >= 0 && d <= 90 ? ` · ${d} dana` : ''}</span></td>
                      <td className="p-space-md"><span className="flex items-center gap-1 font-body-sm text-body-sm text-text-body"><span className={`material-symbols-outlined text-[16px] ${p.lat ? 'text-secondary' : 'text-outline'}`}>{p.lat ? 'location_on' : 'location_off'}</span>{p.lat ? 'Na mapi' : 'Bez lokacije'}</span><span className="flex items-center gap-1 font-body-sm text-[12px] text-outline"><span className="material-symbols-outlined text-[14px]">description</span>{p.documentCount} dokument(a)</span></td>
                      <td className="p-space-md">
                        <div className="flex items-center gap-1">
                          <button type="button" onClick={() => edit(p)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-surface-container text-primary font-button text-button hover:bg-surface-container-high"><span className="material-symbols-outlined text-[18px]">edit_note</span>Uredi</button>
                          <a href={`/registri/okolisne-dozvole/${p.id}`} target="_blank" rel="noopener" className="p-1.5 rounded-lg text-outline hover:text-primary hover:bg-surface-container" title="Javni dosje"><span className="material-symbols-outlined text-[19px]">open_in_new</span></a>
                          <button type="button" onClick={() => remove(p)} className="p-1.5 rounded-lg text-outline hover:text-error hover:bg-error-container/40" title="Obriši"><span className="material-symbols-outlined text-[19px]">delete</span></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {form && (
        <>
          <div className="fixed inset-0 bg-institutional-navy-deep/30 z-[55]" onClick={() => { setForm(null); setFile(null); }} />
          <form onSubmit={save} className="fixed inset-y-0 right-0 w-full max-w-2xl bg-surface-container-lowest shadow-2xl z-[56] flex flex-col">
            <div className="p-space-md bg-institutional-navy-deep text-on-primary flex items-center justify-between">
              <div className="flex items-center gap-space-sm"><span className="material-symbols-outlined">nature_people</span><div><span className="font-label-kicker text-label-kicker uppercase text-surface-variant block">{form.id ? 'Izmjena zapisa u registru' : 'Novi unos u registar'}</span><span className="font-title-md text-title-md font-bold">{form.operator || 'Okolišna dozvola'}</span>{form.registerNumber && <span className="font-mono text-body-sm text-surface-variant ml-2">{form.registerNumber}</span>}</div></div>
              <button type="button" onClick={() => { setForm(null); setFile(null); }} className="p-2 rounded-lg hover:bg-white/10"><span className="material-symbols-outlined">close</span></button>
            </div>
            <div className="flex-1 overflow-y-auto p-space-md space-y-space-md">
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
              <Field label="Opis postrojenja"><textarea className={input} rows={3} value={form.description} onChange={(e) => set('description', e.target.value)} /></Field>
              <Field label="Rješenje (PDF)" hint="opciono"><input type="file" accept="application/pdf" className="block font-body-sm text-body-sm" onChange={(e) => setFile(e.target.files?.[0] ?? null)} /></Field>
              <Field label="Lokacija na mapi" hint={form.lat ? `${form.lat.toFixed(5)}, ${form.lng?.toFixed(5)}` : 'kliknite na mapu'}><div /></Field>
              <LocationPicker lat={form.lat} lng={form.lng} onChange={(la, lo) => setForm((f) => (f ? { ...f, lat: la, lng: lo } : f))} />
              <div className="p-space-sm rounded-lg bg-surface-container-low flex items-center justify-between"><span className="font-body-sm text-body-sm text-outline flex items-center gap-1"><span className="material-symbols-outlined text-[18px]">science</span>Mjerenja emisija i inspekcijski zapisnici</span><F2Badge /></div>
            </div>
            <div className="p-space-md bg-surface-container-low border-t border-surface-container flex items-center justify-end gap-space-sm">
              <button type="button" className="px-4 py-2 rounded-lg bg-surface-container text-text-heading font-button text-button" onClick={() => { setForm(null); setFile(null); }}>Odustani</button>
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary text-on-secondary font-button text-button shadow-sm disabled:opacity-50" disabled={busy}><span className="material-symbols-outlined text-[18px]">verified</span>{busy ? 'Spremanje…' : form.id ? 'Potvrdi i ažuriraj registar' : 'Upiši u registar'}</button>
            </div>
          </form>
        </>
      )}
      {toast.node}
    </>
  );
}
