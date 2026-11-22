'use client';
import type { ReactNode } from 'react';
import { Badge, Card, CardHeader, FeaturedIcon, PageTitle } from '@/components/admin/ui';
import { Clock } from '@untitledui/icons';

type Icon = React.FC<React.SVGProps<SVGSVGElement> & { size?: number }>;

/** Ekran funkcionalnosti iz Faze 2 (Untitled UI): opis modula, planirane mogućnosti i koraci uvođenja. */
export default function F2Page({ title, sub, icon, features, steps, children }: { title: string; sub: string; icon: Icon; features: [Icon, string, string][]; steps: string[]; children?: ReactNode }) {
  return (
    <>
      <PageTitle kicker={sub} crumbs={[title]} title={title} badge={<Badge tone="gray"><Clock size={12} className="mr-0.5 text-[#a3a3a3]" />Faza 2</Badge>} />
      <Card className="overflow-hidden">
        <div className="flex flex-col gap-6 p-6 md:flex-row md:items-center md:p-8">
          <FeaturedIcon icon={icon} tone="brand" size="xl" />
          <div className="max-w-[720px]">
            <h2 className="text-[20px] leading-[30px] font-semibold text-[#171717]">Modul se uvodi u Fazi 2</h2>
            <p className="mt-1 text-[16px] leading-6 text-[#525252]">Ekran prikazuje planirani opseg. Podaci se ne unose dok modul ne bude povezan s bazom i ulogama korisnika.</p>
          </div>
        </div>
      </Card>
      <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {features.map(([I, t, d]) => (
          <Card key={t} className="p-5 md:p-6">
            <FeaturedIcon icon={I} size="md" />
            <h3 className="mt-4 text-[16px] leading-6 font-semibold text-[#171717]">{t}</h3>
            <p className="mt-1 text-[14px] leading-5 text-[#525252]">{d}</p>
          </Card>
        ))}
      </div>
      <Card className="mt-6">
        <CardHeader title="Koraci uvođenja" />
        <ol className="flex flex-col gap-0 p-4 md:p-6">
          {steps.map((s, i) => (
            <li key={s} className="flex gap-4">
              <span className="flex flex-col items-center"><span className="flex size-8 items-center justify-center rounded-full bg-[#f9f5ff] text-[14px] font-semibold text-[#7f56d9] ring-1 ring-inset ring-[#e9d7fe]">{i + 1}</span>{i < steps.length - 1 && <span className="my-1 w-0.5 flex-1 rounded bg-[#e5e5e5]" />}</span>
              <p className="pb-6 pt-1 text-[14px] leading-5 text-[#404040]">{s}</p>
            </li>
          ))}
        </ol>
      </Card>
      {children}
    </>
  );
}
