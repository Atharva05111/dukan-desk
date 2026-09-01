import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class CatalogService {
  constructor(private readonly prisma: PrismaService) {}

  listItems(outletId: string) {
    return this.prisma.menuItem.findMany({ where: { outletId, isActive: true } });
  }

  createItem(dto: any) {
    return this.prisma.menuItem.create({ data: dto });
  }

  bulkCreateItems(outletId: string, items: any[]) {
    return this.prisma.menuItem.createMany({
      data: items.map((i) => ({ ...i, outletId })),
    });
  }
}
