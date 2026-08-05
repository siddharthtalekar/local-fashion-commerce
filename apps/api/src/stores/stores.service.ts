import { Injectable, NotFoundException } from '@nestjs/common';
import { VerificationStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CitiesService } from '../cities/cities.service';
import { haversineKm, toStoreDetailDto, toStoreSummaryDto } from '../common/mappers';
import { CreateStoreDto } from './dto/create-store.dto';

@Injectable()
export class StoresService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly citiesService: CitiesService,
  ) {}

  async findAll(params: { citySlug?: string; lat?: number; lng?: number; radiusKm?: number }) {
    const cityId = await this.citiesService.resolveCityId(params.citySlug);
    const stores = await this.prisma.store.findMany({
      where: {
        verificationStatus: "approved",
        ...(cityId ? { cityId } : {}),
      },
      orderBy: { name: 'asc' },
    });

    let results = stores.map((s) => toStoreSummaryDto(s));

    if (params.lat != null && params.lng != null) {
      results = results
        .map((s) => ({
          ...s,
          distanceKm: haversineKm(params.lat!, params.lng!, s.latitude, s.longitude),
        }))
        .filter((s) => !params.radiusKm || (s.distanceKm ?? 0) <= params.radiusKm)
        .sort((a, b) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0));
    }

    return results;
  }

  async findNearby(lat: number, lng: number, radiusKm = 5, citySlug?: string) {
    return this.findAll({ citySlug, lat, lng, radiusKm });
  }

  async findOne(id: string, lat?: number, lng?: number) {
    const store = await this.prisma.store.findUnique({ where: { id } });
    if (!store || store.verificationStatus !== "approved") {
      throw new NotFoundException('Store not found');
    }
    const distanceKm =
      lat != null && lng != null ? haversineKm(lat, lng, store.latitude, store.longitude) : undefined;
    return toStoreDetailDto(store, distanceKm);
  }

  async create(ownerId: string, dto: CreateStoreDto) {
    const slug = dto.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const existing = await this.prisma.store.findUnique({ where: { slug } });
    const finalSlug = existing ? `${slug}-${Date.now()}` : slug;

    return this.prisma.store.create({
      data: {
        name: dto.name,
        slug: finalSlug,
        description: dto.description,
        address: dto.address,
        cityId: dto.cityId,
        latitude: dto.latitude,
        longitude: dto.longitude,
        phone: dto.phone,
        whatsapp: dto.whatsapp,
        categoryTags: dto.categoryTags ? JSON.stringify(dto.categoryTags) : '[]',
        openingHours: dto.openingHours ?? undefined,
        coverImageUrl: dto.coverImageUrl,
        ownerId,
        verificationStatus: "pending",
      },
    });
  }

  async updateStore(ownerId: string, storeId: string, dto: Partial<CreateStoreDto>) {
    const store = await this.prisma.store.findFirst({ where: { id: storeId, ownerId } });
    if (!store) throw new NotFoundException('Store not found');
    return this.prisma.store.update({
      where: { id: storeId },
      data: {
        ...dto,
        categoryTags: dto.categoryTags ? JSON.stringify(dto.categoryTags) : undefined,
      },
    });
  }

  async getMyStores(ownerId: string) {
    const stores = await this.prisma.store.findMany({ where: { ownerId }, orderBy: { createdAt: 'desc' } });
    return stores.map(store => toStoreSummaryDto(store));
  }

  async getAnalytics(ownerId: string) {
    const stores = await this.prisma.store.findMany({ where: { ownerId }, select: { id: true } });
    
    if (stores.length === 0) {
      return {
        totalProducts: 0,
        customerIntents: 0,
        whatsappLeads: 0,
        totalOrders: 0,
        pendingOrders: 0,
        totalRevenue: 0,
      };
    }

    const storeIds = stores.map(s => s.id);

    const [
      totalProducts,
      customerIntents,
      whatsappLeads,
      orders
    ] = await Promise.all([
      this.prisma.product.count({ where: { storeId: { in: storeIds } } }),
      this.prisma.intentEvent.count({ where: { storeId: { in: storeIds } } }),
      this.prisma.intentEvent.count({ where: { storeId: { in: storeIds }, type: 'whatsapp' } }),
      this.prisma.order.findMany({ where: { storeId: { in: storeIds } } })
    ]);

    const totalOrders = orders.length;
    const pendingOrders = orders.filter(o => o.status === 'pending').length;
    
    const totalRevenue = orders
      .filter(o => o.status !== 'cancelled')
      .reduce((sum, order) => sum + order.totalAmount, 0);

    return {
      totalProducts,
      customerIntents,
      whatsappLeads,
      totalOrders,
      pendingOrders,
      totalRevenue,
    };
  }
}
