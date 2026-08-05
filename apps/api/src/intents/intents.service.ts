import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateIntentDto } from './dto/create-intent.dto';

@Injectable()
export class IntentsService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateIntentDto) {
    return this.prisma.intentEvent.create({
      data: {
        type: dto.type,
        storeId: dto.storeId,
        productId: dto.productId,
        metadata: dto.metadata ? (dto.metadata as any) : undefined,
      },
    });
  }

  async getStoreAnalytics(storeId: string, ownerId: string) {
    const store = await this.prisma.store.findFirst({ where: { id: storeId, ownerId } });
    if (!store) return null;

    const events = await this.prisma.intentEvent.findMany({
      where: { storeId },
      include: { product: { select: { id: true, title: true } } },
    });

    const callCount = events.filter((e) => e.type === 'call').length;
    const whatsappCount = events.filter((e) => e.type === 'whatsapp').length;
    const directionsCount = events.filter((e) => e.type === 'directions').length;

    const productCounts = new Map<string, { title: string; count: number }>();
    for (const event of events) {
      if (!event.productId || !event.product) continue;
      const existing = productCounts.get(event.productId) ?? {
        title: event.product.title,
        count: 0,
      };
      existing.count += 1;
      productCounts.set(event.productId, existing);
    }

    const topProducts = [...productCounts.entries()]
      .map(([productId, { title, count }]) => ({ productId, title, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalIntents: events.length,
      callCount,
      whatsappCount,
      directionsCount,
      topProducts,
    };
  }
}
