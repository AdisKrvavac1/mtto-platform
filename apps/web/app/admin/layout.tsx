import CmsShell from '@/components/admin/CmsShell';

export const metadata = { title: 'CMS', robots: { index: false, follow: false } };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <CmsShell>{children}</CmsShell>;
}
