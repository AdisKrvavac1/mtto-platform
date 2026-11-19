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

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:flex flex-col justify-between p-space-2xl text-white relative overflow-hidden" style={{ background: 'linear-gradient(160deg, #1a1e5c 0%, #234696 60%, #062343 100%)' }}>
        <div className="absolute -bottom-40 -right-40 w-[520px] h-[520px] rounded-full bg-neretva-cyan/20 blur-3xl" />
        <img src="/mtto-logo.svg" alt="MTTO" className="h-14 w-auto self-start bg-white rounded-lg p-2" />
        <div className="relative space-y-space-md max-w-md">
          <p className="font-label-kicker text-label-kicker uppercase tracking-widest text-secondary-fixed">MTTO Back-Office</p>
          <h1 className="font-display text-display font-bold leading-tight">Jedno mjesto za sav sadržaj Ministarstva</h1>
          <p className="font-body-lead text-body-lead text-white/80">Objave, javni pozivi, dokumenti, registri i mapa. Bez programera, bez dodataka, s evidencijom svake izmjene.</p>
        </div>
        <p className="relative font-body-sm text-body-sm text-white/60">Ministarstvo trgovine, turizma i zaštite okoliša HNK</p>
      </div>
      <div className="flex items-center justify-center p-space-lg bg-slate-surface">
        <form onSubmit={submit} className="w-full max-w-sm bg-surface-container-lowest rounded-xl shadow-md border border-slate-border p-space-lg space-y-space-md">
          <div>
            <p className="font-label-kicker text-label-kicker uppercase tracking-wider text-on-surface-variant">Sigurna prijava</p>
            <h2 className="font-headline-sm text-headline-sm font-bold text-text-heading">Prijava u CMS</h2>
          </div>
          <label className="block space-y-1">
            <span className="font-label-badge text-label-badge uppercase text-on-surface-variant">E-mail</span>
            <input className={input} type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          <label className="block space-y-1">
            <span className="font-label-badge text-label-badge uppercase text-on-surface-variant">Lozinka</span>
            <input className={input} type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          </label>
          {err && <p role="alert" className="flex items-center gap-1 p-2 rounded bg-error-container text-on-error-container font-body-sm text-body-sm"><span className="material-symbols-outlined text-[18px]">error</span>{err}</p>}
          <button className={`${btnPrimary} w-full`} disabled={busy}><span className="material-symbols-outlined text-[18px]">lock_open</span>{busy ? 'Prijava…' : 'Prijavi se'}</button>
          <p className="font-body-sm text-body-sm text-on-surface-variant flex items-start gap-1"><span className="material-symbols-outlined text-[16px] text-eko-green">shield</span>Sesija ističe nakon 8 sati. Dvofaktorska prijava (MFA) dolazi u Fazi 1.</p>
        </form>
      </div>
    </div>
  );
}
