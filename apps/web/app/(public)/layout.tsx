import { Suspense } from 'react';
import { SiteHeader } from '@/components/stitch/SiteHeader';
import { SiteFooter } from '@/components/stitch/SiteFooter';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Suspense fallback={<div className="h-[152px]" />}>
        <SiteHeader />
      </Suspense>
      <main className="w-full pt-[152px] bg-background">{children}</main>
      <SiteFooter />
    </>
  );
}
