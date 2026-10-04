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

  // Pick fields explicitly: scan drafts carry a free-text `category`, which isn't
  // a MenuItem column (MenuItem links to Category by categoryId).
  bulkCreateItems(outletId: string, items: { name: string; price: number }[]) {
    return this.prisma.menuItem.createMany({
      data: items.map((i) => ({ outletId, name: i.name, price: i.price })),
    });
  }
}
