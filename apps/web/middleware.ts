/**
 * F2-06: adrese s prefiksom jezika (/en/vijesti, /hr, /sr-cyrl/...) prikazuju istu stranicu na odabranom jeziku.
 * Middleware skida prefiks (rewrite), prenosi jezik u zaglavlju i pamti izbor u kolačiću, pa i obični linkovi
 * na portalu ostaju na izabranom jeziku. /bs vraća na bosanski.
 */
import { NextResponse, type NextRequest } from 'next/server';
import { LANG_COOKIE, byPrefix } from './lib/i18n';

export function middleware(req: NextRequest) {
  const [, first, ...rest] = req.nextUrl.pathname.split('/');
  const l = first ? byPrefix(first) : undefined;
  if (!l) return NextResponse.next();
  const url = req.nextUrl.clone();
  url.pathname = `/${rest.join('/')}`;
  const h = new Headers(req.headers);
  h.set('x-mtto-lang', l.code);
  const res = NextResponse.rewrite(url, { request: { headers: h } });
  res.cookies.set(LANG_COOKIE, l.code, { path: '/', maxAge: 365 * 86400, sameSite: 'lax', secure: req.nextUrl.protocol === 'https:' });
  return res;
}

export const config = { matcher: ['/((?!api|_next|admin|vendor|hero|favicon|.*\\..*).*)'] };
