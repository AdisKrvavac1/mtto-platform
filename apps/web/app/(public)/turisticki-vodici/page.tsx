import { GuidesF2 } from '@/components/stitch/Guides';
import { apiSafe } from '@/lib/api';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Turistički vodiči' };

export default async function Page() {
  const stats = await apiSafe<{ facilities: number }>('/stats', { facilities: 0 });
  return <GuidesF2 facilities={stats.facilities.toLocaleString('bs-BA')} />;
}
