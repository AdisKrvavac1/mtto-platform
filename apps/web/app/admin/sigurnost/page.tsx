'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { adminFetch, replaceToken } from '@/lib/adminApi';
import { Badge, Card, CardHeader, PageTitle, btnPrimary, btnSecondary, input, useToast } from '@/components/admin/ui';
import { AlertTriangle, Copy01, Download01, Lock01, Phone01, RefreshCw01, ShieldTick } from '@untitledui/icons';

type Me = { name: string; email: string; mfaEnabled: boolean; sessionMfa: boolean; mfaRequired: boolean; recoveryLeft: number };
type Setup = { qr: string; secret: string };

function CodeInput({ value, onChange, id }: { value: string; onChange: (v: string) => void; id: string }) {
  return (
    <input id={id} className={`${input} !w-[180px] text-center tracking-[0.3em] font-medium`} inputMode="numeric" autoComplete="one-time-code" placeholder="000000"
      maxLength={6} value={value} onChange={(e) => onChange(e.target.value.replace(/\D/g, '').slice(0, 6))} />
  );
}

function RecoveryCodes({ codes, onDone }: { codes: string[]; onDone: () => void }) {
  const text = `MTTO CMS – rezervni kodovi za dvofaktorsku prijavu\nSvaki kod se može iskoristiti samo jednom.\n\n${codes.join('\n')}\n`;
  return (
    <div className="space-y-4">
      <p className="flex items-start gap-2 rounded-[8px] bg-[#fffaeb] p-3 text-[14px] leading-5 text-[#b54708] ring-1 ring-inset ring-[#fedf89]">
        <AlertTriangle size={20} className="shrink-0" />
        Sačuvajte ove kodove na sigurnom mjestu. Prikazuju se samo sada, a trebaju vam ako izgubite telefon.
      </p>
      <ul className="grid max-w-[360px] grid-cols-2 gap-2 font-mono text-[15px] text-[#171717]">
        {codes.map((c) => <li key={c} className="rounded-[6px] bg-[#fafafa] px-3 py-2 text-center ring-1 ring-inset ring-[#e5e5e5]">{c}</li>)}
      </ul>
      <div className="flex flex-wrap gap-3">
        <button type="button" className={btnSecondary} onClick={() => navigator.clipboard?.writeText(text)}><Copy01 />Kopiraj</button>
        <a className={btnSecondary} href={`data:text/plain;charset=utf-8,${encodeURIComponent(text)}`} download="mtto-cms-rezervni-kodovi.txt"><Download01 />Preuzmi .txt</a>
        <button type="button" className={btnPrimary} onClick={onDone}>Sačuvao sam kodove</button>
      </div>
    </div>
  );
}

function SecurityPage() {
  const forced = useSearchParams().get('obavezno') === '1';
  const toast = useToast();
  const [me, setMe] = useState<Me | null>(null);
  const [setup, setSetup] = useState<Setup | null>(null);
  const [code, setCode] = useState('');
  const [codes, setCodes] = useState<string[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [disable, setDisable] = useState({ password: '', code: '' });
  const [regen, setRegen] = useState('');

  const load = () => adminFetch<Me>('/auth/me').then(setMe).catch((e) => toast.err(e.message));
  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function run<T>(fn: () => Promise<T>) {
    setBusy(true);
    try { return await fn(); } catch (e: any) { toast.err(e.message); return undefined; } finally { setBusy(false); }
  }

  const start = () => run(async () => { setSetup(await adminFetch<Setup>('/auth/mfa/setup', { method: 'POST' })); setCode(''); });
  const enable = () => run(async () => {
    const r = await adminFetch<{ token: string; recoveryCodes: string[] }>('/auth/mfa/enable', { method: 'POST', body: JSON.stringify({ code }) });
    replaceToken(r.token, { mfaEnabled: true });
    setCodes(r.recoveryCodes); setSetup(null); setCode('');
    toast.ok('Dvofaktorska prijava je uključena');
    await load();
  });
  const newCodes = () => run(async () => {
    const r = await adminFetch<{ recoveryCodes: string[] }>('/auth/mfa/recovery', { method: 'POST', body: JSON.stringify({ code: regen }) });
    setCodes(r.recoveryCodes); setRegen('');
    await load();
  });
  const turnOff = () => run(async () => {
    const r = await adminFetch<{ token: string }>('/auth/mfa/disable', { method: 'POST', body: JSON.stringify(disable) });
    replaceToken(r.token, { mfaEnabled: false });
    setDisable({ password: '', code: '' });
    toast.ok('Dvofaktorska prijava je isključena');
    await load();
  });

  return (
    <>
      <PageTitle kicker="Dvofaktorska prijava štiti CMS i kad neko sazna vašu lozinku." crumbs={['Sigurnost naloga']} title="Sigurnost naloga" />

      {forced && me && !me.mfaEnabled && (
        <p role="alert" className="mt-6 flex items-start gap-3 rounded-[12px] bg-[#fef3f2] p-4 text-[14px] leading-5 text-[#b42318] ring-1 ring-inset ring-[#fecdca]">
          <Lock01 size={20} className="shrink-0" />
          Dvofaktorska prijava je obavezna za sve korisnike CMS-a. Uključite je da biste nastavili s radom.
        </p>
      )}

      <Card className="mt-6">
        <CardHeader
          title="Dvofaktorska prijava (MFA)"
          badge={me ? (me.mfaEnabled ? <Badge tone="success" dot>Uključena</Badge> : <Badge tone="warning" dot>Isključena</Badge>) : undefined}
          description="Pri svakoj prijavi, pored lozinke, unosite kod iz aplikacije na telefonu: Google Authenticator, Microsoft Authenticator, Authy ili sličnu."
        />
        <div className="space-y-6 p-4 md:p-6">
          {!me && <p className="text-[14px] text-[#525252]">Učitavanje…</p>}

          {codes && <RecoveryCodes codes={codes} onDone={() => { setCodes(null); if (forced) location.href = '/admin'; }} />}

          {me && !me.mfaEnabled && !setup && !codes && (
            <div className="flex flex-wrap items-center gap-4">
              <span className="flex size-12 items-center justify-center rounded-[10px] ring-1 ring-inset ring-[#e5e5e5]"><Phone01 size={24} className="text-[#525252]" /></span>
              <p className="max-w-[520px] flex-1 text-[14px] leading-5 text-[#525252]">Postavljanje traje oko minutu. Trebat će vam telefon s instaliranom aplikacijom za autentifikaciju.</p>
              <button type="button" className={btnPrimary} disabled={busy} onClick={start}><ShieldTick />Uključi dvofaktorsku prijavu</button>
            </div>
          )}

          {setup && (
            <ol className="grid gap-6 lg:grid-cols-[auto_minmax(0,1fr)]">
              <li className="flex flex-col items-start gap-3">
                <span className="text-[14px] font-semibold text-[#171717]">1. Skenirajte QR kod aplikacijom</span>
                <img src={setup.qr} alt="QR kod za aplikaciju za autentifikaciju" width={220} height={220} className="rounded-[8px] ring-1 ring-inset ring-[#e5e5e5]" />
              </li>
              <li className="flex flex-col gap-4">
                <div>
                  <span className="text-[14px] font-semibold text-[#171717]">Ne možete skenirati?</span>
                  <p className="mt-1 text-[14px] leading-5 text-[#525252]">U aplikaciji odaberite ručni unos i upišite ključ:</p>
                  <code className="mt-2 inline-block rounded-[6px] bg-[#fafafa] px-3 py-2 font-mono text-[14px] tracking-wider text-[#171717] ring-1 ring-inset ring-[#e5e5e5]">{setup.secret}</code>
                </div>
                <div className="space-y-2">
                  <label htmlFor="mfa-enable" className="block text-[14px] font-semibold text-[#171717]">2. Upišite šestocifreni kod iz aplikacije</label>
                  <div className="flex flex-wrap items-center gap-3">
                    <CodeInput id="mfa-enable" value={code} onChange={setCode} />
                    <button type="button" className={btnPrimary} disabled={busy || code.length !== 6} onClick={enable}>Potvrdi i uključi</button>
                    <button type="button" className={btnSecondary} disabled={busy} onClick={() => setSetup(null)}>Odustani</button>
                  </div>
                </div>
              </li>
            </ol>
          )}

          {me?.mfaEnabled && !codes && (
            <div className="grid gap-6 lg:grid-cols-2">
              <section className="space-y-3 rounded-[12px] p-4 ring-1 ring-inset ring-[#e5e5e5]">
                <h3 className="text-[16px] font-semibold text-[#171717]">Rezervni kodovi</h3>
                <p className="text-[14px] leading-5 text-[#525252]">Preostalo neiskorištenih kodova: <b className="text-[#171717]">{me.recoveryLeft}</b>. Novi kodovi poništavaju stare.</p>
                <div className="flex flex-wrap items-center gap-3">
                  <CodeInput id="mfa-regen" value={regen} onChange={setRegen} />
                  <button type="button" className={btnSecondary} disabled={busy || regen.length !== 6} onClick={newCodes}><RefreshCw01 />Novi kodovi</button>
                </div>
              </section>
              <section className="space-y-3 rounded-[12px] p-4 ring-1 ring-inset ring-[#e5e5e5]">
                <h3 className="text-[16px] font-semibold text-[#171717]">Isključivanje</h3>
                {me.mfaRequired ? (
                  <p className="text-[14px] leading-5 text-[#525252]">Dvofaktorska prijava je obavezna za sve korisnike CMS-a i ne može se isključiti.</p>
                ) : (
                  <>
                    <p className="text-[14px] leading-5 text-[#525252]">Potvrdite lozinkom i kodom iz aplikacije.</p>
                    <div className="flex flex-wrap items-center gap-3">
                      <input type="password" aria-label="Lozinka" autoComplete="current-password" placeholder="Lozinka" className={`${input} !w-[200px]`} value={disable.password} onChange={(e) => setDisable((d) => ({ ...d, password: e.target.value }))} />
                      <CodeInput id="mfa-off" value={disable.code} onChange={(v) => setDisable((d) => ({ ...d, code: v }))} />
                      <button type="button" className={btnSecondary} disabled={busy || !disable.password || disable.code.length !== 6} onClick={turnOff}>Isključi</button>
                    </div>
                  </>
                )}
              </section>
            </div>
          )}
        </div>
      </Card>
      {toast.node}
    </>
  );
}

export default function Page() {
  return <Suspense fallback={null}><SecurityPage /></Suspense>;
}
