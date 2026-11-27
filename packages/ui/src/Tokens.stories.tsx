import type { Meta, StoryObj } from '@storybook/react-vite';
import { tokens } from './tokens';

const meta: Meta = { title: 'Tokeni/Pregled', parameters: { layout: 'padded' } };
export default meta;

const Swatches = ({ scale }: { scale: keyof typeof tokens.color }) => (
  <section className="mb-8">
    <h2 className="mb-3 text-[16px] font-semibold">{scale}</h2>
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
      {Object.entries(tokens.color[scale]).map(([k, v]) => (
        <li key={k} className="overflow-hidden rounded-[12px] ring-1 ring-inset ring-[#e5e5e5]">
          <span className="block h-14" style={{ background: v as string }} />
          <span className="block px-3 py-2 text-[12px] leading-[18px] text-[#525252]"><strong className="block text-[#171717]">--mtto-{scale}-{k}</strong>{v as string}</span>
        </li>
      ))}
    </ul>
  </section>
);

export const Boje: StoryObj = { render: () => <div>{(Object.keys(tokens.color) as (keyof typeof tokens.color)[]).map((s) => <Swatches key={s} scale={s} />)}</div> };

export const Tipografija: StoryObj = {
  render: () => (
    <ul className="space-y-4">
      {Object.entries(tokens.text).map(([k, [size, lh]]) => (
        <li key={k} className="flex items-baseline gap-6"><span className="w-28 shrink-0 text-[12px] text-[#525252]">{k}<br />{size} / {lh}</span><span style={{ fontSize: size, lineHeight: lh }} className="font-semibold text-[#171717]">Hercegovina, Neretva i Buna</span></li>
      ))}
    </ul>
  ),
};

export const RadijusiISjene: StoryObj = {
  name: 'Radijusi i sjene',
  render: () => (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-4">{Object.entries(tokens.radius).map(([k, v]) => <div key={k} className="flex size-24 items-end bg-[#f5f5f5] p-2 text-[12px] text-[#404040] ring-1 ring-inset ring-[#d4d4d4]" style={{ borderRadius: v }}>{k}<br />{v}</div>)}</div>
      <div className="flex flex-wrap gap-6">{Object.entries(tokens.shadow).map(([k, v]) => <div key={k} className="flex size-32 items-end rounded-[12px] bg-white p-3 text-[12px] text-[#404040]" style={{ boxShadow: v }}>{k}</div>)}</div>
    </div>
  ),
};
