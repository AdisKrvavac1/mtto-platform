'use client';
import { daysLeft } from '@/lib/cases';
import { dateShort } from '@/lib/format';

/** Rok predmeta: preostali dani, kašnjenje ili datum zatvaranja. */
export function Due({ c }: { c: { status: string; dueAt: string; closedAt: string | null } }) {
  if (c.closedAt) return <span className="text-[#525252]">Zatvoren {dateShort(c.closedAt)}</span>;
  const d = daysLeft(c.dueAt);
  if (c.status === 'DOPUNA') return <span className="text-[#525252]">Rok miruje</span>;
  return <span className={d < 0 ? 'font-medium text-[#b42318]' : d <= 3 ? 'font-medium text-[#b54708]' : 'text-[#525252]'}>{d < 0 ? `Kasni ${-d} d.` : d === 0 ? 'Danas' : `Još ${d} d.`}<span className="block text-[12px] font-normal text-[#737373]">{dateShort(c.dueAt)}</span></span>;
}

