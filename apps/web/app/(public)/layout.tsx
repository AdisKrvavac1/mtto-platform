import SiteHeader, { type TopInfo } from '@/components/uui/SiteHeader';
import SiteFooter from '@/components/uui/SiteFooter';
import { apiSafe } from '@/lib/api';
import { EMPTY, aqiClass, type RiskSummary } from '@/lib/risk';

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const r = await apiSafe<RiskSummary>('/risk/summary', EMPTY);
  const mostar = r.air?.items.find((a) => a.key === 'mostar');
  const c = aqiClass(mostar?.aqi ?? null);
  const info: TopInfo = { aqi: mostar?.aqi ?? null, aqiLabel: c.label, aqiTone: c.tone, level: r.level };
  return (
    <div className="uui-theme bg-white text-[#525252]">
      <a href="#sadrzaj" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[80] focus:bg-white focus:px-4 focus:py-2 focus:rounded-lg focus:shadow">Preskoči na sadržaj</a>
      <SiteHeader info={info} />
      <main id="sadrzaj" className="w-full bg-white overflow-x-clip">{children}</main>
      <SiteFooter />
    </div>
  );
}
