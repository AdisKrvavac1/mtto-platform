// F2-07: pretraga cijelog portala s fasetama (vrsta, sektor, godina), tolerantna na dijakritike i ćirilicu.
import Link from 'next/link';
import { apiSafe } from '@/lib/api';
import { dateShort } from '@/lib/format';
import { Badge, Container } from '@/components/uui';
import { SearchBox } from '@/components/site/SearchBox';
import { ArrowRight } from '@untitledui/icons';

export const dynamic = 'force-dynamic';
export async function generateMetadata({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const q = (await searchParams).q?.trim();
  return { title: q ? `Pretraga: ${q}` : 'Pretraga', robots: { index: false } };
}

type Facet = { key: string; label: string; count: number };
type Item = { kind: string; kindLabel: string; title: string; titleMarks: [number, number][]; url: string; meta: string | null; sector: string | null; date: string | null; isDemo: boolean; snippet: { text: string; marks: [number, number][] } };
type Result = { q: string; total: number; page: number; pages: number; items: Item[]; facets: { kind: Facet[]; sector: Facet[]; year: Facet[] }; suggestion: string | null; fuzzy: boolean };
type SP = { q?: string; vrsta?: string; sektor?: string; godina?: string; stranica?: string };

/** Tekst s istaknutim pogocima (<mark>), bez HTML-a iz izvora. */
function Marked({ text, marks }: { text: string; marks: [number, number][] }) {
  const out: React.ReactNode[] = []; let at = 0;
  marks.forEach(([a, b], i) => { if (a > at) out.push(text.slice(at, a)); out.push(<mark key={i} className="rounded-[2px] bg-[#fef0c7] text-inherit">{text.slice(a, b)}</mark>); at = b; });
  out.push(text.slice(at));
  return <>{out}</>;
}

const POPULAR = [
  ['Neradna nedjelja', '/trgovina/neradni-dani'], ['Kategorizacija objekata', '/pretraga?q=kategorizacija'], ['Prijava inspekciji', '/e-usluge/prijava-inspekciji'],
  ['Javni pozivi', '/javni-pozivi'], ['Kvalitet zraka', '/zastita-okolisa/kvalitet-zraka'], ['Propisi', '/propisi'],
] as const;

export default async function SearchPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const q = (sp.q ?? '').trim();
  const params = new URLSearchParams();
  if (q) params.set('q', q);
  if (sp.vrsta) params.set('vrsta', sp.vrsta);
  if (sp.sektor) params.set('sektor', sp.sektor);
  if (sp.godina) params.set('godina', sp.godina);
  if (sp.stranica) params.set('page', sp.stranica);
  const r = q ? await apiSafe<Result | null>(`/search?${params}`, null) : null;
  const link = (patch: Partial<SP>) => {
    const p = new URLSearchParams();
    const m: SP = { q, vrsta: sp.vrsta, sektor: sp.sektor, godina: sp.godina, ...patch };
    for (const [k, v] of Object.entries(m)) if (v) p.set(k, v);
    return `/pretraga?${p}`;
  };
  const active = [sp.vrsta && r?.facets.kind.find((f) => f.key === sp.vrsta)?.label, sp.sektor, sp.godina].filter(Boolean);

  const FacetGroup = ({ title, items, k }: { title: string; items: Facet[]; k: 'vrsta' | 'sektor' | 'godina' }) => items.length ? (
    <fieldset>
      <legend className="text-[14px] font-semibold text-[#171717]">{title}</legend>
      <ul className="mt-2 space-y-0.5">
        {items.map((f) => {
          const on = sp[k] === f.key;
          return <li key={f.key}><Link href={link({ [k]: on ? undefined : f.key, stranica: undefined })} aria-current={on ? 'true' : undefined} scroll={false}
            className={`flex items-center justify-between gap-3 rounded-[6px] px-2.5 py-1.5 text-[14px] ${on ? 'bg-[var(--br-50)] font-semibold text-[var(--br-700)]' : 'text-[#404040] hover:bg-[#fafafa]'}`}>
            <span>{f.label}</span><span className="tabular-nums text-[#737373]">{f.count}</span></Link></li>;
        })}
      </ul>
    </fieldset>
  ) : null;

  const facets = r && (
    <>
      <FacetGroup title="Vrsta sadržaja" items={r.facets.kind} k="vrsta" />
      <FacetGroup title="Sektor" items={r.facets.sector} k="sektor" />
      <FacetGroup title="Godina" items={r.facets.year} k="godina" />
    </>
  );

  return (
    <section className="bg-white pb-20 pt-10 md:pt-14">
      <Container>
        <nav aria-label="Putanja" className="text-[14px] text-[#737373]"><Link href="/" className="hover:text-[#171717]">Naslovna</Link> / Pretraga</nav>
        <h1 className="mt-3 text-[30px] font-semibold tracking-[-0.02em] text-[#171717] md:text-[36px]">Pretraga</h1>
        <div className="mt-6 max-w-[760px]"><SearchBox initial={q} size="lg" /></div>

        {!q && (
          <div className="mt-10">
            <p className="text-[16px] text-[#525252]">Pretražite vijesti, propise, registre, javne pozive i elektronske zahtjeve. Kvačice nisu obavezne, a možete pisati i ćirilicom.</p>
            <ul className="mt-6 flex flex-wrap gap-2">{POPULAR.map(([l, h]) => <li key={h}><Link href={h} className="inline-flex h-9 items-center rounded-full px-4 text-[14px] font-medium text-[#404040] ring-1 ring-inset ring-[#d4d4d4] hover:bg-[#fafafa]">{l}</Link></li>)}</ul>
          </div>
        )}

        {q && !r && <p className="mt-10 text-[16px] text-[#b42318]">Pretraga trenutno nije dostupna. Pokušajte ponovo za nekoliko trenutaka.</p>}

        {r && r.total === 0 && (
          <div className="mt-10 max-w-[760px]">
            <p className="text-[18px] font-semibold text-[#171717]">Nema rezultata za „{q}“</p>
            {r.suggestion && <p className="mt-2 text-[16px] text-[#525252]">Da li ste mislili: <Link href={`/pretraga?q=${encodeURIComponent(r.suggestion)}`} className="font-semibold text-[var(--br-700)] underline underline-offset-2">{r.suggestion}</Link>?</p>}
            <ul className="mt-4 list-disc space-y-1 pl-5 text-[16px] text-[#525252]">
              <li>Provjerite pravopis ili upišite kraću riječ (npr. „kategoriz“ umjesto „kategorizacija objekta“).</li>
              <li>Upišite manje riječi; prikazuju se samo rezultati koji sadrže sve riječi.</li>
              <li>Pitanje možete poslati Ministarstvu: <Link href="/e-usluge/obrasci/upit-ministarstvu" className="font-semibold text-[var(--br-700)]">upit Ministarstvu</Link>.</li>
            </ul>
          </div>
        )}

        {r && r.total > 0 && (
          <div className="mt-8 grid gap-6 lg:mt-10 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10">
            <aside aria-label="Filteri" className="hidden space-y-6 lg:sticky lg:top-24 lg:block lg:self-start">{facets}</aside>
            <details className="rounded-[8px] ring-1 ring-inset ring-[#e5e5e5] lg:hidden" open={active.length > 0}>
              <summary className="cursor-pointer px-4 py-3 text-[15px] font-semibold text-[#171717]">Filteri{active.length ? ` (${active.length})` : ''}</summary>
              <div className="space-y-5 px-2 pb-4">{facets}</div>
            </details>
            <div className="min-w-0">
              <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-[#e5e5e5] pb-4">
                <p className="text-[16px] text-[#525252] tabular-nums" role="status"><b className="text-[#171717]">{r.total}</b> {r.total === 1 ? 'rezultat' : 'rezultata'} za „{q}“{active.length ? ` · ${active.join(', ')}` : ''}</p>
                {active.length > 0 && <Link href={link({ vrsta: undefined, sektor: undefined, godina: undefined, stranica: undefined })} className="text-[14px] font-semibold text-[var(--br-700)]">Ukloni filtere</Link>}
              </div>
              {r.fuzzy && <p className="mt-4 rounded-[8px] bg-[#fffcf5] p-3 text-[14px] text-[#b54708] ring-1 ring-inset ring-[#fedf89]">Nema tačnog pogotka; prikazani su slični naslovi.{r.suggestion && <> Pokušajte: <Link href={`/pretraga?q=${encodeURIComponent(r.suggestion)}`} className="font-semibold underline underline-offset-2">{r.suggestion}</Link></>}</p>}
              <ol className="divide-y divide-[#f0f0f0]">
                {r.items.map((it) => (
                  <li key={it.url} className="py-5">
                    <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-[#737373]">
                      <span className="font-semibold text-[var(--br-700)]">{it.kindLabel}</span>
                      {it.meta && <><span aria-hidden>·</span><span>{it.meta}</span></>}
                      {it.sector && <><span aria-hidden>·</span><span>{it.sector}</span></>}
                      {it.date && <><span aria-hidden>·</span><time dateTime={it.date}>{dateShort(it.date)}</time></>}
                      {it.isDemo && <Badge tone="warning">Primjer</Badge>}
                    </p>
                    <h2 className="mt-1 text-[18px] font-semibold leading-7"><Link href={it.url} className="text-[#171717] hover:text-[var(--br-700)] hover:underline"><Marked text={it.title} marks={it.titleMarks} /></Link></h2>
                    {it.snippet.text && <p className="mt-1 line-clamp-3 text-[15px] leading-6 text-[#525252]"><Marked text={it.snippet.text} marks={it.snippet.marks} /></p>}
                  </li>
                ))}
              </ol>
              {r.pages > 1 && (
                <nav aria-label="Stranice rezultata" className="mt-6 flex items-center justify-between border-t border-[#e5e5e5] pt-4 text-[14px] font-semibold">
                  {r.page > 1 ? <Link href={link({ stranica: String(r.page - 1) })} className="text-[var(--br-700)]">Prethodna</Link> : <span />}
                  <span className="font-normal text-[#737373]">Stranica {r.page} od {r.pages}</span>
                  {r.page < r.pages ? <Link href={link({ stranica: String(r.page + 1) })} className="inline-flex items-center gap-1 text-[var(--br-700)]">Sljedeća<ArrowRight size={16} /></Link> : <span />}
                </nav>
              )}
            </div>
          </div>
        )}
      </Container>
    </section>
  );
}

