import { Suspense } from 'react';
import { SiteHeader } from '@/components/figma/SiteHeader';
import { SiteFooter } from '@/components/figma/SiteFooter';
import WidthGuard from '@/components/site/WidthGuard';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a href="#sadrzaj" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[60] focus:bg-white focus:px-4 focus:py-2 focus:rounded-lg focus:shadow">Preskoči na sadržaj</a>
      <div data-fx-root className="contents">
        <Suspense fallback={<div className="h-[92px] lg:h-[170px]" />}>
          <SiteHeader />
        </Suspense>
      </div>
      <main id="sadrzaj" className="w-full bg-[#f8f9ff] overflow-x-clip">{children}</main>
      <div data-fx-root className="contents">
        <SiteFooter />
      </div>
      <Suspense fallback={null}><WidthGuard /></Suspense>
    </>
  );
}
