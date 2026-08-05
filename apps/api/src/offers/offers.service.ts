import { Injectable } from '@nestjs/common';
import { VerificationStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CitiesService } from '../cities/cities.service';

@Injectable()
export class OffersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly citiesService: CitiesService,
  ) {}

  async findActive(citySlug?: string) {
    const cityId = await this.citiesService.resolveCityId(citySlug);
    const now = new Date();

    return this.prisma.offer.findMany({
      where: {
        validFrom: { lte: now },
        validTo: { gte: now },
        store: {
          verificationStatus: "approved",
          ...(cityId ? { cityId } : {}),
        },
      },
      include: { store: { select: { id: true, name: true, slug: true } } },
      orderBy: { validTo: 'asc' },
    });
  }

  async create(storeId: string, ownerId: string, dto: {
    title: string;
    description: string;
    type: string;
    value?: number;
    productId?: string;
    validFrom: string;
    validTo: string;
  }) {
    const store = await this.prisma.store.findFirst({ where: { id: storeId, ownerId } });
    if (!store) throw new Error('Store not found');

    return this.prisma.offer.create({
      data: {
        title: dto.title,
        description: dto.description,
        type: dto.type as 'flat' | 'percent' | 'bogo',
        value: dto.value,
        storeId,
        productId: dto.productId,
        validFrom: new Date(dto.validFrom),
        validTo: new Date(dto.validTo),
      },
    });
  }

  async findByStore(storeId: string, ownerId: string) {
    const store = await this.prisma.store.findFirst({ where: { id: storeId, ownerId } });
    if (!store) throw new Error('Store not found');

    return this.prisma.offer.findMany({
      where: { storeId },
      orderBy: { validTo: 'desc' },
    });
  }

  async delete(storeId: string, offerId: string, ownerId: string) {
    const store = await this.prisma.store.findFirst({ where: { id: storeId, ownerId } });
    if (!store) throw new Error('Store not found');

    const offer = await this.prisma.offer.findFirst({ where: { id: offerId, storeId } });
    if (!offer) throw new Error('Offer not found');

    return this.prisma.offer.delete({ where: { id: offerId } });
  }
}
