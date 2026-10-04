import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { StaffRole } from '@prisma/client';
import { PrismaService } from '../common/prisma.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './jwt-payload';

const SALT_ROUNDS = 10;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async signup(dto: SignupDto) {
    const existing = await this.prisma.staff.findUnique({ where: { phone: dto.phone } });
    if (existing) {
      throw new ConflictException('An account with this phone number already exists');
    }

    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);

    const { business, outlet, staff } = await this.prisma.$transaction(async (tx) => {
      const business = await tx.business.create({
        data: {
          name: dto.businessName,
          businessType: dto.businessType,
          gstNumber: dto.gstNumber,
        },
      });

      const outlet = await tx.outlet.create({
        data: { businessId: business.id, name: `${dto.businessName} — Main Outlet` },
      });

      const staff = await tx.staff.create({
        data: {
          businessId: business.id,
          name: dto.businessName,
          phone: dto.phone,
          role: StaffRole.OWNER,
          passwordHash,
        },
      });

      return { business, outlet, staff };
    });

    const tokens = await this.issueTokens({ sub: staff.id, businessId: business.id, role: staff.role });
    return { ...tokens, business, outlet, staff: this.toSafeStaff(staff) };
  }

  async login(dto: LoginDto) {
    const staff = await this.prisma.staff.findUnique({ where: { phone: dto.phone } });
    if (!staff) {
      throw new UnauthorizedException('Invalid phone number or password');
    }

    const passwordMatches = await bcrypt.compare(dto.password, staff.passwordHash);
    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid phone number or password');
    }

    // Staff aren't tied to a specific outlet yet, so log them into the business's
    // first (main) outlet — the one created at signup.
    const [business, outlet] = await Promise.all([
      this.prisma.business.findUnique({ where: { id: staff.businessId } }),
      this.prisma.outlet.findFirst({ where: { businessId: staff.businessId }, orderBy: { createdAt: 'asc' } }),
    ]);

    const tokens = await this.issueTokens({ sub: staff.id, businessId: staff.businessId, role: staff.role });
    return { ...tokens, business, outlet, staff: this.toSafeStaff(staff) };
  }

  async refresh(refreshToken: string) {
    let payload: JwtPayload;
    try {
      payload = await this.jwt.verifyAsync<JwtPayload>(refreshToken, {
        secret: this.config.get<string>('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    // Re-check the staff still exists (e.g. hasn't been removed since the token was issued).
    const staff = await this.prisma.staff.findUnique({ where: { id: payload.sub } });
    if (!staff) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    return this.issueTokens({ sub: staff.id, businessId: staff.businessId, role: staff.role });
  }

  private async issueTokens(payload: JwtPayload) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(payload, {
        secret: this.config.get<string>('JWT_ACCESS_SECRET'),
        expiresIn: '15m',
      }),
      this.jwt.signAsync(payload, {
        secret: this.config.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: '30d',
      }),
    ]);
    return { accessToken, refreshToken };
  }

  private toSafeStaff<T extends { passwordHash: string }>(staff: T) {
    const { passwordHash, ...safe } = staff;
    return safe;
  }
}
