'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { adminFetch } from '@/lib/adminApi';
import { dateLong, dateShort, dateTime } from '@/lib/format';
import StitchToggles from '@/components/stitch/StitchToggles';
import { DashboardBody } from '@/components/stitch/cms/Dashboard';

type Dash = {
  published: number; drafts: number; scheduled: number; views: number; documents: number; permits: number; facilities: number; locations: number;
  expiring: { id: string; registerNumber: string; operator: string; validUntil: string; status: string }[];
  recentPosts: { id: string; title: string; status: string; type: string; category: string; updatedAt: string }[];
  audit: { id: string; userName: string; action: string; target: string; createdAt: string }[];
};
const PAIRS: [string, string][] = [['exportBtn', 'exportMenu'], ['newItemBtn', 'newItemMenu']];
const ACTION: Record<string, string> = { LOGIN: 'Prijava na CMS', CREATE: 'Kreirao zapis', UPDATE: 'Izmijenio zapis', DELETE: 'Obrisao zapis', PUBLISH: 'Objavio na portalu', UPLOAD: 'Učitao datoteku' };

function card(icon: string, kicker: string, title: string, value: React.ReactNode, note: string, rows: [string, React.ReactNode, string?][], href: string) {
  return (
    <Link href={href} className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
      <div>
        <div className="flex items-center justify-between mb-space-sm">
          <div className="w-10 h-10 rounded-lg bg-surface-container-low text-primary-container flex items-center justify-center"><span className="material-symbols-outlined text-[22px]">{icon}</span></div>
          <span className="font-label-badge text-label-badge px-2 py-0.5 rounded bg-surface-container text-primary uppercase">{kicker}</span>
        </div>
        <span className="font-label-kicker text-label-kicker text-on-surface-variant uppercase tracking-wider">{title}</span>
        <div className="flex items-baseline gap-2 mt-1"><span className="font-headline-lg text-headline-lg text-text-heading">{value}</span><span className="font-body-sm text-body-sm text-secondary font-semibold">{note}</span></div>
      </div>
      <div className="mt-space-md pt-space-xs bg-surface-container-low p-2 rounded-lg space-y-1">
        {rows.map(([k, v, c]) => <div key={k} className={`flex justify-between font-body-sm text-body-sm ${c ?? 'text-on-surface-variant'}`}><span>{k}</span><strong>{v}</strong></div>)}
      </div>
    </Link>
  );
}

export default function Dashboard() {
  const [d, setD] = useState<Dash | null>(null);
  const [err, setErr] = useState<string | null>(null);
  useEffect(() => {
    const load = () => adminFetch<Dash>('/admin/dashboard').then(setD).catch((e) => setErr(e.message));
    load();
    const t = setInterval(load, 15000);
    return () => clearInterval(t);
  }, []);
  if (err) return <p className="text-error">{err}</p>;
  if (!d) return <div className="h-64 rounded-xl bg-surface-container-low animate-pulse" />;
  const now = new Date();

  return (
    <>
      <StitchToggles pairs={PAIRS} />
      <DashboardBody
        now={`Danas, ${now.toLocaleTimeString('bs-BA', { hour: '2-digit', minute: '2-digit' })}`}
        date={dateLong(now)}
        n={{ permits: d.permits, facilities: d.facilities }}
        alert={
          d.expiring.length > 0 ? (
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-amber-light text-on-tertiary-fixed shadow-sm">
              <div className="flex items-center gap-space-sm">
                <span className="material-symbols-outlined text-on-tertiary-container text-[22px]">warning</span>
                <span className="font-body-regular text-body-regular font-semibold">Pažnja, Sektor za zaštitu okoliša:</span>
                <span className="font-body-regular text-body-regular text-text-body">{d.expiring.length} {d.expiring.length === 1 ? 'dozvola ističe' : 'dozvole ističu'} u narednih 60 dana ({d.expiring.map((x) => x.operator).slice(0, 2).join(', ')}{d.expiring.length > 2 ? '…' : ''}).</span>
              </div>
              <Link href="/admin/registri" className="font-button text-button font-bold text-on-tertiary-container hover:underline flex items-center gap-1 shrink-0">Pregledaj isteke<span className="material-symbols-outlined text-[18px]">arrow_forward</span></Link>
            </div>
          ) : (
            <div className="flex items-center gap-space-sm p-3.5 rounded-xl bg-emerald-light text-secondary shadow-sm"><span className="material-symbols-outlined">check_circle</span><span className="font-body-regular text-body-regular font-semibold">Nijedna okolišna dozvola ne ističe u narednih 60 dana.</span></div>
          )
        }
        cardPermits={card('eco', 'Registar A-1', 'Okolišne dozvole', d.permits, 'u registru', [['Ističe u 60 dana', d.expiring.length, d.expiring.length ? 'text-error' : undefined], ['Lokacija na mapi', d.locations + d.permits + d.facilities]], '/admin/registri')}
        cardFacilities={card('apartment', 'Turizam', 'Ugostiteljski objekti', d.facilities, 'kategorizirano', [['Javni registar', 'aktivan'], ['Uvoz pune evidencije', 'pri migraciji']], '/registri/ugostiteljski-objekti')}
        cardPosts={card('article', 'Portal', 'Objave i dokumenti', d.published, 'objavljeno', [['Nacrti / zakazano', `${d.drafts} / ${d.scheduled}`], ['Dokumenata u repozitoriju', d.documents], ['Ukupno pregleda', d.views.toLocaleString('bs-BA')]], '/admin/objave')}
        audit={
          <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-md space-y-space-sm" id="audit">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-xs"><span className="w-2 h-2 rounded-full bg-secondary-fixed animate-ping" /><h2 className="font-title-md text-title-md font-bold text-[#1e2570]">Dnevnik aktivnosti (uživo)</h2></div>
              <span className="font-label-badge text-label-badge uppercase tracking-wider text-outline">Audit log</span>
            </div>
            <div className="space-y-space-md relative pl-4 before:content-[''] before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-[2px] before:bg-surface-container">
              {d.audit.length === 0 && <p className="font-body-sm text-body-sm text-outline">Još nema zabilježenih aktivnosti.</p>}
              {d.audit.map((a, i) => (
                <div key={a.id} className="relative pl-3">
                  <span className={`absolute -left-[19px] top-1.5 w-2.5 h-2.5 rounded-full ring-4 ring-surface-container-lowest ${i === 0 ? 'bg-secondary' : 'bg-primary-container'}`} />
                  <div className="flex items-baseline justify-between gap-2"><span className="font-button text-button font-bold text-text-heading truncate">{a.userName}</span><span className="font-label-badge text-label-badge text-outline shrink-0">{dateShort(a.createdAt) === dateShort(now) ? new Date(a.createdAt).toLocaleTimeString('bs-BA', { hour: '2-digit', minute: '2-digit' }) : dateTime(a.createdAt)}</span></div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">{ACTION[a.action] ?? a.action}{a.target && <>: <span className="font-semibold text-institutional-navy-deep">{a.target}</span></>}</p>
                </div>
              ))}
            </div>
            <Link href="/admin/korisnici#audit" className="font-button text-button text-primary-container hover:underline flex items-center gap-1 pt-1">Cijeli sigurnosni dnevnik<span className="material-symbols-outlined text-[18px]">history</span></Link>
          </div>
        }
      />
    </>
  );
}
