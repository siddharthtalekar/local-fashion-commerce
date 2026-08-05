import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Order } from '@prisma/client';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async getUserOrders(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: { take: 1 }
              }
            }
          }
        },
        store: true,
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async checkout(userId: string, addressId?: string, paymentMethod?: string) {
    // paymentMethod is captured for future payment gateway integration.
    // Currently stored as order metadata in the status flow.
    // 1. Get user cart
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

    if (!cart || cart.items.length === 0) {
      throw new HttpException('Cart is empty', HttpStatus.BAD_REQUEST);
    }

    // 2. Group items by store (since an order belongs to a store in our schema)
    const itemsByStore = cart.items.reduce((acc, item) => {
      const storeId = item.product.storeId;
      if (!acc[storeId]) {
        acc[storeId] = [];
      }
      acc[storeId].push(item);
      return acc;
    }, {} as Record<string, typeof cart.items>);

    // 3. Create orders for each store
    const orders: Order[] = [];
    
    // We use a transaction to ensure all orders are created and cart is emptied
    await this.prisma.$transaction(async (tx) => {
      for (const [storeId, items] of Object.entries(itemsByStore)) {
        
        let totalAmount = 0;
        const orderItemsData = items.map(item => {
          const price = item.product.discountedPrice || item.product.price;
          totalAmount += price * item.quantity;
          return {
            productId: item.productId,
            quantity: item.quantity,
            price: price,
            size: item.size,
            color: item.color
          };
        });

        const order = await tx.order.create({
          data: {
            userId,
            storeId,
            status: 'pending',
            totalAmount,
            addressId,
            items: {
              create: orderItemsData
            }
          },
          include: {
            items: true
          }
        });
        
        orders.push(order);
      }

      // 4. Empty the cart
      await tx.cartItem.deleteMany({
        where: { cartId: cart.id }
      });
    });

    return {
      message: 'Checkout successful',
      orders
    };
  }

  async getRetailerOrders(userId: string) {
    const stores = await this.prisma.store.findMany({ where: { ownerId: userId }, select: { id: true } });
    const storeIds = stores.map(s => s.id);

    return this.prisma.order.findMany({
      where: { storeId: { in: storeIds } },
      include: {
        user: { select: { name: true, phone: true } },
        items: {
          include: {
            product: {
              include: { images: { take: 1 } }
            }
          }
        },
        address: true,
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async updateOrderStatus(userId: string, orderId: string, status: string) {
    const stores = await this.prisma.store.findMany({ where: { ownerId: userId }, select: { id: true } });
    const storeIds = stores.map(s => s.id);

    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new HttpException('Order not found', HttpStatus.NOT_FOUND);
    if (!storeIds.includes(order.storeId)) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    return this.prisma.order.update({
      where: { id: orderId },
      data: { status }
    });
  }
}
