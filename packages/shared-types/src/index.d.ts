export declare enum UserRole {
    CUSTOMER = "customer",
    RETAILER = "retailer",
    ADMIN = "admin"
}
export declare enum VerificationStatus {
    PENDING = "pending",
    APPROVED = "approved",
    REJECTED = "rejected"
}
export declare enum OfferType {
    FLAT = "flat",
    PERCENT = "percent",
    BOGO = "bogo"
}
export declare enum IntentType {
    CALL = "call",
    WHATSAPP = "whatsapp",
    DIRECTIONS = "directions"
}
export declare enum ProductSizeLabel {
    XS = "XS",
    S = "S",
    M = "M",
    L = "L",
    XL = "XL",
    XXL = "XXL",
    FREE = "FREE"
}
export interface CityDto {
    id: string;
    name: string;
    slug: string;
    state: string;
}
export interface BrandDto {
    id: string;
    name: string;
    slug: string;
}
export interface CategoryDto {
    id: string;
    name: string;
    slug: string;
    parentId: string | null;
}
export interface ProductSizeDto {
    id: string;
    size: string;
    inStock: boolean;
}
export interface ProductImageDto {
    id: string;
    url: string;
    sortOrder: number;
}
export interface StoreSummaryDto {
    id: string;
    name: string;
    slug: string;
    address: string;
    cityId: string;
    latitude: number;
    longitude: number;
    phone: string;
    whatsapp: string;
    coverImageUrl: string | null;
    verificationStatus: VerificationStatus;
    distanceKm?: number;
}
export interface StoreDetailDto extends StoreSummaryDto {
    description: string | null;
    openingHours: OpeningHoursDto | null;
    categoryTags: string[];
}
export interface OpeningHoursDto {
    monday?: string;
    tuesday?: string;
    wednesday?: string;
    thursday?: string;
    friday?: string;
    saturday?: string;
    sunday?: string;
}
export interface ProductSummaryDto {
    id: string;
    title: string;
    slug: string;
    price: number;
    discountedPrice: number | null;
    brand: BrandDto;
    category: CategoryDto;
    store: Pick<StoreSummaryDto, 'id' | 'name' | 'slug' | 'address' | 'phone' | 'whatsapp' | 'latitude' | 'longitude'>;
    images: ProductImageDto[];
    sizes: ProductSizeDto[];
    inStock: boolean;
}
export interface ProductDetailDto extends ProductSummaryDto {
    description: string | null;
    colors: string[];
    tags: string[];
    createdAt: string;
}
export interface OfferDto {
    id: string;
    title: string;
    description: string;
    type: OfferType;
    value: number | null;
    storeId: string;
    productId: string | null;
    validFrom: string;
    validTo: string;
    store?: Pick<StoreSummaryDto, 'id' | 'name' | 'slug'>;
}
export interface ProductFilters {
    citySlug?: string;
    categorySlug?: string;
    brandSlug?: string;
    size?: string;
    minPrice?: number;
    maxPrice?: number;
    lat?: number;
    lng?: number;
    radiusKm?: number;
    q?: string;
    page?: number;
    limit?: number;
}
export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
export interface CreateIntentDto {
    type: IntentType;
    productId?: string;
    storeId: string;
    metadata?: Record<string, unknown>;
}
export interface AuthTokensDto {
    accessToken: string;
    refreshToken: string;
}
export interface LoginDto {
    phone: string;
    password: string;
}
export interface RegisterDto {
    name: string;
    phone: string;
    password: string;
    role?: UserRole;
    cityId?: string;
}
export interface UserDto {
    id: string;
    name: string;
    phone: string;
    role: UserRole;
    cityId: string | null;
}
export interface CreateStoreDto {
    name: string;
    description?: string;
    address: string;
    cityId: string;
    latitude: number;
    longitude: number;
    phone: string;
    whatsapp: string;
    categoryTags?: string[];
    openingHours?: OpeningHoursDto;
    coverImageUrl?: string;
}
export interface CreateProductDto {
    title: string;
    description?: string;
    categoryId: string;
    brandId: string;
    price: number;
    discountedPrice?: number;
    colors?: string[];
    tags?: string[];
    sizes: {
        size: string;
        inStock: boolean;
    }[];
    imageUrls: string[];
}
export interface UpdateProductDto extends Partial<CreateProductDto> {
}
export interface CreateOfferDto {
    title: string;
    description: string;
    type: OfferType;
    value?: number;
    productId?: string;
    validFrom: string;
    validTo: string;
}
export interface StoreAnalyticsDto {
    totalIntents: number;
    callCount: number;
    whatsappCount: number;
    directionsCount: number;
    topProducts: {
        productId: string;
        title: string;
        count: number;
    }[];
}
export declare const PLATFORM_NAME = "LocalFashion";
export declare function buildWhatsAppUrl(phone: string, productTitle: string, storeName: string): string;
export declare function buildDirectionsUrl(latitude: number, longitude: number): string;
export declare function buildTelUrl(phone: string): string;
//# sourceMappingURL=index.d.ts.map