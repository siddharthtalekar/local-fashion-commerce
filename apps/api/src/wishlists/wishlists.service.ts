import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class WishlistsService {
  constructor(private readonly prisma: PrismaService) {}

  async getMyWishlist(userId: string) {
    const wishlists = await this.prisma.wishlist.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            brand: true,
            store: true,
            images: { orderBy: { sortOrder: 'asc' }, take: 1 },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return wishlists.map(w => w.product);
  }

  async addProduct(userId: string, productId: string) {
    try {
      await this.prisma.wishlist.create({
        data: { userId, productId },
      });
      return { success: true };
    } catch (e) {
      // Silently ignore unique constraint violation (already in wishlist)
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        return { success: true };
      }
      throw e;
    }
  }

  async removeProduct(userId: string, productId: string) {
    await this.prisma.wishlist.deleteMany({
      where: { userId, productId },
    });
    return { success: true };
  }
}
