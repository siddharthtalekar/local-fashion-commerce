import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { Prisma, VerificationStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CitiesService } from '../cities/cities.service';
import { haversineKm, slugify, toProductDetailDto, toProductSummaryDto } from '../common/mappers';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';

const productInclude = {
  brand: true,
  category: true,
  store: true,
  sizes: true,
  images: { orderBy: { sortOrder: 'asc' as const } },
};

@Injectable()
export class ProductsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly citiesService: CitiesService,
  ) {}

  async findAll(query: ProductQueryDto) {
    const cityId = await this.citiesService.resolveCityId(query.citySlug);
    const page = query.page ?? 1;
    const limit = Math.min(query.limit ?? 20, 50);
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {
      store: {
        verificationStatus: "approved",
        ...(cityId ? { cityId } : {}),
      },
      ...(query.categorySlug
        ? { category: { slug: query.categorySlug } }
        : {}),
      ...(query.brandSlug ? { brand: { slug: query.brandSlug } } : {}),
      ...(query.minPrice != null || query.maxPrice != null
        ? {
            price: {
              ...(query.minPrice != null ? { gte: query.minPrice } : {}),
              ...(query.maxPrice != null ? { lte: query.maxPrice } : {}),
            },
          }
        : {}),
      ...(query.size ? { sizes: { some: { size: query.size, inStock: true } } } : {}),
      ...(query.q
        ? {
            OR: [
              { title: { contains: query.q,  } },
              { brand: { name: { contains: query.q,  } } },
              { category: { name: { contains: query.q,  } } },
              { tags: { contains: query.q.toLowerCase() } },
            ],
          }
        : {}),
    };

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: productInclude,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.product.count({ where }),
    ]);

    let data = products.map((p) => toProductSummaryDto(p));

    if (query.lat != null && query.lng != null) {
      data = data
        .map((p) => {
          const store = products.find((x) => x.id === p.id)!.store;
          const distanceKm = haversineKm(query.lat!, query.lng!, store.latitude, store.longitude);
          return {
            ...p,
            store: { ...p.store, distanceKm } as typeof p.store & { distanceKm?: number },
          };
        })
        .filter((p) => !query.radiusKm || ((p.store as { distanceKm?: number }).distanceKm ?? 0) <= query.radiusKm!)
        .sort(
          (a, b) =>
            ((a.store as { distanceKm?: number }).distanceKm ?? 0) -
            ((b.store as { distanceKm?: number }).distanceKm ?? 0),
        );
    }

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: productInclude,
    });
    if (!product || product.store.verificationStatus !== "approved") {
      throw new NotFoundException('Product not found');
    }
    return toProductDetailDto(product);
  }

  async findOneForRetailer(id: string, ownerId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: productInclude,
    });
    if (!product || product.store.ownerId !== ownerId) {
      throw new NotFoundException('Product not found');
    }
    return toProductDetailDto(product);
  }

  async compare(ids: string[]) {
    const uniqueIds = [...new Set(ids)].slice(0, 4);
    const products = await this.prisma.product.findMany({
      where: {
        id: { in: uniqueIds },
        store: { verificationStatus: "approved" },
      },
      include: productInclude,
    });
    return products.map((p) => toProductDetailDto(p));
  }

  async create(storeId: string, ownerId: string, dto: CreateProductDto) {
    const store = await this.prisma.store.findFirst({ where: { id: storeId, ownerId } });
    if (!store) throw new ForbiddenException('Store not found');

    const baseSlug = slugify(dto.title);
    const slug = `${baseSlug}-${Date.now().toString(36)}`;

    const product = await this.prisma.product.create({
      data: {
        title: dto.title,
        slug,
        description: dto.description,
        storeId,
        categoryId: dto.categoryId,
        brandId: dto.brandId,
        price: dto.price,
        discountedPrice: dto.discountedPrice,
        colors: dto.colors ? JSON.stringify(dto.colors) : '[]',
        tags: dto.tags ? JSON.stringify(dto.tags) : '[]',
        searchVector: `${dto.title} ${dto.tags?.join(' ') ?? ''}`.toLowerCase(),
        sizes: {
          create: dto.sizes.map((s) => ({ size: s.size, inStock: s.inStock })),
        },
        images: {
          create: dto.imageUrls.map((url, i) => ({ url, sortOrder: i })),
        },
      },
      include: productInclude,
    });

    return toProductDetailDto(product);
  }

  async update(productId: string, ownerId: string, dto: Partial<CreateProductDto>) {
    const product = await this.prisma.product.findFirst({
      where: { id: productId, store: { ownerId } },
    });
    if (!product) throw new NotFoundException('Product not found');

    await this.prisma.$transaction(async (tx) => {
      await tx.product.update({
        where: { id: productId },
        data: {
          title: dto.title,
          description: dto.description,
          categoryId: dto.categoryId,
          brandId: dto.brandId,
          price: dto.price,
          discountedPrice: dto.discountedPrice,
          colors: dto.colors ? JSON.stringify(dto.colors) : undefined,
          tags: dto.tags ? JSON.stringify(dto.tags) : undefined,
        },
      });

      if (dto.sizes) {
        await tx.productSize.deleteMany({ where: { productId } });
        await tx.productSize.createMany({
          data: dto.sizes.map((s) => ({ productId, size: s.size, inStock: s.inStock })),
        });
      }

      if (dto.imageUrls) {
        await tx.productImage.deleteMany({ where: { productId } });
        await tx.productImage.createMany({
          data: dto.imageUrls.map((url, i) => ({ productId, url, sortOrder: i })),
        });
      }
    });

    return this.findOneForRetailer(productId, ownerId);
  }

  async remove(productId: string, ownerId: string) {
    const product = await this.prisma.product.findFirst({
      where: { id: productId, store: { ownerId } },
    });
    if (!product) throw new NotFoundException('Product not found');
    await this.prisma.product.delete({ where: { id: productId } });
    return { success: true };
  }

  async toggleSizeStock(productId: string, ownerId: string, sizeId: string, inStock: boolean) {
    const product = await this.prisma.product.findFirst({
      where: { id: productId, store: { ownerId } },
    });
    if (!product) throw new NotFoundException('Product not found');

    await this.prisma.productSize.update({
      where: { id: sizeId },
      data: { inStock },
    });

    return this.findOne(productId);
  }

  async findByStore(storeId: string, ownerId: string) {
    const store = await this.prisma.store.findFirst({ where: { id: storeId, ownerId } });
    if (!store) throw new NotFoundException('Store not found');

    const products = await this.prisma.product.findMany({
      where: { storeId },
      include: productInclude,
      orderBy: { createdAt: 'desc' },
    });

    return products.map((p) => toProductSummaryDto(p));
  }
}
