import { Injectable, NotFoundException } from '@nestjs/common';
import { VerificationStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  findPendingStores() {
    return this.prisma.store.findMany({
      where: { verificationStatus: 'pending' },
      include: { owner: { select: { id: true, name: true, phone: true } }, city: true },
      orderBy: { createdAt: 'asc' },
    });
  }

  findActiveStores() {
    return this.prisma.store.findMany({
      where: { verificationStatus: 'approved' },
      include: { owner: { select: { id: true, name: true, phone: true } }, city: true, _count: { select: { products: true, orders: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  findAllUsers() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        phone: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  findAllOrders() {
    return this.prisma.order.findMany({
      include: {
        store: { select: { id: true, name: true } },
        user: { select: { id: true, name: true, phone: true } },
        _count: { select: { items: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 100, // Limit to 100 most recent for performance
    });
  }

  async updateStoreStatus(storeId: string, status: VerificationStatus) {
    const store = await this.prisma.store.findUnique({ where: { id: storeId } });
    if (!store) throw new NotFoundException('Store not found');
    return this.prisma.store.update({
      where: { id: storeId },
      data: { verificationStatus: status },
    });
  }

  async getAnalytics() {
    const [
      totalUsers,
      totalRetailers,
      approvedStores,
      pendingStores,
      totalProducts,
      totalOrders
    ] = await Promise.all([
      this.prisma.user.count({ where: { role: 'customer' } }),
      this.prisma.user.count({ where: { role: 'retailer' } }),
      this.prisma.store.count({ where: { verificationStatus: 'approved' } }),
      this.prisma.store.count({ where: { verificationStatus: 'pending' } }),
      this.prisma.product.count(),
      this.prisma.order.count()
    ]);

    return {
      totalUsers,
      totalRetailers,
      approvedStores,
      pendingStores,
      totalProducts,
      totalOrders
    };
  }

  async createCategory(name: string, imageUrl?: string, parentId?: string) {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    return this.prisma.category.create({
      data: { name, slug, imageUrl, parentId }
    });
  }

  async createBrand(name: string) {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    return this.prisma.brand.create({
      data: { name, slug }
    });
  }

  async deleteCategory(id: string) {
    return this.prisma.category.delete({ where: { id } });
  }

  async deleteBrand(id: string) {
    return this.prisma.brand.delete({ where: { id } });
  }

  async findAllProducts(skip = 0, take = 50) {
    const [items, total] = await Promise.all([
      this.prisma.product.findMany({
        skip,
        take,
        include: {
          store: { select: { id: true, name: true } },
          brand: { select: { id: true, name: true } },
          category: { select: { id: true, name: true } },
          images: { take: 1, orderBy: { sortOrder: 'asc' } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.product.count(),
    ]);
    return { items, total };
  }

  async deleteProduct(id: string) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundException('Product not found');
    return this.prisma.product.delete({ where: { id } });
  }
}
