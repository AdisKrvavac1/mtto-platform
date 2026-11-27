'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login, verifyMfa } from '@/lib/adminApi';
import { AlertCircle, ArrowLeft, Eye, EyeOff, Phone01, ShieldTick } from '@untitledui/icons';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [mfaToken, setMfaToken] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [useRecovery, setUseRecovery] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      if (mfaToken) {
        await verifyMfa(mfaToken, code);
        router.replace('/admin');
        return;
      }
      const r = await login(email, password);
      if (r.mfaToken) { setMfaToken(r.mfaToken); setPassword(''); return; }
      router.replace(r.setupRequired ? '/admin/sigurnost?obavezno=1' : '/admin');
    } catch (e: any) {
      setErr(e.message || 'Prijava nije uspjela');
    } finally {
      setBusy(false);
    }
  }

  const [show, setShow] = useState(false);
  const field = 'w-full h-11 px-[14px] rounded-[8px] bg-white border border-[#d4d4d4] text-[16px] leading-6 text-[#171717] placeholder:text-[#737373] shadow-[0_1px_2px_rgba(10,13,18,0.05)] focus:outline-none focus:border-[#d6bbfb] focus:ring-4 focus:ring-[#9e77ed]/25';

  // Untitled UI PRO – "Log in / Split mockup" (1646:403218)
  return (
    <div className="min-h-screen flex bg-white">
      <section className="flex flex-col w-full lg:w-1/2 lg:max-w-[640px] lg:min-w-[480px] min-h-screen">
        <div className="flex-1 flex items-center justify-center px-4 md:px-8 py-12">
          <div className="w-full max-w-[360px] flex flex-col gap-12 lg:gap-20">
            <a href="/" aria-label="Javni portal MTTO"><img src="/mtto-logo.svg" alt="Ministarstvo trgovine, turizma i zaštite okoliša HNK" className="h-12 w-auto" /></a>
            <div className="flex flex-col gap-8">
              <div className="flex flex-col gap-3">
                <h1 className="text-[24px] leading-8 lg:text-[30px] lg:leading-[38px] font-semibold text-[#171717]">{mfaToken ? 'Potvrda prijave' : 'Prijava u CMS'}</h1>
                <p className="text-[16px] leading-6 text-[#525252]">{mfaToken ? (useRecovery ? 'Unesite jedan od rezervnih kodova koje ste sačuvali pri uključivanju.' : 'Unesite šestocifreni kod iz aplikacije za autentifikaciju na telefonu.') : 'Dobro došli. Unesite podatke svog službenog naloga.'}</p>
              </div>
              <form onSubmit={submit} className="flex flex-col gap-6" noValidate>
                {mfaToken ? (
                  <div className="flex flex-col gap-4">
                    <label className="flex flex-col gap-1.5">
                      <span className="text-[14px] leading-5 font-medium text-[#404040]">{useRecovery ? 'Rezervni kod' : 'Kod za potvrdu'}</span>
                      <input key={useRecovery ? 'rc' : 'otp'} className={`${field} tracking-[0.3em] text-center font-medium`} autoFocus required value={code} onChange={(e) => setCode(useRecovery ? e.target.value.toUpperCase() : e.target.value.replace(/\D/g, '').slice(0, 6))}
                        inputMode={useRecovery ? 'text' : 'numeric'} autoComplete="one-time-code" placeholder={useRecovery ? 'XXXX-XXXX' : '000000'} maxLength={useRecovery ? 9 : 6} aria-describedby="mfa-help" />
                    </label>
                    <p id="mfa-help" className="flex items-center gap-2 text-[14px] leading-5 text-[#525252]"><Phone01 size={16} className="text-[#a3a3a3]" />Kod se mijenja svakih 30 sekundi.</p>
                    <div className="flex items-center justify-between gap-2 text-[14px] leading-5">
                      <button type="button" className="inline-flex items-center gap-1 font-semibold text-[#525252] hover:text-[#171717]" onClick={() => { setMfaToken(null); setCode(''); setErr(null); setUseRecovery(false); }}><ArrowLeft size={16} />Nazad</button>
                      <button type="button" className="font-semibold text-[#7f56d9] hover:underline" onClick={() => { setUseRecovery((v) => !v); setCode(''); setErr(null); }}>{useRecovery ? 'Koristi kod iz aplikacije' : 'Nemate telefon? Rezervni kod'}</button>
                    </div>
                  </div>
                ) : (<>
                <div className="flex flex-col gap-5">
                  <label className="flex flex-col gap-1.5">
                    <span className="text-[14px] leading-5 font-medium text-[#404040]">E-mail</span>
                    <input className={field} type="email" autoComplete="username" placeholder="ime.prezime@mtto.gov.ba" required value={email} onChange={(e) => setEmail(e.target.value)} />
                  </label>
                  <label className="flex flex-col gap-1.5">
                    <span className="text-[14px] leading-5 font-medium text-[#404040]">Lozinka</span>
                    <span className="relative">
                      <input className={`${field} pr-11`} type={show ? 'text' : 'password'} autoComplete="current-password" placeholder="••••••••••••" required value={password} onChange={(e) => setPassword(e.target.value)} />
                      <button type="button" onClick={() => setShow((v) => !v)} aria-label={show ? 'Sakrij lozinku' : 'Prikaži lozinku'} className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-[#a3a3a3] hover:text-[#525252]">{show ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                    </span>
                  </label>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2 text-[14px] leading-5 font-medium text-[#404040]"><ShieldTick size={16} className="text-[#079455]" />Sesija traje 8 sati</span>
                  <a href="mailto:info@mtto.gov.ba?subject=CMS%20%E2%80%93%20zaboravljena%20lozinka" className="text-[14px] leading-5 font-semibold text-[#7f56d9] hover:underline">Zaboravljena lozinka</a>
                </div>
                </>)}
                {err && <p role="alert" className="flex items-start gap-2 p-3 rounded-[8px] border border-[#fecdca] bg-[#fef3f2] text-[#b42318] text-[14px] leading-5"><AlertCircle size={20} className="shrink-0" />{err}</p>}
                <button className="relative h-11 w-full rounded-[8px] bg-[#7f56d9] hover:bg-[#6941c6] text-white text-[16px] leading-6 font-semibold shadow-[0_1px_2px_rgba(10,13,18,0.05),inset_0_-2px_0_rgba(10,13,18,0.05),inset_0_0_0_1px_rgba(10,13,18,0.18)] border-2 border-white/10 disabled:opacity-60" disabled={busy}>{busy ? 'Provjera…' : mfaToken ? 'Potvrdi' : 'Prijavi se'}</button>
              </form>
              <p className="text-center text-[14px] leading-5 text-[#525252]">Nemate nalog? <a href="mailto:tajnik@mtto.gov.ba?subject=CMS%20%E2%80%93%20zahtjev%20za%20nalog" className="font-semibold text-[#7f56d9] hover:underline">Zatražite pristup</a></p>
            </div>
          </div>
        </div>
        <footer className="px-4 md:px-8 py-8 text-[14px] leading-5 text-[#525252]">© {new Date().getFullYear()} Ministarstvo trgovine, turizma i zaštite okoliša HNK</footer>
      </section>
      <section aria-hidden className="hidden lg:block flex-1 relative overflow-hidden bg-[#f5f5f5]">
        <div className="absolute left-[96px] top-1/2 -translate-y-1/2 rounded-[27px] p-[3.4px] bg-white border border-black/10 shadow-[0_10px_7px_rgba(0,0,0,0.08),0_3px_2.5px_rgba(0,0,0,0.03),0_1.7px_0.8px_rgba(0,0,0,0.04)]">
          <div className="rounded-[23.6px] p-[3.4px] bg-white shadow-[inset_0_0_5px_1.7px_rgba(0,0,0,0.08)]">
            <div className="rounded-[20px] border-[1.7px] border-[#e5e5e5] bg-[#fafafa] overflow-hidden w-[1010px] h-[674px]">
              <img src="/cms/preview-dashboard.png" alt="" className="w-full h-full object-cover object-left-top" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
