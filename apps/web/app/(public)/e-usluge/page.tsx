import Link from 'next/link';
import { apiSafe, type Doc, type Facility, type Permit, type PostListItem } from '@/lib/api';
import { dateLong, daysUntil, fileExt, fileSize } from '@/lib/format';
import { Badge, Button, Card, Container, FeaturedIcon, GRAD, Head, PageHero, FileTypeIcon } from '@/components/uui';
import {
  ArrowRight, Building07, Calendar, CheckVerified01, Clock, Download01, Edit05, File06, FileSearch02, FilterLines, MarkerPin02, Phone01, SearchLg, ShieldTick, Trash03, UploadCloud02, Users01,
} from '@untitledui/icons';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'E-usluge i registri' };

type Stats = { documents: number; permits: number; facilities: number };
type List = { items: PostListItem[] };
const fmt = (n: number) => n.toLocaleString('bs-BA');
const MUNI = ['Čapljina', 'Čitluk', 'Jablanica', 'Konjic', 'Mostar', 'Neum', 'Prozor-Rama', 'Ravno', 'Stolac'];
const fieldCls = 'h-11 w-full rounded-[8px] bg-white px-3.5 text-[16px] text-[#171717] ring-1 ring-inset ring-[#d4d4d4] border-0 focus:outline-none focus:ring-2 focus:ring-[var(--br-500)]';

function countBy<T>(rows: T[], key: (r: T) => string) {
  const m = new Map<string, number>();
  rows.forEach((r) => { const k = key(r); if (k) m.set(k, (m.get(k) || 0) + 1); });
  return [...m.entries()].sort((a, b) => b[1] - a[1]);
}

export default async function EUslugePage() {
  const [stats, permits, facilities, docs, env, calls] = await Promise.all([
    apiSafe<Stats>('/stats', { documents: 0, permits: 0, facilities: 0 }),
    apiSafe<Permit[]>('/permits', []),
    apiSafe<Facility[]>('/facilities', []),
    apiSafe<Doc[]>('/documents', []),
    apiSafe<List>(`/posts?category=${encodeURIComponent('Zaštita okoliša')}&limit=3`, { items: [] }),
    apiSafe<List>('/posts?type=JAVNI_POZIV&limit=4', { items: [] }),
  ]);
  const towns = countBy(permits, (p) => p.municipality).slice(0, 4);
  const forms = docs.filter((d) => d.docType === 'OBRAZAC').slice(0, 5);
  const byKind = countBy(facilities, (f) => f.kind);
  const openCalls = calls.items.filter((c) => !c.deadline || new Date(c.deadline) > new Date());
  const uvidi = [...env.items, ...calls.items.filter((c) => !env.items.some((e) => e.id === c.id))].slice(0, 3);

  return (
    <>
      <PageHero
        crumbs={[{ label: 'Naslovna', href: '/' }, { label: 'E-usluge i registri' }]}
        eyebrow="Regulatorni centar · Hercegovačko-neretvanski kanton"
        title="Digitalni centar e-usluga i javnih registara"
        actions={<><Button href="/registri/okolisne-dozvole" size="lg" icon={CheckVerified01} className="!bg-[var(--br-600)] hover:!bg-[var(--br-700)]">Provjeri dozvolu</Button><Button href="/o-nama#upit" size="lg" variant="secondary" icon={Edit05}>Upiti i pitanja</Button></>}
        stats={[
          { label: 'Okolišnih dozvola', value: stats.permits, sub: 'U javnom registru', icon: FileSearch02 },
          { label: 'Obrazaca', value: forms.length || docs.length, sub: 'Spremni za preuzimanje', icon: File06 },
          { label: 'Javnih poziva', value: openCalls.length, sub: 'Trenutno otvoreno', icon: Calendar },
          { label: 'Ugostiteljskih objekata', value: stats.facilities, sub: 'Kategorizirano', icon: Building07 },
        ]}
      >
        Jedinstvena službena tačka pristupa bazama podataka, elektronskim obrascima, licencama i javnim uvidima Ministarstva.
      </PageHero>

      {/* FILTER TRAKA */}
      <Container className="relative z-10 -mt-8">
        <form action="/registri/okolisne-dozvole" className="grid gap-3 rounded-[16px] bg-white p-3 ring-1 ring-inset ring-[#e5e5e5] shadow-[0_20px_24px_-4px_rgba(10,13,18,0.08),0_8px_8px_-4px_rgba(10,13,18,0.03)] md:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_auto]">
          <label className="relative"><span className="sr-only">Pretraga</span><SearchLg size={20} className="pointer-events-none absolute left-3.5 top-3 text-[#a3a3a3]" /><input name="q" placeholder="Naziv subjekta, broj rješenja ili postrojenje" className={`${fieldCls} pl-11`} /></label>
          <select name="activity" aria-label="Djelatnost" className={fieldCls} defaultValue=""><option value="">Sve djelatnosti</option>{['Industrija', 'Energetika', 'Otpad', 'Turizam', 'Ostalo'].map((a) => <option key={a}>{a}</option>)}</select>
          <select name="municipality" aria-label="Općina" className={fieldCls} defaultValue=""><option value="">Sve općine i gradovi</option>{MUNI.map((m) => <option key={m}>{m}</option>)}</select>
          <button className="inline-flex h-11 items-center justify-center gap-1.5 rounded-[8px] border-2 border-white/10 bg-[#062343] px-5 text-[16px] font-semibold text-white hover:bg-[var(--br-900)]"><FilterLines size={20} />Filtriraj</button>
        </form>
      </Container>

      {/* TEMELJNI REGISTRI */}
      <section className="bg-white py-16 md:py-24">
        <Container>
          <Head k="Službene javne evidencije" t="Temeljni registri kantona" action={<span className="flex items-center gap-1.5 text-[14px] text-[#525252]"><ShieldTick size={16} className="text-[var(--gr-600)]" />Podaci se ažuriraju direktno iz CMS-a Ministarstva</span>} />
          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            <Card className="group uui-lift flex flex-col overflow-hidden border-t-4 border-t-[var(--gr-600)] p-6">
              <div className="flex items-start justify-between"><FeaturedIcon icon={FileSearch02} tone="success" size="md" ripple={false} /><Badge tone="gray">{fmt(stats.permits)} akata</Badge></div>
              <h3 className="mt-4 text-[18px] font-semibold text-[#171717]">Registar okolišnih dozvola</h3>
              <p className="mt-1 text-[14px] text-[#525252]">Važeće, obnovljene i istekle dozvole za industrijske pogone, energetske objekte i kamenolome.</p>
              <p className="mt-4 text-[12px] font-semibold text-[#737373]">Brzi filter općina</p>
              <div className="mt-2 flex flex-wrap gap-1.5">{towns.map(([t, c]) => <Link key={t} href={`/registri/okolisne-dozvole?municipality=${encodeURIComponent(t)}`}><Badge tone="gray">{t} ({c})</Badge></Link>)}</div>
              <Link href="/registri/okolisne-dozvole" className="mt-auto flex items-center gap-1.5 pt-6 text-[14px] font-semibold text-[var(--gr-700)]">Pretraži bazu<ArrowRight size={18} className="transition-transform group-hover:translate-x-1" /></Link>
            </Card>
            <Card className="group uui-lift flex flex-col overflow-hidden border-t-4 border-t-[var(--br-600)] p-6">
              <div className="flex items-start justify-between"><FeaturedIcon icon={Trash03} tone="brand" size="md" ripple={false} /><Badge tone="gray">Faza 2</Badge></div>
              <h3 className="mt-4 text-[18px] font-semibold text-[#171717]">Upravljanje otpadom</h3>
              <p className="mt-1 text-[14px] text-[#525252]">Registar pravnih osoba ovlaštenih za sakupljanje, skladištenje i obradu neopasnog i opasnog otpada.</p>
              <ul className="mt-4 space-y-1.5 text-[14px] text-[#525252]">{['Neopasni otpad', 'Opasni otpad', 'Odlagališta komunalnog otpada'].map((x) => <li key={x} className="flex items-center gap-2"><span className="size-1.5 rounded-full bg-[var(--br-500)]" />{x}</li>)}</ul>
              <Link href="/registri/upravljanje-otpadom" className="mt-auto flex items-center gap-1.5 pt-6 text-[14px] font-semibold text-[var(--br-700)]">Saznaj više<ArrowRight size={18} className="transition-transform group-hover:translate-x-1" /></Link>
            </Card>
            <Card className="group uui-lift flex flex-col overflow-hidden border-t-4 border-t-[#f79009] p-6">
              <div className="flex items-start justify-between"><FeaturedIcon icon={Building07} tone="warning" size="md" ripple={false} /><Badge tone="gray">{fmt(stats.facilities)} objekata</Badge></div>
              <h3 className="mt-4 text-[18px] font-semibold text-[#171717]">Kategorizacija objekata</h3>
              <p className="mt-1 text-[14px] text-[#525252]">Hoteli, moteli, pansioni, kampovi i privatni smještaj s dodijeljenom kategorijom.</p>
              <dl className="mt-4 space-y-1.5 rounded-[8px] bg-[#fafafa] p-3 text-[14px]">{byKind.slice(0, 3).map(([k, n]) => <div key={k} className="flex justify-between"><dt className="text-[#525252]">{k}</dt><dd className="font-semibold text-[#171717]">{n}</dd></div>)}{byKind.length === 0 && <div className="text-[#737373]">Registar je prazan.</div>}</dl>
              <Link href="/registri/ugostiteljski-objekti" className="mt-auto flex items-center gap-1.5 pt-6 text-[14px] font-semibold text-[#b54708]">Otvori registar<ArrowRight size={18} className="transition-transform group-hover:translate-x-1" /></Link>
            </Card>
            <Card className="group uui-lift flex flex-col overflow-hidden border-t-4 border-t-[#062343] p-6">
              <div className="flex items-start justify-between"><FeaturedIcon icon={Users01} tone="brand" size="md" ripple={false} /><Badge tone="success">E-prijava · Faza 2</Badge></div>
              <h3 className="mt-4 text-[18px] font-semibold text-[#171717]">Registar turističkih vodiča</h3>
              <p className="mt-1 text-[14px] text-[#525252]">Certificirani vodiči s verifikacijom jezičnih kompetencija i prijava na stručni ispit.</p>
              <Link href="/turisticki-vodici" className="mt-auto flex items-center gap-1.5 pt-6 text-[14px] font-semibold text-[var(--br-700)]">Uslovi i prijava na ispit<ArrowRight size={18} className="transition-transform group-hover:translate-x-1" /></Link>
            </Card>
          </div>
        </Container>
      </section>

      {/* JAVNI UVIDI + BOČNA KOLONA */}
      <section className="bg-[#fafafa] py-16 md:py-24">
        <Container className="grid gap-8 lg:grid-cols-[1fr_400px]">
          <div>
            <Head k="Demokratsko sudjelovanje javnosti" t="Aktivni javni uvidi i rasprave" s="U skladu sa Zakonom o zaštiti okoliša, Ministarstvo osigurava pravo građanima i organizacijama na uvid u studije utjecaja i podnošenje primjedbi." action={<Link href="/vijesti?category=Za%C5%A1tita%20okoli%C5%A1a" className="flex items-center gap-1.5 text-[16px] font-semibold text-[var(--br-700)]">Svi arhivirani uvidi<ArrowRight size={20} /></Link>} />
            <div className="mt-8 flex flex-col gap-4">
              {uvidi.map((p) => {
                const left = daysUntil(p.deadline);
                const open = left === null || left >= 0;
                return (
                  <Card key={p.id} className="group uui-lift p-5 md:p-6">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2"><Badge tone={open ? 'success' : 'gray'} dot>{open ? 'Otvoreno za primjedbe' : 'Završeno'}</Badge><span className="text-[12px] text-[#737373]">{p.category}</span></div>
                      {p.deadline && <span className={`flex items-center gap-1.5 text-[14px] font-semibold ${open ? 'text-[#d92d20]' : 'text-[#737373]'}`}><Clock size={16} />{open ? `Još ${left} dana (do ${dateLong(p.deadline)})` : `Zaključeno ${dateLong(p.deadline)}`}</span>}
                    </div>
                    <h3 className="mt-3 text-[18px] leading-7 font-semibold text-[#171717]"><Link href={`/vijesti/${p.slug}`} className="hover:text-[var(--br-700)]">{p.title}</Link></h3>
                    {p.excerpt && <p className="mt-2 line-clamp-2 text-[14px] leading-5 text-[#525252]">{p.excerpt}</p>}
                    <div className="mt-4 flex flex-col gap-3 border-t border-[#e5e5e5] pt-4 sm:flex-row sm:items-center sm:justify-between">
                      <Button href={`/vijesti/${p.slug}#dokumenti`} variant="secondary" size="sm" icon={Download01}>{p.attachmentCount ? `Dokumentacija (${p.attachmentCount})` : 'Tekst objave'}</Button>
                      {open && <Button href={`/vijesti/${p.slug}#prijava`} size="sm" icon={Edit05} className="!bg-[#062343] hover:!bg-[var(--br-900)]">Podnesi primjedbu</Button>}
                    </div>
                  </Card>
                );
              })}
              {uvidi.length === 0 && <p className="text-[16px] text-[#525252]">Trenutno nema otvorenih javnih uvida.</p>}
              <Card className="p-5 md:p-6">
                <div className="flex flex-wrap items-center justify-between gap-2"><h3 className="text-[16px] font-semibold text-[#171717]">Status obrade okolišnih predmeta u tekućem kvartalu</h3><Badge tone="gray">Faza 2 · e-pisarnica</Badge></div>
                <p className="mt-1 text-[14px] text-[#525252]">Pregled riješenih i zaprimljenih zahtjeva prikazivat će se automatski iz e-pisarnice.</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">{[['Zahtjevi u obradi', 'var(--br-600)'], ['Izdano novih dozvola', 'var(--gr-600)'], ['Odbijeno ili vraćeno', '#f04438']].map(([l, c]) => <div key={l} className="rounded-[8px] bg-[#fafafa] p-3"><p className="text-[12px] font-medium text-[#737373]">{l}</p><p className="mt-1 text-[20px] font-semibold text-[#a3a3a3]">—</p><div className="mt-2 h-1.5 rounded-full bg-[#e5e5e5]"><div className="h-full w-1/4 rounded-full opacity-30" style={{ background: c }} /></div></div>)}</div>
              </Card>
            </div>
          </div>

          <aside className="flex flex-col gap-6">
            <Card className="overflow-hidden">
              <div className="flex items-center justify-between border-b border-[#e5e5e5] px-5 py-4"><h3 className="flex items-center gap-2 text-[18px] font-semibold text-[#171717]"><File06 size={20} className="text-[var(--br-600)]" />Službeni obrasci</h3><Badge tone="brand">{forms.length}</Badge></div>
              <ul className="divide-y divide-[#e5e5e5]">
                {forms.map((d) => (
                  <li key={d.id}><a href={`/api/documents/${d.id}/file`} target="_blank" rel="noopener" className="group flex items-start gap-3 px-5 py-3.5 hover:bg-[#fafafa]">
                    <FileTypeIcon ext={fileExt(d.fileName)} size={32} />
                    <span className="min-w-0 flex-1"><span className="block line-clamp-2 text-[14px] font-semibold text-[#171717] group-hover:text-[var(--br-700)]">{d.title}</span><span className="text-[12px] text-[#737373]">{d.sector} · {fileSize(d.size)}</span></span>
                    <Download01 size={18} className="mt-0.5 shrink-0 text-[#a3a3a3] group-hover:text-[var(--br-600)]" />
                  </a></li>
                ))}
                {forms.length === 0 && <li className="px-5 py-4 text-[14px] text-[#525252]">Obrasci još nisu objavljeni.</li>}
              </ul>
              <div className="p-4"><Link href="/propisi?docType=OBRAZAC#tablica" className="flex h-10 items-center justify-center rounded-[8px] bg-[var(--br-50)] text-[14px] font-semibold text-[var(--br-700)] hover:bg-[var(--br-100)]">Svi obrasci u repozitoriju</Link></div>
            </Card>
            <div className={`rounded-[16px] p-6 text-white ${GRAD}`}>
              <p className="flex items-center gap-2 text-[18px] font-semibold"><ShieldTick size={20} className="text-[var(--gr-300)]" />Verifikacija e-potpisa</p>
              <p className="mt-2 text-[14px] text-[var(--br-100)]">Provjera digitalnog potpisa i autentičnosti rješenja izdanog od strane Ministarstva.</p>
              <div className="mt-4 flex flex-col items-center gap-2 rounded-[12px] border border-dashed border-white/25 bg-white/5 px-4 py-6 text-center"><UploadCloud02 size={24} className="text-[var(--br-200)]" /><span className="text-[14px] text-[var(--br-100)]">Prevucite potpisani PDF dokument</span></div>
              <Badge tone="gray" className="mt-4">Faza 2</Badge>
            </div>
            <Card className="p-6">
              <h3 className="flex items-center gap-2 text-[18px] font-semibold text-[#171717]"><Building07 size={20} className="text-[var(--br-600)]" />Šalter sala i prijem podnesaka</h3>
              <ul className="mt-4 space-y-4 text-[14px] text-[#525252]">
                <li className="flex gap-3"><MarkerPin02 size={20} className="shrink-0 text-[#a3a3a3]" /><span><b className="block font-semibold text-[#171717]">Sjedište Ministarstva</b>Braće Fejića bb, 88000 Mostar</span></li>
                <li className="flex gap-3"><Clock size={20} className="shrink-0 text-[#a3a3a3]" /><span><b className="block font-semibold text-[#171717]">Rad sa strankama</b>Ponedjeljak – petak, 08:00 – 16:00</span></li>
                <li className="flex gap-3"><Phone01 size={20} className="shrink-0 text-[#a3a3a3]" /><span><b className="block font-semibold text-[#171717]">Pisarnica</b>+387 36 551 823 · info@mtto.gov.ba</span></li>
              </ul>
              <div className="mt-5 flex items-center justify-between border-t border-[#e5e5e5] pt-4 text-[14px]"><Badge tone="success" dot>Pon – pet</Badge><Link href="/o-nama#kontakt" className="font-semibold text-[var(--br-700)]">Upute za dolazak</Link></div>
            </Card>
          </aside>
        </Container>
      </section>
    </>
  );
}
