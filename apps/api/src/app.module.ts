import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import { IpThrottlerGuard, SecurityController } from './security';
import { Db } from './db';
import { FileStore } from './storage';
import { BackupScheduler } from './backup';
import { AuditService } from './audit';
import { AuditController } from './audit.controller';
import { UsersController } from './users.controller';
import { TenantController } from './tenant';
import { DocumentsController } from './documents.controller';
import { SectorsController } from './sectors';
import { PublicRegistriesController, RegistriesController } from './registries.controller';
import { CasesController, PublicCasesController } from './cases.controller';
import { PostScheduler, PostsController, PreviewController } from './posts.controller';
import { MailScheduler } from './mail';
import { StorageMigrator } from './storage-migrate';
import { HealthController } from './health.controller';
import { GeoController } from './geo.controller';
import { AuthController, AuthGuard, SessionGuard } from './auth';
import { PublicController } from './public.controller';
import { AdminController } from './admin.controller';
import { MttoImporter } from './importer';
import { AdminRiskController, RiskController, RiskService } from './risk';
import { SourceHub } from './sources';
import { AdminSearchController, SearchController, SearchIndexer } from './search';
import { LifeEventsController, PublicLifeEventsController } from './life-events.controller';
import { CallsController, PublicCallsController } from './calls.controller';
import { AdminAirController, AirController, AirService } from './air';

const secret = process.env.JWT_SECRET;
if (!secret || secret.length < 32) {
  if (process.env.NODE_ENV === 'production') throw new Error('JWT_SECRET (najmanje 32 znaka) mora biti postavljen');
}

@Module({
  imports: [ThrottlerModule.forRoot([{ name: 'default', ttl: 60_000, limit: 300 }]), JwtModule.register({ global: true, secret: secret || 'dev-only-secret-dev-only-secret-0000', signOptions: { expiresIn: '8h' } })],
  controllers: [CasesController, PublicCasesController, RegistriesController, PublicRegistriesController, SectorsController, DocumentsController, PostsController, PreviewController, TenantController, AuditController, UsersController, SecurityController, HealthController, GeoController, AuthController, PublicController, AdminController, RiskController, AdminRiskController, AirController, AdminAirController, CallsController, PublicCallsController, SearchController, AdminSearchController, PublicLifeEventsController, LifeEventsController],
  providers: [{ provide: APP_GUARD, useClass: IpThrottlerGuard }, Db, FileStore, AuditService, BackupScheduler, StorageMigrator, PostScheduler, MailScheduler, AuthGuard, SessionGuard, MttoImporter, SourceHub, AirService, RiskService, SearchIndexer],
})
export class AppModule {}
