/* Naslovna – kostur MTTO Figme (verzija 2), elementi u Untitled UI stilu, boje Untitled Blue + Green. */
import Link from 'next/link';
import type { ReactNode } from 'react';
import { apiSafe, type MapPoint, type PostListItem } from '@/lib/api';
import { EMPTY, aqiClass, type RiskSummary } from '@/lib/risk';
import { dateLong, dateShort } from '@/lib/format';
import MapSection from '@/components/site/MapSection';
import { Badge, Card, Container, CountUp, FeaturedIcon, GRAD } from '@/components/uui';
import { KINDS } from '@/lib/reportKinds';
import {
  ArrowRight, ArrowUpRight, Award01, Building07, Calendar, CheckVerified01, Download01, File06, Globe01, LayersThree01, Map01,
  MarkerPin02, Phone01, Ticket01, Users01, Waves, Wind01, Mail01, Bell01, Send01,
} from '@untitledui/icons';

export const dynamic = 'force-dynamic';

type Stats = { posts: number; calls: number; documents: number; permits: number; permitsRenewal: number; facilities: number; locations: number };
type Call = { href: string; kind: string; tone: 'success' | 'warning' | 'brand'; title: string; text: string; deadline: string | null; file: string; demo: boolean; ripple: boolean };

const btn = 'inline-flex items-center justify-center gap-1.5 rounded-[8px] font-semibold whitespace-nowrap transition-colors';
const skeu = 'border-2 border-white/10 shadow-[0_1px_2px_rgba(10,13,18,0.05),inset_0_-2px_0_rgba(10,13,18,0.05),inset_0_0_0_1px_rgba(10,13,18,0.18)]';
const green = `${btn} ${skeu} bg-[var(--gr-600)] text-white hover:bg-[var(--gr-700)]`;
const glass = `${btn} bg-white/10 text-white ring-1 ring-inset ring-white/25 backdrop-blur-md hover:bg-white/15`;

function Head({ k, t, s, dark, action }: { k: string; t: string; s?: string; dark?: boolean; action?: ReactNode }) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <p className={`text-[14px] leading-5 font-semibold ${dark ? 'text-[var(--gr-300)]' : 'text-[var(--br-700)]'}`}>{k}</p>
        <h2 className={`mt-2 text-[30px] leading-[38px] md:text-[36px] md:leading-[44px] font-semibold tracking-[-0.02em] ${dark ? 'text-white' : 'text-[#171717]'}`}>{t}</h2>
        {s && <p className={`mt-3 max-w-[720px] text-[16px] leading-6 md:text-[18px] md:leading-7 ${dark ? 'text-[var(--br-200)]' : 'text-[#525252]'}`}>{s}</p>}
      </div>
      {action}
    </div>
  );
}
const More = ({ href, children }: { href: string; children: ReactNode }) => (
  <Link href={href} className="inline-flex shrink-0 items-center gap-1.5 text-[16px] font-semibold text-[var(--br-700)] hover:text-[var(--br-800)] [&>svg]:transition-transform hover:[&>svg]:translate-x-1">{children}<ArrowRight size={20} /></Link>
);

function Featured({ p }: { p: PostListItem }) {
  return (
    <Link href={`/vijesti/${p.slug}`} className="group relative flex h-[360px] items-end overflow-hidden rounded-[16px] bg-[#062343] md:h-[440px]">
      <img src={p.coverImage || '/hero/mostar-m.jpg'} alt="" className="absolute inset-0 size-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
      <span className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/55 to-transparent" />
      <span className="relative m-3 flex w-full items-center justify-between gap-4 rounded-[16px] bg-white/15 px-4 py-3 text-white ring-1 ring-inset ring-white/30 backdrop-blur-md md:m-4 md:px-6 md:py-4">
        <span className="min-w-0">
          <span className="flex flex-wrap gap-2 text-[12px] leading-[18px]"><span className="rounded-full bg-[var(--gr-50)] px-2 py-0.5 font-medium text-[var(--gr-700)]">Istaknuto</span>{p.category && <span className="rounded-full bg-white/15 px-2 py-0.5 ring-1 ring-inset ring-white/30">{p.category}</span>}<span className="text-white/80">{dateLong(p.publishedAt)}</span></span>
          <span className="mt-1.5 block line-clamp-2 text-[17px] leading-6 md:text-[20px] md:leading-[30px] font-semibold">{p.title}</span>
        </span>
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white/15 ring-1 ring-inset ring-white/30 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"><ArrowUpRight size={20} /></span>
      </span>
    </Link>
  );
}
function PostSmall({ p }: { p: PostListItem }) {
  return (
    <Link href={`/vijesti/${p.slug}`} className="group uui-lift flex flex-col overflow-hidden rounded-[12px] bg-white ring-1 ring-inset ring-[#e5e5e5] shadow-[0_1px_2px_rgba(10,13,18,0.05)]">
      <span className="block aspect-[16/10] overflow-hidden bg-[#f5f5f5]"><img src={p.coverImage || '/hero/neretva-m.jpg'} alt="" className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.04]" /></span>
      <span className="flex flex-1 flex-col p-4">
        <span className="text-[14px] font-semibold text-[var(--br-700)]">{p.category}</span>
        <span className="mt-2 flex justify-between gap-3 text-[16px] leading-6 font-semibold text-[#171717]"><span className="line-clamp-2">{p.title}</span><ArrowUpRight size={20} className="shrink-0 text-[#a3a3a3] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[var(--br-600)]" /></span>
        <span className="mt-auto flex items-center gap-1.5 pt-3 text-[14px] text-[#737373]"><Calendar size={16} />{dateShort(p.publishedAt)}</span>
      </span>
    </Link>
  );
}
function CallItem({ c }: { c: Call }) {
  return (
    <li>
      <Link href={c.href} className="group block px-5 py-4 transition-colors hover:bg-[#fafafa]">
        <span className="flex items-start gap-3">
          <FeaturedIcon icon={c.tone === 'warning' ? LayersThree01 : c.tone === 'brand' ? File06 : Ticket01} tone={c.tone} size="md" ripple={c.ripple} />
          <span className="flex flex-wrap gap-1.5"><Badge tone={c.tone} dot={c.tone === 'success'}>{c.kind}</Badge>{c.deadline && <Badge tone="error">Rok {c.deadline}</Badge>}{c.demo && <Badge tone="gray">Demo</Badge>}</span>
        </span>
        <span className="mt-3 block line-clamp-2 text-[16px] leading-6 font-semibold text-[#171717] group-hover:text-[var(--br-700)]">{c.title}</span>
        <span className="mt-1 block line-clamp-2 text-[14px] leading-5 text-[#525252]">{c.text}</span>
        <span className="mt-3 flex items-center justify-between text-[14px]"><span className="flex items-center gap-1.5 text-[#737373]"><File06 size={16} />{c.file}</span><span className="font-semibold text-[var(--br-700)]">{c.file.startsWith('Komentiraj') ? 'Otvori nacrt' : 'Preuzmi'}</span></span>
      </Link>
    </li>
  );
}

export default async function Home() {
  const [news, callsRes, stats, points, risk] = await Promise.all([
    apiSafe<{ items: PostListItem[] }>('/posts?limit=12', { items: [] }),
    apiSafe<{ items: PostListItem[] }>('/posts?type=JAVNI_POZIV&limit=3', { items: [] }),
    apiSafe<Stats>('/stats', { posts: 0, calls: 0, documents: 0, permits: 0, permitsRenewal: 0, facilities: 0, locations: 0 }),
    apiSafe<MapPoint[]>('/map', []),
    apiSafe<RiskSummary>('/risk/summary', EMPTY),
  ]);
  const posts = news.items.filter((p) => p.type !== 'JAVNI_POZIV' && !/^test/i.test(p.title));
  const featured = posts.find((p) => p.coverImage) ?? posts[0];
  const rest = posts.filter((p) => p !== featured).slice(0, 3);
  const openCalls = callsRes.items.filter((c) => !c.deadline || new Date(c.deadline) > new Date());
  const realCall = callsRes.items[0];
  const calls: Call[] = [
    ...callsRes.items.slice(0, 1).map((c) => ({ href: `/vijesti/${c.slug}`, kind: 'Otvoreni poziv', tone: 'success' as const, title: c.title, text: c.excerpt ?? '', deadline: c.deadline ? dateShort(c.deadline) : null, file: c.attachmentCount ? `Dokumenti (${c.attachmentCount})` : 'Tekst poziva', demo: false, ripple: !c.deadline || new Date(c.deadline) > new Date() })),
    { href: '/vijesti?type=JAVNI_POZIV', kind: 'Otvoreni poziv', tone: 'success', title: 'Izrada stručne podloge za zaštitu područja Plato Rujišta – Bijela', text: 'Studija izvodljivosti valorizacije endemskog bora munike i krškog staništa.', deadline: '15. 12. 2026.', file: 'PDF 2,4 MB', demo: true, ripple: true },
    { href: '/zastita-okolisa', kind: 'Javna rasprava', tone: 'warning', title: 'Proglašenje zaštićenog staništa Vrtaljica, Konjic', text: 'Uvid u nacrt rješenja i elaborat o zaštiti rijetke flore i dolomitnih tala.', deadline: '10. 12. 2026.', file: 'PDF 1,8 MB', demo: true, ripple: true },
    { href: '/zastita-okolisa', kind: 'Strateški dokument', tone: 'brand', title: 'Plan upravljanja otpadom HNK 2025–2030 (javni uvid)', text: 'Građani i pravne osobe mogu dostaviti pisane primjedbe resornom povjerenstvu.', deadline: null, file: 'Komentiraj online', demo: true, ripple: false },
  ].slice(0, 3) as Call[];
  const air = risk.air?.items ?? [];
  const rivers = risk.rivers.items.slice(0, 3);

  return (
    <>
      {/* HERO – gradijent iz Figme */}
      <section className={`relative isolate overflow-hidden ${GRAD}`}>
        <div aria-hidden className="absolute inset-0 opacity-30 [background-image:radial-gradient(rgba(255,255,255,0.14)_1px,transparent_1px)] [background-size:24px_24px] [mask-image:linear-gradient(to_bottom,black,transparent_60%)]" />
        <Container className="relative grid gap-10 pb-12 pt-12 md:pt-20 lg:grid-cols-[1.15fr_1fr] lg:items-center">
          <div>
            <Link href="/zastita-okolisa" className="inline-flex max-w-full items-center gap-2 rounded-full bg-white/10 py-1 pl-1 pr-3 text-[14px] font-medium text-white ring-1 ring-inset ring-white/20 backdrop-blur-md hover:bg-white/15">
              <span className="flex items-center gap-1.5 rounded-full bg-[var(--gr-50)] px-2 py-0.5 text-[12px] text-[var(--gr-700)]"><span className="size-1.5 rounded-full bg-[var(--gr-500)]" />Održivi razvoj</span><span className="truncate">Prirodna baština HNK</span><ArrowRight size={16} className="shrink-0" />
            </Link>
            <h1 className="mt-6 text-[36px] leading-[44px] md:text-[56px] md:leading-[64px] font-semibold tracking-[-0.02em] text-white">Prirodna baština, održivi turizam i transparentna uprava: <span className="text-[var(--gr-300)]">od Makljena do Jadranskog mora</span></h1>
            <p className="mt-6 max-w-[600px] text-[18px] leading-7 md:text-[20px] md:leading-[30px] text-[var(--br-100)]">Ravnoteža turističkog rasta, očuvanja kraških krajolika i smaragdnog kanjona Neretve, uz europske standarde zaštite prirode u srcu Hercegovine.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row md:mt-10">
              <Link href="/zastita-okolisa" className={`${green} h-12 px-5 text-[16px]`}><Map01 size={20} />Istraži zaštićena područja</Link>
              <Link href="/eko-rizik" className={`${glass} h-12 px-5 text-[16px]`}><Waves size={20} />Eko-monitoring uživo</Link>
            </div>
          </div>
          <Link href="/turizam-i-bastina" className="group uui-lift overflow-hidden rounded-[16px] bg-white/10 ring-1 ring-inset ring-white/20 backdrop-blur-xl">
            <span className="block aspect-[16/9] overflow-hidden"><img src="/hero/mostar-m.jpg" alt="Stari most u Mostaru" className="size-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" /></span>
            <span className="block p-5 md:p-6"><span className="flex items-center gap-1.5 text-[12px] font-semibold text-[var(--gr-300)]"><CheckVerified01 size={14} />UNESCO svjetska baština</span><span className="mt-1 block text-[22px] md:text-[24px] font-semibold text-white">Mostar i Radimlja</span><span className="mt-1 block text-[16px] text-[var(--br-100)]">Stari most u Mostaru i nekropola stećaka Radimlja kod Stoca.</span></span>
          </Link>
        </Container>
        <Container className="relative grid grid-cols-2 gap-3 pb-4 md:gap-4 lg:grid-cols-4">
          {[['Hidrološki biser', 'Kanjon Neretve', '/fig/tile-neretva.jpg', '/zastita-okolisa'], ['Visokogorje', 'Prenj i Rujišta', '/fig/tile-prenj.jpg', '/turizam-i-bastina'], ['Ramsar močvara', 'Hutovo blato', '/fig/tile-hutovo.jpg', '/foto-albumi/hutovo-blato'], ['Jadranski koridor', 'Neumski zaljev', '/fig/tile-neum.jpg', '/turizam-i-bastina']].map(([k, t, img, href]) => (
            <Link key={t} href={href} className="group uui-lift relative h-[120px] overflow-hidden rounded-[12px] ring-1 ring-inset ring-white/20 md:h-[150px]">
              <img src={img} alt="" className="absolute inset-0 size-full object-cover transition-transform duration-700 group-hover:scale-[1.06]" /><span className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <span className="absolute bottom-3 left-3 right-3 text-white md:left-4"><span className="block text-[12px] font-semibold text-[var(--gr-200)]">{k}</span><span className="text-[16px] md:text-[18px] font-semibold">{t}</span></span>
            </Link>
          ))}
        </Container>
        <Container className="relative grid grid-cols-2 gap-3 pb-24 md:gap-4 md:pb-28 lg:grid-cols-4">
          {([[Building07, 'Teritorij', '9', 'općina i gradova'], [Users01, 'Stanovništvo', '222.007', 'prema popisu 2013.'], [Award01, 'Svjetska baština', '2', 'lokaliteta na UNESCO listi'], [Globe01, 'Zaštićena priroda', '2', 'parka prirode']] as const).map(([I, k, v, l]) => (
            <div key={k} className="rounded-[12px] bg-white/10 p-4 ring-1 ring-inset ring-white/20 backdrop-blur-md md:p-5"><p className="flex items-center justify-between text-[14px] font-medium text-[var(--br-200)]">{k}<I size={20} className="text-[var(--gr-300)]" /></p><p className="mt-2 text-[28px] leading-9 md:text-[36px] md:leading-[44px] font-semibold text-white"><CountUp value={v} /></p><p className="text-[14px] text-[var(--br-100)]">{l}</p></div>
          ))}
        </Container>
      </section>

      {/* BRZE USLUGE */}
      <Container className="relative z-10 -mt-14">
        <div className="grid gap-2 rounded-[16px] bg-white p-3 ring-1 ring-inset ring-[#e5e5e5] shadow-[0_20px_24px_-4px_rgba(10,13,18,0.08),0_8px_8px_-4px_rgba(10,13,18,0.03)] sm:grid-cols-2 lg:grid-cols-4 md:p-4">
          {([[Ticket01, 'Javni natječaji', 'Sufinanciranja i javne nabavke', '/vijesti?type=JAVNI_POZIV', openCalls.length ? `${openCalls.length} otvoren${openCalls.length === 1 ? '' : 'a'}` : null, 'success'], [File06, 'Obrasci i dozvole', 'Okolišne dozvole i zahtjevi', '/propisi?docType=OBRAZAC', null, ''], [Users01, 'Registar vodiča', 'Licencirani turistički vodiči', '/turisticki-vodici', 'Faza 2', 'gray'], [Calendar, 'Neradna nedjelja', 'Propisi i izuzeća za trgovinu', '/propisi', null, '']] as const).map(([I, t, s, href, b, tone], k) => (
            <Link key={t} href={href} className="group flex gap-4 rounded-[12px] p-3 transition-colors hover:bg-[#fafafa] md:p-4">
              <FeaturedIcon icon={I} tone={k === 0 ? 'success' : 'brand'} size="md" ripple={k === 0 && openCalls.length > 0} />
              <span><span className="block text-[16px] font-semibold text-[#171717] group-hover:text-[var(--br-700)]">{t}</span><span className="block text-[14px] text-[#525252]">{s}</span>{b && <span className="mt-2 block"><Badge tone={tone as 'success' | 'gray'} dot={tone === 'success'}>{b}</Badge></span>}</span>
            </Link>
          ))}
        </div>
      </Container>

      {/* AKTUALNOSTI + NATJEČAJI (verzija 2) */}
      <section className="pb-16 pt-16 md:pb-24 md:pt-20">
        <Container className="grid gap-8 lg:grid-cols-[1fr_400px]">
          <div>
            <Head k="Informativni bilten" t="Aktualnosti i vijesti resora" action={<More href="/vijesti">Sve vijesti</More>} />
            {featured && <div className="mt-8"><Featured p={featured} /></div>}
            <div className="mt-6 grid gap-5 sm:grid-cols-2 md:grid-cols-3">{rest.map((p) => <PostSmall key={p.id} p={p} />)}</div>
            {posts.length === 0 && <p className="mt-8 text-[16px] text-[#525252]">Još nema objavljenih vijesti.</p>}
          </div>
          <aside className="flex flex-col gap-6 lg:pt-[86px]">
            <Card className="overflow-hidden">
              <div className="flex items-center justify-between border-b border-[#e5e5e5] px-5 py-4"><h3 className="text-[18px] font-semibold text-[#171717]">Natječaji i javni uvidi</h3><Badge tone="success" dot>Aktivno</Badge></div>
              <ul className="divide-y divide-[#e5e5e5]">{calls.map((c) => <CallItem key={c.title} c={c} />)}</ul>
              <div className="p-4"><Link href="/vijesti?type=JAVNI_POZIV" className="flex h-10 items-center justify-center rounded-[8px] bg-[var(--br-50)] text-[14px] font-semibold text-[var(--br-700)] hover:bg-[var(--br-100)]">Arhiva natječaja i odluka</Link></div>
            </Card>
            <div className={`rounded-[16px] p-6 text-white ${GRAD}`}>
              <p className="flex items-center gap-2 text-[18px] font-semibold"><Phone01 size={20} className="text-[var(--gr-300)]" />Info-desk Ministarstva</p>
              <p className="mt-2 text-[14px] text-[var(--br-100)]">Rad sa strankama radnim danom 08:30–12:00, Braće Fejića bb, Mostar.</p>
              <a href="tel:+38736551823" className="mt-4 block text-[20px] font-semibold hover:text-[var(--gr-200)]">+387 36 551 823</a>
              <a href="mailto:info@mtto.gov.ba" className="flex items-center gap-1.5 text-[14px] text-[var(--br-200)] hover:text-white"><Mail01 size={16} />info@mtto.gov.ba</a>
            </div>
          </aside>
        </Container>
      </section>

      {/* EKO-MONITORING UŽIVO */}
      <section id="eko-monitoring" className={`py-16 md:py-24 ${GRAD}`}>
        <Container className="grid gap-8 lg:grid-cols-[1fr_440px]">
          <div>
            <Head dark k="Mreža mjernih podataka" t="Eko-monitoring uživo" s="Kvalitet zraka (Copernicus CAMS), meteo upozorenja (Meteoalarm) i protok rijeka (GloFAS) za područje kantona." action={<Link href="/eko-rizik" className={`${glass} h-11 px-4 text-[16px]`}>Karta rizika<ArrowRight size={20} /></Link>} />
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {(air.length ? air : [{ key: 'm', name: 'Mostar', aqi: null, pm25: null, pm10: null, o3: null, time: null }]).map((a) => {
                const c = aqiClass(a.aqi);
                return (
                  <div key={a.key} className="rounded-[12px] bg-white/10 p-5 ring-1 ring-inset ring-white/15 backdrop-blur-md">
                    <p className="flex items-center justify-between gap-2 text-[18px] font-semibold text-white">{a.name}<span className={`rounded-full px-2 py-0.5 text-[12px] font-medium ${c.tone === 'success' ? 'bg-[var(--gr-50)] text-[var(--gr-700)]' : c.tone === 'warning' ? 'bg-[#fffaeb] text-[#b54708]' : c.tone === 'error' ? 'bg-[#fef3f2] text-[#b42318]' : 'bg-white/15 text-white'}`}>AQI {a.aqi != null ? <CountUp value={a.aqi} /> : '—'}</span></p>
                    <p className="flex items-center gap-1.5 text-[14px] text-[var(--gr-300)]"><Wind01 size={14} />Kvalitet: {c.label.toLowerCase()}</p>
                    <dl className="mt-4 space-y-1.5 text-[14px] text-[var(--br-100)]">{([['PM2.5', a.pm25], ['PM10', a.pm10], ['O₃', a.o3]] as const).map(([l, v]) => <div key={l} className="flex justify-between"><dt>{l}</dt><dd className="font-semibold text-white">{v != null ? `${v} µg/m³` : '—'}</dd></div>)}</dl>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 rounded-[12px] bg-white/10 p-5 ring-1 ring-inset ring-white/15 backdrop-blur-md">
              <p className="flex items-center justify-between gap-2 text-[18px] font-semibold text-white"><span className="flex items-center gap-2"><Waves size={20} className="text-[var(--gr-300)]" />Protok sliva Neretve</span><span className="text-[12px] font-medium text-[var(--br-200)]">Model GloFAS</span></p>
              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                {rivers.map((r) => (
                  <div key={r.key} className="flex items-center gap-3"><span className="flex size-10 shrink-0 items-center justify-center rounded-[8px] bg-[var(--gr-500)]/20 text-[var(--gr-200)]"><Waves size={20} /></span><span><span className="block text-[12px] text-[var(--br-200)]">{r.name}</span><span className="text-[18px] font-semibold text-white"><CountUp value={Math.round(r.discharge[r.todayIndex] ?? 0)} /> m³/s</span></span></div>
                ))}
                {rivers.length === 0 && <p className="text-[14px] text-[var(--br-200)]">Model protoka trenutno nije dostupan.</p>}
              </div>
            </div>
            {risk.air?.error && <p className="mt-3 text-[12px] text-[var(--br-200)]">Podaci o zraku trenutno nisu dostupni.</p>}
          </div>
          <div className="self-start rounded-[16px] bg-white p-5 shadow-[0_24px_48px_-12px_rgba(10,13,18,0.25)] md:p-6">
            <div className="flex items-center justify-between gap-3"><span className="flex items-center gap-3"><FeaturedIcon icon={Bell01} tone="success" size="md" /><span className="text-[18px] font-semibold text-[#171717]">Građanski eko-alarm</span></span><Badge tone="success">Prijava 24/7</Badge></div>
            <p className="mt-4 text-[14px] leading-5 text-[#525252]">Uočili ste divlju deponiju, požar, zagađenje vode ili klizište? Odaberite vrstu incidenta i prijavite ga direktno Ministarstvu, s lokacijom i fotografijom.</p>
            <div className="mt-5 grid grid-cols-2 gap-2">
              {KINDS.map(([k, l, I]) => (
                <Link key={k} href={`/eko-rizik/prijava?vrsta=${k}`} className="group flex items-center gap-2 rounded-[8px] px-3 py-2.5 text-[14px] font-medium text-[#404040] ring-1 ring-inset ring-[#e5e5e5] transition-colors hover:bg-[var(--br-25)] hover:ring-[var(--br-300)]">
                  <I size={18} className="shrink-0 text-[var(--br-600)] transition-transform group-hover:scale-110" /><span className="truncate">{l}</span>
                </Link>
              ))}
            </div>
            <Link href="/eko-rizik/prijava" className={`${green} mt-5 h-11 w-full text-[16px]`}><Send01 size={20} />Prijavi incident</Link>
            <p className="mt-4 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[12px] text-[#737373]"><span>Hitno:</span>{[['123', 'vatrogasci'], ['121', 'civilna zaštita'], ['124', 'hitna']].map(([n, l]) => <a key={n} href={`tel:${n}`} className="font-semibold text-[#404040] hover:text-[var(--br-700)]">{n} <span className="font-normal text-[#737373]">{l}</span></a>)}</p>
          </div>
        </Container>
      </section>

      {/* ZAŠTIĆENA PODRUČJA */}
      <section className="bg-[#fafafa] py-16 md:py-24">
        <Container>
          <Head k="Resor zaštite okoliša i prirode" t="Zaštićena područja i prirodni rezervati" s="Čuvarske službe, valorizacija kraških fenomena i planovi upravljanja zaštićenim krajolicima." action={<More href="/zastita-okolisa">Zaštita okoliša</More>} />
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[['Park prirode', 'Blidinje i Čvrsnica', '/fig/pa-blidinje.jpg', 'Planinski plato i nekropola stećaka.', '/zastita-okolisa'], ['Ramsar lokalitet', 'Hutovo blato', '/fig/tile-hutovo.jpg', 'Submediteranska močvara i stanište ptica.', '/foto-albumi/hutovo-blato'], ['Kulturni krajolik', 'Vrelo Bune, Blagaj', '/hero/blagaj-m.jpg', 'Krško vrelo i tekija pod liticom.', '/turizam-i-bastina'], ['Hidrološki spomenik', 'Kanjon Neretve', '/hero/neretva-m.jpg', 'Riječni koridor od Konjica do Čapljine.', '/zastita-okolisa']].map(([k, t, img, d, href]) => (
              <Link key={t} href={href} className="group uui-lift flex flex-col overflow-hidden rounded-[12px] bg-white ring-1 ring-inset ring-[#e5e5e5] shadow-[0_1px_2px_rgba(10,13,18,0.05)]">
                <span className="relative block aspect-[4/3] overflow-hidden"><img src={img} alt="" className="size-full object-cover transition-transform duration-700 group-hover:scale-[1.05]" /><span className="absolute left-3 top-3"><Badge tone="brand">{k}</Badge></span></span>
                <span className="flex flex-1 flex-col p-5"><span className="text-[18px] font-semibold text-[#171717]">{t}</span><span className="mt-1 text-[14px] text-[#525252]">{d}</span><span className="mt-auto flex items-center justify-between pt-4 text-[14px] font-semibold text-[var(--br-700)]">Detalji<ArrowRight size={18} className="transition-transform group-hover:translate-x-1" /></span></span>
              </Link>
            ))}
          </div>

          {/* GIS */}
          <Card className="mt-10 overflow-hidden">
            <div className="flex flex-col gap-4 border-b border-[#e5e5e5] px-5 py-5 md:flex-row md:items-center md:justify-between md:px-6">
              <div className="flex items-center gap-3"><FeaturedIcon icon={Map01} size="md" /><div><p className="flex flex-wrap items-center gap-2 text-[18px] font-semibold text-[#171717]">GIS registar zaštićenih područja<Badge tone="brand">WGS-84</Badge></p><p className="text-[14px] text-[#525252]">Dozvole, ugostiteljski objekti, zaštićena područja i projekti na jednoj karti.</p></div></div>
              <Badge tone="success" dot>{points.length} lokacija</Badge>
            </div>
            <div className="grid lg:grid-cols-[1.4fr_1fr]">
              <div className="p-2"><div className="overflow-hidden rounded-[8px]"><MapSection points={points} compact title={false} height={460} /></div></div>
              <div className="border-t border-[#e5e5e5] p-5 md:p-6 lg:border-l lg:border-t-0">
                <Badge tone="success">Park prirode</Badge>
                <p className="mt-3 text-[24px] font-semibold text-[#171717]">Blidinje i Masna Luka</p>
                <p className="mt-2 text-[14px] text-[#525252]">Planinski plato između Čvrsnice i Vran planine, stanište munike i nekropole stećaka.</p>
                <img src="/fig/pa-blidinje.jpg" alt="Park prirode Blidinje" className="mt-4 aspect-[16/8] w-full rounded-[12px] object-cover" />
                <dl className="mt-4 grid grid-cols-2 gap-3 text-[14px]">{[['Površina', '364 km²'], ['Općine', 'Posušje, Tomislavgrad, Jablanica']].map(([a, b]) => <div key={a} className="rounded-[8px] bg-[#fafafa] p-3"><dt className="text-[12px] text-[#737373]">{a}</dt><dd className="font-semibold text-[#171717]">{b}</dd></div>)}</dl>
                <Link href="/mapa" className={`${btn} ${skeu} mt-4 h-11 w-full bg-[var(--br-600)] text-[16px] text-white hover:bg-[var(--br-700)]`}><MarkerPin02 size={20} />Otvori punu GIS kartu</Link>
                <p className="mt-3 flex items-center justify-center gap-1.5 text-[12px] text-[#737373]"><Download01 size={14} />Preuzimanje KML sloja – Faza 2</p>
              </div>
            </div>
          </Card>

          {/* REGISTRI */}
          <div className="mt-16">
            <Head k="Administrativne baze podataka" t="Službeni registri i e-evidencije" action={<More href="/e-usluge">Centar e-usluga</More>} />
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {([[Building07, 'Registar ugostiteljskih objekata', `${stats.facilities} kategoriziranih objekata u 9 općina i gradova.`, '/registri/ugostiteljski-objekti', 'Pretraži registar'], [File06, 'Registar okolišnih dozvola', `${stats.permits} dozvola za postrojenja, energetske objekte i deponije.`, '/registri/okolisne-dozvole', 'Uvid u dozvole'], [Users01, 'Ispiti za turističke vodiče', 'Stručni ispit za turističke vodiče i rokovi prijave.', '/turisticki-vodici', 'Prijavi ispit']] as const).map(([I, t, d, href, cta]) => (
                <Link key={t} href={href} className="group uui-lift flex flex-col rounded-[12px] bg-white p-6 ring-1 ring-inset ring-[#e5e5e5] shadow-[0_1px_2px_rgba(10,13,18,0.05)]"><FeaturedIcon icon={I} size="md" /><span className="mt-4 text-[18px] font-semibold text-[#171717]">{t}</span><span className="mt-1 text-[14px] text-[#525252]">{d}</span><span className="mt-auto flex items-center gap-1.5 pt-4 text-[14px] font-semibold text-[var(--br-700)]">{cta}<ArrowRight size={18} className="transition-transform group-hover:translate-x-1" /></span></Link>
              ))}
            </div>
          </div>

          {/* CTA */}
          {realCall && (
            <div className={`mt-16 flex flex-col gap-8 rounded-[24px] p-6 md:p-10 lg:flex-row lg:items-center lg:justify-between ${GRAD}`}>
              <div className="max-w-[720px]"><Badge tone="success">Za udruženja i privredu</Badge><p className="mt-4 text-[24px] leading-8 md:text-[30px] md:leading-[38px] font-semibold text-white">{realCall.title}</p>{realCall.excerpt && <p className="mt-3 text-[16px] text-[var(--br-100)]">{realCall.excerpt}</p>}</div>
              <div className="flex shrink-0 flex-col gap-3 sm:flex-row"><Link href={`/vijesti/${realCall.slug}#dokumenti`} className={`${glass} h-12 px-5 text-[16px]`}><Download01 size={20} />Kriteriji i upute</Link><Link href={`/vijesti/${realCall.slug}#prijava`} className={`${green} h-12 px-5 text-[16px]`}>Prijavi projekt online</Link></div>
            </div>
          )}
        </Container>
      </section>
    </>
  );
}
