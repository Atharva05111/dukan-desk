import { StaffRole } from '@prisma/client';

export type JwtPayload = {
  sub: string; // staff id
  businessId: string;
  role: StaffRole;
};
