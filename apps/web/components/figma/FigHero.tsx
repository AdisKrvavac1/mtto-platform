/* Zaglavlje podstranice prema Figma okviru "Službeni propisi" (20:666). */
const Icon = ({ n, size = 16, cls = '' }: { n: string; size?: number; cls?: string }) => (
  <span aria-hidden className={`material-symbols-outlined shrink-0 leading-none ${cls}`} style={{ fontSize: size }}>{n}</span>
);

export type HeroStat = { label: string; value: React.ReactNode; note: string; icon: string };

export function FigHero({ icon, kicker, title, lead, badge, stats, children }: {
  icon: string; kicker: string; title: string; lead: string;
  badge?: { label: string; value: React.ReactNode; icon?: string };
  stats?: HeroStat[]; children?: React.ReactNode;
}) {
  return (
    <section className="bg-[#062343] flex flex-col overflow-clip py-[32px] md:py-[40px] relative w-full">
      <div aria-hidden className="absolute bg-[#0a3663] blur-[64px] opacity-40 right-[-96px] rounded-[12px] size-[384px] top-[-96px]" />
      <div aria-hidden className="absolute bg-[#006c4a] blur-[64px] bottom-0 h-[320px] left-[33.33%] opacity-20 right-[41.67%] rounded-[12px]" />
      <div className="flex flex-col gap-[32px] md:gap-[40px] px-4 md:px-[24px] relative w-full">
        <div className="flex flex-col lg:flex-row gap-6 items-start lg:justify-between w-full">
          <div className="flex flex-col gap-[16px] items-start max-w-[768px]">
            <div className="bg-[#0a3663] flex gap-[4px] items-center px-[12px] py-[4px] rounded-[2px]">
              <Icon n={icon} size={15} cls="text-[#85f8c4]" />
              <span className="font-space font-bold text-[#85f8c4] text-[12px] tracking-[0.96px] uppercase leading-[16px]">{kicker}</span>
            </div>
            <h1 className="font-pub font-bold text-[30px] md:text-[38px] lg:text-[48px] text-white tracking-[-0.9px] leading-[1.25]">{title}</h1>
            <p className="font-rob text-[16px] md:text-[18px] text-white leading-[1.6] max-w-[720px]">{lead}</p>
          </div>
          {badge && (
            <div className="backdrop-blur-[8px] bg-[rgba(10,54,99,0.8)] flex gap-[16px] items-center px-[16px] py-[12px] rounded-[8px] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.1)] shrink-0">
              <div className="bg-[#006c4a] flex items-center justify-center rounded-[4px] size-[40px]"><Icon n={badge.icon ?? 'verified'} size={24} cls="text-[#a6c8fe]" /></div>
              <div className="flex flex-col">
                <span className="font-pub font-bold text-[#a6c8fe] text-[11px] tracking-[0.44px] uppercase leading-[14px]">{badge.label}</span>
                <span className="font-pub font-bold text-[18px] text-white leading-[26px]">{badge.value}</span>
              </div>
            </div>
          )}
        </div>
        {children}
        {stats && stats.length > 0 && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-[12px] md:gap-[16px] w-full">
            {stats.map((s) => (
              <div key={s.label} className="backdrop-blur-[8px] bg-[rgba(10,54,99,0.5)] flex flex-col gap-[4px] pb-[20px] pt-[16px] px-[16px] rounded-[8px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]">
                <div className="flex items-center justify-between w-full gap-2"><span className="font-pub text-[#a6c8fe] text-[13px] leading-[20px]">{s.label}</span><Icon n={s.icon} size={20} cls="text-[#85f8c4]" /></div>
                <span className="font-pub font-bold text-[24px] text-white tracking-[-0.24px] leading-[32px]">{s.value}</span>
                <span className="font-pub font-bold text-[#85f8c4] text-[11px] tracking-[0.44px] leading-[14px]">{s.note}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
