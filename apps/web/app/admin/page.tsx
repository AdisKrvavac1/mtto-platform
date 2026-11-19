'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { adminFetch } from '@/lib/adminApi';
import { Card, PageTitle, StatusChip, btnPrimary, btnSecondary } from '@/components/admin/ui';
import { dateShort, dateTime, POST_TYPE } from '@/lib/format';

type Dash = {
  published: number; drafts: number; scheduled: number; views: number; documents: number; permits: number; facilities: number; locations: number;
  expiring: { id: string; registerNumber: string; operator: string; validUntil: string; status: string }[];
  recentPosts: { id: string; title: string; status: string; type: string; category: string; updatedAt: string }[];
  audit: { id: string; userName: string; action: string; target: string; createdAt: string }[];
};

export default function Dashboard() {
  const [d, setD] = useState<Dash | null>(null);
  const [err, setErr] = useState<string | null>(null);
  useEffect(() => {
    adminFetch<Dash>('/admin/dashboard').then(setD).catch((e) => setErr(e.message));
    const t = setInterval(() => adminFetch<Dash>('/admin/dashboard').then(setD).catch(() => {}), 15000);
    return () => clearInterval(t);
  }, []);
  if (err) return <p className="text-error">{err}</p>;
  if (!d) return <div className="h-64 rounded-xl bg-surface-container-low animate-pulse" />;

  const kpi = [
    { label: 'Objavljenih objava', value: d.published, sub: `${d.drafts} nacrta · ${d.scheduled} zakazano`, icon: 'article', color: 'text-mtto-primary', href: '/admin/objave' },
    { label: 'Ukupno pregleda', value: d.views.toLocaleString('bs-BA'), sub: 'Sve objave na portalu', icon: 'visibility', color: 'text-neretva-cyan', href: '/admin/objave' },
    { label: 'Dokumenata', value: d.documents, sub: 'Propisi, obrasci, prilozi', icon: 'folder_open', color: 'text-[#eb851c]', href: '/admin/dokumenti' },
    { label: 'Okolišnih dozvola', value: d.permits, sub: `${d.expiring.length} ističe u 60 dana`, icon: 'eco', color: 'text-eko-green', href: '/admin/registri' },
    { label: 'Lokacija na mapi', value: d.locations + d.permits + d.facilities, sub: `${d.locations} ručno unesenih`, icon: 'map', color: 'text-mtto-navy', href: '/admin/mapa' },
  ];

  return (
    <>
      <PageTitle kicker="Kontrolna ploča · operativni pregled" title="Dobrodošli u MTTO CMS">
        <Link href="/admin/objave/nova" className={btnPrimary}><span className="material-symbols-outlined text-[18px]">add</span>Nova objava</Link>
        <Link href="/admin/dokumenti" className={btnSecondary}><span className="material-symbols-outlined text-[18px]">upload_file</span>Učitaj dokument</Link>
      </PageTitle>

      {d.expiring.length > 0 && (
        <div className="mb-space-lg flex flex-col md:flex-row md:items-center gap-space-sm p-space-md rounded-xl bg-amber-light border border-herzeg-gold">
          <span className="material-symbols-outlined text-[#b45309]">warning</span>
          <p className="flex-1 font-body-sm text-body-sm text-text-heading"><strong>Pažnja, resor zaštite okoliša:</strong> {d.expiring.length} {d.expiring.length === 1 ? 'dozvola ističe' : 'dozvole ističu'} u narednih 60 dana.</p>
          <Link href="/admin/registri" className="font-button text-button font-bold text-[#b45309] inline-flex items-center gap-1">Pregledaj istek<span className="material-symbols-outlined text-[18px]">arrow_forward</span></Link>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-space-md mb-space-lg">
        {kpi.map((k) => (
          <Link key={k.label} href={k.href}>
            <Card className="p-space-md h-full border-t-[3px] border-t-mtto-primary hover:shadow-[0_4px_12px_rgba(35,70,150,0.08)] transition-shadow">
              <span className={`material-symbols-outlined ${k.color}`}>{k.icon}</span>
              <p className="mt-1 font-label-badge text-label-badge uppercase tracking-wider text-on-surface-variant">{k.label}</p>
              <p className="font-display text-[34px] leading-tight font-bold text-text-heading">{k.value}</p>
              <p className="font-body-sm text-[12px] text-on-surface-variant">{k.sub}</p>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-space-lg">
        <Card className="xl:col-span-8 overflow-hidden">
          <div className="p-space-md flex items-center justify-between border-b border-slate-border">
            <h2 className="font-title-md text-title-md font-bold text-text-heading flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-error" />Nedavne objave</h2>
            <Link href="/admin/objave" className="font-button text-button text-mtto-primary">Sve objave →</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] text-left">
              <thead><tr className="border-b-2 border-mtto-primary">{['Naslov', 'Vrsta', 'Resor', 'Status', 'Izmjena'].map((h) => <th key={h} className="px-space-md py-2 font-label-badge text-label-badge uppercase text-[#80807e]">{h}</th>)}</tr></thead>
              <tbody>
                {d.recentPosts.map((p, i) => (
                  <tr key={p.id} className={`${i % 2 ? 'bg-slate-surface' : ''} hover:bg-[rgba(0,171,235,0.05)]`}>
                    <td className="px-space-md py-2.5"><Link href={`/admin/objave/${p.id}`} className="font-button text-button font-bold text-mtto-primary hover:underline line-clamp-1">{p.title}</Link></td>
                    <td className="px-space-md py-2.5 font-body-sm text-body-sm">{POST_TYPE[p.type]}</td>
                    <td className="px-space-md py-2.5 font-body-sm text-body-sm">{p.category}</td>
                    <td className="px-space-md py-2.5"><StatusChip status={p.status} /></td>
                    <td className="px-space-md py-2.5 font-mono text-[12px] text-on-surface-variant whitespace-nowrap">{dateShort(p.updatedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
        <Card className="xl:col-span-4">
          <div className="p-space-md flex items-center justify-between border-b border-slate-border">
            <h2 className="font-title-md text-title-md font-bold text-text-heading">Dnevnik aktivnosti</h2>
            <span className="font-label-badge text-label-badge uppercase text-on-surface-variant">Audit log</span>
          </div>
          <ol className="p-space-md space-y-space-md">
            {d.audit.map((a) => (
              <li key={a.id} className="flex gap-space-sm">
                <span className="mt-1.5 w-2 h-2 rounded-full bg-mtto-primary shrink-0" />
                <div className="min-w-0">
                  <p className="font-body-sm text-body-sm"><strong className="text-text-heading">{a.userName}</strong> · {a.action}</p>
                  <p className="font-body-sm text-[12px] text-on-surface-variant truncate">{a.target}</p>
                  <p className="font-mono text-[11px] text-outline">{dateTime(a.createdAt)}</p>
                </div>
              </li>
            ))}
          </ol>
        </Card>
      </div>
    </>
  );
}
