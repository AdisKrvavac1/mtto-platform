'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { adminFetch, useCan, useSectors } from '@/lib/adminApi';
import type { CmsForm } from '@/lib/cases';
import { PHASE, km, type Award, type CmsCallDetail } from '@/lib/calls';
import { Badge, Card, CardHeader, EmptyState, Field, btnPrimary, btnSecondary, iconBtn, input, td, th, tr, useToast } from '@/components/admin/ui';
import { CheckCircle, Download01, Eye, EyeOff, File06, Inbox01, LinkExternal01, Plus, Save01, Trash01, UploadCloud02, Users01 } from '@untitledui/icons';

const MUNICIPALITIES = ['Čapljina', 'Čitluk', 'Jablanica', 'Konjic', 'Mostar', 'Neum', 'Prozor-Rama', 'Ravno', 'Stolac'];
const toLocal = (iso?: string) => (iso ? new Date(new Date(iso).getTime() - new Date(iso).getTimezoneOffset() * 60000).toISOString().slice(0, 16) : '');
type Draft = { title: string; sector: string; summary: string; body: string; eligibility: string; budget: string; maxAmount: string; opensAt: string; closesAt: string; formId: string; legalBasis: string; contact: string; resultsNote: string; documents: { title: string; url: string }[] };
const blank: Draft = { title: '', sector: '', summary: '', body: '', eligibility: '', budget: '', maxAmount: '', opensAt: '', closesAt: '', formId: '', legalBasis: '', contact: '', resultsNote: '', documents: [] };
const STATUS: Record<string, string> = { ZAPRIMLJEN: 'Zaprimljen', U_OBRADI: 'U obradi', DOPUNA: 'Dopuna', RIJESEN: 'Riješen', ODBIJEN: 'Odbijen', PROSLIJEDJEN: 'Proslijeđen' };

/** Postavke poziva (novi ili postojeći). */
export function CallSettings({ call, onSaved }: { call?: CmsCallDetail; onSaved?: () => void }) {
  const router = useRouter();
  const toast = useToast();
  const sectors = useSectors();
  const canWrite = useCan('pozivi', 'write');
  const [forms, setForms] = useState<CmsForm[]>([]);
  const [d, setD] = useState<Draft>(() => call ? {
    title: call.title, sector: call.sector ?? '', summary: call.summary, body: call.body, eligibility: call.eligibility, budget: call.budget?.toString() ?? '', maxAmount: call.maxAmount?.toString() ?? '',
    opensAt: toLocal(call.opensAt), closesAt: toLocal(call.closesAt), formId: call.formId ?? '', legalBasis: call.legalBasis, contact: call.contact, resultsNote: call.resultsNote, documents: call.documents,
  } : blank);
  const [busy, setBusy] = useState(false);
  useEffect(() => { adminFetch<CmsForm[]>('/admin/forms').then(setForms).catch(() => {}); }, []);
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setD((x) => ({ ...x, [k]: v }));

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const body = { ...d, sector: d.sector || null, formId: d.formId || null, budget: d.budget || null, maxAmount: d.maxAmount || null, opensAt: d.opensAt ? new Date(d.opensAt).toISOString() : undefined, closesAt: d.closesAt ? new Date(d.closesAt).toISOString() : undefined };
      if (call) { await adminFetch(`/admin/calls/${call.id}`, { method: 'PATCH', body: JSON.stringify(body) }); toast.ok('Poziv spremljen'); onSaved?.(); }
      else { const c = await adminFetch<{ id: string }>('/admin/calls', { method: 'POST', body: JSON.stringify(body) }); router.push(`/admin/pozivi/${c.id}`); }
    } catch (x: any) { toast.err(x.message); } finally { setBusy(false); }
  }

  return (
    <form onSubmit={save} className="grid items-start gap-6 xl:grid-cols-12">
      <Card className="xl:col-span-8">
        <CardHeader title="Sadržaj poziva" description="Tekst koji građani vide na stranici poziva." />
        <div className="space-y-5 p-4 md:p-6">
          <Field label="Naslov" required><input className={input} value={d.title} onChange={(e) => set('title', e.target.value)} required maxLength={300} /></Field>
          <Field label="Kratki opis" hint="Jedna do dvije rečenice za listu poziva."><textarea className={input} rows={2} value={d.summary} onChange={(e) => set('summary', e.target.value)} /></Field>
          <Field label="Tekst poziva" hint="Prazan red odvaja pasuse."><textarea className={input} rows={9} value={d.body} onChange={(e) => set('body', e.target.value)} /></Field>
          <Field label="Ko se može prijaviti"><textarea className={input} rows={4} value={d.eligibility} onChange={(e) => set('eligibility', e.target.value)} /></Field>
          <div>
            <p className="text-[14px] font-medium text-[#404040]">Dokumenti</p>
            <p className="text-[14px] text-[#737373]">Tekst poziva, obrasci, odluke. Link na dokument iz Dokumenata i propisa ili s https:// adrese.</p>
            <ul className="mt-3 space-y-2">
              {d.documents.map((x, i) => (
                <li key={i} className="flex flex-wrap gap-2">
                  <input aria-label="Naziv dokumenta" className={`${input} !w-auto flex-1 min-w-[180px]`} value={x.title} placeholder="Naziv" onChange={(e) => set('documents', d.documents.map((y, k) => k === i ? { ...y, title: e.target.value } : y))} />
                  <input aria-label="Link" className={`${input} !w-auto flex-[2] min-w-[220px]`} value={x.url} placeholder="https:// ili /dokumenti/…" onChange={(e) => set('documents', d.documents.map((y, k) => k === i ? { ...y, url: e.target.value } : y))} />
                  <button type="button" className={iconBtn} title="Ukloni" onClick={() => set('documents', d.documents.filter((_, k) => k !== i))}><Trash01 /></button>
                </li>
              ))}
            </ul>
            <button type="button" className={`${btnSecondary} mt-3`} onClick={() => set('documents', [...d.documents, { title: '', url: '' }])}><Plus />Dodaj dokument</button>
          </div>
        </div>
      </Card>
      <div className="space-y-6 xl:col-span-4">
        <Card>
          <CardHeader title="Rok i sredstva" />
          <div className="space-y-5 p-4 md:p-6">
            <Field label="Sektor"><select className={input} value={d.sector} onChange={(e) => set('sector', e.target.value)}><option value="">Bez sektora</option>{sectors.map((s) => <option key={s.key} value={s.key}>{s.name}</option>)}</select></Field>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
              <Field label="Prijave od" required><input type="datetime-local" className={input} value={d.opensAt} onChange={(e) => set('opensAt', e.target.value)} required /></Field>
              <Field label="Prijave do" required><input type="datetime-local" className={input} value={d.closesAt} onChange={(e) => set('closesAt', e.target.value)} required /></Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
              <Field label="Ukupno sredstava (KM)"><input className={input} inputMode="decimal" value={d.budget} onChange={(e) => set('budget', e.target.value)} placeholder="npr. 100.000,00" /></Field>
              <Field label="Najviše po projektu (KM)"><input className={input} inputMode="decimal" value={d.maxAmount} onChange={(e) => set('maxAmount', e.target.value)} /></Field>
            </div>
            <Field label="Obrazac za online prijavu" hint="Obrazac prima prijave samo dok je poziv otvoren.">
              <select className={input} value={d.formId} onChange={(e) => set('formId', e.target.value)}><option value="">Bez online prijave</option>{forms.map((f) => <option key={f.id} value={f.id}>{f.title}{f.active ? '' : ' (isključen)'}</option>)}</select>
            </Field>
            <Field label="Kontakt"><input className={input} value={d.contact} onChange={(e) => set('contact', e.target.value)} /></Field>
            <Field label="Pravni osnov"><input className={input} value={d.legalBasis} onChange={(e) => set('legalBasis', e.target.value)} /></Field>
            {call && <Field label="Napomena uz listu korisnika" hint="Npr. broj i datum odluke."><textarea className={input} rows={3} value={d.resultsNote} onChange={(e) => set('resultsNote', e.target.value)} /></Field>}
          </div>
        </Card>
        {canWrite && <button className={`${btnPrimary} w-full`} disabled={busy}><Save01 />{call ? 'Spremi izmjene' : 'Kreiraj poziv'}</button>}
      </div>
      {toast.node}
    </form>
  );
}

/** Lista korisnika: uređivanje u tabeli, CSV ili preuzimanje iz prijave. */
export function AwardsEditor({ call, onSaved }: { call: CmsCallDetail; onSaved: () => void }) {
  const toast = useToast();
  const canWrite = useCan('pozivi', 'write');
  const [rows, setRows] = useState<Award[]>(call.awards);
  const [csv, setCsv] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const dirty = JSON.stringify(rows) !== JSON.stringify(call.awards);
  const total = useMemo(() => rows.reduce((t, r) => t + (Number(r.amount) || 0), 0), [rows]);
  const over = call.budget != null && total > call.budget;
  const setRow = (i: number, p: Partial<Award>) => setRows((x) => x.map((r, k) => (k === i ? { ...r, ...p } : r)));
  const inCall = new Set(rows.map((r) => r.caseId).filter(Boolean));

  async function parse() {
    setBusy(true);
    try {
      const r = await adminFetch<{ awards: Award[]; errors: string[] }>(`/admin/calls/${call.id}/awards/parse`, { method: 'POST', body: JSON.stringify({ csv }) });
      if (r.errors.length) toast.err(`${r.errors.length} grešaka: ${r.errors.slice(0, 3).join('; ')}`);
      setRows(r.awards.filter((a) => a.beneficiary && a.amount != null)); setCsv(null);
      toast.ok(`Učitano ${r.awards.length} redova. Provjerite i spremite.`);
    } catch (e: any) { toast.err(e.message); } finally { setBusy(false); }
  }
  async function save() {
    setBusy(true);
    try {
      const r = await adminFetch<{ count: number; total: number; overBudget: boolean }>(`/admin/calls/${call.id}/awards`, { method: 'PUT', body: JSON.stringify({ awards: rows }) });
      toast.ok(`Lista spremljena: ${r.count} korisnika, ${km(r.total)}`); onSaved();
    } catch (e: any) { toast.err(e.message); } finally { setBusy(false); }
  }

  return (
    <div className="mt-6 space-y-6">
      <Card className="overflow-hidden">
        <CardHeader title="Lista korisnika i iznosa" badge={<Badge tone={over ? 'error' : 'brand'}>{rows.length} · {km(total)}</Badge>}
          description={call.resultsPublished ? 'Lista je javna. Izmjene su vidljive na portalu čim ih spremite.' : 'Lista nije javna dok je ne objavite. Fizička lica se na portalu prikazuju bez imena.'}
          actions={canWrite ? <div className="flex flex-wrap gap-2"><button type="button" className={btnSecondary} onClick={() => setCsv(csv == null ? '' : null)}><UploadCloud02 />CSV</button><button type="button" className={btnSecondary} onClick={() => setRows([...rows, { beneficiary: '', beneficiaryType: 'PRAVNO', municipality: null, project: '', amount: null }])}><Plus />Red</button></div> : undefined} />
        {csv != null && (
          <div className="space-y-3 border-b border-[#e5e5e5] bg-[#fafafa] p-4 md:p-6">
            <Field label="Zalijepite CSV" hint="Kolone: korisnik; općina; projekat; iznos; vrsta (pravno ili fizičko lice). Zamjenjuje listu u tabeli dok je ne spremite.">
              <textarea className={`${input} font-mono text-[13px]`} rows={6} value={csv} onChange={(e) => setCsv(e.target.value)} placeholder={'korisnik;općina;projekat;iznos;vrsta\nUdruženje X;Mostar;Edukacija o otpadu;8.500,00;pravno lice'} />
            </Field>
            <button type="button" className={btnPrimary} disabled={!csv.trim() || busy} onClick={parse}><CheckCircle />Učitaj u tabelu</button>
          </div>
        )}
        {rows.length === 0 ? <EmptyState icon={Users01} title="Lista je prazna">Dodajte korisnike ručno, iz CSV-a ili iz prijava ispod.</EmptyState> : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1120px]">
              <thead><tr><th className={th}>#</th><th className={th}>Korisnik</th><th className={th}>Vrsta</th><th className={th}>Općina</th><th className={th}>Projekat</th><th className={`${th} text-right`}>Iznos (KM)</th><th className={th}><span className="sr-only">Ukloni</span></th></tr></thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i} className={tr}>
                    <td className={`${td} w-10 tabular-nums`}>{i + 1}</td>
                    <td className={`${td} min-w-[260px]`}><input aria-label="Korisnik" className={input} value={r.beneficiary} disabled={!canWrite} onChange={(e) => setRow(i, { beneficiary: e.target.value })} /></td>
                    <td className={td}><select aria-label="Vrsta" className={`${input} !w-[150px]`} value={r.beneficiaryType} disabled={!canWrite} onChange={(e) => setRow(i, { beneficiaryType: e.target.value as Award['beneficiaryType'] })}><option value="PRAVNO">Pravno lice</option><option value="FIZICKO">Fizičko lice</option></select></td>
                    <td className={td}><select aria-label="Općina" className={`${input} !w-[150px]`} value={r.municipality ?? ''} disabled={!canWrite} onChange={(e) => setRow(i, { municipality: e.target.value || null })}><option value="">—</option>{MUNICIPALITIES.map((m) => <option key={m}>{m}</option>)}</select></td>
                    <td className={`${td} min-w-[260px]`}><input aria-label="Projekat" className={input} value={r.project} disabled={!canWrite} onChange={(e) => setRow(i, { project: e.target.value })} /></td>
                    <td className={`${td} w-[150px]`}><input aria-label="Iznos" className={`${input} text-right tabular-nums`} inputMode="decimal" value={r.amount ?? ''} disabled={!canWrite} onChange={(e) => setRow(i, { amount: e.target.value === '' ? null : Number(e.target.value.replace(',', '.')) })} /></td>
                    <td className={td}>{canWrite && <button type="button" className={`${iconBtn} hover:!text-[#d92d20]`} title="Ukloni red" onClick={() => setRows(rows.filter((_, k) => k !== i))}><Trash01 /></button>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {(dirty || over) && (
          <div className="flex flex-col gap-3 border-t border-[#e5e5e5] p-4 sm:flex-row sm:items-center sm:justify-between md:px-6">
            <p className={`text-[14px] ${over ? 'font-medium text-[#b42318]' : 'text-[#525252]'}`}>{over ? `Ukupno ${km(total)} je više od sredstava poziva (${km(call.budget)}).` : 'Imate nespremljene izmjene.'}</p>
            {canWrite && dirty && <span className="flex gap-2"><button type="button" className={btnSecondary} onClick={() => setRows(call.awards)}>Poništi</button><button type="button" className={btnPrimary} disabled={busy} onClick={save}><Save01 />Spremi listu</button></span>}
          </div>
        )}
      </Card>

      <Card className="overflow-hidden">
        <CardHeader title="Prijave na poziv" badge={<Badge tone="gray">{call.applications.length}</Badge>} description="Svaka online prijava je predmet u e-pisarnici. Odobrene prijave dodajte na listu korisnika." />
        {call.applications.length === 0 ? <EmptyState icon={Inbox01} title="Još nema prijava">{call.formId ? 'Prijave stižu kroz vezani obrazac dok je poziv otvoren.' : 'Poziv nema vezan obrazac za online prijavu.'}</EmptyState> : (
          <div className="overflow-x-auto"><table className="w-full min-w-[820px]">
            <thead><tr><th className={th}>Predmet</th><th className={th}>Podnosilac</th><th className={th}>Projekat</th><th className={`${th} text-right`}>Traženo</th><th className={th}>Status</th><th className={th}><span className="sr-only">Radnje</span></th></tr></thead>
            <tbody>{call.applications.map((a) => (
              <tr key={a.id} className={tr}>
                <td className={`${td} whitespace-nowrap`}><Link href={`/admin/predmeti/${a.id}`} className="font-medium text-[#171717] hover:underline">{a.number}</Link></td>
                <td className={td}>{a.applicantName ?? <span className="text-[#a3a3a3]">zaštićeno</span>}{a.municipality && <span className="block text-[12px] text-[#737373]">{a.municipality}</span>}</td>
                <td className={td}>{a.project ?? '—'}</td>
                <td className={`${td} text-right tabular-nums`}>{a.requested != null ? km(Number(a.requested)) : '—'}</td>
                <td className={td}><Badge tone={a.status === 'RIJESEN' ? 'success' : a.status === 'ODBIJEN' ? 'gray' : 'warning'}>{STATUS[a.status] ?? a.status}</Badge></td>
                <td className={`${td} text-right`}>{canWrite && !inCall.has(a.id) && <button type="button" className={btnSecondary} onClick={() => setRows([...rows, { beneficiary: a.applicantName ?? '', beneficiaryType: 'PRAVNO', municipality: a.municipality, project: a.project ?? '', amount: a.requested != null ? Number(a.requested) : null, caseId: a.id }])}><Plus />Na listu</button>}</td>
              </tr>
            ))}</tbody>
          </table></div>
        )}
      </Card>
      {toast.node}
    </div>
  );
}

/** Objava poziva i liste korisnika (urednik / administrator). */
export function PublishBar({ call, onSaved }: { call: CmsCallDetail; onSaved: () => void }) {
  const toast = useToast();
  const canPublish = useCan('pozivi', 'publish');
  const [busy, setBusy] = useState(false);
  async function patch(body: Record<string, boolean>, ok: string) {
    if (body.resultsPublished && !confirm(`Objaviti listu od ${call.awards.length} korisnika na portalu? Lista postaje javna i dostupna u CSV-u.`)) return;
    setBusy(true);
    try { await adminFetch(`/admin/calls/${call.id}`, { method: 'PATCH', body: JSON.stringify(body) }); toast.ok(ok); onSaved(); } catch (e: any) { toast.err(e.message); } finally { setBusy(false); }
  }
  const p = PHASE[call.phase];
  return (
    <Card className="flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between md:p-6">
      <div className="flex flex-wrap items-center gap-3">
        <Badge tone={p.tone} dot>{p.label}</Badge>
        {call.isDemo && <Badge tone="warning">Primjer</Badge>}
        <span className="text-[14px] text-[#525252]">{call.applications.length} prijava · {call.awards.length} korisnika na listi</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {call.published && <a href={`/javni-pozivi/${call.slug}`} target="_blank" rel="noopener" className={btnSecondary}><LinkExternal01 />Na portalu</a>}
        {call.resultsPublished && <a href={`/api/calls/${call.slug}/korisnici.csv`} className={btnSecondary}><Download01 />CSV</a>}
        {canPublish && (call.published
          ? <button type="button" className={btnSecondary} disabled={busy} onClick={() => patch({ published: false, resultsPublished: false }, 'Poziv uklonjen s portala')}><EyeOff />Ukloni s portala</button>
          : <button type="button" className={btnPrimary} disabled={busy} onClick={() => patch({ published: true }, 'Poziv objavljen')}><Eye />Objavi poziv</button>)}
        {canPublish && call.published && (call.resultsPublished
          ? <button type="button" className={btnSecondary} disabled={busy} onClick={() => patch({ resultsPublished: false }, 'Lista korisnika više nije javna')}><EyeOff />Sakrij listu</button>
          : <button type="button" className={btnPrimary} disabled={busy || !call.awards.length} onClick={() => patch({ resultsPublished: true }, 'Lista korisnika objavljena')}><File06 />Objavi listu korisnika</button>)}
      </div>
      {toast.node}
    </Card>
  );
}
