import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { signJwtHS256 } from './jwt';
import { verifyPassword } from './password';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async login(input: { username: string; password: string }) {
    const username = input.username.trim();
    const password = input.password;

    if (!username || !password) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    const user = await this.prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    const ok = await verifyPassword(password, user.passwordHash);
    if (!ok) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    const secret = this.config.get<string>('JWT_SECRET');
    if (!secret) {
      throw new Error('缺少环境变量 JWT_SECRET');
    }

    const expiresIn = this.config.get<string>('JWT_EXPIRES_IN') || undefined;

    const accessToken = signJwtHS256(
      { sub: user.id, username: user.username },
      secret,
      { expiresIn },
    );

    return {
      accessToken,
      user: {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
      },
    };
  }
}

