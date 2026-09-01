import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { InventoryService } from './inventory.service';

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventory: InventoryService) {}

  @Get('stock-items')
  list(@Query('outletId') outletId: string) {
    return this.inventory.listStockItems(outletId);
  }

  // Manual stock-in entry — e.g. { name: "Mutton", quantity: 10, unit: "kg", ratePerUnit: 650 }
  // See docs/04-flow-diagrams.md §3
  @Post('stock-in')
  stockIn(@Body() dto: { outletId: string; name: string; quantity: number; unit: string; ratePerUnit: number }) {
    return this.inventory.recordStockIn(dto);
  }

  @Post('wastage')
  wastage(@Body() dto: { stockItemId: string; quantity: number; reason: string }) {
    return this.inventory.recordWastage(dto);
  }
}
