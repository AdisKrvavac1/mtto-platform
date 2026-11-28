import Link from 'next/link';
import { apiSafe, type PostListItem, type Facility } from '@/lib/api';
import { EMPTY, type RiskSummary } from '@/lib/risk';
import { dateLong, dateShort, daysUntil } from '@/lib/format';
import EkoMonitoring from '@/components/uui/EkoMonitoring';
import { Badge, Button, Card, Container, CountUp, FeaturedIcon, GRAD, Head, TableCard, td, th } from '@/components/uui';
import { ArrowRight, Award01, Building07, Calendar, CheckCircle, Clock, Download01, Edit05, File06, Mail01, Map01, MarkerPin02, Phone01, Route, SearchLg, Sun, Ticket01, Users01 } from '@untitledui/icons';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Turizam i baština' };

type Stats = { facilities: number };
type List = { items: PostListItem[] };
const TABS = [{ k: 'objekti', l: 'Kategorizirani objekti' }, { k: 'vodici', l: 'Turistički vodiči' }, { k: 'agencije', l: 'Turističke agencije' }];

export default async function TurizamPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const tab = TABS.some((t) => t.k === sp.registar) ? sp.registar! : 'objekti';
  const [stats, calls, facilities, risk] = await Promise.all([
    apiSafe<Stats>('/stats', { facilities: 0 }),
    apiSafe<List>(`/posts?type=JAVNI_POZIV&category=Turizam&limit=1`, { items: [] }),
    apiSafe<Facility[]>(`/facilities${sp.q ? `?q=${encodeURIComponent(sp.q)}` : ''}`, []),
    apiSafe<RiskSummary>('/risk/summary', EMPTY),
  ]);
  const call = calls.items[0];
  const left = call ? daysUntil(call.deadline) : null;
  const open = call && (left === null || left >= 0);

  return (
    <>
      {/* HERO */}
      <section className={`relative isolate overflow-hidden text-white ${GRAD}`}>
        <div aria-hidden className="absolute inset-0 opacity-25 [background-image:radial-gradient(rgba(255,255,255,0.14)_1px,transparent_1px)] [background-size:24px_24px] [mask-image:linear-gradient(to_bottom,black,transparent_60%)]" />
        <Container className="relative pb-10 pt-10 md:pt-14">
          <nav aria-label="Putanja" className="mb-6 flex items-center gap-2 text-[14px] font-medium text-[var(--br-200)]"><Link href="/" className="hover:text-white">Naslovna</Link><span className="text-white/30">/</span><span className="font-semibold text-white">Turizam i baština</span></nav>
          <div className="grid gap-10 lg:grid-cols-[1.3fr_1fr] lg:items-end">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--gr-500)]/15 px-2.5 py-0.5 text-[12px] font-semibold text-[var(--gr-200)] ring-1 ring-inset ring-[var(--gr-500)]/40"><span className="size-1.5 rounded-full bg-[var(--gr-400)]" />Sektor za turizam, ugostiteljstvo i kulturno-historijsko naslijeđe</span>
              <h1 className="mt-4 text-[36px] leading-[44px] md:text-[56px] md:leading-[64px] font-semibold tracking-[-0.02em]">Održivi turizam i baština: <span className="text-[var(--gr-300)]">od Makljena do Jadranskog mora</span></h1>
              <p className="mt-4 max-w-[680px] text-[18px] leading-7 text-[var(--br-100)]">Službeni informacijski sustav za turističku privredu: kategorizacija objekata, licenciranje vodiča i poticaji za razvoj turističke ponude kantona.</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Link href="/registri/ugostiteljski-objekti" className="inline-flex h-11 items-center justify-center gap-1.5 rounded-[8px] border-2 border-white/10 bg-[var(--br-600)] px-4 text-[16px] font-semibold text-white hover:bg-[var(--br-700)]"><Building07 size={20} />Istraži kategorizirane objekte</Link>
                <Link href="/turisticki-vodici" className="inline-flex h-11 items-center justify-center gap-1.5 rounded-[8px] bg-white/10 px-4 text-[16px] font-semibold ring-1 ring-inset ring-white/25 backdrop-blur-md hover:bg-white/15"><Users01 size={20} />Ispit za vodiče</Link>
                <Link href="/vijesti?type=JAVNI_POZIV" className="inline-flex h-11 items-center justify-center gap-1.5 rounded-[8px] bg-white/10 px-4 text-[16px] font-semibold ring-1 ring-inset ring-white/25 backdrop-blur-md hover:bg-white/15"><Ticket01 size={20} />Sufinanciranje i grantovi</Link>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 rounded-[16px] bg-white/10 p-3 ring-1 ring-inset ring-white/15 backdrop-blur-md">
              {([[String(stats.facilities), 'Kategoriziranih objekata', 'Javni registar'], ['Faza 2', 'Licencirani vodiči', 'Registar u izradi'], ['2', 'UNESCO lokaliteta', 'Mostar i Radimlja'], ['4.401 km²', 'Površina kantona', '9 općina i gradova']] as const).map(([v, l, s]) => (
                <div key={l} className="rounded-[12px] bg-white/5 p-4"><p className="text-[28px] leading-9 font-semibold"><CountUp value={v} /></p><p className="text-[14px] font-medium text-[var(--br-100)]">{l}</p><p className="text-[12px] text-[var(--gr-300)]">{s}</p></div>
              ))}
            </div>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
            {[['UNESCO baština', 'Stari most, Mostar', '/hero/mostar-m.jpg'], ['Kulturni krajolik', 'Vrelo Bune, Blagaj', '/hero/blagaj-m.jpg'], ['Ramsar močvara', 'Hutovo blato', '/fig/tile-hutovo.jpg'], ['Jadranski koridor', 'Neumski zaljev', '/hero/neum-m.jpg']].map(([k, t, img]) => (
              <div key={t} className="group uui-lift relative h-[130px] overflow-hidden rounded-[12px] ring-1 ring-inset ring-white/20 md:h-[150px]"><img src={img} alt="" className="absolute inset-0 size-full object-cover transition-transform duration-700 group-hover:scale-[1.06]" /><span className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" /><span className="absolute bottom-3 left-3 text-white md:left-4"><span className="block text-[12px] font-semibold text-[var(--gr-200)]">{k}</span><span className="text-[16px] md:text-[18px] font-semibold">{t}</span></span></div>
            ))}
          </div>
        </Container>
      </section>

      {/* BRZI LINKOVI */}
      <section className="border-b border-[#e5e5e5] bg-white">
        <Container className="grid gap-2 py-4 sm:grid-cols-2 lg:grid-cols-4">
          {([[Ticket01, 'Javni natječaj', call ? (open ? 'Otvoren poziv' : 'Zatvoren') : 'Nema otvorenih', '/vijesti?type=JAVNI_POZIV', !!open], [File06, 'Zahtjev za kategorizaciju', 'Podnesite elektronski', '/e-usluge/obrasci/zahtjev-za-kategorizaciju', false], [Users01, 'Turističke zajednice', 'Upisnik i kontakti', '/registri/turisticke-zajednice', false], [Award01, 'Boravišna taksa', 'Prijava gostiju na prijava.ba', '/turizam-i-bastina/boravisna-taksa', false]] as const).map(([I, t, s, href, rip]) => (
            <Link key={t} href={href} className="group flex items-center gap-3 rounded-[12px] p-3 hover:bg-[#fafafa]"><FeaturedIcon icon={I} tone={rip ? 'success' : 'brand'} size="md" ripple={rip} /><span><b className="block text-[16px] font-semibold text-[#171717] group-hover:text-[var(--br-700)]">{t}</b><span className="text-[14px] text-[#525252]">{s}</span></span></Link>
          ))}
        </Container>
      </section>

      {/* TEMATSKE CJELINE */}
      <section className="bg-white py-16 md:py-24">
        <Container>
          <Head k="Razvojni prioriteti" t="Tematske cjeline i strateški pravci turizma" action={<p className="max-w-[420px] text-[14px] text-[#525252]">Plan poticanja diverzifikacije turističkih proizvoda u ruralnim i urbanim područjima kantona.</p>} />
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[['Baština i UNESCO', 'Kultura i UNESCO baština', 'Stari most u Mostaru, Počitelj, Blagaj i nekropola Radimlja kod Stoca.', '/hero/pocitelj-m.jpg', 'Pregled lokaliteta'], ['Outdoor i aktivni', 'Cikloturizam i aktivni odmor', 'Ćiro trasa, planinarenje na Prenju i rafting Neretvom.', '/fig/tile-prenj.jpg', 'Staze i karta'], ['Enogastronomija', 'Vinski turizam i agroturizam', 'Vinske ceste Hercegovine, žilavka i blatina, lokalna gastronomija.', '/hero/neretva-m.jpg', 'Vinske ceste'], ['Jadran i more', 'Primorski turizam i marikultura', 'Neum, jedini izlaz Bosne i Hercegovine na Jadransko more.', '/hero/neum-m.jpg', 'Zaštita obale']].map(([k, t, d, img, cta]) => (
              <Card key={t} className="group uui-lift flex flex-col overflow-hidden">
                <span className="relative block aspect-[4/3] overflow-hidden"><img src={img} alt="" className="size-full object-cover transition-transform duration-700 group-hover:scale-[1.05]" /><span className="absolute left-3 top-3"><Badge tone="success">{k}</Badge></span></span>
                <span className="flex flex-1 flex-col p-5"><span className="text-[18px] font-semibold text-[#171717]">{t}</span><span className="mt-1 text-[14px] text-[#525252]">{d}</span><Link href="/mapa" className="mt-auto flex items-center justify-between pt-4 text-[14px] font-semibold text-[var(--br-700)]">{cta}<ArrowRight size={18} className="transition-transform group-hover:translate-x-1" /></Link></span>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      <EkoMonitoring risk={risk} intro="Kvalitet zraka i stanje voda važni su za turističku ponudu kanjona Neretve, Bune i obale u Neumu." />

      {/* SLUŽBENI REGISTRI U SEKTORU TURIZMA */}
      <section id="registri" className="scroll-mt-28 bg-white py-16 md:py-24">
        <Container>
          <Head k="Javni popisi i evidencije" t="Službeni registri u sektoru turizma i ugostiteljstva" s="Centralna baza kategoriziranih objekata, licenciranih vodiča i turističkih agencija u nadležnosti Ministarstva." action={
            <nav className="flex gap-1 overflow-x-auto rounded-[10px] bg-[#fafafa] p-1 ring-1 ring-inset ring-[#e5e5e5]">{TABS.map((t) => <Link key={t.k} scroll={false} href={`/turizam-i-bastina?registar=${t.k}#registri`} className={`h-9 shrink-0 rounded-[6px] px-3 text-[14px] font-semibold leading-9 ${tab === t.k ? 'bg-[#062343] text-white' : 'text-[#525252] hover:text-[#262626]'}`}>{t.l}</Link>)}</nav>
          } />
          <div className="mt-8">
            {tab === 'objekti' ? (
              <TableCard title="Kategorizirani ugostiteljski objekti" badge={<Badge tone="brand">{facilities.length}</Badge>} actions={
                <form action="/turizam-i-bastina#registri" className="flex h-10 items-center gap-2 rounded-[8px] px-3 ring-1 ring-inset ring-[#d4d4d4] md:w-[300px]"><input type="hidden" name="registar" value="objekti" /><SearchLg size={18} className="text-[#a3a3a3]" /><input name="q" defaultValue={sp.q} placeholder="Naziv objekta ili mjesto" aria-label="Pretraga objekata" className="min-w-0 flex-1 border-0 bg-transparent p-0 text-[14px] !shadow-none focus:outline-none focus:ring-0" /></form>
              }>
                <table className="w-full min-w-[820px]">
                  <thead><tr><th className={th}>Objekat</th><th className={th}>Vrsta</th><th className={th}>Kategorija</th><th className={th}>Općina</th><th className={th}>Rješenje</th><th className={th}>Status</th></tr></thead>
                  <tbody>
                    {facilities.slice(0, 8).map((f) => (
                      <tr key={f.id} className="hover:bg-[#fafafa]">
                        <td className={td}><span className="font-semibold text-[#171717]">{f.name}</span>{f.isDemo && <Badge tone="warning" className="ml-2">Demo</Badge>}</td>
                        <td className={td}>{f.kind}</td>
                        <td className={td}>{f.stars ? <span className="text-[#f79009]" aria-label={`${f.stars} zvjezdice`}>{'★'.repeat(f.stars)}</span> : '—'}</td>
                        <td className={td}>{f.municipality}</td>
                        <td className={`${td} whitespace-nowrap`}>{f.decisionNumber || '—'}{f.decisionDate ? ` · ${dateShort(f.decisionDate)}` : ''}</td>
                        <td className={td}><Badge tone="success" dot>Aktivno</Badge></td>
                      </tr>
                    ))}
                    {facilities.length === 0 && <tr><td colSpan={6} className={`${td} py-10 text-center`}>Nema objekata za zadani pojam.</td></tr>}
                  </tbody>
                </table>
              </TableCard>
            ) : (
              <Card className="flex flex-col items-center gap-3 px-6 py-14 text-center">
                <FeaturedIcon icon={tab === 'vodici' ? Users01 : Building07} tone="brand" size="lg" />
                <p className="text-[18px] font-semibold text-[#171717]">{tab === 'vodici' ? 'Registar turističkih vodiča' : 'Registar turističkih agencija'}</p>
                <p className="max-w-[460px] text-[14px] text-[#525252]">Javni registar s pretragom po jezicima i specijalizacijama digitalizira se u Fazi 2. Do tada informacije daje Sektor za turizam.</p>
                <Badge tone="gray">Faza 2</Badge>
              </Card>
            )}
          </div>
          <div className="mt-6 flex flex-col gap-4 rounded-[16px] bg-[var(--br-25)] p-5 ring-1 ring-inset ring-[var(--br-100)] md:flex-row md:items-center md:justify-between md:p-6">
            <div className="flex gap-4"><FeaturedIcon icon={Award01} tone="brand" size="md" /><div><Badge tone="brand">Ispitni ciklus 2026</Badge><p className="mt-2 text-[18px] font-semibold text-[#171717]">Stručni ispiti za turističke vodiče i voditelje poslovnica</p><p className="text-[14px] text-[#525252]">Uslovi, prijava i literatura za polaganje općeg i posebnog dijela ispita.</p></div></div>
            <div className="flex shrink-0 gap-3"><Button href="/turisticki-vodici" icon={Edit05} className="!bg-[#062343]">Uvjeti i prijava</Button><Button href="/propisi" variant="secondary" icon={File06}>Katalog pitanja</Button></div>
          </div>
        </Container>
      </section>

      {/* JAVNI POZIVI + EDUKACIJA */}
      <section className="bg-[#fafafa] py-16 md:py-24">
        <Container className="grid gap-8 lg:grid-cols-[1fr_380px]">
          <div>
            <Head k="Bespovratna sredstva i transferi" t="Javni pozivi i sufinanciranje" s="Programi podrške udruženjima i privredi za razvoj turističke ponude i manifestacija." />
            {call ? (
              <Card className="mt-8 overflow-hidden">
                <div className="h-1.5 bg-[linear-gradient(90deg,var(--gr-600),var(--br-600))]" />
                <div className="p-6 md:p-8">
                  <div className="flex flex-wrap items-center justify-between gap-2"><Badge tone={open ? 'success' : 'gray'} dot>{open ? 'Otvoren javni poziv' : 'Zatvoren poziv'}</Badge>{call.deadline && <span className={`flex items-center gap-1.5 text-[14px] font-semibold ${open ? 'text-[#d92d20]' : 'text-[#737373]'}`}><Clock size={16} />Rok za prijave: {dateLong(call.deadline)}</span>}</div>
                  <h3 className="mt-4 text-[22px] leading-8 md:text-[26px] md:leading-9 font-semibold text-[#171717]"><Link href={`/vijesti/${call.slug}`} className="hover:text-[var(--br-700)]">{call.title}</Link></h3>
                  {call.excerpt && <p className="mt-3 text-[16px] leading-6 text-[#525252]">{call.excerpt}</p>}
                  <div className="mt-6 flex flex-col gap-3 border-t border-[#e5e5e5] pt-6 sm:flex-row">
                    <Button href={`/vijesti/${call.slug}#dokumenti`} icon={Download01} className="!bg-[#062343]">Tekst javnog poziva</Button>
                    {open && <Button href={`/vijesti/${call.slug}#prijava`} variant="secondary" icon={Edit05}>Prijavni obrasci</Button>}
                  </div>
                </div>
              </Card>
            ) : <p className="mt-8 text-[16px] text-[#525252]">Trenutno nema objavljenih poziva iz oblasti turizma.</p>}
          </div>
          <aside>
            <p className="text-[14px] font-semibold text-[var(--br-700)]">Standardi kvalitete</p>
            <h3 className="mt-2 text-[20px] font-semibold text-[#171717]">Edukacija i radionice</h3>
            <div className="mt-6 flex flex-col gap-4">
              {[['Usklađivanje s Pravilnikom o kategorizaciji', 'Interaktivna obuka za vlasnike apartmana i soba. Sala Sektora za turizam, Mostar.'], ['Uvođenje EU eko-oznake za smještaj', 'Smjernice za dobijanje okolišnog certifikata za hotele i kampove.']].map(([t, d]) => (
                <Card key={t} className="uui-lift p-5"><div className="flex items-center gap-2"><Calendar size={16} className="text-[var(--br-600)]" /><Badge tone="gray">Demo · termin uskoro</Badge></div><p className="mt-3 text-[16px] font-semibold text-[#171717]">{t}</p><p className="mt-1 text-[14px] text-[#525252]">{d}</p><Link href="/o-nama#upit" className="mt-3 inline-flex items-center gap-1 text-[14px] font-semibold text-[var(--br-700)]">Prijava na radionicu<ArrowRight size={16} /></Link></Card>
              ))}
            </div>
          </aside>
        </Container>
      </section>

      {/* KAKO REGISTRIRATI OBJEKAT */}
      <section className="bg-white py-16 md:py-24">
        <Container>
          <Head k="Vodič za iznajmljivače" t="Kako legalno registrirati smještajni objekat" s="Jedinstveni postupak sufinanciranja i kategorizacije objekata kroz tri koraka." action={<Button href="/propisi" variant="secondary" icon={Download01}>Brošura postupka (PDF)</Button>} />
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {[['Priprema dokumentacije', 'Pribavite dokaz o vlasništvu, urbanističku saglasnost i upotrebnu dozvolu za objekat.', 'Potrebno: dokaz o vlasništvu'], ['Podnošenje zahtjeva', 'Ispunjen obrazac zahtjeva za kategorizaciju predaje se na protokol Ministarstva.', 'Gdje: pisarnica MTTO ili elektronski zahtjev na portalu'], ['Očevid i izdavanje rješenja', 'Komisija vrši očevid i utvrđuje kategoriju; rješenje se upisuje u javni registar.', 'Rok: rješenje u zakonskom roku']].map(([t, d, n], i) => (
              <Card key={t} className="uui-lift p-6">
                <span className="flex size-10 items-center justify-center rounded-[8px] bg-[#062343] text-[16px] font-semibold text-white">{i + 1}</span>
                <h3 className="mt-5 text-[18px] font-semibold text-[#171717]">{t}</h3><p className="mt-2 text-[14px] text-[#525252]">{d}</p>
                <p className="mt-4 rounded-[8px] bg-[#fafafa] px-3 py-2 text-[12px] font-medium text-[#404040]">{n}</p>
              </Card>
            ))}
          </div>
          <div className={`mt-8 flex flex-col gap-4 rounded-[16px] p-6 text-white md:flex-row md:items-center md:justify-between ${GRAD}`}>
            <div className="flex gap-4"><span className="flex size-12 shrink-0 items-center justify-center rounded-[10px] bg-white/10 ring-1 ring-inset ring-white/20"><Route size={24} /></span><div><p className="text-[18px] font-semibold">Digitalni vodiči i GPX staze destinacije</p><p className="text-[14px] text-[var(--br-100)]">Besplatne interaktivne GPX rute (Ćiro staza, Via Dinarica, kanjon Neretve) za planinare i bicikliste.</p></div></div>
            <div className="flex shrink-0 gap-3"><Link href="/mapa" className="inline-flex h-11 items-center gap-1.5 rounded-[8px] border-2 border-white/10 bg-[var(--br-600)] px-4 text-[16px] font-semibold hover:bg-[var(--br-700)]"><Map01 size={20} />Otvori kartu</Link><Badge tone="gray" className="self-center">GPX · Faza 2</Badge></div>
          </div>
        </Container>
      </section>

      {/* KONTAKT SEKTORA */}
      <section className="bg-[#fafafa] py-16 md:py-24">
        <Container className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <Card className="p-6 md:p-8">
            <Badge tone="brand" dot>Nadležna služba</Badge>
            <h2 className="mt-4 text-[24px] md:text-[30px] font-semibold text-[#171717]">Sektor za turizam i ugostiteljstvo</h2>
            <p className="mt-2 text-[16px] text-[#525252]">Za sva pitanja o kategorizaciji, licencama vodiča i javnim pozivima obratite se Sektoru.</p>
            <ul className="mt-6 space-y-4 text-[16px] text-[#525252]">
              <li className="flex gap-3"><FeaturedIcon icon={Users01} size="md" /><span><b className="block font-semibold text-[#171717]">Edina Jogunović</b>Sektor za turizam</span></li>
              <li className="flex gap-3"><FeaturedIcon icon={Phone01} size="md" /><span><b className="block font-semibold text-[#171717]">Telefon</b><a href="tel:+38736552498">+387 36 552 498</a></span></li>
              <li className="flex gap-3"><FeaturedIcon icon={Mail01} size="md" /><span><b className="block font-semibold text-[#171717]">E-pošta</b><a href="mailto:turizam@mtto.gov.ba">turizam@mtto.gov.ba</a></span></li>
            </ul>
          </Card>
          <Card className="p-6 md:p-8">
            <h3 className="text-[18px] font-semibold text-[#171717]">Uredovno vrijeme sa strankama</h3>
            <p className="mt-1 text-[14px] text-[#525252]">Prijem stranaka u sjedištu Ministarstva bez prethodnog zakazivanja.</p>
            <dl className="mt-6 space-y-3 text-[14px]">{[['Ponedjeljak – petak', '08:00 – 16:00'], ['Lokacija prijema', 'Braće Fejića bb, Mostar']].map(([a, b]) => <div key={a} className="flex justify-between border-b border-[#e5e5e5] pb-3"><dt className="text-[#525252]">{a}</dt><dd className="font-semibold text-[#171717]">{b}</dd></div>)}</dl>
            <Button href="/o-nama#upit" className="mt-6 w-full !bg-[#062343]" icon={CheckCircle}>Pošalji upit sektoru</Button>
          </Card>
        </Container>
      </section>
    </>
  );
}
