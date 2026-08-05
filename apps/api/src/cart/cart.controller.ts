import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, Request } from '@nestjs/common';
import { CartService } from './cart.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  getCart(@Request() req) {
    return this.cartService.getCart(req.user.id);
  }

  @Post(':productId')
  addToCart(
    @Request() req,
    @Param('productId') productId: string,
    @Body() body: { quantity?: number; size?: string; color?: string }
  ) {
    return this.cartService.addToCart(req.user.id, productId, body.quantity, body.size, body.color);
  }

  @Patch('item/:cartItemId')
  updateCartItem(
    @Request() req,
    @Param('cartItemId') cartItemId: string,
    @Body('quantity') quantity: number
  ) {
    return this.cartService.updateCartItem(req.user.id, cartItemId, quantity);
  }

  @Delete('item/:cartItemId')
  removeFromCart(@Request() req, @Param('cartItemId') cartItemId: string) {
    return this.cartService.removeFromCart(req.user.id, cartItemId);
  }
}
