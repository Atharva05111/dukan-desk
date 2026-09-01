import { Body, Controller, Param, Post } from '@nestjs/common';
import { BillingService } from './billing.service';

@Controller('orders')
export class BillingController {
  constructor(private readonly billing: BillingService) {}

  @Post()
  createOrder(@Body() dto: { outletId: string; tableId?: string }) {
    return this.billing.createOrder(dto);
  }

  @Post(':id/items')
  addItem(@Param('id') orderId: string, @Body() dto: { menuItemId: string; quantity: number }) {
    return this.billing.addItem(orderId, dto);
  }

  @Post(':id/kot')
  sendKot(@Param('id') orderId: string) {
    return this.billing.sendKot(orderId);
  }

  @Post(':id/close')
  closeOrder(@Param('id') orderId: string, @Body() dto: { mode: string; amount: number }) {
    return this.billing.closeOrder(orderId, dto);
  }
}
