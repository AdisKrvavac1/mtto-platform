import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import { IpThrottlerGuard, SecurityController } from './security';
import { Db } from './db';
import { FileStore } from './storage';
import { BackupScheduler } from './backup';
import { StorageMigrator } from './storage-migrate';
import { HealthController } from './health.controller';
import { GeoController } from './geo.controller';
import { AuthController, AuthGuard, SessionGuard } from './auth';
import { PublicController } from './public.controller';
import { AdminController } from './admin.controller';
import { MttoImporter } from './importer';
import { AdminRiskController, RiskController, RiskService } from './risk';

const secret = process.env.JWT_SECRET;
if (!secret || secret.length < 32) {
  if (process.env.NODE_ENV === 'production') throw new Error('JWT_SECRET (najmanje 32 znaka) mora biti postavljen');
}

@Module({
  imports: [ThrottlerModule.forRoot([{ name: 'default', ttl: 60_000, limit: 300 }]), JwtModule.register({ global: true, secret: secret || 'dev-only-secret-dev-only-secret-0000', signOptions: { expiresIn: '8h' } })],
  controllers: [SecurityController, HealthController, GeoController, AuthController, PublicController, AdminController, RiskController, AdminRiskController],
  providers: [{ provide: APP_GUARD, useClass: IpThrottlerGuard }, Db, FileStore, BackupScheduler, StorageMigrator, AuthGuard, SessionGuard, MttoImporter, RiskService],
})
export class AppModule {}
