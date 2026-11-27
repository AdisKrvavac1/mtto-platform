import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AllExceptionsFilter, initSentry, logJson, requestId } from './observability';

async function bootstrap() {
  initSentry();
  const app = await NestFactory.create(AppModule, { bodyParser: true });
  app.use(requestId);
  app.useGlobalFilters(new AllExceptionsFilter());
  app.use((_req: any, res: any, next: any) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
  });
  const origins = (process.env.CORS_ORIGINS ?? '').split(',').map((s) => s.trim()).filter(Boolean);
  if (origins.length) app.enableCors({ origin: origins });
  const port = Number(process.env.PORT ?? 4000);
  await app.listen(port, '0.0.0.0');
  logJson('info', `MTTO API na portu ${port}`, { sentry: !!process.env.SENTRY_DSN });
}
process.on('unhandledRejection', (e) => logJson('error', 'Neobrađena greška (promise)', { error: String((e as Error)?.message ?? e) }));
bootstrap();
