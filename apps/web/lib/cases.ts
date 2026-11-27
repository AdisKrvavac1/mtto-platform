// F2-05: obrasci i predmeti (tipovi i prikaz za CMS i portal).
import type { RegField } from './registry';

export type CaseStatus = 'ZAPRIMLJEN' | 'U_OBRADI' | 'DOPUNA' | 'RIJESEN' | 'ODBIJEN';
export const CASE_STATUS: Record<CaseStatus, { label: string; tone: 'blue' | 'brand' | 'warning' | 'success' | 'error' }> = {
  ZAPRIMLJEN: { label: 'Zaprimljen', tone: 'blue' },
  U_OBRADI: { label: 'U obradi', tone: 'brand' },
  DOPUNA: { label: 'Čeka dopunu', tone: 'warning' },
  RIJESEN: { label: 'Riješen', tone: 'success' },
  ODBIJEN: { label: 'Odbijen', tone: 'error' },
};
/** Prelazi koje nudi sučelje (server ih svejedno provjerava). */
export const NEXT: Record<CaseStatus, CaseStatus[]> = {
  ZAPRIMLJEN: ['U_OBRADI', 'DOPUNA', 'RIJESEN', 'ODBIJEN'],
  U_OBRADI: ['DOPUNA', 'RIJESEN', 'ODBIJEN'],
  DOPUNA: ['U_OBRADI', 'RIJESEN', 'ODBIJEN'],
  RIJESEN: ['U_OBRADI'],
  ODBIJEN: ['U_OBRADI'],
};
export const ACTION_LABEL: Record<CaseStatus, string> = {
  ZAPRIMLJEN: 'Zaprimi', U_OBRADI: 'Počni obradu', DOPUNA: 'Traži dopunu', RIJESEN: 'Riješi', ODBIJEN: 'Odbij',
};
export const OPEN: CaseStatus[] = ['ZAPRIMLJEN', 'U_OBRADI', 'DOPUNA'];

export type PublicForm = {
  slug: string; title: string; description: string; sector: string | null; fields: RegField[]; slaDays: number;
  attachments: 'NE' | 'OPCIONO' | 'OBAVEZNO'; attachmentHint: string; legalBasis: string; isDemo: boolean;
};
export type CmsForm = PublicForm & { id: string; active: boolean; updatedAt: string; caseCount?: number; openCount?: number };

/** Dana do roka (negativno = prekoračen). */
export function daysLeft(due: string) {
  return Math.ceil((new Date(due).getTime() - Date.now()) / 86400_000);
}
