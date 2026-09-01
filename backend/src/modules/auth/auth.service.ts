import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async signup(dto: { businessName: string; businessType: string; phone: string; password: string }) {
    // TODO: hash password (bcrypt), create Business + Outlet + Staff(OWNER), issue JWT
    throw new Error('Not implemented yet — see docs/01-requirements.md §2.1');
  }

  async login(dto: { phone: string; password: string }) {
    // TODO: verify password, issue access + refresh JWT
    throw new Error('Not implemented yet');
  }
}
