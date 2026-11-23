import Link from 'next/link';
import { apiSafe, type Permit, type PostListItem, type MapPoint } from '@/lib/api';
import { EMPTY, type RiskSummary } from '@/lib/risk';
import { dateLong, dateShort, daysUntil } from '@/lib/format';
import EkoMonitoring from '@/components/uui/EkoMonitoring';
import ProtectedAreas from '@/components/uui/ProtectedAreas';
import InquiryForm from '@/components/figma/InquiryForm';
import { Badge, Button, Card, Container, CountUp, FeaturedIcon, GRAD, Head, TableCard, td, th } from '@/components/uui';
import { AlertTriangle, ArrowRight, Clock, Download01, Edit05, File06, FileSearch02, Map01, MessageTextSquare01, SearchLg, ShieldTick, Ticket01, Waves } from '@untitledui/icons';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Zaštita okoliša' };

type Stats = { permits: number; permitsRenewal: number; documents: number; locations: number; facilities: number };
type List = { items: PostListItem[] };
const PERMIT_ST: Record<string, [string, 'success' | 'warning' | 'error' | 'gray']> = { VAZECA: ['Važeća', 'success'], U_OBNOVI: ['U obnovi', 'warning'], ISTEKLA: ['Istekla', 'error'] };

export default async function OkolisPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const qs = new URLSearchParams(); if (sp.q) qs.set('q', sp.q); if (sp.municipality) qs.set('municipality', sp.municipality);
  const [stats, permits, envPosts, calls, points, risk] = await Promise.all([
    apiSafe<Stats>('/stats', { permits: 0, permitsRenewal: 0, documents: 0, locations: 0, facilities: 0 }),
    apiSafe<Permit[]>(`/permits?${qs}`, []),
    apiSafe<List>(`/posts?category=${encodeURIComponent('Zaštita okoliša')}&limit=3`, { items: [] }),
    apiSafe<List>('/posts?type=JAVNI_POZIV&limit=3', { items: [] }),
    apiSafe<MapPoint[]>('/map', []),
    apiSafe<RiskSummary>('/risk/summary', EMPTY),
  ]);
  const openCall = calls.items.find((c) => !c.deadline || new Date(c.deadline) > new Date());

  return (
    <>
      {/* HERO */}
      <section className={`relative isolate overflow-hidden text-white ${GRAD}`}>
        <div aria-hidden className="absolute inset-0 opacity-25 [background-image:radial-gradient(rgba(255,255,255,0.14)_1px,transparent_1px)] [background-size:24px_24px] [mask-image:linear-gradient(to_bottom,black,transparent_60%)]" />
        <Container className="relative pb-10 pt-10 md:pt-14">
          <nav aria-label="Putanja" className="mb-6 flex items-center gap-2 text-[14px] font-medium text-[var(--br-200)]"><Link href="/" className="hover:text-white">Naslovna</Link><span className="text-white/30">/</span><span className="font-semibold text-white">Zaštita okoliša</span></nav>
          <div className="grid gap-10 lg:grid-cols-[1.3fr_1fr] lg:items-end">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--gr-500)]/15 px-2.5 py-0.5 text-[12px] font-semibold text-[var(--gr-200)] ring-1 ring-inset ring-[var(--gr-500)]/40"><span className="size-1.5 rounded-full bg-[var(--gr-400)]" />Sektor za zaštitu okoliša i prirodnih resursa</span>
              <h1 className="mt-4 text-[36px] leading-[44px] md:text-[56px] md:leading-[64px] font-semibold tracking-[-0.02em]">Zaštita okoliša i krša: <span className="text-[var(--gr-300)]">od Makljena do Jadranskog mora</span></h1>
              <p className="mt-4 max-w-[680px] text-[18px] leading-7 text-[var(--br-100)]">Okolišne dozvole, upravljanje otpadom, javni uvidi i praćenje rizika od požara, poplava i klizišta u slivu Neretve.</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Link href="#podrucja" className="inline-flex h-11 items-center justify-center gap-1.5 rounded-[8px] border-2 border-white/10 bg-[var(--br-600)] px-4 text-[16px] font-semibold hover:bg-[var(--br-700)]"><Map01 size={20} />Istraži zaštićena područja</Link>
                <Link href="/eko-rizik" className="inline-flex h-11 items-center justify-center gap-1.5 rounded-[8px] bg-white/10 px-4 text-[16px] font-semibold ring-1 ring-inset ring-white/25 backdrop-blur-md hover:bg-white/15"><Waves size={20} />Eko-rizik uživo</Link>
                <Link href="#uvidi" className="inline-flex h-11 items-center justify-center gap-1.5 rounded-[8px] bg-white/10 px-4 text-[16px] font-semibold ring-1 ring-inset ring-white/25 backdrop-blur-md hover:bg-white/15"><MessageTextSquare01 size={20} />Aktivni javni uvidi</Link>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 rounded-[16px] bg-white/10 p-3 ring-1 ring-inset ring-white/15 backdrop-blur-md">
              {([[String(stats.permits), 'Okolišnih dozvola', 'Javni registar'], [String(stats.permitsRenewal), 'U postupku obnove', 'Praćenje rokova'], [String(points.length), 'Lokacija na GIS karti', 'Dozvole i područja'], ['24/7', 'Eko-alarm', 'Prijave građana']] as const).map(([v, l, s]) => (
                <div key={l} className="rounded-[12px] bg-white/5 p-4"><p className="text-[28px] leading-9 font-semibold"><CountUp value={v} /></p><p className="text-[14px] font-medium text-[var(--br-100)]">{l}</p><p className="text-[12px] text-[var(--gr-300)]">{s}</p></div>
              ))}
            </div>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
            {[['Hidrološki biser', 'Kanjon Neretve', '/fig/tile-neretva.jpg'], ['Visokogorje', 'Prenj i Rujišta', '/fig/tile-prenj.jpg'], ['Ramsar stanište', 'Hutovo blato', '/fig/tile-hutovo.jpg'], ['Jadranski koridor', 'Neumski zaljev', '/fig/tile-neum.jpg']].map(([k, t, img]) => (
              <div key={t} className="group uui-lift relative h-[130px] overflow-hidden rounded-[12px] ring-1 ring-inset ring-white/20 md:h-[150px]"><img src={img} alt="" className="absolute inset-0 size-full object-cover transition-transform duration-700 group-hover:scale-[1.06]" /><span className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" /><span className="absolute bottom-3 left-3 text-white md:left-4"><span className="block text-[12px] font-semibold text-[var(--gr-200)]">{k}</span><span className="text-[16px] md:text-[18px] font-semibold">{t}</span></span></div>
            ))}
          </div>
        </Container>
      </section>

      {/* BRZI LINKOVI */}
      <section className="border-b border-[#e5e5e5] bg-white">
        <Container className="grid gap-2 py-4 sm:grid-cols-2 lg:grid-cols-4">
          {([[Ticket01, 'Javni pozivi', 'Eko-fond i sufinanciranje', '/vijesti?type=JAVNI_POZIV', !!openCall], [File06, 'Obrasci i dozvole', 'Zahtjevi i PDF obrasci', '/propisi?docType=OBRAZAC', false], [FileSearch02, 'Registar dozvola', `${stats.permits} izdanih dozvola`, '/registri/okolisne-dozvole', false], [AlertTriangle, 'Eko-inspekcija', 'Građanski alarm i prijave', '/eko-rizik/prijava', false]] as const).map(([I, t, s, href, rip]) => (
            <Link key={t} href={href} className="group flex items-center gap-3 rounded-[12px] p-3 hover:bg-[#fafafa]"><FeaturedIcon icon={I} tone={rip ? 'success' : 'brand'} size="md" ripple={rip} /><span><b className="block text-[16px] font-semibold text-[#171717] group-hover:text-[var(--br-700)]">{t}</b><span className="text-[14px] text-[#525252]">{s}</span></span></Link>
          ))}
        </Container>
      </section>

      <EkoMonitoring risk={risk} title="Automatski eko-monitoring uživo" />

      <section id="podrucja" className="scroll-mt-28 bg-[#fafafa] py-16 md:py-24"><Container><ProtectedAreas points={points} more={false} /></Container></section>

      {/* JAVNI UVIDI + AARHUS */}
      <section id="uvidi" className="scroll-mt-28 bg-white py-16 md:py-24">
        <Container className="grid gap-8 lg:grid-cols-[1fr_440px]">
          <div>
            <Head k="Aarhuška konvencija" t="Javni uvidi, rasprave i učešće javnosti" s="Pravo javnosti na pristup informacijama, sudjelovanje u odlučivanju i pravnu zaštitu u okolišnim pitanjima." />
            <div className="mt-8 flex flex-col gap-4">
              {envPosts.items.map((p) => {
                const left = daysUntil(p.deadline);
                const open = left === null || left >= 0;
                return (
                  <Card key={p.id} className="group uui-lift p-5 md:p-6">
                    <div className="flex flex-wrap items-center justify-between gap-2"><Badge tone={open ? 'success' : 'gray'} dot>{p.type === 'JAVNI_POZIV' ? 'Javni poziv' : p.deadline && open ? 'Otvoreno za primjedbe' : 'Objava'}</Badge>{p.deadline && <span className={`flex items-center gap-1.5 text-[14px] font-semibold ${open ? 'text-[#d92d20]' : 'text-[#737373]'}`}><Clock size={16} />{open ? `Rok: još ${left} dana` : `Zaključeno ${dateLong(p.deadline)}`}</span>}</div>
                    <h3 className="mt-3 text-[18px] leading-7 font-semibold text-[#171717]"><Link href={`/vijesti/${p.slug}`} className="hover:text-[var(--br-700)]">{p.title}</Link></h3>
                    {p.excerpt && <p className="mt-2 line-clamp-2 text-[14px] text-[#525252]">{p.excerpt}</p>}
                    <div className="mt-4 flex flex-col gap-3 border-t border-[#e5e5e5] pt-4 sm:flex-row sm:items-center sm:justify-between">
                      <Link href={`/vijesti/${p.slug}${p.attachmentCount ? '#dokumenti' : ''}`} className="flex items-center gap-1.5 text-[14px] font-semibold text-[var(--br-700)]"><Download01 size={16} />{p.attachmentCount ? `Studija i prilozi (${p.attachmentCount})` : 'Tekst objave'}</Link>
                      <span className="text-[12px] text-[#737373]">Objavljeno {dateShort(p.publishedAt)}</span>
                    </div>
                  </Card>
                );
              })}
              {envPosts.items.length === 0 && <p className="text-[16px] text-[#525252]">Trenutno nema otvorenih javnih uvida.</p>}
            </div>
          </div>
          <Card className="self-start p-6">
            <h3 className="flex items-center gap-2 text-[18px] font-semibold text-[#171717]"><MessageTextSquare01 size={20} className="text-[var(--br-600)]" />Dostava komentara i primjedbi</h3>
            <p className="mt-2 text-[14px] text-[#525252]">Građani, udruženja i institucije mogu dostaviti pisana mišljenja na objavljene studije i nacrte.</p>
            <div className="mt-5"><InquiryForm /></div>
            <p className="mt-4 flex items-start gap-2 text-[12px] text-[#737373]"><ShieldTick size={16} className="shrink-0 text-[var(--gr-600)]" />Lični podaci obrađuju se u skladu sa Zakonom o zaštiti ličnih podataka.</p>
          </Card>
        </Container>
      </section>

      {/* REGISTAR DOZVOLA */}
      <section className="bg-[#fafafa] py-16 md:py-24">
        <Container>
          <Head k="Javne baze podataka" t="Službeni registri i e-usluge zaštite okoliša" s="Pretražite registrirane subjekte, izdane dozvole i preuzmite podatke za istraživanje." action={<Button href="/registri/okolisne-dozvole/izvoz?format=csv" variant="secondary" icon={Download01}>Izvoz CSV</Button>} />
          <div className="mt-8">
            <TableCard title="Okolišne dozvole" badge={<Badge tone="brand">{permits.length}</Badge>} actions={
              <form action="/zastita-okolisa" className="flex h-10 items-center gap-2 rounded-[8px] bg-white px-3 ring-1 ring-inset ring-[#d4d4d4] md:w-[300px]"><SearchLg size={18} className="text-[#a3a3a3]" /><input name="q" defaultValue={sp.q} placeholder="Subjekt, grad ili djelatnost" aria-label="Pretraga dozvola" className="min-w-0 flex-1 border-0 bg-transparent p-0 text-[14px] !shadow-none focus:outline-none focus:ring-0" /></form>
            }>
              <table className="w-full min-w-[900px]">
                <thead><tr><th className={th}>Broj dozvole</th><th className={th}>Pravni subjekt / operater</th><th className={th}>Općina</th><th className={th}>Djelatnost</th><th className={th}>Važi do</th><th className={th}>Status</th><th className={`${th} text-right`}>Rješenje</th></tr></thead>
                <tbody>
                  {permits.filter((p) => !/^test/i.test(p.operator)).slice(0, 8).map((p) => {
                    const [sl, tone] = PERMIT_ST[p.status] ?? PERMIT_ST.VAZECA;
                    return (
                      <tr key={p.id} className="hover:bg-[#fafafa]">
                        <td className={td}><Link href={`/registri/okolisne-dozvole/${p.id}`} className="font-semibold text-[var(--br-700)] hover:underline whitespace-nowrap">{p.registerNumber}</Link></td>
                        <td className={td}><span className="font-semibold text-[#171717]">{p.operator}</span>{p.isDemo && <Badge tone="warning" className="ml-2">Demo</Badge>}</td>
                        <td className={td}>{p.municipality}</td>
                        <td className={td}>{p.activity}</td>
                        <td className={`${td} whitespace-nowrap`}>{dateShort(p.validUntil)}</td>
                        <td className={td}><Badge tone={tone} dot>{sl}</Badge></td>
                        <td className={`${td} text-right`}><Link href={`/registri/okolisne-dozvole/${p.id}#dokumenti`} className="inline-flex items-center gap-1 text-[14px] font-semibold text-[var(--br-700)]"><File06 size={16} />Dosje</Link></td>
                      </tr>
                    );
                  })}
                  {permits.length === 0 && <tr><td colSpan={7} className={`${td} py-10 text-center`}>Nema dozvola za zadani pojam.</td></tr>}
                </tbody>
              </table>
            </TableCard>
            <div className="mt-4 text-right"><Link href="/registri/okolisne-dozvole" className="inline-flex items-center gap-1.5 text-[16px] font-semibold text-[var(--br-700)]">Puni registar s filterima<ArrowRight size={20} /></Link></div>
          </div>
        </Container>
      </section>

      {/* CTA */}
      {openCall && (
        <section className="bg-white py-16 md:py-24">
          <Container>
            <div className={`flex flex-col gap-8 rounded-[24px] p-6 text-white md:p-10 lg:flex-row lg:items-center lg:justify-between ${GRAD}`}>
              <div className="max-w-[720px]"><Badge tone="success">Za udruženja i privredu</Badge><p className="mt-4 text-[24px] leading-8 md:text-[30px] md:leading-[38px] font-semibold">{openCall.title}</p>{openCall.excerpt && <p className="mt-3 text-[16px] text-[var(--br-100)]">{openCall.excerpt}</p>}{openCall.deadline && <p className="mt-4 text-[14px] font-semibold text-[var(--gr-300)]">Rok: {dateLong(openCall.deadline)}</p>}</div>
              <div className="flex shrink-0 flex-col gap-3"><Link href={`/vijesti/${openCall.slug}#prijava`} className="inline-flex h-12 items-center justify-center gap-1.5 rounded-[8px] border-2 border-white/10 bg-[var(--br-600)] px-5 text-[16px] font-semibold hover:bg-[var(--br-700)]"><Edit05 size={20} />Prijavi projekt online</Link><Link href={`/vijesti/${openCall.slug}#dokumenti`} className="inline-flex h-12 items-center justify-center gap-1.5 rounded-[8px] bg-white/10 px-5 text-[16px] font-semibold ring-1 ring-inset ring-white/25 hover:bg-white/15"><Download01 size={20} />Kriteriji i upute</Link></div>
            </div>
          </Container>
        </section>
      )}
    </>
  );
}
