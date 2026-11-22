import Link from 'next/link';
import { Badge, Card, Container, FeaturedIcon, GRAD, HB1, HB2, Head, PageHero, HeroInfo, TableCard, td, th } from '@/components/uui';
import { AlertTriangle, Database01, Download01, File06, FileCheck02, Mail01, Package, Phone, SearchLg, Trash01, Truck01 } from '@untitledui/icons';

export const metadata = { title: 'Registar dozvola za upravljanje otpadom' };

const KINDS = [
  [Truck01, 'Sakupljanje i prijevoz', 'Komunalni i industrijski otpad, uključujući posebne tokove (gume, ambalaža, ulja).'],
  [Package, 'Privremeno skladištenje', 'Skladišta i pretovarne stanice do predaje ovlaštenom obrađivaču.'],
  [FileCheck02, 'Obrada i reciklaža', 'Postrojenja za oporabu materijala i pripremu za ponovnu upotrebu.'],
  [Trash01, 'Zbrinjavanje', 'Regionalne i općinske deponije te postrojenja za konačno zbrinjavanje.'],
] as const;

export default function Page() {
  return (
    <>
      <PageHero
        crumbs={[{ label: 'Naslovna', href: '/' }, { label: 'E-usluge', href: '/e-usluge' }, { label: 'Upravljanje otpadom' }]}
        eyebrow="Službeni registar operatera · Faza 2"
        title="Registar dozvola za upravljanje otpadom"
        actions={<><Link href="/propisi?q=otpad" className={HB1}><File06 size={20} />Propisi i obrasci</Link><Link href="/eko-rizik/prijava?vrsta=DEPONIJA" className={HB2}><AlertTriangle size={20} />Prijavi divlju deponiju</Link></>}
        aside={<HeroInfo icon={Database01} label="Status registra" value="Faza 2">Evidencija se prenosi iz arhive Sektora za zaštitu okoliša i objavljuje nakon provjere podataka.</HeroInfo>}
      >
        Javna evidencija pravnih lica s dozvolom za sakupljanje, skladištenje, obradu i zbrinjavanje opasnog i neopasnog otpada na području Hercegovačko-neretvanskog kantona.
      </PageHero>

      <section className="bg-white py-16 md:py-20">
        <Container>
          <Head k="Vrste dozvola" t="Šta registar obuhvata" s="Dozvole se izdaju po djelatnosti. Svaki operater u registru imat će dosje s rješenjem, rokom važenja i lokacijom." />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {KINDS.map(([I, t, s]) => (
              <Card key={t} className="uui-lift p-6"><FeaturedIcon icon={I} tone="brand" size="md" ripple={false} /><h3 className="mt-5 text-[18px] font-semibold text-[#171717]">{t}</h3><p className="mt-2 text-[14px] leading-5 text-[#525252]">{s}</p></Card>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-[#fafafa] py-16 md:py-20">
        <Container>
          <TableCard title="Operateri s važećom dozvolom" badge={<Badge tone="gray">Faza 2</Badge>} actions={
            <div className="flex h-10 items-center gap-2 rounded-[8px] bg-white px-3 opacity-60 ring-1 ring-inset ring-[#d4d4d4] md:w-[300px]"><SearchLg size={18} className="text-[#a3a3a3]" /><input disabled placeholder="Operater, općina ili vrsta otpada" aria-label="Pretraga (Faza 2)" className="min-w-0 flex-1 border-0 bg-transparent p-0 text-[14px] !shadow-none" /></div>
          }>
            <table className="w-full min-w-[820px]">
              <thead><tr><th className={th}>Broj dozvole</th><th className={th}>Operater</th><th className={th}>Djelatnost</th><th className={th}>Općina</th><th className={th}>Važi do</th><th className={th}>Status</th></tr></thead>
              <tbody><tr><td colSpan={6} className="px-6 py-16 text-center">
                <div className="mx-auto flex max-w-[420px] flex-col items-center"><FeaturedIcon icon={Database01} tone="brand" size="lg" /><p className="mt-4 text-[16px] font-semibold text-[#171717]">Registar se puni u Fazi 2</p><p className="mt-1 text-[14px] text-[#525252]">Do objave podataka informacije o operaterima dobijate od Sektora za zaštitu okoliša.</p></div>
              </td></tr></tbody>
            </table>
          </TableCard>
        </Container>
      </section>

      <section className="bg-white py-16 md:py-20">
        <Container className="grid gap-8 lg:grid-cols-[1fr_400px]">
          <div>
            <Head k="Postupak" t="Kako do dozvole za upravljanje otpadom" />
            <ol className="mt-8 flex flex-col gap-4">
              {[['Zahtjev i plan upravljanja otpadom', 'Podnosi se Ministarstvu s opisom djelatnosti, lokacije, vrsta i količina otpada.'], ['Provjera i očevid', 'Stručna služba provjerava dokumentaciju i, po potrebi, obilazi lokaciju.'], ['Rješenje i upis u registar', 'Izdano rješenje se objavljuje u registru s rokom važenja i uslovima.']].map(([t, s], i) => (
                <li key={t} className="flex gap-4 rounded-[12px] bg-white p-5 ring-1 ring-inset ring-[#e5e5e5]"><span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[var(--br-50)] text-[16px] font-semibold text-[var(--br-700)] ring-1 ring-inset ring-[var(--br-200)]">{i + 1}</span><span><b className="block text-[16px] font-semibold text-[#171717]">{t}</b><span className="text-[14px] text-[#525252]">{s}</span></span></li>
              ))}
            </ol>
          </div>
          <div className={`self-start rounded-[16px] p-6 text-white ${GRAD}`}>
            <p className="text-[12px] font-semibold text-[var(--gr-300)]">Sektor za zaštitu okoliša</p>
            <p className="mt-2 text-[20px] font-semibold">dr. sc. Zejnil Trešnjo</p>
            <p className="text-[14px] text-[var(--br-100)]">Pomoćnik ministra</p>
            <div className="mt-5 flex flex-col gap-2">
              <a href="tel:+38736551324" className={HB2}><Phone size={20} />036 551 324</a>
              <a href="mailto:info@mtto.gov.ba" className={HB1}><Mail01 size={20} />info@mtto.gov.ba</a>
              <Link href="/propisi" className="mt-2 inline-flex items-center gap-1.5 text-[14px] font-semibold text-[var(--gr-300)]"><Download01 size={16} />Obrasci za zahtjev</Link>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
