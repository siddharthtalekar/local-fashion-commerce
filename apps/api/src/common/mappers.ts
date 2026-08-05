import type {
  BrandDto,
  CategoryDto,
  OpeningHoursDto,
  ProductDetailDto,
  ProductImageDto,
  ProductSizeDto,
  ProductSummaryDto,
  StoreDetailDto,
  StoreSummaryDto,
  VerificationStatus,
} from '@local-fashion/shared-types';
import type { Brand, Category, Product, ProductImage, ProductSize, Store } from '@prisma/client';

type ProductWithRelations = Product & {
  brand: Brand;
  category: Category;
  store: Store;
  sizes: ProductSize[];
  images: ProductImage[];
};

function safeParseArray(val: unknown): string[] {
  if (Array.isArray(val)) return val;
  if (typeof val === 'string') {
    try {
      const parsed = JSON.parse(val);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

export function toBrandDto(brand: Brand): BrandDto {
  return { id: brand.id, name: brand.name, slug: brand.slug };
}

export function toCategoryDto(category: Category): CategoryDto {
  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    imageUrl: category.imageUrl,
    parentId: category.parentId,
  };
}

export function toStoreSummaryDto(store: Store, distanceKm?: number): StoreSummaryDto {
  return {
    id: store.id,
    name: store.name,
    slug: store.slug,
    address: store.address,
    cityId: store.cityId,
    latitude: store.latitude,
    longitude: store.longitude,
    phone: store.phone,
    whatsapp: store.whatsapp,
    coverImageUrl: store.coverImageUrl,
    verificationStatus: store.verificationStatus as VerificationStatus,
    distanceKm,
    description: store.description,
    categoryTags: safeParseArray(store.categoryTags),
  };
}

export function toStoreDetailDto(store: Store, distanceKm?: number): StoreDetailDto {
  return {
    ...toStoreSummaryDto(store, distanceKm),
    openingHours: (store.openingHours as OpeningHoursDto | null) ?? null,
  };
}

function toProductSizeDto(size: ProductSize): ProductSizeDto {
  return { id: size.id, size: size.size, inStock: size.inStock };
}

function toProductImageDto(image: ProductImage): ProductImageDto {
  return { id: image.id, url: image.url, sortOrder: image.sortOrder };
}

export function toProductSummaryDto(product: ProductWithRelations): ProductSummaryDto {
  const store = toStoreSummaryDto(product.store);
  return {
    id: product.id,
    title: product.title,
    slug: product.slug,
    price: product.price,
    discountedPrice: product.discountedPrice,
    brand: toBrandDto(product.brand),
    category: toCategoryDto(product.category),
    store: {
      id: store.id,
      name: store.name,
      slug: store.slug,
      address: store.address,
      phone: store.phone,
      whatsapp: store.whatsapp,
      latitude: store.latitude,
      longitude: store.longitude,
    },
    images: product.images.map(toProductImageDto),
    sizes: product.sizes.map(toProductSizeDto),
    inStock: product.sizes.some((s) => s.inStock),
  };
}

export function toProductDetailDto(product: ProductWithRelations): ProductDetailDto {
  return {
    ...toProductSummaryDto(product),
    description: product.description,
    colors: safeParseArray(product.colors),
    tags: safeParseArray(product.tags),
    createdAt: product.createdAt.toISOString(),
  };
}

export function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}
