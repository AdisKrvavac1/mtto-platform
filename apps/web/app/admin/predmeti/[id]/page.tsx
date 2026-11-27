'use client';
// F2-05: spis predmeta – podaci iz obrasca, prilozi, historija, status, dodjela referentu.
import { useParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { adminFetch, getUser, inMySectors, useCan } from '@/lib/adminApi';
import { ACTION_LABEL, CASE_STATUS, NEXT, OPEN, type CaseStatus } from '@/lib/cases';
import { type RegField, show } from '@/lib/registry';
import { dateTime, fileSize } from '@/lib/format';
import { Due } from '@/components/admin/CaseBits';
import { Badge, Card, CardHeader, Field, PageTitle, btnPrimary, btnSecondary, input, useToast } from '@/components/admin/ui';
import { Attachment01, File06, Mail01, MessageChatSquare, Phone01, UploadCloud02 } from '@untitledui/icons';

type Ev = { id: string; kind: string; fromStatus: CaseStatus | null; toStatus: CaseStatus | null; note: string; public: boolean; actorName: string; createdAt: string };
type CaseFull = {
  id: string; number: string; status: CaseStatus; sector: string | null; data: Record<string, any>; applicantName: string; applicantEmail: string | null; applicantPhone: string | null;
  assigneeId: string | null; receivedAt: string; dueAt: string; closedAt: string | null; isDemo: boolean;
  form: { title: string; fields: RegField[]; slaDays: number; legalBasis: string } | null; events: Ev[];
  files: { id: string; fileName: string; mimeType: string; size: number; scanStatus: string; source: string; createdAt: string }[];
  assignee: { id: string; name: string } | null;
};
type Person = { id: string; name: string; role: string; sectors: string[] };

const KIND: Record<string, string> = { PRIJEM: 'Prijem', STATUS: 'Status', DODJELA: 'Dodjela', BILJESKA: 'Interna bilješka', PRILOG: 'Prilog službenika', DOPUNA_PODNOSIOCA: 'Dopuna podnosioca' };
const PLACEHOLDER: Partial<Record<CaseStatus, string>> = {
  DOPUNA: 'Šta podnosilac treba dostaviti i do kada (vidi se pri praćenju statusa).',
  RIJESEN: 'Ishod i naredni korak za podnosioca, npr. broj rješenja i gdje ga preuzeti.',
  ODBIJEN: 'Razlog odbijanja i pravna pouka.',
  U_OBRADI: 'Neobavezno: poruka podnosiocu.',
};

export default function CasePage() {
  const { id } = useParams<{ id: string }>();
  const toast = useToast();
  const canWrite = useCan('predmeti', 'write');
  const [k, setK] = useState<CaseFull | null>(null);
  const [people, setPeople] = useState<Person[]>([]);
  const [action, setAction] = useState<CaseStatus | null>(null);
  const [message, setMessage] = useState('');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const fileIn = useRef<HTMLInputElement>(null);

  useEffect(() => {
    adminFetch<CaseFull>(`/admin/cases/${id}`).then(setK).catch((e) => toast.err(e.message));
    adminFetch<Person[]>('/admin/cases-assignees').then(setPeople).catch(() => {});
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  async function call(path: string, body: any, ok: string) {
    setBusy(true);
    try { const r = await adminFetch<CaseFull>(`/admin/cases/${id}/${path}`, { method: 'POST', body: body instanceof FormData ? body : JSON.stringify(body) }); setK(r); toast.ok(ok); return true; } catch (e: any) { toast.err(e.message); return false; } finally { setBusy(false); }
  }

  if (!k) return <div className="h-64 animate-pulse rounded-[12px] bg-[#f5f5f5]" />;
  const editable = canWrite && inMySectors(getUser(), k.sector);
  const st = CASE_STATUS[k.status];
  const fields = k.form?.fields ?? [];
  const extra = Object.keys(k.data).filter((key) => !fields.some((f) => f.key === key));
  const eligible = people.filter((p) => p.role === 'ADMIN' || !p.sectors?.length || (k.sector && p.sectors.includes(k.sector)));

  return (
    <>
      <PageTitle kicker={k.form?.title ?? 'Obrazac'} crumbs={['E-pisarnica', k.number]} title={k.number}
        badge={<><Badge tone={st.tone} dot>{st.label}</Badge>{k.isDemo && <Badge tone="warning">Demo</Badge>}</>} />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <Card>
            <CardHeader title="Podaci iz zahtjeva" description={`Zaprimljeno ${dateTime(k.receivedAt)} putem portala`} />
            <dl className="divide-y divide-[#e5e5e5] px-6">
              {fields.map((f) => (
                <div key={f.key} className="grid gap-1 py-3 sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] sm:gap-4">
                  <dt className="text-[14px] font-medium text-[#525252]">{f.label}</dt>
                  <dd className="whitespace-pre-wrap break-words text-[14px] text-[#171717]">{show(f, k.data[f.key])}</dd>
                </div>
              ))}
              {extra.map((key) => <div key={key} className="grid gap-1 py-3 sm:grid-cols-[2fr_3fr]"><dt className="text-[14px] text-[#737373]">{key} (uklonjeno polje)</dt><dd className="text-[14px]">{String(k.data[key])}</dd></div>)}
            </dl>
          </Card>

          <Card>
            <CardHeader title="Prilozi" badge={<Badge tone="gray">{k.files.length}</Badge>}
              actions={editable ? <><button type="button" className={btnSecondary} disabled={busy} onClick={() => fileIn.current?.click()}><UploadCloud02 />Dodaj</button>
                <input ref={fileIn} type="file" multiple accept=".pdf,image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => {
                  const fl = [...(e.target.files ?? [])]; e.target.value = ''; if (!fl.length) return;
                  const fd = new FormData(); fl.forEach((x) => fd.append('files', x)); call('files', fd, 'Prilog dodan u spis');
                }} /></> : undefined} />
            {k.files.length === 0 ? <p className="px-6 pb-6 text-[14px] text-[#737373]">Nema priloga.</p> : (
              <ul className="divide-y divide-[#e5e5e5]">
                {k.files.map((f) => (
                  <li key={f.id} className="flex items-center gap-3 px-6 py-3">
                    <File06 size={20} className="shrink-0 text-[#a3a3a3]" />
                    <a className="min-w-0 flex-1 truncate text-[14px] font-medium text-[#171717] hover:underline" href={`/api/admin/cases/${k.id}/files/${f.id}`} target="_blank" rel="noopener">{f.fileName}</a>
                    <Badge tone={f.source === 'PODNOSILAC' ? 'blue' : 'gray'}>{f.source === 'PODNOSILAC' ? 'Podnosilac' : 'Službenik'}</Badge>
                    {f.scanStatus === 'NIJE_SKENIRANO' && <Badge tone="warning">Nije skenirano</Badge>}
                    <span className="whitespace-nowrap text-[12px] text-[#737373]">{fileSize(f.size)} · {dateTime(f.createdAt)}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card>
            <CardHeader title="Historija" description="Koraci označeni „Javno“ vidi podnosilac pri praćenju statusa." />
            <ol className="space-y-0 px-6 pb-2">
              {[...k.events].reverse().map((e) => (
                <li key={e.id} className="relative border-l border-[#e5e5e5] py-3 pl-5">
                  <span className={`absolute -left-[5px] top-[18px] size-[9px] rounded-full ${e.public ? 'bg-[#7f56d9]' : 'bg-[#d4d4d4]'}`} />
                  <p className="flex flex-wrap items-center gap-2 text-[14px] text-[#171717]">
                    <span className="font-medium">{e.toStatus ? `${e.fromStatus ? `${CASE_STATUS[e.fromStatus].label} → ` : ''}${CASE_STATUS[e.toStatus].label}` : KIND[e.kind] ?? e.kind}</span>
                    {e.public ? <Badge tone="brand">Javno</Badge> : <Badge tone="gray">Interno</Badge>}
                  </p>
                  {e.note && <p className="mt-1 whitespace-pre-wrap text-[14px] text-[#404040]">{e.note}</p>}
                  <p className="mt-1 text-[12px] text-[#737373]">{e.actorName} · {dateTime(e.createdAt)}</p>
                </li>
              ))}
            </ol>
            {editable && (
              <form className="flex flex-col gap-3 border-t border-[#e5e5e5] px-6 py-4" onSubmit={async (ev) => { ev.preventDefault(); if (await call('note', { note }, 'Bilješka dodana')) setNote(''); }}>
                <label className="sr-only" htmlFor="note">Interna bilješka</label>
                <textarea id="note" className={input} rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Interna bilješka (vidi samo e-pisarnica)" />
                <div className="flex justify-end"><button className={btnSecondary} disabled={busy || !note.trim()}><MessageChatSquare />Dodaj bilješku</button></div>
              </form>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader title="Obrada" />
            <div className="space-y-5 px-6 pb-6">
              <div className="grid grid-cols-2 gap-4 text-[14px]">
                <div><p className="text-[#737373]">Status</p><p className="mt-1"><Badge tone={st.tone} dot>{st.label}</Badge></p></div>
                <div><p className="text-[#737373]">Rok ({k.form?.slaDays ?? '—'} dana)</p><p className="mt-1"><Due c={k} /></p></div>
              </div>
              <Field label="Referent">
                <select className={input} value={k.assigneeId ?? ''} disabled={!editable || busy} onChange={(e) => call('assign', { assigneeId: e.target.value || null }, e.target.value ? 'Predmet dodijeljen' : 'Dodjela uklonjena')}>
                  <option value="">Nije dodijeljen</option>
                  {eligible.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </Field>
              {editable && (
                <div>
                  <p className="mb-2 text-[14px] font-medium text-[#404040]">{OPEN.includes(k.status) ? 'Sljedeći korak' : 'Predmet je zatvoren'}</p>
                  <div className="flex flex-wrap gap-2">
                    {NEXT[k.status].map((s) => (
                      <button key={s} type="button" className={action === s ? btnPrimary : btnSecondary} onClick={() => { setAction(action === s ? null : s); setMessage(''); }}>
                        {!OPEN.includes(k.status) ? 'Ponovo otvori' : ACTION_LABEL[s]}
                      </button>
                    ))}
                  </div>
                  {action && (
                    <form className="mt-3 space-y-3" onSubmit={async (ev) => { ev.preventDefault(); if (await call('status', { status: action, message }, `Status: ${CASE_STATUS[action].label}`)) setAction(null); }}>
                      <Field label={action === 'U_OBRADI' && OPEN.includes(k.status) ? 'Poruka podnosiocu' : !OPEN.includes(k.status) ? 'Razlog ponovnog otvaranja' : 'Obavještenje podnosiocu'} required={action !== 'U_OBRADI' || !OPEN.includes(k.status)}>
                        <textarea className={input} rows={4} value={message} onChange={(e) => setMessage(e.target.value)} placeholder={PLACEHOLDER[action]} />
                      </Field>
                      {action === 'DOPUNA' && <p className="text-[12px] text-[#737373]">Dok se čeka dopuna, rok miruje.</p>}
                      <div className="flex justify-end gap-2"><button type="button" className={btnSecondary} onClick={() => setAction(null)}>Odustani</button><button className={btnPrimary} disabled={busy}>Potvrdi</button></div>
                    </form>
                  )}
                </div>
              )}
              {!editable && canWrite && <p className="text-[14px] text-[#525252]">Predmet pripada sektoru „{k.sector}“. Obrađuju ga referenti tog sektora.</p>}
            </div>
          </Card>

          <Card>
            <CardHeader title="Podnosilac" />
            <div className="space-y-2 px-6 pb-6 text-[14px] text-[#404040]">
              <p className="font-medium text-[#171717]">{k.applicantName}</p>
              {k.applicantEmail && <p className="flex items-center gap-2"><Mail01 size={16} className="text-[#a3a3a3]" /><a className="hover:underline" href={`mailto:${k.applicantEmail}?subject=${encodeURIComponent(`Predmet ${k.number}`)}`}>{k.applicantEmail}</a></p>}
              {k.applicantPhone && <p className="flex items-center gap-2"><Phone01 size={16} className="text-[#a3a3a3]" /><a className="hover:underline" href={`tel:${k.applicantPhone.replace(/\s/g, '')}`}>{k.applicantPhone}</a></p>}
              <p className="flex items-center gap-2 text-[#737373]"><Attachment01 size={16} className="text-[#a3a3a3]" />{k.files.filter((f) => f.source === 'PODNOSILAC').length} priloga podnosioca</p>
            </div>
          </Card>
          {k.form?.legalBasis && <p className="px-1 text-[12px] text-[#737373]">Pravni osnov: {k.form.legalBasis}</p>}
        </div>
      </div>
      {toast.node}
    </>
  );
}
