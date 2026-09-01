import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class InventoryService {
  constructor(private readonly prisma: PrismaService) {}

  listStockItems(outletId: string) {
    return this.prisma.stockItem.findMany({ where: { outletId } });
  }

  // Finds-or-creates the stock item, records the IN transaction, and
  // recalculates current quantity + weighted-average cost per unit.
  async recordStockIn(dto: { outletId: string; name: string; quantity: number; unit: string; ratePerUnit: number }) {
    const totalCost = dto.quantity * dto.ratePerUnit;

    return this.prisma.$transaction(async (tx) => {
      let stockItem = await tx.stockItem.findFirst({
        where: { outletId: dto.outletId, name: dto.name },
      });

      if (!stockItem) {
        stockItem = await tx.stockItem.create({
          data: {
            outletId: dto.outletId,
            name: dto.name,
            unit: dto.unit,
            currentQty: 0,
            avgCostPerUnit: 0,
            lowStockThreshold: 0,
          },
        });
      }

      const newQty = Number(stockItem.currentQty) + dto.quantity;
      const newAvgCost =
        (Number(stockItem.currentQty) * Number(stockItem.avgCostPerUnit) + totalCost) / newQty;

      const [txn, updated] = await Promise.all([
        tx.stockTransaction.create({
          data: {
            stockItemId: stockItem.id,
            type: 'IN',
            quantity: dto.quantity,
            ratePerUnit: dto.ratePerUnit,
            totalCost,
          },
        }),
        tx.stockItem.update({
          where: { id: stockItem.id },
          data: { currentQty: newQty, avgCostPerUnit: newAvgCost },
        }),
      ]);

      return { transaction: txn, stockItem: updated };
    });
  }

  async recordWastage(dto: { stockItemId: string; quantity: number; reason: string }) {
    const stockItem = await this.prisma.stockItem.findUniqueOrThrow({ where: { id: dto.stockItemId } });

    return this.prisma.$transaction([
      this.prisma.stockTransaction.create({
        data: {
          stockItemId: dto.stockItemId,
          type: 'WASTAGE',
          quantity: dto.quantity,
          ratePerUnit: stockItem.avgCostPerUnit,
          totalCost: Number(stockItem.avgCostPerUnit) * dto.quantity,
          reason: dto.reason,
        },
      }),
      this.prisma.stockItem.update({
        where: { id: dto.stockItemId },
        data: { currentQty: Number(stockItem.currentQty) - dto.quantity },
      }),
    ]);
  }
}
