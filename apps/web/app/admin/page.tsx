'use client';
import { SearchStats } from '@/components/admin/SearchStats';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { adminFetch, useCan } from '@/lib/adminApi';
import { dateShort, dateTime } from '@/lib/format';
import { AlertTriangle, Announcement01, ArrowRight, CheckCircle, LinkExternal01, Plus, XClose } from '@untitledui/icons';
import { Avatar, Badge, BarChart, ButtonGroup, Card, CardHeader, EmptyState, MetricCard, ProgressBar, StatusChip, WelcomeHeader, btnPrimary, btnSecondary, btnTertiary, td, th, tr } from '@/components/admin/ui';
import { getUser } from '@/lib/adminApi';

type Dash = {
  published: number; drafts: number; scheduled: number; pending?: number; views: number; documents: number; permits: number; facilities: number; locations: number;
  expiring: { id: string; registerNumber: string; operator: string; validUntil: string; status: string }[];
  recentPosts: { id: string; title: string; status: string; type: string; category: string; updatedAt: string }[];
  audit: { id: string; userName: string; action: string; target: string; createdAt: string }[];
  monthly?: { m: string; type: string; n: number }[];
  topPosts?: { id: string; title: string; views: number; type: string; publishedAt: string }[];
  reports?: { status: string; n: number }[];
};
const ACTION: Record<string, string> = { LOGIN: 'se prijavio/la na CMS', CREATE: 'je kreirao/la', UPDATE: 'je izmijenio/la', DELETE: 'je obrisao/la', PUBLISH: 'je objavio/la', UPLOAD: 'je učitao/la datoteku' };
const TYPE: Record<string, string> = { VIJEST: 'Vijest', JAVNI_POZIV: 'Javni poziv', SAOPCENJE: 'Saopćenje' };
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'Maj', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dec'];
type Range = '12' | '6' | '3';

export default function Dashboard() {
  const canPost = useCan('objave', 'write');
  const [d, setD] = useState<Dash | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [range, setRange] = useState<Range>('12');
  const [hideAlert, setHideAlert] = useState(false);
  useEffect(() => {
    const load = () => adminFetch<Dash>('/admin/dashboard').then(setD).catch((e) => setErr(e.message));
    load();
    const t = setInterval(load, 30000);
    return () => clearInterval(t);
  }, []);

  const months = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 12 }, (_, i) => { const x = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1); return { key: `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}`, label: MON[x.getMonth()] }; });
  }, []);
  const per = (type?: string) => months.map((m) => (d?.monthly ?? []).filter((r) => r.m === m.key && (!type || r.type === type)).reduce((s, r) => s + r.n, 0));

  if (err) return <Card className="p-6"><EmptyState icon={AlertTriangle} title="Kontrolnu ploču nije moguće učitati">{err}</EmptyState></Card>;
  if (!d) return <div className="space-y-6"><div className="h-12 w-80 animate-pulse rounded-[8px] bg-[#f5f5f5]" /><div className="grid gap-6 md:grid-cols-3">{[0, 1, 2].map((i) => <div key={i} className="h-40 animate-pulse rounded-[12px] bg-[#f5f5f5]" />)}</div><div className="h-96 animate-pulse rounded-[12px] bg-[#f5f5f5]" /></div>;

  const all = per();
  const trend = all[10] ? Math.round(((all[11] - all[10]) / all[10]) * 100) : null;
  const cut = 12 - Number(range);
  const reportsTotal = (d.reports ?? []).reduce((s, r) => s + r.n, 0);
  const reportsNew = (d.reports ?? []).find((r) => r.status === 'NOVO')?.n ?? 0;
  const structure: [string, number, string][] = [['Objave', d.published, '/admin/objave'], ['Dokumenti i propisi', d.documents, '/admin/dokumenti'], ['Okolišne dozvole', d.permits, '/admin/registri'], ['Ugostiteljski objekti', d.facilities, '/registri/ugostiteljski-objekti'], ['Lokacije na karti', d.locations, '/admin/mapa']];
  const maxS = Math.max(1, ...structure.map((s) => s[1]));
  const first = (getUser()?.name ?? 'urednice').split(' ')[0];

  return (
    <>
      <WelcomeHeader
        title={`Dobro došli, ${first}`}
        sub="Pregled sadržaja portala, registara i prijava građana."
        actions={<><a href="/" target="_blank" rel="noopener" className={btnSecondary}><LinkExternal01 />Javni portal</a>{canPost && <Link href="/admin/objave/nova" className={btnPrimary}><Plus />Nova objava</Link>}</>}
      />

      {d.expiring.length > 0 && !hideAlert && (
        <div className="mb-6 flex items-start gap-4 rounded-[12px] bg-white p-4 ring-1 ring-inset ring-[#fedf89] shadow-[0_1px_2px_rgba(10,13,18,0.05)]">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#fef0c7] text-[#dc6803] ring-[6px] ring-[#fffaeb]"><AlertTriangle size={16} /></span>
          <div className="min-w-0 flex-1">
            <p className="text-[14px] leading-5 font-semibold text-[#171717]">{d.expiring.length} {d.expiring.length === 1 ? 'okolišna dozvola ističe' : 'okolišne dozvole ističu'} u narednih 60 dana</p>
            <p className="mt-1 text-[14px] leading-5 text-[#525252]">{d.expiring.map((x) => `${x.operator} (${dateShort(x.validUntil)})`).join(', ')}</p>
            <Link href="/admin/registri" className="mt-3 inline-flex items-center gap-1.5 text-[14px] font-semibold text-[#6941c6] hover:text-[#53389e]">Pregledaj registar<ArrowRight size={16} /></Link>
          </div>
          <button type="button" onClick={() => setHideAlert(true)} className="rounded-[8px] p-2 text-[#a3a3a3] hover:bg-[#fafafa]" aria-label="Zatvori"><XClose size={20} /></button>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Objavljeno" value={d.published.toLocaleString('bs-BA')} trend={trend} spark={all} href="/admin/objave" />
        <MetricCard title="Pregledi objava" value={d.views.toLocaleString('bs-BA')} footer={d.pending ? `${d.pending} čeka odobrenje · ${d.scheduled} zakazano` : `${d.drafts} nacrta · ${d.scheduled} zakazano`} spark={all.map((v, i) => v + i)} href="/admin/objave" />
        <MetricCard title="Okolišne dozvole" value={d.permits} footer={d.expiring.length ? <span className="text-[#d92d20]">{d.expiring.length} ističe u 60 dana</span> : 'Nijedna ne ističe uskoro'} href="/admin/registri" />
        <MetricCard title="Prijave građana" value={reportsTotal} footer={reportsNew ? <Badge tone="error" dot>{reportsNew} nove</Badge> : 'Sve prijave obrađene'} href="/admin/eko-rizik" />
      </div>

      <Card className="mt-6 overflow-hidden">
        <CardHeader title="Objave po mjesecima" description="Objavljene vijesti, javni pozivi i saopćenja na portalu." actions={<ButtonGroup<Range> value={range} onChange={setRange} items={[{ value: '12', label: '12 mjeseci' }, { value: '6', label: '6 mjeseci' }, { value: '3', label: '3 mjeseca' }]} />} />
        <div className="grid gap-8 p-4 md:p-6 lg:grid-cols-[1fr_320px] [&>*]:min-w-0">
          <BarChart labels={months.slice(cut).map((m) => m.label)} series={[
            { name: 'Vijesti', data: per('VIJEST').slice(cut), color: '#6941c6' },
            { name: 'Javni pozivi', data: per('JAVNI_POZIV').slice(cut), color: '#9e77ed' },
            { name: 'Saopćenja', data: per('SAOPCENJE').slice(cut), color: '#d6bbfb' },
          ]} />
          <div className="border-t border-[#e5e5e5] pt-6 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
            <p className="text-[14px] font-medium text-[#525252]">Ukupno zapisa u sistemu</p>
            <p className="mt-1 text-[36px] leading-[44px] font-semibold tracking-[-0.02em] text-[#171717]">{structure.reduce((s, x) => s + x[1], 0).toLocaleString('bs-BA')}</p>
            <ul className="mt-6 flex flex-col gap-5">
              {structure.map(([l, n, href]) => (
                <li key={l}><Link href={href} className="group block"><span className="flex justify-between text-[14px] font-medium text-[#404040] group-hover:text-[#6941c6]"><span>{l}</span><span className="text-[#525252]">{n}</span></span><span className="mt-2 block"><ProgressBar value={(n / maxS) * 100} /></span></Link></li>
              ))}
            </ul>
          </div>
        </div>
      </Card>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_400px]">
        <Card className="overflow-hidden">
          <CardHeader title="Nedavne izmjene" badge={<Badge tone="brand">{d.recentPosts.length} objava</Badge>} actions={<Link href="/admin/objave" className={btnSecondary}>Sve objave</Link>} />
          {d.recentPosts.length === 0 ? <EmptyState icon={Announcement01} title="Još nema objava" action={canPost ? <Link href="/admin/objave/nova" className={btnPrimary}><Plus />Nova objava</Link> : undefined}>Prva objava pojavit će se ovdje.</EmptyState> : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px]">
                <thead><tr><th className={th}>Naslov</th><th className={th}>Vrsta</th><th className={th}>Status</th><th className={th}>Izmijenjeno</th></tr></thead>
                <tbody>
                  {d.recentPosts.map((p) => (
                    <tr key={p.id} className={tr}>
                      <td className={td}><Link href={`/admin/objave/${p.id}`} className="line-clamp-1 font-medium text-[#171717] hover:text-[#6941c6]">{p.title}</Link><span className="text-[#525252]">{p.category}</span></td>
                      <td className={td}><Badge tone="gray">{TYPE[p.type] ?? p.type}</Badge></td>
                      <td className={td}><StatusChip status={p.status} /></td>
                      <td className={`${td} whitespace-nowrap`}>{dateTime(p.updatedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card className="flex flex-col">
          <CardHeader title="Aktivnost" description="Dnevnik prijava i izmjena u CMS-u." menu />
          <ul className="flex-1 divide-y divide-[#e5e5e5] px-4 md:px-6">
            {d.audit.length === 0 && <li className="py-6 text-[14px] text-[#525252]">Još nema zabilježenih aktivnosti.</li>}
            {d.audit.map((a, i) => (
              <li key={a.id} className="flex gap-3 py-4">
                <Avatar name={a.userName} online={i === 0} />
                <div className="min-w-0 flex-1">
                  <p className="flex items-baseline gap-2 text-[14px] leading-5"><span className="truncate font-semibold text-[#404040]">{a.userName}</span><span className="shrink-0 text-[12px] text-[#737373]">{dateTime(a.createdAt)}</span></p>
                  <p className="text-[14px] leading-5 text-[#525252]">{ACTION[a.action] ?? a.action}{a.target && <> <span className="font-medium text-[#6941c6]">{a.target}</span></>}</p>
                </div>
              </li>
            ))}
          </ul>
          <div className="border-t border-[#e5e5e5] px-4 py-3 text-right md:px-6"><Link href="/admin/korisnici#audit" className={btnTertiary}>Cijeli dnevnik</Link></div>
        </Card>
      </div>

      {(d.topPosts?.length ?? 0) > 0 && (
        <Card className="mt-6 overflow-hidden">
          <CardHeader title="Najčitanije objave" description="Prema broju pregleda na portalu." menu />
          <ul className="divide-y divide-[#e5e5e5]">
            {d.topPosts!.map((p, i) => (
              <li key={p.id} className="flex items-center gap-4 px-4 py-4 md:px-6">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#f9f5ff] text-[14px] font-semibold text-[#7f56d9]">{i + 1}</span>
                <span className="min-w-0 flex-1"><Link href={`/admin/objave/${p.id}`} className="line-clamp-1 text-[14px] font-medium text-[#171717] hover:text-[#6941c6]">{p.title}</Link><span className="text-[14px] text-[#525252]">{TYPE[p.type] ?? p.type} · {dateShort(p.publishedAt)}</span></span>
                <span className="text-[14px] font-medium text-[#404040] whitespace-nowrap">{p.views.toLocaleString('bs-BA')} pregleda</span>
              </li>
            ))}
          </ul>
        </Card>
      )}
      <SearchStats />
      {d.expiring.length === 0 && <p className="mt-6 flex items-center gap-2 text-[14px] text-[#525252]"><CheckCircle size={16} className="text-[#079455]" />Nijedna okolišna dozvola ne ističe u narednih 60 dana.</p>}
    </>
  );
}
