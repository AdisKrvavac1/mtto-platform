import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import * as Sentry from '@sentry/node';
import { randomUUID } from 'crypto';

/**
 * F1-06: nadzor grešaka.
 * - Svaki zahtjev dobija X-Request-Id (ili zadržava onaj iz proxyja), koji se vidi u logu i u odgovoru.
 * - Greške se logiraju kao JSON red (Render logovi), bez tijela zahtjeva, kolačića i tokena.
 * - Ako je SENTRY_DSN postavljen (preporuka: EU region, de.sentry.io), neočekivane greške (5xx) idu i u Sentry.
 */
export const sentryOn = () => !!process.env.SENTRY_DSN;

export function initSentry() {
  if (!sentryOn()) return;
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.SENTRY_ENV ?? (process.env.RENDER ? 'production' : 'local'),
    release: process.env.RENDER_GIT_COMMIT,
    tracesSampleRate: 0,
    beforeSend(event) {
      if (event.request) {
        delete event.request.data;
        delete event.request.cookies;
        if (event.request.headers) {
          for (const h of Object.keys(event.request.headers)) if (/authorization|cookie|x-forwarded-for/i.test(h)) delete event.request.headers[h];
        }
      }
      delete event.user;
      return event;
    },
  });
}

export function requestId(req: any, res: any, next: () => void) {
  const incoming = String(req.headers['x-request-id'] ?? '');
  req.id = /^[\w-]{8,64}$/.test(incoming) ? incoming : randomUUID();
  res.setHeader('X-Request-Id', req.id);
  next();
}

export function logJson(level: 'info' | 'warn' | 'error', msg: string, extra: Record<string, unknown> = {}) {
  const line = JSON.stringify({ t: new Date().toISOString(), level, msg, ...extra });
  (level === 'error' ? console.error : console.log)(line);
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(err: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const req = ctx.getRequest();
    const res = ctx.getResponse();
    const isHttp = err instanceof HttpException;
    const status = isHttp ? (err as HttpException).getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const body = isHttp ? (err as HttpException).getResponse() : { statusCode: 500, message: 'Došlo je do greške na serveru. Pokušajte ponovo.' };

    if (status >= 500) {
      logJson('error', 'Greška na serveru', { requestId: req.id, method: req.method, path: req.route?.path ?? req.path, status, error: (err as Error)?.message, stack: (err as Error)?.stack?.split('\n').slice(0, 6).join(' | ') });
      if (sentryOn()) Sentry.captureException(err, { tags: { requestId: req.id, path: req.route?.path ?? req.path } });
    } else if (status === 429 || status === 403) {
      logJson('warn', 'Odbijen zahtjev', { requestId: req.id, method: req.method, path: req.route?.path ?? req.path, status });
    }
    res.status(status).json(typeof body === 'string' ? { statusCode: status, message: body, requestId: req.id } : { ...(body as object), requestId: req.id });
  }
}
