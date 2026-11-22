import SiteHeader from '@/components/uui/SiteHeader';
import SiteFooter from '@/components/uui/SiteFooter';
import WidthGuard from '@/components/site/WidthGuard';
import { Suspense } from 'react';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="uui-theme bg-white text-[#525252]">
      <a href="#sadrzaj" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[60] focus:bg-white focus:px-4 focus:py-2 focus:rounded-lg focus:shadow">Preskoči na sadržaj</a>
      <SiteHeader />
      <main id="sadrzaj" className="w-full bg-white overflow-x-clip">{children}</main>
      <SiteFooter />
      <Suspense fallback={null}><WidthGuard /></Suspense>
    </div>
  );
}
