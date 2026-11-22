import Link from 'next/link';
import { apiSafe, type Doc, type Facility, type Permit, type PostListItem } from '@/lib/api';
import { DOC_TYPE, dateLong, fileExt, fileSize } from '@/lib/format';
import { Badge, Button, Card, Container, CtaBox, FeaturedIcon, PageHeader, Section, SectionHeader } from '@/components/uui';
import {
  ArrowRight, Building07, Calendar, Clock, Download01, FileSearch02, Mail01, MarkerPin02, Phone01, BankNote01, Scales02, SearchLg, ShieldTick, Trash03, Users01,
} from '@untitledui/icons';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'E-usluge i registri' };

type Stats = { documents: number; permits: number; facilities: number };
type List = { items: PostListItem[]; total?: number };
const fmt = (n: number) => n.toLocaleString('bs-BA');

function countBy<T>(rows: T[], key: (r: T) => string) {
  const m = new Map<string, number>();
  rows.forEach((r) => { const k = key(r); if (k) m.set(k, (m.get(k) || 0) + 1); });
  return [...m.entries()].sort((a, b) => b[1] - a[1]);
}

export default async function EUslugePage() {
  const [stats, permits, facilities, docs, env] = await Promise.all([
    apiSafe<Stats>('/stats', { documents: 0, permits: 0, facilities: 0 }),
    apiSafe<Permit[]>('/permits', []),
    apiSafe<Facility[]>('/facilities', []),
    apiSafe<Doc[]>('/documents', []),
    apiSafe<List>(`/posts?category=${encodeURIComponent('Zaštita okoliša')}&limit=3`, { items: [] }),
  ]);
  const towns = countBy(permits, (p) => p.municipality).slice(0, 4);
  const forms = [...docs].sort((a, b) => (a.docType === 'OBRAZAC' ? -1 : 0) - (b.docType === 'OBRAZAC' ? -1 : 0)).slice(0, 6);

  const registries = [
    { icon: FileSearch02, title: 'Registar okolišnih dozvola', count: `${fmt(stats.permits)} dozvola`, href: '/registri/okolisne-dozvole', cta: 'Pretraži registar', text: 'Važeće, obnovljene i istekle okolišne dozvole za industrijske pogone, energetske objekte i kamenolome.', extra: towns.map(([t, c]) => <Link key={t} href={`/registri/okolisne-dozvole?municipality=${encodeURIComponent(t)}`}><Badge tone="gray">{t} ({c})</Badge></Link>) },
    { icon: Building07, title: 'Kategorizacija ugostiteljskih objekata', count: `${fmt(stats.facilities)} objekata`, href: '/registri/ugostiteljski-objekti', cta: 'Otvori registar', text: 'Hoteli, moteli, pansioni, kampovi i privatni smještaj s dodijeljenom kategorijom. Izvoz u CSV.', extra: null },
    { icon: Users01, title: 'Registar turističkih vodiča', count: 'Faza 2', href: '/turisticki-vodici', cta: 'Stručni ispit', text: 'Uslovi za polaganje stručnog ispita za turističke vodiče i budući javni registar licenci.', extra: null },
    { icon: Trash03, title: 'Upravljanje otpadom', count: 'Faza 2', href: '/registri/upravljanje-otpadom', cta: 'Saznaj više', text: 'Registar ovlaštenih operatera za sakupljanje, skladištenje i obradu otpada digitalizira se u Fazi 2.', extra: null },
  ];

  return (
    <>
      <PageHeader
        crumbs={[{ label: 'Naslovna', href: '/' }, { label: 'E-usluge' }]}
        eyebrow="Centar e-usluga"
        title="Registri, obrasci i javni uvidi"
        after={
          <form action="/registri/okolisne-dozvole" role="search" className="flex w-full max-w-[640px] flex-col gap-3 sm:flex-row">
            <label className="flex h-12 flex-1 items-center gap-2 rounded-[8px] bg-white px-3.5 ring-1 ring-inset ring-[#d4d4d4] shadow-[0_1px_2px_rgba(10,13,18,0.05)] focus-within:ring-2 focus-within:ring-[var(--br-500)]">
              <SearchLg size={20} className="text-[#a3a3a3]" />
              <input name="q" aria-label="Pretraga dozvola" placeholder="Operater, broj rješenja ili lokacija" className="min-w-0 flex-1 border-0 bg-transparent p-0 text-[16px] leading-6 text-[#171717] placeholder:text-[#737373] shadow-none focus:outline-none focus:ring-0" />
            </label>
            <Button type="submit" size="xl">Pretraži dozvole</Button>
          </form>
        }
      >
        Jedinstvena tačka pristupa bazama podataka, elektronskim obrascima i javnim uvidima Ministarstva trgovine, turizma i zaštite okoliša HNK.
      </PageHeader>

      {/* Registri – kartice (Untitled "Pricing / feature cards") */}
      <Section tone="gray">
        <SectionHeader eyebrow="Javne evidencije" title="Temeljni registri kantona">Podaci se objavljuju direktno iz CMS-a Ministarstva i dostupni su svima, bez prijave.</SectionHeader>
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {registries.map((r) => (
            <Card key={r.title} className="group uui-lift flex flex-col p-6 md:p-8">
              <div className="flex items-start justify-between gap-4">
                <FeaturedIcon icon={r.icon} />
                <Badge tone={r.count === 'Faza 2' ? 'gray' : 'brand'} size="md">{r.count}</Badge>
              </div>
              <h3 className="mt-6 text-[20px] leading-[30px] font-semibold text-[#171717]">{r.title}</h3>
              <p className="mt-2 text-[16px] leading-6 text-[#525252]">{r.text}</p>
              {r.extra && r.extra.length > 0 && <div className="mt-4 flex flex-wrap gap-2">{r.extra}</div>}
              <div className="mt-auto pt-8"><Button href={r.href} variant={r.count === 'Faza 2' ? 'secondary' : 'primary'} iconRight={ArrowRight}>{r.cta}</Button></div>
            </Card>
          ))}
        </div>
      </Section>

      {/* Javni uvidi + obrasci */}
      <Section>
        <div className="grid gap-16 lg:grid-cols-2 lg:gap-12">
          <div>
            <SectionHeader eyebrow="Učešće javnosti" title="Javni uvidi i rasprave" actions={<Button href={`/vijesti?category=${encodeURIComponent('Zaštita okoliša')}`} variant="link" iconRight={ArrowRight}>Sve objave</Button>}>
              Građani i udruženja mogu dati primjedbe na studije utjecaja i planove.
            </SectionHeader>
            <ul className="mt-8 flex flex-col gap-4">
              {env.items.map((p) => (
                <li key={p.id}>
                  <Link href={`/vijesti/${p.slug}`} className="group flex flex-col gap-2 rounded-[12px] p-5 ring-1 ring-inset ring-[#e5e5e5] hover:ring-[var(--br-300)] hover:bg-[var(--br-25)]">
                    <div className="flex flex-wrap items-center gap-2"><Badge tone="success" dot>Objavljeno</Badge><span className="flex items-center gap-1.5 text-[14px] text-[#525252]"><Calendar size={14} className="text-[#a3a3a3]" />{dateLong(p.publishedAt)}</span>{p.isDemo && <Badge tone="warning">Demo</Badge>}</div>
                    <p className="text-[16px] leading-6 font-semibold text-[#171717] group-hover:text-[var(--br-700)]">{p.title}</p>
                    {p.excerpt && <p className="text-[14px] leading-5 text-[#525252] line-clamp-2">{p.excerpt}</p>}
                  </Link>
                </li>
              ))}
              {env.items.length === 0 && <li className="text-[16px] text-[#525252]">Trenutno nema objavljenih javnih uvida.</li>}
            </ul>
          </div>
          <div>
            <SectionHeader eyebrow="Obrasci" title="Službeni obrasci" actions={<Button href="/propisi" variant="link" iconRight={ArrowRight}>Svi propisi</Button>}>
              Standardizirani obrasci za zahtjeve prema nadležnim sektorima.
            </SectionHeader>
            <ul className="mt-8 flex flex-col gap-3">
              {forms.map((d) => (
                <li key={d.id} className="flex items-center gap-3 rounded-[12px] bg-white p-4 ring-1 ring-inset ring-[#e5e5e5]">
                  <span className="relative flex h-10 w-8 shrink-0 rounded-[4px] ring-1 ring-inset ring-[#d4d4d4]"><span className={`absolute -left-1.5 bottom-1.5 rounded-[2px] px-1 text-[10px] leading-[14px] font-bold text-white ${fileExt(d.fileName) === 'PDF' ? 'bg-[#d92d20]' : 'bg-[#155eef]'}`}>{fileExt(d.fileName).slice(0, 4)}</span></span>
                  <div className="min-w-0 flex-1"><p className="truncate text-[14px] leading-5 font-medium text-[#404040]">{d.title}</p><p className="text-[14px] leading-5 text-[#525252]">{DOC_TYPE[d.docType] ?? d.docType} · {fileSize(d.size)}</p></div>
                  {d.isDemo && <Badge tone="warning">Demo</Badge>}
                  <Button href={`/api/documents/${d.id}/file`} variant="tertiary" size="sm" icon={Download01} external>Preuzmi</Button>
                </li>
              ))}
              {forms.length === 0 && <li className="text-[16px] text-[#525252]">Obrasci se objavljuju u rubrici Propisi.</li>}
            </ul>
          </div>
        </div>
      </Section>

      {/* Kako podnijeti zahtjev – koraci */}
      <Section tone="gray">
        <SectionHeader eyebrow="Postupak" title="Kako podnijeti zahtjev" align="center">Četiri koraka od obrasca do rješenja.</SectionHeader>
        <ol className="mt-12 md:mt-16 grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          {[
            [Scales02, 'Provjerite propise', 'Pročitajte zakon i pravilnik koji uređuju vaš zahtjev.'],
            [Download01, 'Preuzmite obrazac', 'Popunite standardizirani obrazac i pripremite priloge.'],
            [BankNote01, 'Uplatite taksu', 'Kantonalna administrativna taksa prema tarifi za vrstu zahtjeva.'],
            [Mail01, 'Predajte zahtjev', 'U pisarnici Ministarstva ili poštom na Braće Fejića bb, Mostar.'],
          ].map(([I, t, d], i) => (
            <li key={t as string} className="flex flex-col items-center text-center">
              <FeaturedIcon icon={I as any} tone="brand" />
              <p className="mt-5 text-[14px] font-semibold text-[var(--br-700)]">Korak {i + 1}</p>
              <h3 className="mt-1 text-[20px] leading-[30px] font-semibold text-[#171717]">{t as string}</h3>
              <p className="mt-2 text-[16px] leading-6 text-[#525252]">{d as string}</p>
            </li>
          ))}
        </ol>
      </Section>

      {/* Kontakt + e-potpis */}
      <Section>
        <div className="grid gap-8 lg:grid-cols-2">
          <CtaBox icon={<FeaturedIcon icon={ShieldTick} tone="brand" />} title={<span className="inline-flex items-center gap-2">Provjera elektronskog potpisa <Badge tone="gray">Faza 2</Badge></span>}>
            Provjera vjerodostojnosti digitalno potpisanih rješenja Ministarstva bit će dostupna nakon uvođenja kvalificiranog e-potpisa.
          </CtaBox>
          <Card className="p-6 md:p-8">
            <h3 className="text-[20px] leading-[30px] font-semibold text-[#171717]">Pisarnica i prijem podnesaka</h3>
            <ul className="mt-6 flex flex-col gap-5 text-[16px] leading-6 text-[#525252]">
              <li className="flex gap-3"><MarkerPin02 size={24} className="text-[var(--br-600)] shrink-0" /><span><b className="block font-semibold text-[#171717]">Sjedište Ministarstva</b>Braće Fejića bb, 88000 Mostar</span></li>
              <li className="flex gap-3"><Clock size={24} className="text-[var(--br-600)] shrink-0" /><span><b className="block font-semibold text-[#171717]">Rad sa strankama</b>Radnim danom, prema dogovoru</span></li>
              <li className="flex gap-3"><Phone01 size={24} className="text-[var(--br-600)] shrink-0" /><span><b className="block font-semibold text-[#171717]">Kontakt</b><a href="tel:+38736551823" className="hover:text-[var(--br-700)]">+387 36 551 823</a> · <a href="mailto:info@mtto.gov.ba" className="hover:text-[var(--br-700)]">info@mtto.gov.ba</a></span></li>
            </ul>
            <div className="mt-8"><Button href="https://www.google.com/maps/search/?api=1&query=Bra%C4%87e+Fej%C4%87a+bb%2C+Mostar" variant="secondary" icon={MarkerPin02}>Upute za dolazak</Button></div>
          </Card>
        </div>
      </Section>
    </>
  );
}
