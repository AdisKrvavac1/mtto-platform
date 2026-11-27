import type { Meta, StoryObj } from '@storybook/react-vite';
import { ArrowRight, Download01, Globe01, Map01 } from '@untitledui/icons';
import { Badge, BadgeGroup, Button, Card, CategoryBadge, CtaBox, Faq, Feature, FeaturedIcon, FileTypeIcon, Metric, PageHeader, SectionHeader, TableCard, Tag, td, th } from './portal';

const meta: Meta = { title: 'Portal/Komponente', parameters: { theme: 'portal' } };
export default meta;
type S = StoryObj;

export const Dugmad: S = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button>Primarno</Button>
      <Button variant="secondary" icon={Download01}>Preuzmi</Button>
      <Button variant="secondary-color">Sekundarno u boji</Button>
      <Button variant="tertiary">Tercijarno</Button>
      <Button variant="link" iconRight={ArrowRight}>Saznaj više</Button>
      <Button size="lg">Veliko</Button>
      <Button disabled>Onemogućeno</Button>
    </div>
  ),
};

export const Znacke: S = {
  name: 'Značke',
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      {(['gray', 'brand', 'success', 'warning', 'error', 'blue'] as const).map((t) => <Badge key={t} tone={t} dot>{t}</Badge>)}
      <BadgeGroup label="Novo">Prijava eko-problema je dostupna</BadgeGroup>
      <CategoryBadge name="Turizam" /><CategoryBadge name="Zaštita okoliša" /><Tag dot="#17b26a" count={12}>Okoliš</Tag>
    </div>
  ),
};

export const IstaknuteIkone: S = {
  name: 'Istaknute ikone',
  render: () => <div className="flex gap-6">{(['modern', 'brand', 'success', 'warning', 'error'] as const).map((t) => <FeaturedIcon key={t} icon={Globe01} tone={t} />)}</div>,
};

export const Zaglavlja: S = {
  render: () => (
    <div className="space-y-12">
      <PageHeader eyebrow="Zaštita okoliša" title="Okolišne dozvole" crumbs={[{ label: 'Početna', href: '/' }, { label: 'Registri' }]}>Javni registar izdatih okolišnih dozvola u HNK.</PageHeader>
      <SectionHeader eyebrow="Turizam" title="Turistički vodiči" actions={<Button variant="secondary">Svi vodiči</Button>}>Licencirani vodiči za Hercegovinu.</SectionHeader>
    </div>
  ),
};

export const KarticeIMetrike: S = {
  name: 'Kartice i metrike',
  render: () => (
    <div className="grid gap-6 md:grid-cols-3">
      <Feature icon={Map01} title="Karta lokacija" href="/mapa">Zaštićena područja, objekti i dozvole na jednoj karti.</Feature>
      <Card className="p-6"><Metric value="4.401 km²" label="Površina kantona" /></Card>
      <Card className="p-6"><FileTypeIcon ext="pdf" /><p className="mt-3 text-[14px] text-[#525252]">Pravilnik o turističkoj taksi (PDF)</p></Card>
    </div>
  ),
};

export const Tabela: S = {
  render: () => (
    <TableCard title="Ugostiteljski objekti" badge={<Badge tone="brand">3 zapisa</Badge>} description="Demo podaci.">
      <table className="w-full">
        <thead><tr><th className={th}>Naziv</th><th className={th}>Općina</th><th className={th}>Status</th></tr></thead>
        <tbody>
          {[['Hotel Primjer (demo)', 'Mostar', 'success'], ['Pansion Buna (demo)', 'Blagaj', 'warning'], ['Kamp Neretva (demo)', 'Čapljina', 'gray']].map(([n, o, t]) => (
            <tr key={n}><td className={td}>{n}</td><td className={td}>{o}</td><td className={td}><Badge tone={t as 'success'} dot>{t === 'success' ? 'Važeće' : t === 'warning' ? 'U obnovi' : 'Arhivirano'}</Badge></td></tr>
          ))}
        </tbody>
      </table>
    </TableCard>
  ),
};

export const PozivIPitanja: S = {
  name: 'Poziv na akciju i pitanja',
  render: () => (
    <div className="space-y-10">
      <CtaBox title="Prijavite eko-problem" actions={<Button>Nova prijava</Button>}>Divlja deponija, zagađenje vode ili klizište: prijava ide direktno inspekciji.</CtaBox>
      <Faq items={[{ q: 'Ko izdaje okolišnu dozvolu?', a: 'Ministarstvo, za pogone iz svoje nadležnosti.' }, { q: 'Koliko traje postupak?', a: 'Rokovi zavise od vrste pogona.' }]} />
    </div>
  ),
};
