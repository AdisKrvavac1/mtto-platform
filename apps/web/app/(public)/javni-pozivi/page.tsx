// F2-16: javni pozivi za sufinansiranje, s online prijavom i objavljenim listama korisnika.
import Link from 'next/link';
import { apiSafe, type PostListItem } from '@/lib/api';
import { PHASE, daysLeft, km, type CallListItem } from '@/lib/calls';
import { dateShort } from '@/lib/format';
import { Badge, Container, HB1, HB2, Head, PageHero } from '@/components/uui';
import { ArrowRight, Calendar, Download01, File06, SearchLg, Ticket01 } from '@untitledui/icons';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Javni pozivi', description: 'Otvoreni javni pozivi za sufinansiranje u turizmu i zaštiti okoliša, online prijava i liste korisnika s iznosima.' };

const TABS = [['otvoreni', 'Otvoreni i najavljeni'], ['zatvoreni', 'Zatvoreni i rezultati'], ['svi', 'Svi']] as const;

function CallRow({ c }: { c: CallListItem }) {
  const left = daysLeft(c.closesAt);
  const p = PHASE[c.phase];
  return (
    <li>
      <Link href={`/javni-pozivi/${c.slug}`} className="group grid gap-4 px-5 py-5 transition-colors hover:bg-[#fafafa] md:grid-cols-[minmax(0,1fr)_200px_160px] md:items-center md:px-6">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2"><Badge tone={p.tone} dot>{p.label}</Badge>{c.sector && <span className="text-[12px] font-medium text-[#737373]">{c.sector}</span>}{c.isDemo && <Badge tone="warning">Primjer</Badge>}</div>
          <p className="mt-2 text-[18px] font-semibold leading-7 text-[#171717] group-hover:text-[var(--br-700)]">{c.title}</p>
          {c.summary && <p className="mt-1 line-clamp-2 text-[14px] text-[#525252]">{c.summary}</p>}
        </div>
        <dl className="text-[14px]">
          <dt className="text-[12px] text-[#737373]">{c.phase === 'NAJAVLJEN' ? 'Prijave od' : 'Rok za prijave'}</dt>
          <dd className="font-semibold text-[#171717]">{dateShort(c.phase === 'NAJAVLJEN' ? c.opensAt : c.closesAt)}</dd>
          {c.phase === 'OTVOREN' && <dd className={`text-[12px] font-medium ${left <= 7 ? 'text-[#b54708]' : 'text-[#067647]'}`}>{left <= 0 ? 'ističe danas' : `još ${left} ${left === 1 ? 'dan' : 'dana'}`}</dd>}
        </dl>
        <dl className="text-[14px] md:text-right">
          {c.phase === 'REZULTATI' ? <><dt className="text-[12px] text-[#737373]">Dodijeljeno</dt><dd className="font-semibold tabular-nums text-[#171717]">{km(c.awarded ?? 0)}</dd><dd className="text-[12px] text-[#737373]">{c.awards} korisnika</dd></>
            : <><dt className="text-[12px] text-[#737373]">Ukupno sredstava</dt><dd className="font-semibold tabular-nums text-[#171717]">{km(c.budget)}</dd>{c.maxAmount != null && <dd className="text-[12px] text-[#737373]">do {km(c.maxAmount)} po projektu</dd>}</>}
        </dl>
      </Link>
    </li>
  );
}

export default async function CallsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const sp = await searchParams;
  const status = TABS.some(([k]) => k === sp.status) ? sp.status! : 'otvoreni';
  const [all, news] = await Promise.all([
    apiSafe<CallListItem[]>('/calls', []),
    apiSafe<{ items: PostListItem[] }>('/posts?type=JAVNI_POZIV&limit=6', { items: [] }),
  ]);
  const open = all.filter((c) => c.phase === 'OTVOREN' || c.phase === 'NAJAVLJEN');
  const closed = all.filter((c) => c.phase === 'ZATVOREN' || c.phase === 'REZULTATI');
  const shown = status === 'otvoreni' ? open : status === 'zatvoreni' ? closed : all;
  const available = open.filter((c) => c.phase === 'OTVOREN').reduce((t, c) => t + (c.budget ?? 0), 0);
  const awarded = all.reduce((t, c) => t + (c.awarded ?? 0), 0);

  return (
    <>
      <PageHero
        crumbs={[{ label: 'Naslovna', href: '/' }, { label: 'Javni pozivi' }]}
        eyebrow="Sufinansiranje" title="Javni pozivi"
        stats={[
          { label: 'Otvorenih poziva', value: String(open.filter((c) => c.phase === 'OTVOREN').length) },
          { label: 'Sredstava u otvorenim pozivima', value: km(available) },
          { label: 'Objavljenih lista korisnika', value: String(all.filter((c) => c.phase === 'REZULTATI').length) },
          { label: 'Ukupno dodijeljeno', value: km(awarded) },
        ]}
        actions={<><Link href="#pozivi" className={HB1}><Ticket01 size={20} />Otvoreni pozivi</Link><Link href="/e-usluge/status" className={HB2}><SearchLg size={20} />Status prijave</Link></>}
      >
        Sufinansiranje projekata u turizmu i zaštiti okoliša. Prijavite se elektronski, pratite status prijave brojem predmeta i pogledajte kome su i koliko sredstva dodijeljena.
      </PageHero>

      <section id="pozivi" className="scroll-mt-24 bg-white py-16 md:py-20">
        <Container>
          <Head k="Pozivi Ministarstva" t="Pozivi i rokovi" s="Prijava se podnosi elektronski dok je poziv otvoren; nakon odluke ovdje se objavljuje lista korisnika s iznosima." />
          <nav aria-label="Filter poziva" className="mt-8 flex flex-wrap gap-1 rounded-[8px] bg-[#fafafa] p-1 ring-1 ring-inset ring-[#e5e5e5] sm:inline-flex">
            {TABS.map(([k, l]) => {
              const n = k === 'otvoreni' ? open.length : k === 'zatvoreni' ? closed.length : all.length;
              return <Link key={k} href={`/javni-pozivi?status=${k}#pozivi`} aria-current={k === status ? 'page' : undefined} className={`rounded-[6px] px-3 py-1.5 text-[14px] font-semibold ${k === status ? 'bg-white text-[#171717] shadow-[0_1px_2px_rgba(10,13,18,0.08)]' : 'text-[#525252] hover:text-[#171717]'}`}>{l} <span className="font-normal text-[#737373]">{n}</span></Link>;
            })}
          </nav>
          {shown.length ? (
            <ul className="mt-6 divide-y divide-[#e5e5e5] overflow-hidden rounded-[12px] ring-1 ring-inset ring-[#e5e5e5]">{shown.map((c) => <CallRow key={c.slug} c={c} />)}</ul>
          ) : (
            <div className="mt-6 rounded-[12px] p-8 text-center ring-1 ring-inset ring-[#e5e5e5]">
              <Calendar size={24} className="mx-auto text-[#a3a3a3]" />
              <p className="mt-3 text-[16px] font-semibold text-[#171717]">{status === 'otvoreni' ? 'Trenutno nema otvorenih poziva' : 'Nema poziva u ovoj grupi'}</p>
              <p className="mt-1 text-[14px] text-[#525252]">Novi pozivi objavljuju se ovdje i među vijestima. {status === 'otvoreni' && <Link href="/javni-pozivi?status=zatvoreni#pozivi" className="font-semibold text-[var(--br-700)]">Pogledajte ranije pozive i rezultate.</Link>}</p>
            </div>
          )}
        </Container>
      </section>

      {news.items.length > 0 && (
        <section className="bg-[#fafafa] py-16 md:py-20">
          <Container>
            <Head k="Objave" t="Obavještenja o pozivima i nabavkama" s="Tekstovi poziva, odluke i obavještenja objavljeni među vijestima." action={<Link href="/vijesti?type=JAVNI_POZIV" className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-[var(--br-700)]">Sve objave<ArrowRight size={16} /></Link>} />
            <ul className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {news.items.map((p) => (
                <li key={p.id}><Link href={`/vijesti/${p.slug}`} className="flex h-full flex-col rounded-[12px] bg-white p-5 ring-1 ring-inset ring-[#e5e5e5] hover:shadow-[0_4px_8px_-2px_rgba(10,13,18,0.1)]">
                  <span className="flex items-center gap-2 text-[12px] text-[#737373]"><File06 size={14} />{dateShort(p.publishedAt)}{p.deadline && <> · rok {dateShort(p.deadline)}</>}</span>
                  <span className="mt-2 line-clamp-2 text-[16px] font-semibold text-[#171717]">{p.title}</span>
                  <span className="mt-1 line-clamp-2 text-[14px] text-[#525252]">{p.excerpt}</span>
                </Link></li>
              ))}
            </ul>
          </Container>
        </section>
      )}

      <section className="bg-white py-12">
        <Container>
          <div className="flex flex-col gap-4 rounded-[16px] p-6 ring-1 ring-inset ring-[#e5e5e5] md:flex-row md:items-center md:justify-between">
            <div><p className="flex items-center gap-2 text-[16px] font-semibold text-[#171717]"><Download01 size={20} className="text-[#737373]" />Otvoreni podaci</p>
              <p className="mt-1 text-[14px] text-[#525252]">Liste korisnika svakog poziva dostupne su u CSV-u na stranici poziva, a svi pozivi kao JSON.</p></div>
            <a href="/api/calls" className="inline-flex h-10 items-center rounded-[8px] px-4 text-[14px] font-semibold text-[#404040] ring-1 ring-inset ring-[#d4d4d4] hover:bg-[#fafafa]">JSON</a>
          </div>
        </Container>
      </section>
    </>
  );
}
