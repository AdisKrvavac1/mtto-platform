import { CanActivate, ExecutionContext, Injectable, UnauthorizedException, Controller, Post, Body, Get, Req, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { Db, id } from './db';

const DUMMY_HASH = bcrypt.hashSync('timing-safe-dummy', 10);

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwt: JwtService) {}
  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest();
    const h: string = req.headers['authorization'] ?? '';
    const token = h.startsWith('Bearer ') ? h.slice(7) : '';
    if (!token) throw new UnauthorizedException('Potrebna je prijava');
    try {
      req.user = await this.jwt.verifyAsync(token);
      return true;
    } catch {
      throw new UnauthorizedException('Sesija je istekla');
    }
  }
}

@Controller('auth')
export class AuthController {
  constructor(private db: Db, private jwt: JwtService) {}

  @Post('login')
  async login(@Body() body: { email?: string; password?: string }) {
    const email = String(body?.email ?? '').trim().toLowerCase();
    const user = await this.db.one<any>('SELECT * FROM users WHERE "email"=$1', [email]);
    const ok = user ? await bcrypt.compare(String(body?.password ?? ''), user.passwordHash) : await bcrypt.compare('x', DUMMY_HASH);
    if (!user || !ok) throw new UnauthorizedException('Pogrešan e-mail ili lozinka');
    const token = await this.jwt.signAsync({ sub: user.id, name: user.name, role: user.role });
    await this.db.insert('audit_log', { id: id(), userName: user.name, action: 'Prijava u CMS', target: user.email });
    return { token, user: { id: user.id, name: user.name, email: user.email, role: user.role } };
  }

  @Get('me')
  @UseGuards(AuthGuard)
  me(@Req() req: any) {
    return req.user;
  }
}
