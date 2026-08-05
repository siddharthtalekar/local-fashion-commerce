import { Controller, Post, Get, Patch, Param, UseGuards, Request, Body, HttpException, HttpStatus } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  getUserOrders(@Request() req) {
    return this.ordersService.getUserOrders(req.user.id);
  }

  @Post('checkout')
  checkout(
    @Request() req,
    @Body() body: { addressId?: string; paymentMethod: string }
  ) {
    if (!body.paymentMethod) {
      throw new HttpException('Payment method is required', HttpStatus.BAD_REQUEST);
    }
    return this.ordersService.checkout(req.user.id, body.addressId, body.paymentMethod);
  }

  @Get('retailer')
  getRetailerOrders(@Request() req) {
    return this.ordersService.getRetailerOrders(req.user.id);
  }

  @Patch('retailer/:id/status')
  updateOrderStatus(
    @Request() req,
    @Param('id') orderId: string,
    @Body('status') status: string
  ) {
    if (!status) {
      throw new HttpException('Status is required', HttpStatus.BAD_REQUEST);
    }
    return this.ordersService.updateOrderStatus(req.user.id, orderId, status);
  }
}
