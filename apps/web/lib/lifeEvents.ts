// F2-08: životne situacije.
export type LELink = { label: string; url: string };
export type LEStep = { title: string; text: string; links: LELink[] };
export type LifeEventItem = { slug: string; audience: 'GRADJANI' | 'PRIVREDA'; title: string; summary: string; icon: string; sector: string | null; verified: boolean; stepCount: number };
export type LifeEventDetail = Omit<LifeEventItem, 'stepCount'> & { steps: LEStep[]; links: LELink[]; contact: string; updatedAt: string; related: { slug: string; title: string; icon: string }[] };
export type CmsLifeEvent = LifeEventDetail & { id: string; keywords: string; position: number; published: boolean };
export const AUDIENCE = { GRADJANI: 'Za građane', PRIVREDA: 'Za privredu' } as const;
