import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  // POST /api/auth/signup — creates Business + first Staff (role: OWNER)
  @Post('signup')
  signup(@Body() dto: { businessName: string; businessType: string; phone: string; password: string }) {
    return this.auth.signup(dto);
  }

  // POST /api/auth/login
  @Post('login')
  login(@Body() dto: { phone: string; password: string }) {
    return this.auth.login(dto);
  }
}
