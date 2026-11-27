'use client';
// F2-05: praćenje statusa predmeta (broj + kod) i dopuna kad Ministarstvo traži dopunu.
import { useEffect, useState } from 'react';
import { CASE_STATUS, type CaseStatus } from '@/lib/cases';
import { dateLong, dateTime } from '@/lib/format';
import { Badge } from '@/components/uui';
import { FilePicker, HumanCheck, btnP, fieldCls, labelCls } from '@/components/site/CaseForm';
import { AlertCircle, CheckCircle, SearchLg, Send01 } from '@untitledui/icons';

type Ev = { kind: string; toStatus: CaseStatus | null; statusLabel: string | null; note: string; createdAt: string };
type St = { number: string; form: string; status: CaseStatus; statusLabel: string; receivedAt: string; dueAt: string; closedAt: string | null; canSupplement: boolean; events: Ev[] };

const STEP: Record<string, string> = { PRIJEM: 'Zahtjev zaprimljen', DOPUNA_PODNOSIOCA: 'Vaša dopuna' };

export default function CaseStatusLookup() {
  const [number, setNumber] = useState('');
  const [code, setCode] = useState('');
  const [st, setSt] = useState<St | null>(null);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => { const b = new URLSearchParams(location.search).get('broj'); if (b) setNumber(b); }, []);

  async function look(e?: React.FormEvent) {
    e?.preventDefault();
    setErr(''); setBusy(true);
    try {
      const r = await fetch('/api/cases/status', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ number, code }) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j.message || 'Provjera nije uspjela.');
      setSt(j);
    } catch (x: any) { setSt(null); setErr(x.message); } finally { setBusy(false); }
  }

  return (
    <div className="space-y-8">
      <form onSubmit={look} className="grid gap-4 rounded-[16px] bg-white p-6 ring-1 ring-inset ring-[#e5e5e5] md:grid-cols-[1fr_1fr_auto] md:items-end md:p-8">
        <div><label htmlFor="broj" className={labelCls}>Broj predmeta</label><input id="broj" className={`${fieldCls} mt-1.5 h-11 font-mono uppercase`} value={number} onChange={(e) => setNumber(e.target.value)} placeholder="MTTO-2026-00001" required autoComplete="off" /></div>
        <div><label htmlFor="kod" className={labelCls}>Kod za praćenje</label><input id="kod" className={`${fieldCls} mt-1.5 h-11 font-mono uppercase`} value={code} onChange={(e) => setCode(e.target.value)} placeholder="ABCD-2345" required autoComplete="off" /></div>
        <button className={btnP} disabled={busy}><SearchLg size={20} />Provjeri</button>
        {err && <p className="flex items-start gap-2 text-[14px] text-[#b42318] md:col-span-3" role="alert"><AlertCircle size={20} className="shrink-0" />{err}</p>}
      </form>

      {st && (
        <section aria-live="polite" className="rounded-[16px] bg-white p-6 ring-1 ring-inset ring-[#e5e5e5] md:p-8">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="font-mono text-[14px] text-[#525252]">{st.number}</p>
              <h2 className="mt-1 text-[24px] font-semibold leading-8 text-[#171717]">{st.form}</h2>
            </div>
            <Badge tone={CASE_STATUS[st.status].tone} dot size="md">{st.statusLabel}</Badge>
          </div>
          <dl className="mt-6 grid gap-4 sm:grid-cols-3">
            <div><dt className="text-[14px] text-[#525252]">Zaprimljen</dt><dd className="text-[16px] font-medium text-[#171717]">{dateLong(st.receivedAt)}</dd></div>
            <div><dt className="text-[14px] text-[#525252]">{st.closedAt ? 'Zatvoren' : 'Rok za rješavanje'}</dt><dd className="text-[16px] font-medium text-[#171717]">{dateLong(st.closedAt ?? st.dueAt)}{st.status === 'DOPUNA' && <span className="block text-[14px] font-normal text-[#525252]">Rok miruje dok čekamo dopunu.</span>}</dd></div>
          </dl>
          <h3 className="mt-8 text-[16px] font-semibold text-[#171717]">Tok predmeta</h3>
          <ol className="mt-3">
            {st.events.map((e, i) => (
              <li key={i} className="relative border-l border-[#e5e5e5] pb-5 pl-5 last:pb-0">
                <span className="absolute -left-[5px] top-[7px] size-[9px] rounded-full bg-[var(--br-600)]" />
                <p className="text-[14px] font-medium text-[#171717]">{e.statusLabel ?? STEP[e.kind] ?? 'Korak'} <span className="font-normal text-[#737373]">· {dateTime(e.createdAt)}</span></p>
                {e.note && <p className="mt-1 whitespace-pre-wrap text-[14px] text-[#404040]">{e.note}</p>}
              </li>
            ))}
          </ol>
          {st.canSupplement && <Supplement number={st.number} code={code} onDone={() => look()} />}
        </section>
      )}
    </div>
  );
}

function Supplement({ number, code, onDone }: { number: string; code: string; onDone: () => void }) {
  const [files, setFiles] = useState<File[]>([]);
  const [err, setErr] = useState('');
  const [ok, setOk] = useState(false);
  const [busy, setBusy] = useState(false);
  async function send(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    if (!fd.get('altcha')) return setErr('Pričekajte da se završi provjera da niste robot.');
    const body = new FormData();
    body.append('number', number); body.append('code', code); body.append('note', String(fd.get('note') ?? '')); body.append('altcha', String(fd.get('altcha')));
    files.forEach((f) => body.append('files', f, f.name));
    setBusy(true); setErr('');
    try {
      const r = await fetch('/api/cases/supplement', { method: 'POST', body });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j.message || 'Dopuna nije poslana.');
      setOk(true); setFiles([]); onDone();
    } catch (x: any) { setErr(x.message); } finally { setBusy(false); }
  }
  if (ok) return <p className="mt-8 flex items-center gap-2 rounded-[8px] bg-[#ecfdf3] p-4 text-[14px] font-medium text-[#067647] ring-1 ring-inset ring-[#abefc6]"><CheckCircle size={20} />Dopuna je poslana i dodana u predmet.</p>;
  return (
    <form onSubmit={send} className="mt-8 space-y-5 border-t border-[#e5e5e5] pt-8">
      <h3 className="text-[18px] font-semibold text-[#171717]">Dostavite dopunu</h3>
      <div><label htmlFor="note" className={labelCls}>Poruka</label><textarea id="note" name="note" rows={3} className={`${fieldCls} mt-1.5 py-2.5`} /></div>
      <FilePicker files={files} setFiles={setFiles} />
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"><HumanCheck /><button className={btnP} disabled={busy}><Send01 size={20} />Pošalji dopunu</button></div>
      {err && <p className="text-[14px] text-[#b42318]" role="alert">{err}</p>}
    </form>
  );
}
