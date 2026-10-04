import { SetMetadata } from '@nestjs/common';
import { StaffRole } from '@prisma/client';

export const ROLES_KEY = 'roles';

// Use with @UseGuards(JwtAuthGuard, RolesGuard). Must come after JwtAuthGuard
// so req.user is populated when RolesGuard checks it.
export const Roles = (...roles: StaffRole[]) => SetMetadata(ROLES_KEY, roles);
