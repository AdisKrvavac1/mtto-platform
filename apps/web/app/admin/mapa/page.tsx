'use client';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { adminFetch } from '@/lib/adminApi';
import { Card, Field, PageTitle, btnGreen, btnSecondary, input, useToast } from '@/components/admin/ui';
import { LAYERS } from '@/components/site/MapView';
import type { MapPoint } from '@/lib/api';

const LocationPicker = dynamic(() => import('@/components/admin/LocationPicker'), { ssr: false, loading: () => <div className="h-[420px] rounded-lg bg-surface-container-low animate-pulse" /> });

type Loc = { id: string; name: string; layer: MapPoint['layer']; description: string; lat: number; lng: number; link: string | null };
const EMPTY = { name: '', layer: 'TURIZAM' as MapPoint['layer'], description: '', lat: null as number | null, lng: null as number | null, link: '' };

export default function MapAdmin() {
  const [rows, setRows] = useState<Loc[]>([]);
  const [f, setF] = useState(EMPTY);
  const [busy, setBusy] = useState(false);
  const [key, setKey] = useState(0);
  const toast = useToast();
  const load = () => adminFetch<Loc[]>('/admin/locations').then(setRows).catch((e) => toast.err(e.message));
  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (f.lat === null) { toast.err('Kliknite na mapu da postavite lokaciju'); return; }
    setBusy(true);
    try {
      await adminFetch('/admin/locations', { method: 'POST', body: JSON.stringify(f) });
      toast.ok('Lokacija je objavljena na javnoj mapi');
      setF(EMPTY);
      setKey((k) => k + 1);
      load();
    } catch (e: any) { toast.err(e.message); } finally { setBusy(false); }
  }

  async function remove(l: Loc) {
    if (!confirm(`Ukloniti „${l.name}” s mape?`)) return;
    try { await adminFetch(`/admin/locations/${l.id}`, { method: 'DELETE' }); toast.ok('Lokacija uklonjena'); load(); } catch (e: any) { toast.err(e.message); }
  }

  return (
    <>
      <PageTitle kicker="Geo Manager" title="Lokacije na interaktivnoj mapi">
        <a href="/mapa" target="_blank" rel="noopener" className={btnSecondary}><span className="material-symbols-outlined text-[18px]">public</span>Javna mapa</a>
      </PageTitle>
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-space-lg items-start">
        <Card className="xl:col-span-7 p-space-md md:p-space-lg">
          <form onSubmit={save} className="space-y-space-md">
            <h2 className="font-title-md text-title-md font-bold text-text-heading">Dodaj lokaciju</h2>
            <LocationPicker key={key} lat={f.lat} lng={f.lng} height={420} onChange={(lat, lng) => setF((s) => ({ ...s, lat, lng }))} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-space-sm">
              <Field label="Naziv" required><input className={input} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} required /></Field>
              <Field label="Sloj mape"><select className={input} value={f.layer} onChange={(e) => setF({ ...f, layer: e.target.value as MapPoint['layer'] })}>{(['TURIZAM', 'ZASTICENO', 'PROJEKT'] as const).map((k) => <option key={k} value={k}>{LAYERS[k].label}</option>)}</select></Field>
            </div>
            <Field label="Opis"><input className={input} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} /></Field>
            <Field label="Link na detalje" hint="opciono"><input className={input} value={f.link} onChange={(e) => setF({ ...f, link: e.target.value })} placeholder="/vijesti/... ili https://..." /></Field>
            <div className="flex items-center justify-between">
              <span className="font-mono text-[12px] text-on-surface-variant">{f.lat !== null ? `${f.lat}° N, ${f.lng}° E` : 'Lokacija nije postavljena'}</span>
              <button className={btnGreen} disabled={busy}><span className="material-symbols-outlined text-[18px]">add_location_alt</span>Objavi na mapi</button>
            </div>
            <p className="font-body-sm text-[12px] text-on-surface-variant">Okolišne dozvole i ugostiteljski objekti pojavljuju se na mapi automatski, iz svojih registara.</p>
          </form>
        </Card>
        <Card className="xl:col-span-5 overflow-hidden">
          <div className="p-space-md border-b border-slate-border"><h2 className="font-title-md text-title-md font-bold text-text-heading">Ručno unesene lokacije ({rows.length})</h2></div>
          <ul className="divide-y divide-slate-border">
            {rows.map((l) => (
              <li key={l.id} className="flex items-start gap-space-sm p-space-md">
                <span className="mt-1.5 w-3 h-3 rounded-full shrink-0" style={{ background: LAYERS[l.layer]?.color }} />
                <span className="flex-1 min-w-0"><span className="block font-button text-button font-bold text-text-heading">{l.name}</span><span className="block font-body-sm text-[12px] text-on-surface-variant">{LAYERS[l.layer]?.label} · {l.description}</span></span>
                <button type="button" onClick={() => remove(l)} className="w-8 h-8 rounded bg-error-container text-on-error-container inline-flex items-center justify-center" title="Ukloni"><span className="material-symbols-outlined text-[18px]">delete</span></button>
              </li>
            ))}
          </ul>
        </Card>
      </div>
      {toast.node}
    </>
  );
}
