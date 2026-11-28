// F2-16: javni pozivi i sufinansiranje.
export type Phase = 'NACRT' | 'NAJAVLJEN' | 'OTVOREN' | 'ZATVOREN' | 'REZULTATI';
export const PHASE: Record<Phase, { label: string; tone: 'gray' | 'blue' | 'success' | 'warning' | 'brand' }> = {
  NACRT: { label: 'Nacrt', tone: 'gray' },
  NAJAVLJEN: { label: 'Najavljen', tone: 'blue' },
  OTVOREN: { label: 'Otvoren za prijave', tone: 'success' },
  ZATVOREN: { label: 'Zatvoren, u ocjeni', tone: 'warning' },
  REZULTATI: { label: 'Objavljeni rezultati', tone: 'brand' },
};
export type CallListItem = {
  slug: string; title: string; sector: string | null; summary: string; opensAt: string; closesAt: string;
  budget: number | null; maxAmount: number | null; phase: Phase; isDemo: boolean; awards?: number; awarded?: number | null;
};
export type PublicAward = { beneficiary: string; beneficiaryType: 'PRAVNO' | 'FIZICKO'; municipality: string | null; project: string; amount: number };
export type CallDetail = CallListItem & {
  body: string; eligibility: string; documents: { title: string; url: string }[]; legalBasis: string; contact: string; resultsNote: string;
  form: { slug: string; title: string; attachments: string; attachmentHint: string } | null; awards: PublicAward[]; applications: number; awarded: number;
};
export type Award = { id?: string; beneficiary: string; beneficiaryType: 'PRAVNO' | 'FIZICKO'; municipality: string | null; project: string; amount: number | null; caseId?: string | null };
export type CmsCall = {
  id: string; slug: string; title: string; sector: string | null; summary: string; body: string; eligibility: string; budget: number | null; maxAmount: number | null;
  opensAt: string; closesAt: string; formId: string | null; formTitle?: string | null; documents: { title: string; url: string }[]; legalBasis: string; contact: string;
  published: boolean; resultsPublished: boolean; resultsNote: string; isDemo: boolean; phase: Phase; applications?: number; awards?: number; awarded?: number | null; updatedAt: string;
};
export type CmsCallDetail = CmsCall & {
  awards: Award[];
  applications: { id: string; number: string; status: string; receivedAt: string; applicantName: string | null; municipality: string | null; project: string | null; requested: number | null }[];
};

/** Iznos u KM s tačkom za hiljade i zarezom za decimale (ne ovisi o jeziku preglednika). */
export const km = (n: number | null | undefined) => {
  if (n == null) return '—';
  const [i, d] = (Math.round(n * 100) / 100).toFixed(2).split('.');
  return `${i.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}${d === '00' ? '' : `,${d}`} KM`;
};
export const daysLeft = (iso: string) => Math.ceil((Date.parse(iso) - Date.now()) / 86400_000);
