import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Announcement01, Plus } from '@untitledui/icons';
import { Avatar, Badge, BarChart, ButtonGroup, Card, CardHeader, EmptyState, Field, MetricCard, PageTitle, ProgressBar, StatusChip, Tabs, Toast, btnDanger, btnPrimary, btnSecondary, btnTertiary, input } from './cms';

const meta: Meta = { title: 'CMS/Komponente', parameters: { theme: 'cms' } };
export default meta;
type S = StoryObj;

export const Dugmad: S = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      <button type="button" className={btnPrimary}><Plus />Nova objava</button>
      <button type="button" className={btnSecondary}>Odustani</button>
      <button type="button" className={btnTertiary}>Više</button>
      <button type="button" className={btnDanger}>Obriši</button>
      <button type="button" className={btnPrimary} disabled>Spremanje…</button>
    </div>
  ),
};

export const Obrazac: S = {
  render: () => (
    <div className="max-w-[480px] space-y-5">
      <Field label="Naslov" required><input className={input} defaultValue="Javni poziv za turističke manifestacije 2027" /></Field>
      <Field label="Sažetak" hint="Do 200 znakova, prikazuje se na listi vijesti."><textarea className={input} rows={3} /></Field>
      <Field label="Kategorija"><select className={input}><option>Turizam</option><option>Zaštita okoliša</option></select></Field>
    </div>
  ),
};

export const StatusiIZnacke: S = {
  name: 'Statusi i značke',
  render: () => <div className="flex flex-wrap gap-3">{['OBJAVLJENO', 'NACRT', 'ZAKAZANO', 'VAZECA', 'U_OBNOVI', 'ISTEKLA'].map((s) => <StatusChip key={s} status={s} />)}<Badge tone="brand">Samo administrator</Badge></div>,
};

export const Kartice: S = {
  render: () => (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-3">
        <MetricCard title="Objavljeno" value={42} trend={12} spark={[3, 5, 4, 8, 6, 9, 12]} />
        <MetricCard title="Okolišne dozvole" value={9} footer={<span className="text-[#b42318]">2 ističu u 60 dana</span>} />
        <MetricCard title="Prijave građana" value={7} trend={-4} />
      </div>
      <Card>
        <CardHeader title="Objave po mjesecima" badge={<Badge tone="gray">12 mjeseci</Badge>} description="Vijesti, javni pozivi i saopćenja." />
        <div className="p-6"><BarChart labels={['Jul', 'Aug', 'Sep', 'Okt', 'Nov']} series={[{ name: 'Vijesti', data: [3, 5, 2, 6, 8], color: '#7f56d9' }, { name: 'Pozivi', data: [1, 0, 2, 1, 3], color: '#b692f6' }]} /></div>
      </Card>
    </div>
  ),
};

export const Navigacija: S = {
  render: function Render() {
    const [tab, setTab] = useState<'sve' | 'objavljeno' | 'nacrti'>('sve');
    const [range, setRange] = useState<'12' | '6' | '3'>('12');
    return (
      <div className="space-y-6">
        <PageTitle kicker="Vijesti, javni pozivi i saopćenja." crumbs={['Objave i vijesti']} title="Objave i vijesti" />
        <Tabs value={tab} onChange={setTab} items={[{ value: 'sve', label: 'Sve', count: 48 }, { value: 'objavljeno', label: 'Objavljeno', count: 42 }, { value: 'nacrti', label: 'Nacrti', count: 6 }]} />
        <ButtonGroup value={range} onChange={setRange} items={[{ value: '12', label: '12 mjeseci' }, { value: '6', label: '6 mjeseci' }, { value: '3', label: '3 mjeseca' }]} />
      </div>
    );
  },
};

export const PrazanIOstalo: S = {
  name: 'Prazno stanje, avatar, napredak',
  render: () => (
    <div className="space-y-8">
      <Card><EmptyState icon={Announcement01} title="Još nema objava" action={<button type="button" className={btnPrimary}><Plus />Nova objava</button>}>Prva objava pojavit će se ovdje.</EmptyState></Card>
      <div className="flex items-center gap-4"><Avatar name="Amra Test" /><Avatar name="Urednik MTTO" online /><div className="w-64"><ProgressBar value={64} /></div></div>
      <Toast msg="Objava je spremljena" onDone={() => {}} />
    </div>
  ),
};
