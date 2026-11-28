/**
 * F2-06: višejezičnost. Izvorni sadržaj je na bosanskom (hrvatski i srpski ga čitaju bez prijevoda);
 * objave i životne situacije mogu imati prijevod na engleski (translations.en). Ćirilica se izvodi automatski.
 */
export const m0018_i18n = {
  id: '0018_i18n',
  up: `
ALTER TABLE posts ADD COLUMN IF NOT EXISTS "translations" jsonb NOT NULL DEFAULT '{}';
ALTER TABLE life_events ADD COLUMN IF NOT EXISTS "translations" jsonb NOT NULL DEFAULT '{}';
`,
};
