import { Body, Controller, Get, Param, Post, Delete, Query, Req, UseGuards } from '@nestjs/common';
import { UserRole } from '@local-fashion/shared-types';
import { JwtAuthGuard, Roles } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { OffersService } from './offers.service';
import { CreateOfferDto } from './dto/create-offer.dto';

@Controller('offers')
export class OffersController {
  constructor(private readonly offersService: OffersService) {}

  @Get('active')
  findActive(@Query('citySlug') citySlug?: string) {
    return this.offersService.findActive(citySlug);
  }

  @Post('store/:storeId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.RETAILER)
  create(
    @Req() req: { user: { id: string } },
    @Param('storeId') storeId: string,
    @Body() dto: CreateOfferDto,
  ) {
    return this.offersService.create(storeId, req.user.id, dto);
  }

  @Get('store/:storeId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.RETAILER)
  findByStore(
    @Req() req: { user: { id: string } },
    @Param('storeId') storeId: string,
  ) {
    return this.offersService.findByStore(storeId, req.user.id);
  }

  @Delete('store/:storeId/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.RETAILER)
  delete(
    @Req() req: { user: { id: string } },
    @Param('storeId') storeId: string,
    @Param('id') id: string,
  ) {
    return this.offersService.delete(storeId, id, req.user.id);
  }
}
