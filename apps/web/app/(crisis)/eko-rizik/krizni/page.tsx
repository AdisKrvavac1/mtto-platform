import { apiSafe } from '@/lib/api';
import { EMPTY, type RiskSummary } from '@/lib/risk';
import CrisisBoard from '@/components/risk/CrisisBoard';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Krizni prikaz – Eko-rizik HNK', robots: { index: false } };

export default async function KrizniPage() {
  const d = await apiSafe<RiskSummary>('/risk/summary', EMPTY);
  return <CrisisBoard initial={d} />;
}
