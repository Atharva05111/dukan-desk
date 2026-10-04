import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { StaffRole } from '@prisma/client';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtPayload } from '../auth/jwt-payload';

// Reports are for owners/managers only — waiters/cashiers/kitchen staff can
// take orders but shouldn't see sales figures or P&L (docs/01-requirements.md §2.5).
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(StaffRole.OWNER, StaffRole.MANAGER)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reports: ReportsService) {}

  @Get('sales-summary')
  salesSummary(@Query('outletId') outletId: string, @Query('from') from: string, @Query('to') to: string) {
    return this.reports.getSalesSummary(outletId, new Date(from), new Date(to));
  }

  // businessId comes from the authenticated staff member's token, never the client —
  // otherwise anyone could read another business's P&L by passing its id.
  @Get('profit-loss')
  profitLoss(@CurrentUser() user: JwtPayload, @Query('from') from: string, @Query('to') to: string) {
    return this.reports.getProfitAndLoss(user.businessId, new Date(from), new Date(to));
  }
}
