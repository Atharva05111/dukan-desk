import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtPayload } from './jwt-payload';

// Use with @UseGuards(JwtAuthGuard) — pulls the authenticated staff member's
// { sub, businessId, role } off the request, set there by JwtStrategy.validate().
export const CurrentUser = createParamDecorator((_data: unknown, ctx: ExecutionContext): JwtPayload => {
  const request = ctx.switchToHttp().getRequest();
  return request.user;
});
