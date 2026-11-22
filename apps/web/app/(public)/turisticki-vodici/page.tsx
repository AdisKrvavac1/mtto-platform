import Link from 'next/link';
import { apiSafe } from '@/lib/api';
import { Badge, Card, Container, FeaturedIcon, GRAD, HB1, HB2, Head, HeroInfo, PageHero, TableCard, th } from '@/components/uui';
import { Award01, BookOpen01, Building07, Compass03, Edit04, File06, Home03, Mail01, MessageChatCircle, Phone, SearchLg, Star01, Users01 } from '@untitledui/icons';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Turistički vodiči i kategorizacija' };

export default async function Page() {
  const stats = await apiSafe<{ facilities: number }>('/stats', { facilities: 0 });
  return (
    <>
      <PageHero
        crumbs={[{ label: 'Naslovna', href: '/' }, { label: 'Turizam i baština', href: '/turizam-i-bastina' }, { label: 'Turistički vodiči' }]}
        eyebrow="Sektor za turizam i ugostiteljstvo"
        title="Stručni ispiti, licenciranje vodiča i kategorizacija objekata"
        actions={<><Link href="/propisi?q=vodi" className={HB1}><File06 size={20} />Obrasci za ispit</Link><Link href="/registri/ugostiteljski-objekti" className={HB2}><Building07 size={20} />Registar objekata</Link></>}
        stats={[{ label: 'Kategoriziranih objekata', value: String(stats.facilities), icon: Building07 }, { label: 'Licencirani vodiči', value: 'Faza 2', icon: Users01 }, { label: 'Dijelova ispita', value: '3', icon: BookOpen01 }, { label: 'UNESCO lokaliteta', value: '2', icon: Award01 }]}
      >
        Kako položiti stručni ispit za turističkog vodiča, dobiti službenu iskaznicu i podnijeti zahtjev za kategorizaciju ugostiteljskog objekta u HNK.
      </PageHero>

      <section className="bg-white py-16 md:py-20">
        <Container>
          <Head k="Stručni ispit" t="Struktura ispita za turističkog vodiča" s="Ispit se polaže pred komisijom Ministarstva. Termini rokova objavljuju se među vijestima i javnim pozivima." />
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {([[Edit04, 'Pismeni dio', 'Test iz propisa o turizmu, kulturno-historijske baštine i geografije kantona.'], [MessageChatCircle, 'Usmeni dio', 'Razgovor pred komisijom o odabranim lokalitetima i pravilima struke.'], [Compass03, 'Praktični dio', 'Vođenje kraće ture na terenu uz ocjenu komunikacije i sadržaja.']] as const).map(([I, t, s]) => (
              <Card key={t} className="uui-lift p-6"><FeaturedIcon icon={I} tone="brand" size="md" ripple={false} /><h3 className="mt-5 text-[18px] font-semibold text-[#171717]">{t}</h3><p className="mt-2 text-[14px] text-[#525252]">{s}</p></Card>
            ))}
          </div>
          <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_400px]">
            <Card className="p-6">
              <h3 className="text-[18px] font-semibold text-[#171717]">Postupak prijave u četiri koraka</h3>
              <ol className="mt-5 grid gap-4 sm:grid-cols-2">
                {[['Prijava na ispit', 'Obrazac zahtjeva i dokaz o stručnoj spremi.'], ['Uplata takse', 'Prema važećem rješenju o naknadama.'], ['Polaganje ispita', 'Pismeni, usmeni i praktični dio.'], ['Izdavanje iskaznice', 'Upis u registar licenciranih vodiča.']].map(([t, s], i) => (
                  <li key={t} className="flex gap-3"><span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[var(--br-50)] text-[14px] font-semibold text-[var(--br-700)] ring-1 ring-inset ring-[var(--br-200)]">{i + 1}</span><span><b className="block text-[14px] font-semibold text-[#171717]">{t}</b><span className="text-[14px] text-[#525252]">{s}</span></span></li>
                ))}
              </ol>
            </Card>
            <div className={`rounded-[16px] p-6 text-white ${GRAD}`}>
              <Badge tone="success">Ispitni materijali</Badge>
              <p className="mt-3 text-[18px] font-semibold">Literatura i obrasci za pripremu</p>
              <p className="mt-1 text-[14px] text-[var(--br-100)]">Pravilnik, ispitna pitanja i obrazac prijave nalaze se u arhivi propisa.</p>
              <Link href="/propisi?q=vodi" className={`mt-5 w-full ${HB1}`}><File06 size={20} />Otvori propise i obrasce</Link>
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-[#fafafa] py-16 md:py-20">
        <Container>
          <Head k="Kategorizacija" t="Kategorizacija ugostiteljskih objekata" s="Rješenje o kategoriji izdaje Ministarstvo nakon pregleda objekta i minimalno-tehničkih uslova." />
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {([[Star01, 'Hoteli 4★ i 5★', 'Komisijski pregled, usklađenost sa standardima kvaliteta i sadržajima.'], [Building07, 'Hoteli 1★–3★, pansioni i moteli', 'Minimalni tehnički uslovi, sigurnost i sanitarni zahtjevi.'], [Home03, 'Kampovi, eko sela i kuće za odmor', 'Uslovi smještaja, priključci i zaštita okoliša.']] as const).map(([I, t, s]) => (
              <Card key={t} className="uui-lift p-6"><FeaturedIcon icon={I} tone="success" size="md" ripple={false} /><h3 className="mt-5 text-[18px] font-semibold text-[#171717]">{t}</h3><p className="mt-2 text-[14px] text-[#525252]">{s}</p></Card>
            ))}
          </div>
          <div className="mt-10">
            <TableCard title="Registar licenciranih turističkih vodiča" badge={<Badge tone="gray">Faza 2</Badge>} actions={<div className="flex h-10 items-center gap-2 rounded-[8px] bg-white px-3 opacity-60 ring-1 ring-inset ring-[#d4d4d4] md:w-[280px]"><SearchLg size={18} className="text-[#a3a3a3]" /><input disabled placeholder="Ime, jezik ili područje" aria-label="Pretraga (Faza 2)" className="min-w-0 flex-1 border-0 bg-transparent p-0 text-[14px] !shadow-none" /></div>}>
              <table className="w-full min-w-[720px]">
                <thead><tr><th className={th}>Broj iskaznice</th><th className={th}>Vodič</th><th className={th}>Jezici</th><th className={th}>Područje</th><th className={th}>Važi do</th></tr></thead>
                <tbody><tr><td colSpan={5} className="px-6 py-14 text-center"><p className="text-[16px] font-semibold text-[#171717]">Registar vodiča objavljuje se u Fazi 2</p><p className="mt-1 text-[14px] text-[#525252]">Podaci o licenciranim vodičima prenose se iz arhive Sektora za turizam.</p></td></tr></tbody>
              </table>
            </TableCard>
          </div>
        </Container>
      </section>

      <section className="bg-white py-16 md:py-20">
        <Container>
          <div className="flex flex-col gap-6 rounded-[16px] bg-[#fafafa] p-6 ring-1 ring-inset ring-[#e5e5e5] md:flex-row md:items-center md:justify-between md:p-8">
            <div className="flex items-center gap-4"><FeaturedIcon icon={MessageChatCircle} tone="brand" size="lg" /><div><p className="text-[18px] font-semibold text-[#171717]">Pitanje o ispitu ili kategorizaciji?</p><p className="text-[14px] text-[#525252]">Edina Jogunović, Sektor za turizam · radnim danima 08:00–16:00</p></div></div>
            <div className="flex flex-wrap gap-2"><a href="tel:+38736552498" className="inline-flex h-11 items-center gap-1.5 rounded-[8px] bg-white px-4 text-[16px] font-semibold text-[#404040] ring-1 ring-inset ring-[#d4d4d4] hover:bg-[#fafafa]"><Phone size={20} />036 552 498</a><a href="mailto:turizam@mtto.gov.ba" className="inline-flex h-11 items-center gap-1.5 rounded-[8px] bg-[var(--br-600)] px-4 text-[16px] font-semibold text-white hover:bg-[var(--br-700)]"><Mail01 size={20} />turizam@mtto.gov.ba</a></div>
          </div>
        </Container>
      </section>
    </>
  );
}
