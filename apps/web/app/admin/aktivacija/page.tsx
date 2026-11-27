'use client';
// F1-04: aktivacija naloga iz pozivnice. Token je u # dijelu adrese, pa ne ide serveru u zahtjevu za stranicu ni u logove.
import { useEffect, useState } from 'react';
import { adminFetch } from '@/lib/adminApi';
import { AlertCircle, CheckCircle, Eye, EyeOff } from '@untitledui/icons';

const field = 'w-full h-11 px-[14px] rounded-[8px] bg-white border border-[#d4d4d4] text-[16px] leading-6 text-[#171717] placeholder:text-[#737373] shadow-[0_1px_2px_rgba(10,13,18,0.05)] focus:outline-none focus:border-[#d6bbfb] focus:ring-4 focus:ring-[#9e77ed]/25';

export default function ActivatePage() {
  const [token, setToken] = useState<string | null>(null);
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [show, setShow] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<string | null>(null);

  useEffect(() => {
    const t = new URLSearchParams(location.hash.slice(1)).get('t');
    setToken(t || '');
    if (t) history.replaceState(null, '', location.pathname); // token ne ostaje u historiji preglednika
  }, []);

  const rules = [
    { ok: pw.length >= 12, label: 'Najmanje 12 znakova' },
    { ok: pw.length > 0 && pw === pw2, label: 'Obje lozinke su iste' },
  ];

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (!rules.every((r) => r.ok)) { setErr('Lozinka ne ispunjava uslove ispod.'); return; }
    setBusy(true);
    try {
      const r = await adminFetch<{ email: string }>('/auth/activate', { method: 'POST', body: JSON.stringify({ token, password: pw }) });
      setDone(r.email);
    } catch (e: any) { setErr(e.message); } finally { setBusy(false); }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4 py-12">
      <div className="flex w-full max-w-[400px] flex-col gap-10">
        <a href="/" aria-label="Javni portal MTTO"><img src="/mtto-logo.svg" alt="Ministarstvo trgovine, turizma i zaštite okoliša HNK" className="h-12 w-auto" /></a>
        {done ? (
          <div className="flex flex-col gap-6">
            <span className="flex size-12 items-center justify-center rounded-full bg-[#dcfae6] text-[#079455] ring-8 ring-[#ecfdf3]"><CheckCircle size={24} /></span>
            <div><h1 className="text-[24px] leading-8 font-semibold text-[#171717]">Nalog je aktiviran</h1>
              <p className="mt-2 text-[16px] leading-6 text-[#525252]">Prijavite se s e-mailom <strong className="text-[#171717]">{done}</strong> i novom lozinkom. Nakon prijave uključite dvofaktorsku prijavu aplikacijom na telefonu.</p></div>
            <a href="/admin/prijava" className="flex h-11 items-center justify-center rounded-[8px] bg-[#7f56d9] text-[16px] font-semibold text-white hover:bg-[#6941c6]">Na prijavu</a>
          </div>
        ) : token === '' ? (
          <div className="flex flex-col gap-3">
            <h1 className="text-[24px] leading-8 font-semibold text-[#171717]">Link nije potpun</h1>
            <p className="text-[16px] leading-6 text-[#525252]">Otvorite cijeli link iz poruke administratora. Ako je link istekao, zatražite novi.</p>
          </div>
        ) : (
          <form onSubmit={submit} className="flex flex-col gap-6" noValidate>
            <div><h1 className="text-[24px] leading-8 lg:text-[30px] lg:leading-[38px] font-semibold text-[#171717]">Postavite lozinku</h1>
              <p className="mt-2 text-[16px] leading-6 text-[#525252]">Lozinka za vaš nalog u CMS-u Ministarstva. Najlakše je složiti nekoliko riječi u rečenicu koju pamtite.</p></div>
            <label className="flex flex-col gap-1.5">
              <span className="text-[14px] leading-5 font-medium text-[#404040]">Nova lozinka</span>
              <span className="relative">
                <input className={`${field} pr-11`} type={show ? 'text' : 'password'} autoComplete="new-password" value={pw} onChange={(e) => setPw(e.target.value)} required autoFocus />
                <button type="button" onClick={() => setShow((v) => !v)} aria-label={show ? 'Sakrij lozinku' : 'Prikaži lozinku'} className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-[#a3a3a3] hover:text-[#525252]">{show ? <EyeOff size={16} /> : <Eye size={16} />}</button>
              </span>
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-[14px] leading-5 font-medium text-[#404040]">Ponovite lozinku</span>
              <input className={field} type={show ? 'text' : 'password'} autoComplete="new-password" value={pw2} onChange={(e) => setPw2(e.target.value)} required />
            </label>
            <ul className="flex flex-col gap-2 text-[14px] leading-5" aria-live="polite">
              {rules.map((r) => <li key={r.label} className={`flex items-center gap-2 ${r.ok ? 'text-[#067647]' : 'text-[#525252]'}`}><CheckCircle size={16} className={r.ok ? 'text-[#17b26a]' : 'text-[#d4d4d4]'} />{r.label}</li>)}
            </ul>
            {err && <p role="alert" className="flex items-start gap-2 rounded-[8px] border border-[#fecdca] bg-[#fef3f2] p-3 text-[14px] leading-5 text-[#b42318]"><AlertCircle size={20} className="shrink-0" />{err}</p>}
            <button className="h-11 w-full rounded-[8px] bg-[#7f56d9] text-[16px] font-semibold text-white hover:bg-[#6941c6] disabled:opacity-60" disabled={busy || token === null}>{busy ? 'Spremanje…' : 'Aktiviraj nalog'}</button>
          </form>
        )}
      </div>
    </div>
  );
}
