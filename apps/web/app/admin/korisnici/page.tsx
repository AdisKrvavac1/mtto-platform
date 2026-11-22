'use client';
import { useEffect, useState } from 'react';
import { adminFetch } from '@/lib/adminApi';
import { dateTime } from '@/lib/format';
import F2Page from '@/components/admin/F2Page';
import { Avatar, Badge, Card, CardHeader, td, th, tr } from '@/components/admin/ui';
import { Key01, Lock01, ShieldTick, UserCheck01, Users01 } from '@untitledui/icons';

type A = { id: string; userName: string; action: string; target: string; createdAt: string };
const ACTION: Record<string, [string, 'brand' | 'success' | 'gray' | 'error' | 'warning']> = { LOGIN: ['Prijava', 'gray'], CREATE: ['Kreiranje', 'brand'], UPDATE: ['Izmjena', 'warning'], DELETE: ['Brisanje', 'error'], PUBLISH: ['Objava', 'success'], UPLOAD: ['Učitavanje', 'brand'] };

export default function Page() {
  const [audit, setAudit] = useState<A[] | null>(null);
  useEffect(() => { adminFetch<{ audit: A[] }>('/admin/dashboard').then((d) => setAudit(d.audit)).catch(() => setAudit([])); }, []);
  return (
    <F2Page title="Korisnici i dnevnik" sub="Korisnički računi, uloge i dnevnik aktivnosti." icon={Users01}
      features={[
        [UserCheck01, 'Korisnički računi', 'Računi za urednike po sektorima, s aktivacijom putem e-maila.'],
        [Key01, 'Uloge i prava', 'Administrator, urednik sektora i referent registra, s pravima po modulu.'],
        [Lock01, 'Dvofaktorska prijava', 'Dodatna zaštita računa aplikacijom za jednokratne kodove.'],
        [ShieldTick, 'Dnevnik aktivnosti', 'Već radi: svaka prijava i izmjena bilježi se ispod.'],
      ]}
      steps={['Popis urednika po sektorima od Ministarstva.', 'Kreiranje računa i dodjela uloga.', 'Uključivanje dvofaktorske prijave za administratore.']}>
      <Card className="mt-6 overflow-hidden" >
        <div id="audit" className="scroll-mt-24">
          <CardHeader title="Dnevnik aktivnosti" badge={<Badge tone="success" dot>Uživo</Badge>} description="Prijave i izmjene u CMS-u. Ovaj dio radi već u MVP-u." />
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead><tr><th className={th}>Korisnik</th><th className={th}>Radnja</th><th className={th}>Zapis</th><th className={th}>Vrijeme</th></tr></thead>
              <tbody>
                {audit === null && <tr><td colSpan={4} className={td}><div className="h-12 animate-pulse rounded-[8px] bg-[#f5f5f5]" /></td></tr>}
                {audit?.length === 0 && <tr><td colSpan={4} className={`${td} text-center`}>Nema zabilježenih aktivnosti.</td></tr>}
                {audit?.map((a) => {
                  const [l, t] = ACTION[a.action] ?? [a.action, 'gray' as const];
                  return (
                    <tr key={a.id} className={tr}>
                      <td className={td}><span className="flex items-center gap-3"><Avatar name={a.userName} size={32} /><span className="font-medium text-[#171717]">{a.userName}</span></span></td>
                      <td className={td}><Badge tone={t}>{l}</Badge></td>
                      <td className={td}><span className="line-clamp-1">{a.target || '—'}</span></td>
                      <td className={`${td} whitespace-nowrap`}>{dateTime(a.createdAt)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </Card>
    </F2Page>
  );
}
