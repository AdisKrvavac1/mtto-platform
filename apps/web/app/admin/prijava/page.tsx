'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login } from '@/lib/adminApi';
import { input, btnPrimary } from '@/components/admin/ui';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      await login(email, password);
      router.replace('/admin');
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
    <div className="cms-theme min-h-screen flex bg-white">
      <section className="flex flex-col w-full lg:w-1/2 lg:max-w-[640px] lg:min-w-[480px] min-h-screen">
        <div className="flex-1 flex items-center justify-center px-4 md:px-8 py-12">
          <div className="w-full max-w-[360px] flex flex-col gap-12 lg:gap-20">
            <a href="/" aria-label="Javni portal MTTO"><img src="/mtto-logo.svg" alt="Ministarstvo trgovine, turizma i zaštite okoliša HNK" className="h-12 w-auto" /></a>
            <div className="flex flex-col gap-8">
              <div className="flex flex-col gap-3">
                <h1 className="text-[24px] leading-8 lg:text-[30px] lg:leading-[38px] font-semibold text-[#171717]">Prijava u CMS</h1>
                <p className="text-[16px] leading-6 text-[#525252]">Dobro došli. Unesite podatke svog službenog naloga.</p>
              </div>
              <form onSubmit={submit} className="flex flex-col gap-6" noValidate>
                <div className="flex flex-col gap-5">
                  <label className="flex flex-col gap-1.5">
                    <span className="text-[14px] leading-5 font-medium text-[#404040]">E-mail</span>
                    <input className={field} type="email" autoComplete="username" placeholder="ime.prezime@mtto.gov.ba" required value={email} onChange={(e) => setEmail(e.target.value)} />
                  </label>
                  <label className="flex flex-col gap-1.5">
                    <span className="text-[14px] leading-5 font-medium text-[#404040]">Lozinka</span>
                    <span className="relative">
                      <input className={`${field} pr-11`} type={show ? 'text' : 'password'} autoComplete="current-password" placeholder="••••••••••••" required value={password} onChange={(e) => setPassword(e.target.value)} />
                      <button type="button" onClick={() => setShow((v) => !v)} aria-label={show ? 'Sakrij lozinku' : 'Prikaži lozinku'} className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-[#a3a3a3] hover:text-[#525252]"><span className="material-symbols-outlined text-[18px]">{show ? 'visibility_off' : 'visibility'}</span></button>
                    </span>
                  </label>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2 text-[14px] leading-5 font-medium text-[#404040]"><span className="material-symbols-outlined text-[16px] text-[#079455]">shield_lock</span>Sesija traje 8 sati</span>
                  <a href="mailto:info@mtto.gov.ba?subject=CMS%20%E2%80%93%20zaboravljena%20lozinka" className="text-[14px] leading-5 font-semibold text-[#7f56d9] hover:underline">Zaboravljena lozinka</a>
                </div>
                {err && <p role="alert" className="flex items-start gap-2 p-3 rounded-[8px] border border-[#fecdca] bg-[#fef3f2] text-[#b42318] text-[14px] leading-5"><span className="material-symbols-outlined text-[18px]">error</span>{err}</p>}
                <button className="relative h-11 w-full rounded-[8px] bg-[#7f56d9] hover:bg-[#6941c6] text-white text-[16px] leading-6 font-semibold shadow-[0_1px_2px_rgba(10,13,18,0.05),inset_0_-2px_0_rgba(10,13,18,0.05),inset_0_0_0_1px_rgba(10,13,18,0.18)] border-2 border-white/10 disabled:opacity-60" disabled={busy}>{busy ? 'Prijava…' : 'Prijavi se'}</button>
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
