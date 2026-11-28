'use client';
// F2-05: javni elektronski obrazac. Nakon slanja građanin dobija broj predmeta i kod za praćenje.
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import type { PublicForm } from '@/lib/cases';
import type { RegField } from '@/lib/registry';
import { dateLong } from '@/lib/format';
import { AlertCircle, CheckCircle, Copy01, File06, Printer, Send01, UploadCloud02, XClose } from '@untitledui/icons';

export const fieldCls = 'w-full rounded-[8px] border border-[#d4d4d4] bg-white px-[14px] text-[16px] leading-6 text-[#171717] shadow-[0_1px_2px_rgba(10,13,18,0.05)] placeholder:text-[#737373] focus:border-[var(--br-300)] focus:outline-none focus:ring-4 focus:ring-[var(--br-100)] aria-[invalid=true]:border-[#fda29b]';
export const labelCls = 'text-[14px] font-medium leading-5 text-[#404040]';
export const btnP = 'inline-flex h-11 items-center justify-center gap-1.5 rounded-[8px] bg-[var(--br-600)] px-[18px] text-[16px] font-semibold text-white hover:bg-[var(--br-700)] disabled:opacity-60';
export const btnS = 'inline-flex h-11 items-center justify-center gap-1.5 rounded-[8px] bg-white px-4 text-[16px] font-semibold text-[#404040] ring-1 ring-inset ring-[#d4d4d4] hover:bg-[#fafafa]';
const MAX = 5, MAX_MB = 5;

export function HumanCheck() {
  useEffect(() => { import('altcha').then(() => import('altcha/i18n/bs')).catch(() => {}); }, []);
  return <div className="max-w-[320px]"><altcha-widget challenge="/api/altcha/challenge" auto="onload" language="bs" name="altcha" /></div>;
}

export function FilePicker({ files, setFiles, required, hint }: { files: File[]; setFiles: (f: File[]) => void; required?: boolean; hint?: string }) {
  const inp = useRef<HTMLInputElement>(null);
  const [err, setErr] = useState('');
  function add(list: FileList | null) {
    setErr('');
    const ok: File[] = [];
    for (const f of Array.from(list ?? [])) {
      if (!/\.(pdf|jpe?g|png|webp)$/i.test(f.name)) { setErr(`„${f.name}“: dozvoljeni su PDF, JPG, PNG i WEBP.`); continue; }
      if (f.size > MAX_MB * 1024 * 1024) { setErr(`„${f.name}“ je veći od ${MAX_MB} MB.`); continue; }
      ok.push(f);
    }
    setFiles([...files, ...ok].slice(0, MAX));
  }
  return (
    <div>
      <p className={labelCls}>Prilozi{required && <span className="text-[var(--br-600)]">*</span>}</p>
      {hint && <p className="mt-1 text-[14px] text-[#525252]">{hint}</p>}
      <div className="mt-2 flex flex-col items-center gap-2 rounded-[12px] border border-dashed border-[#d4d4d4] px-6 py-6 text-center"
        onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); add(e.dataTransfer.files); }}>
        <UploadCloud02 size={24} className="text-[#737373]" />
        <p className="text-[14px] text-[#525252]"><button type="button" className="font-semibold text-[var(--br-700)] hover:underline" onClick={() => inp.current?.click()}>Odaberite datoteke</button> ili ih prevucite ovdje</p>
        <p className="text-[12px] text-[#737373]">PDF ili fotografija, do {MAX} datoteka po {MAX_MB} MB</p>
        <input ref={inp} type="file" multiple accept=".pdf,image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => { add(e.target.files); e.target.value = ''; }} />
      </div>
      {err && <p className="mt-2 text-[14px] text-[#d92d20]" role="alert">{err}</p>}
      {files.length > 0 && (
        <ul className="mt-3 space-y-2">
          {files.map((f, i) => (
            <li key={i} className="flex items-center gap-2 rounded-[8px] px-3 py-2 text-[14px] ring-1 ring-inset ring-[#e5e5e5]">
              <File06 size={18} className="shrink-0 text-[#a3a3a3]" /><span className="min-w-0 flex-1 truncate">{f.name}</span><span className="text-[#737373]">{(f.size / 1024 / 1024).toFixed(1)} MB</span>
              <button type="button" aria-label={`Ukloni ${f.name}`} className="rounded p-1 text-[#a3a3a3] hover:bg-[#fafafa] hover:text-[#525252]" onClick={() => setFiles(files.filter((_, j) => j !== i))}><XClose size={16} /></button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Control({ f, err }: { f: RegField; err?: string }) {
  const p = { id: `f-${f.key}`, name: f.key, required: f.required, className: `${fieldCls} h-11`, 'aria-invalid': !!err || undefined, 'aria-describedby': err ? `e-${f.key}` : f.help ? `h-${f.key}` : undefined };
  switch (f.type) {
    case 'longtext': return <textarea {...p} rows={5} className={`${fieldCls} py-2.5`} />;
    case 'select': return <select {...p} defaultValue=""><option value="" disabled={f.required}>Odaberite…</option>{f.options?.map((o) => <option key={o}>{o}</option>)}</select>;
    case 'boolean': return <select {...p} defaultValue=""><option value="">—</option><option value="da">Da</option><option value="ne">Ne</option></select>;
    case 'date': return <input {...p} type="date" />;
    case 'integer': return <input {...p} type="number" step={1} inputMode="numeric" />;
    case 'number': return <input {...p} type="number" step="any" inputMode="decimal" />;
    case 'email': return <input {...p} type="email" autoComplete="email" />;
    case 'url': return <input {...p} type="url" placeholder="https://" />;
    default: return <input {...p} />;
  }
}

type Done = { number: string; code: string; dueAt: string; form: string; emailQueued?: boolean };

export default function CaseForm({ form }: { form: PublicForm }) {
  const [files, setFiles] = useState<File[]>([]);
  const [errs, setErrs] = useState<Record<string, string>>({});
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<Done | null>(null);
  const [copied, setCopied] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr(''); setErrs({});
    const fd = new FormData(e.currentTarget);
    if (!fd.get('altcha')) return setErr('Pričekajte trenutak da se završi provjera da niste robot, pa pošaljite ponovo.');
    if (form.attachments === 'OBAVEZNO' && !files.length) return setErr(`Priložite dokumente: ${form.attachmentHint || 'prilog je obavezan'}.`);
    const data: Record<string, string> = {};
    for (const f of form.fields) { const v = fd.get(f.key); if (v != null && v !== '') data[f.key] = String(v); }
    const body = new FormData();
    body.append('data', JSON.stringify(data));
    for (const k of ['applicantName', 'applicantEmail', 'applicantPhone', 'altcha', 'website']) { const v = fd.get(k); if (v) body.append(k, String(v)); }
    body.append('consent', fd.get('consent') ? 'true' : 'false');
    files.forEach((f) => body.append('files', f, f.name));
    setBusy(true);
    try {
      const r = await fetch(`/api/forms/${form.slug}/submit`, { method: 'POST', body });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) {
        const m: Record<string, string> = {};
        for (const x of j.errors ?? []) m[x.field] = x.message;
        setErrs(m);
        throw new Error(Object.keys(m).length ? 'Provjerite označena polja.' : Array.isArray(j.message) ? j.message[0] : j.message || 'Zahtjev nije poslan.');
      }
      setDone(j);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (x: any) { setErr(x.message); } finally { setBusy(false); }
  }

  if (done) return (
    <div className="rounded-[16px] bg-white p-6 ring-1 ring-inset ring-[#e5e5e5] md:p-10 print:ring-0" role="status">
      <span className="flex size-12 items-center justify-center rounded-full bg-[#dcfae6] text-[#079455] ring-8 ring-[#ecfdf3] print:hidden"><CheckCircle size={24} /></span>
      <h2 className="mt-6 text-[24px] font-semibold leading-8 text-[#171717]">Zahtjev je zaprimljen</h2>
      <p className="mt-2 text-[16px] text-[#525252]">{done.form}. Sačuvajte ili odštampajte ovu potvrdu: broj predmeta i kod trebaju vam za praćenje statusa i dopunu.{done.emailQueued && ' Istu potvrdu šaljemo i na vaš e-mail, kao i obavijesti o promjeni statusa.'}</p>
      <dl className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-[12px] bg-[#fafafa] p-4 ring-1 ring-inset ring-[#e5e5e5]"><dt className="text-[14px] text-[#525252]">Broj predmeta</dt><dd className="mt-1 font-mono text-[20px] font-semibold text-[#171717]">{done.number}</dd></div>
        <div className="rounded-[12px] bg-[#fafafa] p-4 ring-1 ring-inset ring-[#e5e5e5]"><dt className="text-[14px] text-[#525252]">Kod za praćenje</dt><dd className="mt-1 font-mono text-[20px] font-semibold text-[#171717]">{done.code}</dd></div>
        <div className="rounded-[12px] bg-[#fafafa] p-4 ring-1 ring-inset ring-[#e5e5e5]"><dt className="text-[14px] text-[#525252]">Rok za rješavanje</dt><dd className="mt-1 text-[20px] font-semibold text-[#171717]">{dateLong(done.dueAt)}</dd></div>
      </dl>
      <p className="mt-4 text-[14px] text-[#525252]">Kod se ne može ponovo izdati putem portala jer se čuva šifrovano. Ako ga izgubite, javite se Ministarstvu s brojem predmeta.</p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row print:hidden">
        <button type="button" className={btnS} onClick={() => { navigator.clipboard?.writeText(`${done.number} ${done.code}`); setCopied(true); }}><Copy01 size={20} />{copied ? 'Kopirano' : 'Kopiraj broj i kod'}</button>
        <button type="button" className={btnS} onClick={() => window.print()}><Printer size={20} />Štampaj potvrdu</button>
        <Link href={`/e-usluge/status?broj=${encodeURIComponent(done.number)}`} className={btnP}>Prati status</Link>
      </div>
    </div>
  );

  return (
    <form onSubmit={submit} noValidate={false} className="space-y-8 rounded-[16px] bg-white p-6 ring-1 ring-inset ring-[#e5e5e5] md:p-8">
      <fieldset className="grid gap-5 md:grid-cols-2">
        <legend className="mb-4 text-[18px] font-semibold text-[#171717]">Podaci o zahtjevu</legend>
        {form.fields.map((f) => (
          <div key={f.key} className={f.type === 'longtext' ? 'md:col-span-2' : ''}>
            <label htmlFor={`f-${f.key}`} className={labelCls}>{f.label}{f.required && <span className="text-[var(--br-600)]">*</span>}</label>
            <div className="mt-1.5"><Control f={f} err={errs[f.key]} /></div>
            {errs[f.key] ? <p id={`e-${f.key}`} className="mt-1.5 text-[14px] text-[#d92d20]">{errs[f.key]}</p> : f.help && <p id={`h-${f.key}`} className="mt-1.5 text-[14px] text-[#525252]">{f.help}</p>}
          </div>
        ))}
      </fieldset>

      {form.attachments !== 'NE' && <FilePicker files={files} setFiles={setFiles} required={form.attachments === 'OBAVEZNO'} hint={form.attachmentHint} />}

      <div className="border-t border-[#e5e5e5] pt-8"><fieldset className="grid gap-5 md:grid-cols-2">
        <legend className="mb-4 text-[18px] font-semibold text-[#171717]">Podnosilac</legend>
        <div className="md:col-span-2">
          <label htmlFor="applicantName" className={labelCls}>Ime i prezime ili naziv pravnog lica<span className="text-[var(--br-600)]">*</span></label>
          <input id="applicantName" name="applicantName" required minLength={3} autoComplete="name" aria-invalid={!!errs.applicantName || undefined} className={`${fieldCls} mt-1.5 h-11`} />
          {errs.applicantName && <p className="mt-1.5 text-[14px] text-[#d92d20]">{errs.applicantName}</p>}
        </div>
        <div>
          <label htmlFor="applicantEmail" className={labelCls}>E-mail</label>
          <input id="applicantEmail" name="applicantEmail" type="email" autoComplete="email" aria-invalid={!!errs.applicantEmail || undefined} className={`${fieldCls} mt-1.5 h-11`} />
          {errs.applicantEmail ? <p className="mt-1.5 text-[14px] text-[#d92d20]">{errs.applicantEmail}</p> : <p className="mt-1.5 text-[14px] text-[#525252]">E-mail ili telefon, da vas službenik može kontaktirati.</p>}
        </div>
        <div>
          <label htmlFor="applicantPhone" className={labelCls}>Telefon</label>
          <input id="applicantPhone" name="applicantPhone" type="tel" autoComplete="tel" className={`${fieldCls} mt-1.5 h-11`} />
        </div>
        <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
        <label className="flex items-start gap-3 text-[14px] text-[#404040] md:col-span-2">
          <input type="checkbox" name="consent" required className="mt-0.5 size-4 accent-[var(--br-600)]" />
          <span>Saglasan/na sam da Ministarstvo obrađuje navedene lične podatke isključivo radi rješavanja ovog zahtjeva. {errs.consent && <span className="block text-[#d92d20]">{errs.consent}</span>}</span>
        </label>
      </fieldset></div>

      <div className="flex flex-col gap-4 border-t border-[#e5e5e5] pt-6 md:flex-row md:items-center md:justify-between">
        <HumanCheck />
        <button className={btnP} disabled={busy}><Send01 size={20} />{busy ? 'Šaljem…' : 'Pošalji zahtjev'}</button>
      </div>
      {err && <p className="flex items-start gap-2 rounded-[8px] bg-[#fef3f2] p-3 text-[14px] text-[#b42318] ring-1 ring-inset ring-[#fecdca]" role="alert"><AlertCircle size={20} className="shrink-0" />{err}</p>}
    </form>
  );
}
