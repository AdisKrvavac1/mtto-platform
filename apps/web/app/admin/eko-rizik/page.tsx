'use client';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { adminFetch } from '@/lib/adminApi';
import { Avatar, Badge, Card, CardHeader, EmptyState, Field, MetricCard, PageTitle, Tabs, btnPrimary, btnSecondary, iconBtn, input, useToast } from '@/components/admin/ui';
import { Activity, AlertTriangle, Edit01, Eye, EyeOff, Globe01, LayersThree01, MarkerPin02, Plus, ReverseLeft, Save01, Trash01 } from '@untitledui/icons';
import { LS_STATUS, REPORT_STATUS, fmtTime, type Landslide } from '@/lib/risk';
import { ReportPhotos, ReportPublish } from '@/components/admin/EcoReportReview';

const LocationPicker = dynamic(() => import('@/components/admin/LocationPicker'), { ssr: false, loading: () => <div className="h-[320px] rounded-lg bg-[#f5f5f5] animate-pulse" /> });

const MUNICIPALITIES = ['Čapljina', 'Čitluk', 'Jablanica', 'Konjic', 'Mostar', 'Neum', 'Prozor-Rama', 'Ravno', 'Stolac'];
const KIND: Record<string, string> = { POZAR: 'Požar ili dim', DEPONIJA: 'Divlja deponija', VODA: 'Zagađenje vode', ZRAK: 'Zrak / mirisi', KLIZISTE: 'Klizište / odron', POPLAVA: 'Poplava / bujica', SJECA: 'Nelegalna sječa', OSTALO: 'Ostalo' };
type Report = { id: string; code: string; kind: string; municipality: string; location: string; lat: number | null; lng: number | null; description: string; contactName: string | null; contactEmail: string | null; status: string; isPublic: boolean; note: string; publicNote: string; photosPublic: boolean; photos: string[]; createdAt: string };
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
  const [open, setOpen] = useState<string | null>(null);
  async function patchReport(r: Report, body: Record<string, unknown>) {
    try {
      await adminFetch(`/admin/eco-reports/${r.id}`, { method: 'PATCH', body: JSON.stringify(body) });
      toast.ok(body.isPublic === true ? 'Prijava je objavljena na karti' : body.isPublic === false ? 'Prijava je uklonjena s karte' : 'Prijava ažurirana');
      await load();
    } catch (x: any) { toast.err(x.message); }
  }
  const fresh = reports.filter((r) => r.status === 'NOVO').length;

  const RTONE: Record<string, 'error' | 'warning' | 'success' | 'gray'> = { NOVO: 'error', U_OBRADI: 'warning', RIJESENO: 'success', ODBACENO: 'gray' };
  const LTONE: Record<string, 'error' | 'warning' | 'success'> = { AKTIVNO: 'error', PRACENJE: 'warning', SANIRANO: 'success' };

  return (
    <>
      <PageTitle kicker="Prijave građana i registar klizišta za javnu kartu rizika." crumbs={['Eko-rizik i prijave']} title="Eko-rizik i prijave">
        <a href="/eko-rizik/krizni" target="_blank" rel="noopener" className={btnSecondary}><Activity />Krizni prikaz</a>
        <a href="/eko-rizik" target="_blank" rel="noopener" className={btnSecondary}><Globe01 />Javni prikaz</a>
      </PageTitle>

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Nove prijave" value={fresh} footer={fresh ? <Badge tone="error" dot>Čeka obradu</Badge> : 'Sve obrađeno'} />
        <MetricCard title="Ukupno prijava" value={reports.length} footer={`${reports.filter((r) => r.isPublic).length} javno na karti`} />
        <MetricCard title="Aktivna klizišta" value={ls.filter((l) => l.status === 'AKTIVNO').length} footer={`${ls.filter((l) => l.status === 'PRACENJE').length} u praćenju`} />
        <MetricCard title="Registar klizišta" value={ls.length} footer={`${ls.filter((l) => l.isDemo).length} demo zapisa`} />
      </div>

      <div className="mt-8">
        <Tabs value={tab} onChange={setTab} items={[{ value: 'prijave', label: 'Prijave građana', count: reports.length }, { value: 'klizista', label: 'Registar klizišta', count: ls.length }]} />
      </div>

      {tab === 'prijave' && (
        <Card className="mt-6 overflow-hidden">
          <CardHeader title="Prijave građana" badge={fresh ? <Badge tone="error">{fresh} novih</Badge> : undefined} description="Javne prijave prikazuju se na karti bez ličnih podataka prijavitelja." />
          {reports.length === 0 ? <EmptyState icon={AlertTriangle} title="Nema prijava">Prijave s obrasca na portalu pojavit će se ovdje.</EmptyState> : (
            <ul className="divide-y divide-[#e5e5e5]">
              {reports.map((r) => (
                <li key={r.id} className="grid gap-4 px-4 py-5 md:px-6 lg:grid-cols-12">
                  <div className="flex min-w-0 gap-3 lg:col-span-7">
                    <Avatar name={r.contactName || 'Anonimno'} />
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2"><span className="text-[14px] font-semibold text-[#171717]">{KIND[r.kind] ?? r.kind}</span><Badge tone={RTONE[r.status] ?? 'gray'} dot>{REPORT_STATUS[r.status] ?? r.status}</Badge><span className="text-[12px] text-[#737373]">{r.code} · {fmtTime(r.createdAt)}</span></div>
                      <p className="mt-0.5 flex items-center gap-1 text-[14px] text-[#525252]"><MarkerPin02 size={14} className="text-[#a3a3a3]" />{r.municipality}{r.location ? ` · ${r.location}` : ''}{r.lat == null ? ' · bez koordinata' : ''}</p>
                      <p className="mt-2 whitespace-pre-line rounded-[8px] bg-[#fafafa] px-3 py-2 text-[14px] leading-5 text-[#404040] ring-1 ring-inset ring-[#e5e5e5]">{r.description}</p>
                      <ReportPhotos r={r} />
                      <p className="mt-2 text-[12px] text-[#737373]">{r.contactName || r.contactEmail ? `Prijavitelj: ${r.contactName ?? ''} ${r.contactEmail ? `<${r.contactEmail}>` : ''}` : 'Anonimna prijava'}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-start gap-2 lg:col-span-5 lg:justify-end">
                    <select aria-label="Status prijave" className={`${input} !w-auto`} value={r.status} onChange={(e) => patchReport(r, { status: e.target.value })}>{Object.entries(REPORT_STATUS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
                    <button type="button" aria-expanded={open === r.id} onClick={() => setOpen(open === r.id ? null : r.id)} className={r.isPublic ? btnPrimary : btnSecondary} title="Lokacija, obrazloženje i objava na javnoj karti">{r.isPublic ? <Eye /> : <EyeOff />}{r.isPublic ? 'Javno na karti' : 'Pregled i objava'}</button>
                    {r.contactEmail && <a className={btnSecondary} href={`mailto:${r.contactEmail}?subject=${encodeURIComponent(`Vaša eko-prijava ${r.code}`)}`}><ReverseLeft />Odgovori</a>}
                  </div>
                  {open === r.id && <div className="lg:col-span-12"><ReportPublish key={`${r.id}-${r.isPublic}`} r={r} onSave={(b) => patchReport(r, b)} /></div>}
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}

      {tab === 'klizista' && (
        <div className="mt-6 grid items-start gap-6 xl:grid-cols-12">
          <Card className="xl:col-span-7">
            <CardHeader title={f.id ? 'Uredi klizište' : 'Dodaj klizište'} description="Kliknite na kartu da postavite lokaciju." />
            <form onSubmit={saveLs} className="space-y-5 p-4 md:p-6">
              <div className="overflow-hidden rounded-[8px]"><LocationPicker key={pk} lat={f.lat} lng={f.lng} height={320} onChange={(lat, lng) => setF((s) => ({ ...s, lat, lng }))} /></div>
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Naziv" required><input className={input} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} required /></Field>
                <Field label="Općina" required><select className={input} value={f.municipality} onChange={(e) => setF({ ...f, municipality: e.target.value })}>{MUNICIPALITIES.map((m) => <option key={m}>{m}</option>)}</select></Field>
                <Field label="Status"><select className={input} value={f.status} onChange={(e) => setF({ ...f, status: e.target.value })}>{Object.entries(LS_STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}</select></Field>
                <Field label="Nivo rizika"><select className={input} value={f.risk} onChange={(e) => setF({ ...f, risk: +e.target.value })}><option value={1}>1 – nizak</option><option value={2}>2 – srednji</option><option value={3}>3 – visok</option></select></Field>
              </div>
              <Field label="Opis"><textarea className={input} rows={3} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} /></Field>
              <Field label="Izvor podatka" hint="npr. općinska civilna zaštita"><input className={input} value={f.source} onChange={(e) => setF({ ...f, source: e.target.value })} /></Field>
              <div className="flex flex-col-reverse gap-3 border-t border-[#e5e5e5] pt-5 sm:flex-row sm:items-center sm:justify-between">
                <span className="flex items-center gap-1.5 text-[14px] text-[#525252]"><MarkerPin02 size={16} className={f.lat != null ? 'text-[#7f56d9]' : 'text-[#d4d4d4]'} />{f.lat != null ? `${f.lat}° N, ${f.lng}° E` : 'Lokacija nije postavljena'}</span>
                <span className="flex gap-3">{f.id && <button type="button" className={btnSecondary} onClick={() => { setF(BLANK); setPk((k) => k + 1); }}>Odustani</button>}<button className={btnPrimary} disabled={busy}>{f.id ? <Save01 /> : <Plus />}{f.id ? 'Spremi izmjene' : 'Dodaj u registar'}</button></span>
              </div>
            </form>
          </Card>
          <Card className="overflow-hidden xl:col-span-5">
            <CardHeader title="Registar klizišta" badge={<Badge tone="brand">{ls.length}</Badge>} />
            {ls.length === 0 ? <EmptyState icon={LayersThree01} title="Registar je prazan" /> : (
              <ul className="divide-y divide-[#e5e5e5]">
                {ls.map((l) => (
                  <li key={l.id} className="flex items-center gap-3 px-4 py-4 md:px-6">
                    <span className="min-w-0 flex-1"><span className="flex flex-wrap items-center gap-2 text-[14px] font-medium text-[#171717]">{l.name}{l.isDemo && <Badge tone="warning">Demo</Badge>}</span><span className="mt-1 flex flex-wrap items-center gap-2 text-[14px] text-[#525252]"><Badge tone={LTONE[l.status] ?? 'warning'} dot>{LS_STATUS[l.status]?.label}</Badge>{l.municipality} · rizik {l.risk}/3</span></span>
                    <button type="button" onClick={() => removeLs(l)} className={`${iconBtn} hover:!text-[#d92d20]`} title="Ukloni"><Trash01 /></button>
                    <button type="button" onClick={() => { setF({ id: l.id, name: l.name, municipality: l.municipality, status: l.status, risk: l.risk, description: l.description, source: l.source, lat: l.lat, lng: l.lng }); setPk((k) => k + 1); }} className={iconBtn} title="Uredi"><Edit01 /></button>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      )}
      {toast.node}
    </>
  );
}
