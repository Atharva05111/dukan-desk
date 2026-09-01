import { Controller, Get, Query } from '@nestjs/common';
import { ReportsService } from './reports.service';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reports: ReportsService) {}

  @Get('sales-summary')
  salesSummary(@Query('outletId') outletId: string, @Query('from') from: string, @Query('to') to: string) {
    return this.reports.getSalesSummary(outletId, new Date(from), new Date(to));
  }

  @Get('profit-loss')
  profitLoss(@Query('businessId') businessId: string, @Query('from') from: string, @Query('to') to: string) {
    return this.reports.getProfitAndLoss(businessId, new Date(from), new Date(to));
  }
}
