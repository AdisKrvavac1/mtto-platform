import SiteHeader, { type TopInfo } from '@/components/uui/SiteHeader';
import SiteFooter from '@/components/uui/SiteFooter';
import { Cyrillic } from '@/components/site/Cyrillic';
import { apiSafe } from '@/lib/api';
import { t } from '@/lib/i18n';
import { getLang } from '@/lib/lang.server';
import { EMPTY, aqiClass, type RiskSummary } from '@/lib/risk';

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const [r, lang] = await Promise.all([apiSafe<RiskSummary>('/risk/summary', EMPTY), getLang()]);
  const mostar = r.air?.items.find((a) => a.key === 'mostar');
  const c = aqiClass(mostar?.aqi ?? null);
  const info: TopInfo = { aqi: mostar?.aqi ?? null, aqiLabel: c.label, aqiTone: c.tone, level: r.level };
  return (
    <div className="uui-theme bg-white text-[#525252]">
      <a href="#sadrzaj" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[80] focus:bg-white focus:px-4 focus:py-2 focus:rounded-lg focus:shadow">{t(lang, 'Preskoči na sadržaj')}</a>
      <SiteHeader info={info} lang={lang} />
      <main id="sadrzaj" className="w-full bg-white overflow-x-clip">{children}</main>
      <SiteFooter lang={lang} />
      {lang === 'sr-Cyrl' && <Cyrillic />}
    </div>
  );
}
