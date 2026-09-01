import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

// Business-terms glossary this service implements — see docs/02-brain.md §5.
export interface ProfitAndLoss {
  periodStart: Date;
  periodEnd: Date;
  revenue: number;
  cogs: number;
  grossProfit: number;
  grossMarginPct: number;
  operatingExpenses: number;
  netProfit: number;
}

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async getSalesSummary(outletId: string, from: Date, to: Date) {
    const orders = await this.prisma.order.findMany({
      where: { outletId, status: 'CLOSED', closedAt: { gte: from, lte: to } },
      include: { items: { include: { menuItem: true } } },
    });

    const totalSales = orders.reduce((sum, o) => sum + Number(o.totalAmount), 0);

    const itemCounts = new Map<string, { name: string; qty: number; revenue: number }>();
    for (const order of orders) {
      for (const item of order.items) {
        const key = item.menuItemId;
        const entry = itemCounts.get(key) ?? { name: item.menuItem.name, qty: 0, revenue: 0 };
        entry.qty += item.quantity;
        entry.revenue += Number(item.lineTotal);
        itemCounts.set(key, entry);
      }
    }

    const topItems = [...itemCounts.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 10);

    return { totalSales, orderCount: orders.length, topItems };
  }

  // Single source of truth for P&L — called by the Reports UI AND the RAG
  // Assistant (docs/03-architecture.md §6), so numbers never disagree.
  async getProfitAndLoss(businessId: string, from: Date, to: Date): Promise<ProfitAndLoss> {
    const orders = await this.prisma.order.findMany({
      where: { outlet: { businessId }, status: 'CLOSED', closedAt: { gte: from, lte: to } },
    });
    const revenue = orders.reduce((sum, o) => sum + Number(o.totalAmount), 0);

    // COGS: sum of stock consumed (OUT/WASTAGE transactions) at cost, for this business's outlets.
    const stockTxns = await this.prisma.stockTransaction.findMany({
      where: {
        stockItem: { outlet: { businessId } },
        type: { in: ['OUT', 'WASTAGE'] },
        occurredAt: { gte: from, lte: to },
      },
    });
    const cogs = stockTxns.reduce((sum, t) => sum + Number(t.totalCost), 0);

    const expenses = await this.prisma.expense.findMany({
      where: { businessId, incurredAt: { gte: from, lte: to } },
    });
    const operatingExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

    const grossProfit = revenue - cogs;
    const netProfit = grossProfit - operatingExpenses;

    return {
      periodStart: from,
      periodEnd: to,
      revenue,
      cogs,
      grossProfit,
      grossMarginPct: revenue > 0 ? (grossProfit / revenue) * 100 : 0,
      operatingExpenses,
      netProfit,
    };
  }
}
