'use client';
import { useEffect, useState } from 'react';
import { adminFetch } from '@/lib/adminApi';
import { dateTime } from '@/lib/format';
import { UsersF2 } from '@/components/stitch/cms/Korisnici';

type A = { id: string; userName: string; action: string; target: string; createdAt: string };

export default function Page() {
  const [audit, setAudit] = useState<A[] | null>(null);
  useEffect(() => { adminFetch<{ audit: A[] }>('/admin/dashboard').then((d) => setAudit(d.audit)).catch(() => setAudit([])); }, []);
  return (
    <>
      <UsersF2 />
      <section id="audit" className="mt-space-xl bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden scroll-mt-24">
        <div className="p-space-md flex items-center justify-between">
          <div><h2 className="font-title-md text-title-md font-bold text-text-heading flex items-center gap-2"><span className="material-symbols-outlined text-secondary">history_edu</span>Dnevnik revizije (stvarni podaci)</h2><p className="font-body-sm text-body-sm text-outline">Svaka prijava i svaka izmjena u CMS-u se bilježi. Ovaj dio radi već u MVP-u.</p></div>
          <span className="font-label-badge text-label-badge px-2 py-0.5 rounded bg-emerald-light text-secondary uppercase">Uživo</span>
        </div>
        <table className="w-full text-left">
          <thead><tr className="bg-surface-container-low text-outline font-label-kicker text-[11px] uppercase tracking-wider">{['Vrijeme', 'Korisnik', 'Radnja', 'Zapis'].map((h) => <th key={h} className="p-space-md">{h}</th>)}</tr></thead>
          <tbody>
            {audit === null && <tr><td colSpan={4} className="p-space-md"><div className="h-12 rounded bg-surface-container-low animate-pulse" /></td></tr>}
            {audit?.map((a) => (
              <tr key={a.id} className="hover:bg-surface-container-low/60"><td className="p-space-md font-mono text-body-sm text-outline">{dateTime(a.createdAt)}</td><td className="p-space-md font-button text-button font-bold text-text-heading">{a.userName}</td><td className="p-space-md font-body-sm text-body-sm">{a.action}</td><td className="p-space-md font-body-sm text-body-sm text-on-surface-variant">{a.target}</td></tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  );
}
