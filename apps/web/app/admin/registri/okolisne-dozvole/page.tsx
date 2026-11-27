'use client';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { adminFetch, useCan } from '@/lib/adminApi';
import { Avatar, Badge, Card, CardHeader, EmptyState, F2Badge, Field, MetricCard, PageTitle, ProgressBar, StatusChip, btnPrimary, btnSecondary, iconBtn, input, td, th, tr, useToast } from '@/components/admin/ui';
import { ClipboardCheck, Download01, Edit01, File06, LinkExternal01, Map01, MarkerPin02, Plus, SearchLg, Trash01, XClose } from '@untitledui/icons';
import type { MapPoint } from '@/lib/api';
import { PERMIT_STATUS, dateShort, daysUntil } from '@/lib/format';

const MapSection = dynamic(() => import('@/components/site/MapSection'), { ssr: false });
const LocationPicker = dynamic(() => import('@/components/admin/LocationPicker'), { ssr: false, loading: () => <div className="h-[260px] rounded-lg bg-[#f5f5f5] animate-pulse" /> });

type Permit = { id: string; registerNumber: string; operator: string; facility: string; activity: string; municipality: string; address: string; issuedAt: string; validUntil: string; status: string; description: string; lat: number | null; lng: number | null; isDemo: boolean; documentCount: number };
const MUNICIPALITIES = ['Čapljina', 'Čitluk', 'Jablanica', 'Konjic', 'Mostar', 'Neum', 'Prozor-Rama', 'Ravno', 'Stolac'];
const ACTIVITIES = ['Industrija', 'Energetika', 'Otpad', 'Turizam', 'Ostalo'];
const EMPTY = { id: '', registerNumber: '', operator: '', facility: '', activity: 'Industrija', municipality: 'Mostar', address: '', issuedAt: '', validUntil: '', status: 'VAZECA', description: '', lat: null as number | null, lng: null as number | null };

export default function RegistryAdmin() {
  const canEdit = useCan('registri', 'write');
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
  const edit = (p: Permit) => setForm({ id: p.id, registerNumber: p.registerNumber, operator: p.operator, facility: p.facility, activity: p.activity, municipality: p.municipality, address: p.address, issuedAt: p.issuedAt.slice(0, 10), validUntil: p.validUntil.slice(0, 10), status: p.status, description: p.description, lat: p.lat, lng: p.lng });
  const byMuni = MUNICIPALITIES.map((m) => [m, rows.filter((r) => r.municipality === m).length] as const).filter(([, n]) => n > 0).sort((a, b) => b[1] - a[1]);
  const maxM = Math.max(1, ...byMuni.map(([, n]) => n));
  const close = () => { setForm(null); setFile(null); };

  return (
    <>
      <PageTitle kicker="Unos, izmjena i objava dozvola. Svaki zapis odmah se prikazuje u javnom registru i na karti." crumbs={['Okolišne dozvole']} title="Registar okolišnih dozvola">
        <a href="/registri/okolisne-dozvole/izvoz?format=csv" className={btnSecondary}><Download01 />Izvoz CSV</a>
        {canEdit && <button type="button" onClick={() => setForm({ ...EMPTY })} className={btnPrimary}><Plus />Nova dozvola</button>}
      </PageTitle>

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Ukupno dozvola" value={rows.length} footer={`${rows.filter((r) => r.status === 'VAZECA').length} važećih`} />
        <MetricCard title="U obnovi" value={rows.filter((r) => r.status === 'U_OBNOVI').length} footer="Postupak u toku" />
        <MetricCard title="Ističe za 90 dana" value={expiring.length} footer={expiring.length ? <span className="text-[#d92d20]">Potrebna obnova</span> : 'Nema upozorenja'} />
        <MetricCard title="Na karti" value={points.length} footer={`${rows.length - points.length} bez lokacije`} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_360px]">
        <Card className="overflow-hidden">
          <CardHeader title="Lokacije postrojenja" description="Dozvole s unesenom lokacijom." actions={<a href="/admin/mapa" className={btnSecondary}><Map01 />Sve lokacije</a>} />
          <div className="p-2"><div className="overflow-hidden rounded-[8px]"><MapSection points={points} height={320} compact title={false} /></div></div>
        </Card>
        <Card className="flex flex-col">
          <CardHeader title="Po općinama" menu />
          <ul className="flex flex-1 flex-col gap-5 p-4 md:p-6">
            {byMuni.length === 0 && <li className="text-[14px] text-[#525252]">Registar je prazan.</li>}
            {byMuni.map(([m, n]) => <li key={m}><span className="flex justify-between text-[14px] font-medium text-[#404040]"><span>{m}</span><span className="text-[#525252]">{n}</span></span><span className="mt-2 block"><ProgressBar value={(n / maxM) * 100} /></span></li>)}
          </ul>
        </Card>
      </div>

      <Card className="mt-6 overflow-hidden">
        <CardHeader title="Sve dozvole" badge={<Badge tone="brand">{shown.length} od {rows.length}</Badge>} />
        <div className="grid gap-3 border-b border-[#e5e5e5] px-4 py-4 md:grid-cols-2 md:px-6 lg:grid-cols-[1fr_180px_180px_180px]">
          <label className="relative"><span className="sr-only">Pretraga</span><SearchLg size={20} className="pointer-events-none absolute left-3 top-2.5 text-[#a3a3a3]" /><input className={`${input} pl-10`} placeholder="Operater, postrojenje ili broj" value={fq} onChange={(e) => setFq(e.target.value)} /></label>
          <select className={input} value={fm} onChange={(e) => setFm(e.target.value)} aria-label="Općina"><option value="">Sve općine</option>{MUNICIPALITIES.map((m) => <option key={m}>{m}</option>)}</select>
          <select className={input} value={fa} onChange={(e) => setFa(e.target.value)} aria-label="Djelatnost"><option value="">Sve djelatnosti</option>{ACTIVITIES.map((m) => <option key={m}>{m}</option>)}</select>
          <select className={input} value={fs} onChange={(e) => setFs(e.target.value)} aria-label="Status"><option value="">Svi statusi</option>{Object.entries(PERMIT_STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}</select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px]">
            <thead><tr><th className={th}>Operater</th><th className={th}>Lokacija</th><th className={th}>Postrojenje</th><th className={th}>Status</th><th className={th}>Važi do</th><th className={th}>Prilozi</th><th className={th}><span className="sr-only">Radnje</span></th></tr></thead>
            <tbody>
              {shown.length === 0 && <tr><td colSpan={7}><EmptyState icon={ClipboardCheck} title="Nema dozvola" action={canEdit ? <button type="button" onClick={() => setForm({ ...EMPTY })} className={btnPrimary}><Plus />Nova dozvola</button> : undefined}>Nijedan zapis ne odgovara filterima.</EmptyState></td></tr>}
              {shown.map((p) => {
                const d = daysUntil(p.validUntil)!;
                const soon = d >= 0 && d <= 90;
                return (
                  <tr key={p.id} className={tr}>
                    <td className={td}><div className="flex items-center gap-3"><Avatar name={p.operator} /><div className="min-w-0"><span className="block font-medium text-[#171717]">{p.operator}{p.isDemo && <Badge tone="warning" className="ml-2">Demo</Badge>}</span><span>{p.registerNumber}</span></div></div></td>
                    <td className={td}><span className="block text-[#171717]">{p.municipality}</span><span>{p.address || '—'}</span></td>
                    <td className={td}><span className="block text-[#171717]">{p.facility}</span><Badge tone="gray">{p.activity}</Badge></td>
                    <td className={td}><StatusChip status={p.status} /></td>
                    <td className={`${td} whitespace-nowrap`}><span className={soon ? 'font-medium text-[#d92d20]' : ''}>{dateShort(p.validUntil)}</span>{soon && <span className="block text-[12px] text-[#d92d20]">još {d} dana</span>}</td>
                    <td className={td}><span className="flex items-center gap-1.5">{p.lat ? <MarkerPin02 size={16} className="text-[#7f56d9]" /> : <MarkerPin02 size={16} className="text-[#d4d4d4]" />}<File06 size={16} className="text-[#a3a3a3]" />{p.documentCount}</span></td>
                    <td className={`${td} whitespace-nowrap text-right`}>
                      <a href={`/registri/okolisne-dozvole/${p.id}`} target="_blank" rel="noopener" className={iconBtn} title="Javni dosje"><LinkExternal01 /></a>
                      <button type="button" onClick={() => remove(p)} className={`${iconBtn} hover:!text-[#d92d20]`} title="Obriši"><Trash01 /></button>
                      <button type="button" onClick={() => edit(p)} className={iconBtn} title="Uredi"><Edit01 /></button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {form && (
        <>
          <div className="fixed inset-0 z-[55] bg-[#0a0d12]/70 backdrop-blur-[2px]" onClick={close} />
          <form onSubmit={save} className="fixed inset-y-0 right-0 z-[56] flex w-full max-w-[560px] flex-col bg-white shadow-[0_24px_48px_-12px_rgba(10,13,18,0.18)]">
            <div className="flex items-start justify-between gap-4 border-b border-[#e5e5e5] px-4 py-5 md:px-6">
              <div className="flex items-start gap-4"><span className="flex size-12 items-center justify-center rounded-[10px] text-[#525252] ring-1 ring-inset ring-[#d4d4d4] shadow-[0_1px_2px_rgba(10,13,18,0.05)]"><ClipboardCheck size={24} /></span><div><h2 className="text-[18px] leading-7 font-semibold text-[#171717]">{form.id ? 'Uredi dozvolu' : 'Nova okolišna dozvola'}</h2><p className="text-[14px] text-[#525252]">{form.registerNumber || 'Upis u javni registar i na kartu.'}</p></div></div>
              <button type="button" onClick={close} className={iconBtn} aria-label="Zatvori"><XClose /></button>
            </div>
            <div className="flex-1 space-y-5 overflow-y-auto px-4 py-6 md:px-6">
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Broj rješenja (UPI)" required><input className={input} value={form.registerNumber} onChange={(e) => set('registerNumber', e.target.value)} placeholder="UPI/05-23-…/26" required /></Field>
                <Field label="Status"><select className={input} value={form.status} onChange={(e) => set('status', e.target.value)}>{Object.entries(PERMIT_STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}</select></Field>
                <Field label="Operater" required><input className={input} value={form.operator} onChange={(e) => set('operator', e.target.value)} required /></Field>
                <Field label="Postrojenje" required><input className={input} value={form.facility} onChange={(e) => set('facility', e.target.value)} required /></Field>
                <Field label="Djelatnost"><select className={input} value={form.activity} onChange={(e) => set('activity', e.target.value)}>{ACTIVITIES.map((a) => <option key={a}>{a}</option>)}</select></Field>
                <Field label="Općina"><select className={input} value={form.municipality} onChange={(e) => set('municipality', e.target.value)}>{MUNICIPALITIES.map((m) => <option key={m}>{m}</option>)}</select></Field>
                <Field label="Datum izdavanja" required><input type="date" className={input} value={form.issuedAt} onChange={(e) => set('issuedAt', e.target.value)} required /></Field>
                <Field label="Važi do" required><input type="date" className={input} value={form.validUntil} onChange={(e) => set('validUntil', e.target.value)} required /></Field>
              </div>
              <Field label="Adresa"><input className={input} value={form.address} onChange={(e) => set('address', e.target.value)} /></Field>
              <Field label="Opis postrojenja"><textarea className={input} rows={3} value={form.description} onChange={(e) => set('description', e.target.value)} /></Field>
              <Field label="Rješenje (PDF)" hint="Opcionalno"><input type="file" accept="application/pdf" className="block w-full text-[14px] text-[#525252] file:mr-3 file:rounded-[8px] file:border-0 file:bg-[#f9f5ff] file:px-3 file:py-2 file:text-[14px] file:font-semibold file:text-[#6941c6]" onChange={(e) => setFile(e.target.files?.[0] ?? null)} /></Field>
              <div className="space-y-1.5"><span className="flex justify-between text-[14px] font-medium text-[#404040]"><span>Lokacija na karti</span><span className="font-normal text-[#737373]">{form.lat ? `${form.lat.toFixed(5)}, ${form.lng?.toFixed(5)}` : 'Kliknite na kartu'}</span></span>
                <LocationPicker lat={form.lat} lng={form.lng} onChange={(la, lo) => setForm((f) => (f ? { ...f, lat: la, lng: lo } : f))} /></div>
              <div className="flex items-center justify-between rounded-[8px] bg-[#fafafa] p-3 text-[14px] text-[#525252]"><span>Mjerenja emisija i inspekcijski zapisnici</span><F2Badge /></div>
            </div>
            <div className="flex justify-end gap-3 border-t border-[#e5e5e5] px-4 py-4 md:px-6">
              <button type="button" className={btnSecondary} onClick={close}>Odustani</button>
              <button className={btnPrimary} disabled={busy}>{busy ? 'Spremanje…' : form.id ? 'Spremi izmjene' : 'Upiši u registar'}</button>
            </div>
          </form>
        </>
      )}
      {toast.node}
    </>
  );
}
