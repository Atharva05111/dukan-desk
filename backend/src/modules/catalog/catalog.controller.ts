import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { CatalogService } from './catalog.service';

@Controller('catalog')
export class CatalogController {
  constructor(private readonly catalog: CatalogService) {}

  @Get('items')
  listItems(@Query('outletId') outletId: string) {
    return this.catalog.listItems(outletId);
  }

  @Post('items')
  createItem(@Body() dto: any) {
    return this.catalog.createItem(dto);
  }

  // Bulk create — used after AI Menu Scan review step (docs/04-flow-diagrams.md §2)
  @Post('items/bulk')
  bulkCreate(@Body() dto: { outletId: string; items: any[] }) {
    return this.catalog.bulkCreateItems(dto.outletId, dto.items);
  }
}
