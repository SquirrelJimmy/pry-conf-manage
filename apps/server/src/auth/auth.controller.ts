import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() body: unknown) {
    if (!body || typeof body !== 'object') {
      return this.authService.login({ username: '', password: '' });
    }

    const { username, password } = body as { username?: unknown; password?: unknown };
    return this.authService.login({
      username: typeof username === 'string' ? username : '',
      password: typeof password === 'string' ? password : '',
    });
  }
}

