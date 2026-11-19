import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { Db } from './db';
import { AuthController, AuthGuard } from './auth';
import { PublicController } from './public.controller';
import { AdminController } from './admin.controller';

const secret = process.env.JWT_SECRET;
if (!secret || secret.length < 32) {
  if (process.env.NODE_ENV === 'production') throw new Error('JWT_SECRET (najmanje 32 znaka) mora biti postavljen');
}

@Module({
  imports: [JwtModule.register({ global: true, secret: secret || 'dev-only-secret-dev-only-secret-0000', signOptions: { expiresIn: '8h' } })],
  controllers: [AuthController, PublicController, AdminController],
  providers: [Db, AuthGuard],
})
export class AppModule {}
