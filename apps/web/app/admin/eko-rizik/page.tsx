'use client';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { adminFetch } from '@/lib/adminApi';
import { Card, Field, PageTitle, btnGreen, btnSecondary, input, useToast } from '@/components/admin/ui';
import { LS_STATUS, REPORT_STATUS, fmtTime, type Landslide } from '@/lib/risk';

const LocationPicker = dynamic(() => import('@/components/admin/LocationPicker'), { ssr: false, loading: () => <div className="h-[320px] rounded-lg bg-surface-container-low animate-pulse" /> });

const MUNICIPALITIES = ['Čapljina', 'Čitluk', 'Jablanica', 'Konjic', 'Mostar', 'Neum', 'Prozor-Rama', 'Ravno', 'Stolac'];
const KIND: Record<string, string> = { POZAR: 'Požar ili dim', DEPONIJA: 'Divlja deponija', VODA: 'Zagađenje vode', ZRAK: 'Zrak / mirisi', KLIZISTE: 'Klizište / odron', POPLAVA: 'Poplava / bujica', SJECA: 'Nelegalna sječa', OSTALO: 'Ostalo' };
type Report = { id: string; code: string; kind: string; municipality: string; location: string; lat: number | null; lng: number | null; description: string; contactName: string | null; contactEmail: string | null; status: string; isPublic: boolean; note: string; createdAt: string };
const BLANK = { id: '', name: '', municipality: 'Mostar', status: 'AKTIVNO', risk: 2, description: '', source: '', lat: null as number | null, lng: null as number | null };

export default function RiskAdmin() {
  const [tab, setTab] = useState<'prijave' | 'klizista'>('prijave');
  const [ls, setLs] = useState<Landslide[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [f, setF] = useState(BLANK);
  const [pk, setPk] = useState(0);
  const [busy, setBusy] = useState(false);
  const toast = useToast();
  const load = () => Promise.all([adminFetch<Landslide[]>('/admin/landslides').then(setLs), adminFetch<Report[]>('/admin/eco-reports').then(setReports)]).catch((e) => toast.err(e.message));
  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function saveLs(e: React.FormEvent) {
    e.preventDefault();
    if (f.lat == null) return toast.err('Kliknite na kartu da postavite lokaciju klizišta');
    setBusy(true);
    try {
      const { id, ...body } = f;
      await adminFetch(id ? `/admin/landslides/${id}` : '/admin/landslides', { method: id ? 'PATCH' : 'POST', body: JSON.stringify(body) });
      toast.ok(id ? 'Klizište ažurirano' : 'Klizište dodano u registar');
      setF(BLANK); setPk((k) => k + 1); load();
    } catch (x: any) { toast.err(x.message); } finally { setBusy(false); }
  }
  async function removeLs(l: Landslide) {
    if (!confirm(`Ukloniti „${l.name}” iz registra?`)) return;
    try { await adminFetch(`/admin/landslides/${l.id}`, { method: 'DELETE' }); toast.ok('Uklonjeno'); load(); } catch (x: any) { toast.err(x.message); }
  }
  async function patchReport(r: Report, body: Partial<Report>) {
    try { await adminFetch(`/admin/eco-reports/${r.id}`, { method: 'PATCH', body: JSON.stringify(body) }); toast.ok('Prijava ažurirana'); load(); } catch (x: any) { toast.err(x.message); }
  }
  const fresh = reports.filter((r) => r.status === 'NOVO').length;

  return (
    <>
      <PageTitle kicker="Sistem ranog informisanja" title="Eko-rizik HNK: prijave i klizišta">
        <a href="/eko-rizik" target="_blank" rel="noopener" className={btnSecondary}><span className="material-symbols-outlined text-[18px]">public</span>Javni prikaz</a>
        <a href="/eko-rizik/krizni" target="_blank" rel="noopener" className={btnSecondary}><span className="material-symbols-outlined text-[18px]">monitor_heart</span>Krizni prikaz</a>
      </PageTitle>
      <div className="flex gap-2 mb-space-md" role="tablist">
        {([['prijave', `Prijave građana${fresh ? ` (${fresh} novih)` : ''}`], ['klizista', `Registar klizišta (${ls.length})`]] as const).map(([k, l]) => (
          <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={`px-4 py-2 rounded-lg font-button text-button ${tab === k ? 'bg-primary text-on-primary' : 'bg-surface-container-lowest text-primary hover:bg-surface-container-low'}`}>{l}</button>
        ))}
      </div>

      {tab === 'prijave' && (
        <Card className="overflow-hidden">
          {reports.length === 0 && <p className="p-space-lg text-center text-outline font-body-sm">Nema prijava.</p>}
          <ul className="divide-y divide-slate-border">
            {reports.map((r) => (
              <li key={r.id} className="p-space-md grid grid-cols-1 lg:grid-cols-12 gap-space-sm">
                <div className="lg:col-span-7 min-w-0">
                  <div className="flex flex-wrap items-center gap-2"><span className="font-mono text-[12px] text-outline">{r.code}</span><span className="font-button text-button font-bold text-text-heading">{KIND[r.kind] ?? r.kind}</span><span className="font-body-sm text-[12px] text-outline">{r.municipality}{r.location ? ` · ${r.location}` : ''} · {fmtTime(r.createdAt)}</span></div>
                  <p className="font-body-sm text-body-sm text-text-body mt-1 whitespace-pre-line">{r.description}</p>
                  <p className="font-body-sm text-[12px] text-outline mt-1">{r.contactName || r.contactEmail ? `Prijavitelj: ${r.contactName ?? ''} ${r.contactEmail ? `<${r.contactEmail}>` : ''}` : 'Anonimna prijava'}{r.lat != null ? ` · ${r.lat}, ${r.lng}` : ' · bez koordinata'}</p>
                </div>
                <div className="lg:col-span-5 flex flex-wrap items-start lg:justify-end gap-2">
                  <select aria-label="Status prijave" className={`${input} !w-auto`} value={r.status} onChange={(e) => patchReport(r, { status: e.target.value })}>{Object.entries(REPORT_STATUS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
                  <button type="button" onClick={() => patchReport(r, { isPublic: !r.isPublic })} className={r.isPublic ? btnGreen : btnSecondary} title="Prikaz na javnoj karti, bez ličnih podataka">
                    <span className="material-symbols-outlined text-[18px]">{r.isPublic ? 'visibility' : 'visibility_off'}</span>{r.isPublic ? 'Javno' : 'Nije javno'}
                  </button>
                  {r.contactEmail && <a className={btnSecondary} href={`mailto:${r.contactEmail}?subject=${encodeURIComponent(`Vaša eko-prijava ${r.code}`)}`}><span className="material-symbols-outlined text-[18px]">reply</span>Odgovori</a>}
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {tab === 'klizista' && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-space-lg items-start">
          <Card className="xl:col-span-7 p-space-md md:p-space-lg">
            <form onSubmit={saveLs} className="space-y-space-md">
              <h2 className="font-title-md text-title-md font-bold text-text-heading">{f.id ? 'Uredi klizište' : 'Dodaj klizište'}</h2>
              <LocationPicker key={pk} lat={f.lat} lng={f.lng} height={320} onChange={(lat, lng) => setF((s) => ({ ...s, lat, lng }))} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-space-sm">
                <Field label="Naziv" required><input className={input} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} required /></Field>
                <Field label="Općina" required><select className={input} value={f.municipality} onChange={(e) => setF({ ...f, municipality: e.target.value })}>{MUNICIPALITIES.map((m) => <option key={m}>{m}</option>)}</select></Field>
                <Field label="Status"><select className={input} value={f.status} onChange={(e) => setF({ ...f, status: e.target.value })}>{Object.entries(LS_STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}</select></Field>
                <Field label="Nivo rizika"><select className={input} value={f.risk} onChange={(e) => setF({ ...f, risk: +e.target.value })}><option value={1}>1 – nizak</option><option value={2}>2 – srednji</option><option value={3}>3 – visok</option></select></Field>
              </div>
              <Field label="Opis"><textarea className={input} rows={3} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} /></Field>
              <Field label="Izvor podatka" hint="npr. općinska civilna zaštita, terenski obilazak"><input className={input} value={f.source} onChange={(e) => setF({ ...f, source: e.target.value })} /></Field>
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-[12px] text-on-surface-variant">{f.lat != null ? `${f.lat}° N, ${f.lng}° E` : 'Lokacija nije postavljena'}</span>
                <span className="flex gap-2">{f.id && <button type="button" className={btnSecondary} onClick={() => { setF(BLANK); setPk((k) => k + 1); }}>Odustani</button>}<button className={btnGreen} disabled={busy}><span className="material-symbols-outlined text-[18px]">save</span>{f.id ? 'Spremi izmjene' : 'Dodaj u registar'}</button></span>
              </div>
            </form>
          </Card>
          <Card className="xl:col-span-5 overflow-hidden">
            <div className="p-space-md border-b border-slate-border"><h2 className="font-title-md text-title-md font-bold text-text-heading">Registar ({ls.length})</h2></div>
            <ul className="divide-y divide-slate-border">
              {ls.map((l) => (
                <li key={l.id} className="flex items-start gap-space-sm p-space-md">
                  <span className="mt-1.5 w-3 h-3 rounded-sm shrink-0" style={{ background: LS_STATUS[l.status]?.color }} />
                  <span className="flex-1 min-w-0"><span className="block font-button text-button font-bold text-text-heading">{l.name}{l.isDemo && <span className="ml-1.5 text-[10px] font-bold uppercase text-[#786000] bg-herzeg-gold-soft px-1.5 rounded">Demo</span>}</span><span className="block font-body-sm text-[12px] text-on-surface-variant">{l.municipality} · {LS_STATUS[l.status]?.label} · rizik {l.risk}/3</span></span>
                  <button type="button" onClick={() => { setF({ id: l.id, name: l.name, municipality: l.municipality, status: l.status, risk: l.risk, description: l.description, source: l.source, lat: l.lat, lng: l.lng }); setPk((k) => k + 1); }} className="w-8 h-8 rounded bg-surface-container-low text-primary inline-flex items-center justify-center" title="Uredi"><span className="material-symbols-outlined text-[18px]">edit</span></button>
                  <button type="button" onClick={() => removeLs(l)} className="w-8 h-8 rounded bg-error-container text-on-error-container inline-flex items-center justify-center" title="Ukloni"><span className="material-symbols-outlined text-[18px]">delete</span></button>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      )}
      {toast.node}
    </>
  );
}
