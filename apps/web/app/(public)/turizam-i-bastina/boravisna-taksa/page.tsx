// F2-15: boravišna taksa i prijava gostiju. MTTO ne gradi prijavu gostiju: upućuje na prijava.ba
// i na turističke zajednice. Iznosi takse se ne navode dok ih Ministarstvo ne potvrdi.
import Link from 'next/link';
import { apiSafe } from '@/lib/api';
import type { RegEntry } from '@/lib/registry';
import { Badge, Card, Container, Faq, GRAD, HB1, HB2, Head, PageHero } from '@/components/uui';
import { ArrowUpRight, BookOpen01, Building07, File06, Users01 } from '@untitledui/icons';

export const metadata = { title: 'Boravišna taksa i prijava gostiju', description: 'Kako se prijavljuju gosti i plaća boravišna taksa u kantonu: prijava.ba, turističke zajednice, obaveze smještaja.' };
export const dynamic = 'force-dynamic';

const STEPS: [string, string][] = [
  ['Registrujte objekat u sistemu', 'Smještajni objekat dobija pristup aplikaciji prijava.ba preko turističke zajednice na čijem je području.'],
  ['Prijavite gosta pri dolasku', 'Podatke o gostu unosite u prijava.ba. Strane goste aplikacija može prijaviti i službi za poslove sa strancima.'],
  ['Naplatite boravišnu taksu', 'Taksu plaća gost uz cijenu smještaja, prema propisanom iznosu za mjesto boravka.'],
  ['Odjavite gosta i uplatite taksu', 'Pri odlasku gosta odjavite ga u aplikaciji; prikupljenu taksu uplaćujete na propisani račun u propisanom roku.'],
];

export default async function TouristTax() {
  const tz = await apiSafe<{ items: RegEntry[] }>('/registries/turisticke-zajednice/entries?limit=50', { items: [] });
  return (
    <>
      <PageHero
        crumbs={[{ label: 'Naslovna', href: '/' }, { label: 'Turizam i baština', href: '/turizam-i-bastina' }, { label: 'Boravišna taksa' }]}
        eyebrow="Za smještajne objekte" title="Boravišna taksa i prijava gostiju"
        actions={<><a href="https://www.prijava.ba" target="_blank" rel="noopener" className={HB1}><ArrowUpRight size={20} />Otvori prijava.ba</a><Link href="/registri/turisticke-zajednice" className={HB2}><Users01 size={20} />Turističke zajednice</Link></>}
      >
        Gosti se u kantonu prijavljuju elektronski, preko aplikacije prijava.ba. Prijavu i boravišnu taksu vode turističke zajednice; Ministarstvo ne prima prijave gostiju.
      </PageHero>

      <section className="bg-white py-16 md:py-20">
        <Container>
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
            <div>
              <Head k="Prijava gostiju" t="Obavezna elektronska prijava" />
              <div className="mt-6 space-y-4 text-[16px] leading-7 text-[#404040]">
                <p>Prijava.ba je web aplikacija kojom smještajni objekti prijavljuju i odjavljuju goste u turističkim zajednicama, a strane goste po želji i službi za poslove sa strancima.</p>
                <p>U Hercegovačko-neretvanskom kantonu elektronska prijava preko prijava.ba je obavezna. Prema Turističkoj zajednici kantona, do 15. septembra 2026. u sistemu je bilo evidentirano 704 subjekta iz svih devet općina i gradova.</p>
                <p>Pristup i pomoć pri radu daje turistička zajednica na čijem je području objekat.</p>
              </div>
              <ol className="mt-10 grid gap-4 sm:grid-cols-2">
                {STEPS.map(([t, d], i) => (
                  <li key={t} className="rounded-[12px] p-5 ring-1 ring-inset ring-[#e5e5e5]">
                    <span className="flex size-8 items-center justify-center rounded-full bg-[var(--br-50)] text-[14px] font-semibold text-[var(--br-700)]">{i + 1}</span>
                    <p className="mt-3 text-[16px] font-semibold text-[#171717]">{t}</p>
                    <p className="mt-1 text-[14px] leading-5 text-[#525252]">{d}</p>
                  </li>
                ))}
              </ol>
            </div>
            <div className="space-y-4">
              <div className={`rounded-[16px] p-6 text-white ${GRAD}`}>
                <BookOpen01 size={24} />
                <p className="mt-4 text-[18px] font-semibold">Korisničko uputstvo</p>
                <p className="mt-1 text-[14px] text-[var(--br-100)]">Uputstvo za prijava.ba za smještajne objekte u kantonu (Turistička zajednica HNK, PDF).</p>
                <a href="https://hercegovina.ba/wp-content/uploads/2024/09/Korisnicko-uputstvo-HNZ_K.pdf" target="_blank" rel="noopener" className={`mt-5 w-full ${HB1}`}><File06 size={20} />Preuzmi uputstvo</a>
              </div>
              <Card className="p-6">
                <p className="text-[16px] font-semibold text-[#171717]">Iznos boravišne takse</p>
                <p className="mt-2 text-[14px] text-[#525252]">Iznos zavisi od mjesta i propisa koji ga utvrđuje. Tačan iznos za vaš objekat potvrđuje turistička zajednica.</p>
                <div className="mt-3"><Badge tone="gray">Iznose objavljuje Ministarstvo</Badge></div>
              </Card>
              <Card className="p-6">
                <p className="text-[16px] font-semibold text-[#171717]">Kategorizacija objekta</p>
                <p className="mt-2 text-[14px] text-[#525252]">Prije prijave gostiju objekat mora imati rješenje o kategorizaciji.</p>
                <div className="mt-4 flex flex-col gap-2">
                  <Link href="/e-usluge/obrasci/zahtjev-za-kategorizaciju" className="text-[14px] font-semibold text-[var(--br-700)] hover:underline">Zahtjev za kategorizaciju</Link>
                  <Link href="/registri/ugostiteljski-objekti" className="text-[14px] font-semibold text-[var(--br-700)] hover:underline">Registar kategoriziranih objekata</Link>
                </div>
              </Card>
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-[#fafafa] py-16 md:py-20">
        <Container>
          <Head k="Kontakt" t="Turističke zajednice" s="Za pristup prijava.ba, uplatu takse i pitanja o prijavi gostiju." action={<Link href="/registri/turisticke-zajednice" className="text-[14px] font-semibold text-[var(--br-700)] hover:underline">Cijeli upisnik</Link>} />
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {tz.items.map((e) => (
              <Link key={e.id} href={`/registri/turisticke-zajednice/${e.id}`} className="rounded-[12px] bg-white p-5 ring-1 ring-inset ring-[#e5e5e5] hover:shadow-[0_12px_16px_-4px_rgba(10,13,18,0.08)]">
                <Building07 size={20} className="text-[var(--br-600)]" />
                <p className="mt-3 text-[16px] font-semibold text-[#171717]">{e.data.naziv}</p>
                <p className="mt-1 text-[14px] text-[#525252]">{e.data.opcina}</p>
                <div className="mt-3">{e.data.status === 'Aktivna' ? <Badge tone="success" dot>Aktivna</Badge> : <Badge tone="gray">{e.data.status}</Badge>}</div>
              </Link>
            ))}
          </div>
          <p className="mt-4 text-[12px] text-[#737373]">Upisnik se dopunjava; kontakte i status potvrđuje Ministarstvo.</p>
        </Container>
      </section>

      <section className="bg-white py-16 md:py-20">
        <Container>
          <Head k="Pitanja" t="Najčešća pitanja" />
          <div className="mt-8">
            <Faq items={[
              { q: 'Da li Ministarstvo prima prijave gostiju?', a: 'Ne. Gosti se prijavljuju u prijava.ba, a sistem vode turističke zajednice. Ministarstvo vodi kategorizaciju objekata i nadzor.' },
              { q: 'Ko plaća boravišnu taksu?', a: 'Gost koji koristi smještaj izvan mjesta prebivališta, uz izuzetke i umanjenja koje propisuju važeći propisi. Smještajni objekat taksu naplaćuje i uplaćuje.' },
              { q: 'Koliko iznosi taksa?', a: 'Iznos zavisi od mjesta. Turistička zajednica na čijem je području objekat daje važeći iznos; Ministarstvo će ga objaviti i na ovoj stranici.' },
              { q: 'Kako dobiti pristup prijava.ba?', a: <>Obratite se turističkoj zajednici svog mjesta. Kontakti su u <Link className="font-medium text-[var(--br-700)] underline" href="/registri/turisticke-zajednice">upisniku turističkih zajednica</Link>.</> },
              { q: 'Šta ako objekat nema rješenje o kategorizaciji?', a: <>Prvo podnesite <Link className="font-medium text-[var(--br-700)] underline" href="/e-usluge/obrasci/zahtjev-za-kategorizaciju">zahtjev za kategorizaciju</Link>.</> },
            ]} />
          </div>
        </Container>
      </section>
    </>
  );
}
