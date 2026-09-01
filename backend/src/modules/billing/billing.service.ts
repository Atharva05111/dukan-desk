import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class BillingService {
  constructor(private readonly prisma: PrismaService) {}

  createOrder(dto: { outletId: string; tableId?: string }) {
    return this.prisma.order.create({
      data: { outletId: dto.outletId, tableId: dto.tableId, status: 'OPEN' },
    });
  }

  async addItem(orderId: string, dto: { menuItemId: string; quantity: number }) {
    const menuItem = await this.prisma.menuItem.findUniqueOrThrow({ where: { id: dto.menuItemId } });
    const lineTotal = Number(menuItem.price) * dto.quantity;

    await this.prisma.orderItem.create({
      data: { orderId, menuItemId: dto.menuItemId, quantity: dto.quantity, unitPrice: menuItem.price, lineTotal },
    });

    return this.recalcTotal(orderId);
  }

  sendKot(orderId: string) {
    // TODO: send to thermal printer via ESC-POS SDK / print service
    return this.prisma.order.update({ where: { id: orderId }, data: { status: 'KOT_SENT' } });
  }

  async closeOrder(orderId: string, dto: { mode: string; amount: number }) {
    await this.prisma.payment.create({
      data: { orderId, mode: dto.mode as any, amount: dto.amount },
    });

    // TODO: deduct raw-material stock via MenuItemIngredient (recipe/BOM), see
    // docs/04-flow-diagrams.md §4 "Deduct raw-material stock"

    return this.prisma.order.update({
      where: { id: orderId },
      data: { status: 'CLOSED', closedAt: new Date() },
    });
  }

  private async recalcTotal(orderId: string) {
    const items = await this.prisma.orderItem.findMany({ where: { orderId } });
    const total = items.reduce((sum, i) => sum + Number(i.lineTotal), 0);
    return this.prisma.order.update({ where: { id: orderId }, data: { totalAmount: total } });
  }
}
