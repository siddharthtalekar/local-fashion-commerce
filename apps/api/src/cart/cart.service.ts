import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  async getCart(userId: string) {
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              include: {
                store: true,
                images: true
              }
            }
          }
        }
      }
    });

    if (!cart) {
      return this.prisma.cart.create({
        data: { userId },
        include: { items: { include: { product: { include: { store: true, images: true } } } } }
      });
    }

    return cart;
  }

  async addToCart(userId: string, productId: string, quantity: number = 1, size?: string, color?: string) {
    let cart = await this.prisma.cart.findUnique({
      where: { userId }
    });

    if (!cart) {
      cart = await this.prisma.cart.create({
        data: { userId }
      });
    }

    const existingItem = await this.prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId,
        size: size || null,
        color: color || null
      }
    });

    if (existingItem) {
      await this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity }
      });
    } else {
      await this.prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          quantity,
          size,
          color
        }
      });
    }

    return this.getCart(userId);
  }

  async updateCartItem(userId: string, cartItemId: string, quantity: number) {
    const cart = await this.prisma.cart.findUnique({
      where: { userId }
    });

    if (!cart) throw new NotFoundException('Cart not found');

    const item = await this.prisma.cartItem.findFirst({
      where: { id: cartItemId, cartId: cart.id }
    });

    if (!item) throw new NotFoundException('Cart item not found');

    if (quantity <= 0) {
      await this.prisma.cartItem.delete({
        where: { id: cartItemId }
      });
    } else {
      await this.prisma.cartItem.update({
        where: { id: cartItemId },
        data: { quantity }
      });
    }

    return this.getCart(userId);
  }

  async removeFromCart(userId: string, cartItemId: string) {
    const cart = await this.prisma.cart.findUnique({
      where: { userId }
    });

    if (!cart) throw new NotFoundException('Cart not found');

    const item = await this.prisma.cartItem.findFirst({
      where: { id: cartItemId, cartId: cart.id }
    });

    if (!item) throw new NotFoundException('Cart item not found');

    await this.prisma.cartItem.delete({
      where: { id: cartItemId }
    });

    return this.getCart(userId);
  }
}
