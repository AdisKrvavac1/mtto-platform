// F2-11: neradna nedjelja i praznici – pravilo, izuzeci, kalendar, kontrole i kazne, pitanja.
import Link from 'next/link';
import { apiSafe } from '@/lib/api';
import { type DayOff, upcoming } from '@/lib/nonworking';
import type { RegEntry } from '@/lib/registry';
import { Badge, Card, Container, Faq, GRAD, HB1, HB2, Head, PageHero } from '@/components/uui';
import { AlertTriangle, Calendar, CalendarPlus01, Download01, ShieldTick } from '@untitledui/icons';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Neradna nedjelja i praznici', description: 'Kada trgovine ne rade, izuzeci, kontrole inspekcije i kalendar za preuzimanje.' };

const MONTHS = ['januar', 'februar', 'mart', 'april', 'maj', 'juni', 'juli', 'august', 'septembar', 'oktobar', 'novembar', 'decembar'];
const DAYS = ['nedjelja', 'ponedjeljak', 'utorak', 'srijeda', 'četvrtak', 'petak', 'subota'];
const km = (n: number) => n.toLocaleString('bs-BA');
const day = (iso: string) => new Date(`${iso}T12:00:00`);

function MonthBlock({ y, m, items }: { y: number; m: number; items: DayOff[] }) {
  const first = new Date(y, m, 1);
  const lead = (first.getDay() + 6) % 7; // ponedjeljak prvi
  const n = new Date(y, m + 1, 0).getDate();
  const byDay = new Map(items.map((i) => [day(i.date).getDate(), i]));
  return (
    <div className="rounded-[12px] p-4 ring-1 ring-inset ring-[#e5e5e5]">
      <p className="text-[14px] font-semibold capitalize text-[#171717]">{MONTHS[m]} {y}.</p>
      <div className="mt-3 grid grid-cols-7 gap-1 text-center text-[12px]" role="presentation">
        {['P', 'U', 'S', 'Č', 'P', 'S', 'N'].map((d, i) => <span key={i} className="pb-1 font-medium text-[#a3a3a3]" aria-hidden>{d}</span>)}
        {Array.from({ length: lead }, (_, i) => <span key={`e${i}`} />)}
        {Array.from({ length: n }, (_, i) => {
          const it = byDay.get(i + 1);
          const cls = !it ? 'text-[#525252]' : it.kind === 'Nedjelja' ? 'bg-[var(--br-50)] font-semibold text-[var(--br-700)]' : it.kind === 'Izmijenjeno radno vrijeme' ? 'bg-[#fffaeb] font-semibold text-[#b54708]' : 'bg-[var(--gr-50)] font-semibold text-[var(--gr-700)] ring-1 ring-inset ring-[var(--gr-200)]';
          return <span key={i} title={it ? `${it.name}${it.confirmed ? '' : ' (provjeriti)'}` : undefined} className={`flex h-7 items-center justify-center rounded-[6px] tabular-nums ${cls}`}>{i + 1}</span>;
        })}
      </div>
    </div>
  );
}

export default async function NonWorkingDays() {
  const [days, exc, report] = await Promise.all([
    upcoming(365),
    apiSafe<{ items: RegEntry[] }>('/registries/izuzeci-neradne-nedjelje/entries?limit=200', { items: [] }),
    apiSafe<{ items: RegEntry[] }>(`/registries/izvjestaj-nadzora/entries?limit=50&f.podrucje=${encodeURIComponent('Neradna nedjelja i praznici')}&sort=godina&dir=desc`, { items: [] }),
  ]);
  const special = days.filter((d) => d.kind !== 'Nedjelja');
  const nextOff = days[0];
  const months: { y: number; m: number }[] = [];
  const now = new Date();
  for (let i = 0; i < 12; i++) { const d = new Date(now.getFullYear(), now.getMonth() + i, 1); months.push({ y: d.getFullYear(), m: d.getMonth() }); }
  const unconfirmed = special.some((s) => !s.confirmed);
  const totals = report.items.reduce((a, e) => ({ naloga: a.naloga + (e.data.prekrsajnihNaloga ?? 0), kazne: a.kazne + (e.data.iznosKazni ?? 0), subjekata: a.subjekata + (e.data.subjekataNepravilnosti ?? 0) }), { naloga: 0, kazne: 0, subjekata: 0 });

  return (
    <>
      <PageHero
        crumbs={[{ label: 'Naslovna', href: '/' }, { label: 'Trgovina', href: '/trgovina' }, { label: 'Neradna nedjelja i praznici' }]}
        eyebrow="Radno vrijeme u trgovini" title="Neradna nedjelja i praznici"
        stats={[
          { label: 'Sljedeći neradni dan', value: nextOff ? `${day(nextOff.date).getDate()}. ${day(nextOff.date).getMonth() + 1}.` : '—', sub: nextOff ? nextOff.name : undefined, icon: Calendar },
          { label: 'Neradnih dana u 12 mjeseci', value: String(days.length) },
          ...(totals.naloga ? [{ label: 'Prekršajnih naloga u kontrolama', value: km(totals.naloga) }] : []),
        ]}
        actions={<><a href="/trgovina/neradni-dani.ics" className={HB1}><CalendarPlus01 size={20} />Dodaj u kalendar</a><Link href="/e-usluge/prijava-inspekciji" className={HB2}><ShieldTick size={20} />Prijavi kršenje</Link></>}
      >
        Prodajni objekti nedjeljom i u dane državnih praznika ne rade, osim zakonom propisanih izuzetaka. Ovdje su kalendar, izuzeci i rezultati kontrola.
      </PageHero>

      <section className="bg-white py-16 md:py-20">
        <Container>
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
            <div>
              <Head k="Pravilo" t="Ko i kada ne radi" />
              <div className="mt-6 space-y-4 text-[16px] leading-7 text-[#404040]">
                <p>Zakon o unutrašnjoj trgovini Federacije BiH („Sl. novine FBiH”, br. 87/2024) uređuje rad prodajnih objekata nedjeljom i u dane državnih praznika. Na području kantona primjenjuje se od 17. novembra 2024.</p>
                <p>Prodajni objekti tih dana su zatvoreni. Izuzeci su objekti i djelatnosti koje propisuje zakon; popis s uslovima je ispod i vodi ga Ministarstvo.</p>
                <p>Nadzor provodi tržišna inspekcija. Rad protivno propisu prijavite online, i anonimno, ili telefonom inspekciji.</p>
              </div>
            </div>
            <div className={`rounded-[16px] p-6 text-white ${GRAD}`}>
              <AlertTriangle size={24} />
              <p className="mt-4 text-[20px] font-semibold">Trgovina radi u nedjelju?</p>
              <p className="mt-2 text-[14px] text-[var(--br-100)]">Zapišite naziv, adresu i vrijeme. Fotografija ulaza ili računa pomaže inspekciji.</p>
              <Link href="/e-usluge/prijava-inspekciji" className={`mt-6 w-full ${HB1}`}><ShieldTick size={20} />Prijavi inspekciji</Link>
            </div>
          </div>
        </Container>
      </section>

      <section id="kalendar" className="scroll-mt-24 bg-[#fafafa] py-16 md:py-20">
        <Container>
          <Head k="Kalendar" t="Narednih 12 mjeseci" s="Plavo su neradne nedjelje, zeleno državni praznici. Kalendar možete dodati u Outlook, Google ili Apple kalendar i automatski se osvježava."
            action={<a href="/trgovina/neradni-dani.ics" className="inline-flex h-10 items-center gap-1.5 rounded-[8px] bg-white px-4 text-[14px] font-semibold text-[#404040] ring-1 ring-inset ring-[#d4d4d4] hover:bg-[#fafafa]"><Download01 size={20} />Preuzmi .ics</a>} />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {months.map(({ y, m }) => <MonthBlock key={`${y}-${m}`} y={y} m={m} items={days.filter((d) => { const x = day(d.date); return x.getFullYear() === y && x.getMonth() === m; })} />)}
          </div>
          <div className="mt-10">
            <h3 className="text-[18px] font-semibold text-[#171717]">Praznici i posebni dani</h3>
            {special.length === 0 ? <p className="mt-2 text-[14px] text-[#525252]">Ministarstvo još nije upisalo praznike za ovaj period.</p> : (
              <ul className="mt-4 divide-y divide-[#e5e5e5] rounded-[12px] bg-white ring-1 ring-inset ring-[#e5e5e5]">
                {special.map((s) => (
                  <li key={s.date + s.name} className="flex flex-col gap-1 px-5 py-4 sm:flex-row sm:items-center sm:gap-6">
                    <span className="w-[200px] shrink-0 text-[14px] font-medium capitalize text-[#525252]">{DAYS[day(s.date).getDay()]}, {day(s.date).getDate()}. {MONTHS[day(s.date).getMonth()]} {day(s.date).getFullYear()}.</span>
                    <span className="flex-1 text-[16px] font-medium text-[#171717]">{s.name}{s.note && <span className="block text-[14px] font-normal text-[#525252]">{s.note}</span>}</span>
                    {s.confirmed ? <Badge tone="success">Potvrđeno</Badge> : <Badge tone="gray">Provjeriti s Ministarstvom</Badge>}
                  </li>
                ))}
              </ul>
            )}
            {unconfirmed && <p className="mt-3 text-[12px] text-[#737373]">Dani označeni „Provjeriti“ upisani su prema kalendaru državnih praznika; rad trgovina tih dana potvrđuje Ministarstvo.</p>}
          </div>
        </Container>
      </section>

      <section id="izuzeci" className="scroll-mt-24 bg-white py-16 md:py-20">
        <Container>
          <Head k="Izuzeci" t="Ko smije raditi nedjeljom" s="Objekti i djelatnosti kojima je rad nedjeljom i praznikom dozvoljen, s uslovima." />
          {exc.items.length === 0 ? (
            <Card className="mt-8 flex flex-col gap-3 p-6 md:flex-row md:items-center md:justify-between">
              <p className="text-[16px] text-[#404040]">Ministarstvo priprema službeni popis izuzetaka s uslovima. Do objave, za konkretan objekat obratite se tržišnoj inspekciji.</p>
              <Badge tone="gray">Provjeriti s Ministarstvom</Badge>
            </Card>
          ) : (
            <div className="mt-8 overflow-x-auto rounded-[12px] ring-1 ring-inset ring-[#e5e5e5]">
              <table className="w-full min-w-[640px] text-left">
                <thead className="bg-[#fafafa] text-[12px] font-medium text-[#525252]"><tr><th className="px-5 py-3">Objekat ili djelatnost</th><th className="px-5 py-3">Uslov</th><th className="px-5 py-3">Osnov</th></tr></thead>
                <tbody className="divide-y divide-[#e5e5e5] text-[14px]">{exc.items.map((e) => <tr key={e.id}><td className="px-5 py-4 font-medium text-[#171717]">{e.data.vrstaObjekta}</td><td className="px-5 py-4 text-[#525252]">{e.data.uslov ?? '—'}</td><td className="px-5 py-4 text-[#525252]">{e.data.osnov ?? '—'}</td></tr>)}</tbody>
              </table>
            </div>
          )}
        </Container>
      </section>

      {report.items.length > 0 && (
        <section id="kontrole" className="scroll-mt-24 bg-[#fafafa] py-16 md:py-20">
          <Container>
            <Head k="Kontrole" t="Šta je inspekcija utvrdila" s="Objavljeni rezultati nadzora nad radom nedjeljom i praznikom." action={<Link href="/inspekcija" className="text-[14px] font-semibold text-[var(--br-700)] hover:underline">Plan i izvještaj nadzora</Link>} />
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {[['Subjekata s nepravilnostima', km(totals.subjekata)], ['Prekršajnih naloga', km(totals.naloga)], ['Iznos kazni', `${km(totals.kazne)} KM`]].map(([l, v]) => (
                <Card key={l} className="p-6"><p className="text-[14px] font-medium text-[#525252]">{l}</p><p className="mt-2 text-[30px] font-semibold leading-[38px] text-[#171717]">{v}</p></Card>
              ))}
            </div>
            <ul className="mt-6 space-y-2 text-[14px] text-[#525252]">
              {report.items.map((e) => <li key={e.id}>{e.data.period ?? e.data.godina}: {e.data.mjere}{e.data.izvor && <> <a className="font-medium text-[var(--br-700)] underline" href={e.data.izvor} target="_blank" rel="noopener">Izvor</a></>}</li>)}
            </ul>
          </Container>
        </section>
      )}

      <section className="bg-white py-16 md:py-20">
        <Container>
          <Head k="Pitanja" t="Najčešća pitanja" />
          <div className="mt-8">
            <Faq items={[
              { q: 'Da li zabrana važi za sve trgovine?', a: 'Važi za prodajne objekte, uz izuzetke koje propisuje zakon. Popis izuzetaka s uslovima je na ovoj stranici, a za konkretan slučaj obratite se tržišnoj inspekciji.' },
              { q: 'Šta je s praznicima?', a: 'Pravilo važi i u dane državnih praznika. Praznike i eventualno izmijenjeno radno vrijeme Ministarstvo upisuje u kalendar na ovoj stranici.' },
              { q: 'Kako prijaviti trgovinu koja radi u nedjelju?', a: <>Online preko <Link className="font-medium text-[var(--br-700)] underline" href="/e-usluge/prijava-inspekciji">prijave inspekciji</Link>, s imenom ili anonimno. Dobijate broj predmeta i kod za praćenje ishoda.</> },
              { q: 'Koja je kazna za rad nedjeljom?', a: 'Visinu prekršajnih kazni propisuje zakon; inspektor izdaje prekršajni nalog. Objavljeni rezultati kontrola su u odjeljku iznad.' },
              { q: 'Kako dodati kalendar u telefon?', a: 'Kliknite „Dodaj u kalendar“. Na Androidu ga otvorite u Google kalendaru, na iPhoneu potvrdite pretplatu. Kalendar se osvježava kad Ministarstvo upiše novi praznik.' },
            ]} />
          </div>
        </Container>
      </section>
    </>
  );
}
