import { cookies, headers } from 'next/headers';
import { DEFAULT_LANG, LANG_COOKIE, isLang, type Lang } from './i18n';

/** Jezik zahtjeva: prefiks u adresi (middleware ga prenosi u x-mtto-lang) ili kolačić izbora. */
export async function getLang(): Promise<Lang> {
  const h = (await headers()).get('x-mtto-lang');
  if (isLang(h)) return h;
  const c = (await cookies()).get(LANG_COOKIE)?.value;
  return isLang(c) ? c : DEFAULT_LANG;
}
