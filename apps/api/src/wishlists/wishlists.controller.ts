import { Controller, Get, Post, Delete, Param, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { WishlistsService } from './wishlists.service';

@Controller('wishlists')
@UseGuards(JwtAuthGuard)
export class WishlistsController {
  constructor(private readonly wishlistsService: WishlistsService) {}

  @Get()
  getMyWishlist(@Req() req: { user: { id: string } }) {
    return this.wishlistsService.getMyWishlist(req.user.id);
  }

  @Post(':productId')
  addProduct(
    @Req() req: { user: { id: string } },
    @Param('productId') productId: string,
  ) {
    return this.wishlistsService.addProduct(req.user.id, productId);
  }

  @Delete(':productId')
  removeProduct(
    @Req() req: { user: { id: string } },
    @Param('productId') productId: string,
  ) {
    return this.wishlistsService.removeProduct(req.user.id, productId);
  }
}
