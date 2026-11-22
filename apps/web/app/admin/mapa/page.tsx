'use client';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { adminFetch } from '@/lib/adminApi';
import { Badge, Card, CardHeader, EmptyState, Field, PageTitle, btnPrimary, btnSecondary, iconBtn, input, useToast } from '@/components/admin/ui';
import { Globe01, Map01, MarkerPin02, Plus, Trash01 } from '@untitledui/icons';
import { LAYERS } from '@/components/site/MapView';
import type { MapPoint } from '@/lib/api';

const LocationPicker = dynamic(() => import('@/components/admin/LocationPicker'), { ssr: false, loading: () => <div className="h-[420px] rounded-lg bg-[#f5f5f5] animate-pulse" /> });

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
      <PageTitle kicker="Turističke lokacije, zaštićena područja i projekti na javnoj karti." crumbs={['Lokacije na karti']} title="Lokacije na karti">
        <a href="/mapa" target="_blank" rel="noopener" className={btnSecondary}><Globe01 />Javna karta</a>
      </PageTitle>
      <div className="grid items-start gap-6 xl:grid-cols-12">
        <Card className="xl:col-span-7">
          <CardHeader title="Dodaj lokaciju" description="Kliknite na kartu da postavite oznaku." />
          <form onSubmit={save} className="space-y-5 p-4 md:p-6">
            <div className="overflow-hidden rounded-[8px]"><LocationPicker key={key} lat={f.lat} lng={f.lng} height={420} onChange={(lat, lng) => setF((s) => ({ ...s, lat, lng }))} /></div>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Naziv" required><input className={input} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} required /></Field>
              <Field label="Sloj"><select className={input} value={f.layer} onChange={(e) => setF({ ...f, layer: e.target.value as MapPoint['layer'] })}>{(['TURIZAM', 'ZASTICENO', 'PROJEKT'] as const).map((k) => <option key={k} value={k}>{LAYERS[k].label}</option>)}</select></Field>
            </div>
            <Field label="Opis"><input className={input} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} /></Field>
            <Field label="Link na detalje" hint="Opcionalno"><input className={input} value={f.link} onChange={(e) => setF({ ...f, link: e.target.value })} placeholder="/vijesti/… ili https://…" /></Field>
            <div className="flex flex-col-reverse gap-3 border-t border-[#e5e5e5] pt-5 sm:flex-row sm:items-center sm:justify-between">
              <span className="flex items-center gap-1.5 text-[14px] text-[#525252]"><MarkerPin02 size={16} className={f.lat !== null ? 'text-[#7f56d9]' : 'text-[#d4d4d4]'} />{f.lat !== null ? `${f.lat}° N, ${f.lng}° E` : 'Lokacija nije postavljena'}</span>
              <button className={btnPrimary} disabled={busy}><Plus />Objavi na karti</button>
            </div>
            <p className="text-[14px] text-[#737373]">Okolišne dozvole i ugostiteljski objekti pojavljuju se na karti automatski, iz svojih registara.</p>
          </form>
        </Card>
        <Card className="overflow-hidden xl:col-span-5">
          <CardHeader title="Ručno unesene lokacije" badge={<Badge tone="brand">{rows.length}</Badge>} />
          {rows.length === 0 ? <EmptyState icon={Map01} title="Nema lokacija">Dodajte prvu lokaciju na karti lijevo.</EmptyState> : (
            <ul className="divide-y divide-[#e5e5e5]">
              {rows.map((l) => (
                <li key={l.id} className="flex items-center gap-3 px-4 py-4 md:px-6">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full" style={{ background: `${LAYERS[l.layer]?.color}1a`, color: LAYERS[l.layer]?.color }}><MarkerPin02 size={20} /></span>
                  <span className="min-w-0 flex-1"><span className="block truncate text-[14px] font-medium text-[#171717]">{l.name}</span><span className="block truncate text-[14px] text-[#525252]">{LAYERS[l.layer]?.label}{l.description ? ` · ${l.description}` : ''}</span></span>
                  <button type="button" onClick={() => remove(l)} className={`${iconBtn} hover:!text-[#d92d20]`} title="Ukloni"><Trash01 /></button>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
      {toast.node}
    </>
  );
}
