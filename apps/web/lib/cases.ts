// F2-05: obrasci i predmeti (tipovi i prikaz za CMS i portal).
import type { RegField } from './registry';

export type CaseStatus = 'ZAPRIMLJEN' | 'U_OBRADI' | 'DOPUNA' | 'RIJESEN' | 'ODBIJEN' | 'PROSLIJEDJEN';
export const CASE_STATUS: Record<CaseStatus, { label: string; tone: 'blue' | 'brand' | 'warning' | 'success' | 'error' | 'gray' }> = {
  ZAPRIMLJEN: { label: 'Zaprimljen', tone: 'blue' },
  U_OBRADI: { label: 'U obradi', tone: 'brand' },
  DOPUNA: { label: 'Čeka dopunu', tone: 'warning' },
  RIJESEN: { label: 'Riješen', tone: 'success' },
  ODBIJEN: { label: 'Odbijen', tone: 'error' },
  PROSLIJEDJEN: { label: 'Proslijeđen', tone: 'gray' },
};
/** Prelazi koje nudi sučelje (server ih svejedno provjerava). */
export const NEXT: Record<CaseStatus, CaseStatus[]> = {
  ZAPRIMLJEN: ['U_OBRADI', 'DOPUNA', 'RIJESEN', 'ODBIJEN', 'PROSLIJEDJEN'],
  U_OBRADI: ['DOPUNA', 'RIJESEN', 'ODBIJEN', 'PROSLIJEDJEN'],
  DOPUNA: ['U_OBRADI', 'RIJESEN', 'ODBIJEN', 'PROSLIJEDJEN'],
  RIJESEN: ['U_OBRADI'],
  ODBIJEN: ['U_OBRADI'],
  PROSLIJEDJEN: ['U_OBRADI'],
};
export const ACTION_LABEL: Record<CaseStatus, string> = {
  ZAPRIMLJEN: 'Zaprimi', U_OBRADI: 'Počni obradu', DOPUNA: 'Traži dopunu', RIJESEN: 'Riješi', ODBIJEN: 'Odbij', PROSLIJEDJEN: 'Proslijedi nadležnom',
};
export const OPEN: CaseStatus[] = ['ZAPRIMLJEN', 'U_OBRADI', 'DOPUNA'];

export type PublicForm = {
  slug: string; title: string; description: string; sector: string | null; fields: RegField[]; slaDays: number;
  attachments: 'NE' | 'OPCIONO' | 'OBAVEZNO'; attachmentHint: string; legalBasis: string; isDemo: boolean;
  allowAnonymous?: boolean; protectIdentity?: boolean;
  /** F2-16: obrazac javnog poziva */
  call?: { slug: string; title: string; opensAt: string; closesAt: string; phase: string } | null;
};
export type Route = { field: string; equals: string; sector: string | null; label: string };
export type CmsForm = PublicForm & { id: string; active: boolean; updatedAt: string; caseCount?: number; openCount?: number; routing?: Route[] };

/** Dana do roka (negativno = prekoračen). */
export function daysLeft(due: string) {
  return Math.ceil((new Date(due).getTime() - Date.now()) / 86400_000);
}
