import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UserRole } from '@local-fashion/shared-types';
import { JwtAuthGuard, Roles } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { StoresService } from './stores.service';
import { CreateStoreDto } from './dto/create-store.dto';

@Controller('stores')
export class StoresController {
  constructor(private readonly storesService: StoresService) {}

  @Get()
  findAll(
    @Query('citySlug') citySlug?: string,
    @Query('lat') lat?: number,
    @Query('lng') lng?: number,
    @Query('radiusKm') radiusKm?: number,
  ) {
    return this.storesService.findAll({ citySlug, lat, lng, radiusKm });
  }

  @Get('nearby')
  findNearby(
    @Query('lat') lat: number,
    @Query('lng') lng: number,
    @Query('radiusKm') radiusKm?: number,
    @Query('citySlug') citySlug?: string,
  ) {
    return this.storesService.findNearby(lat, lng, radiusKm ?? 5, citySlug);
  }

  @Get('mine')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.RETAILER)
  getMyStores(@Req() req: { user: { id: string } }) {
    return this.storesService.getMyStores(req.user.id);
  }

  @Get('mine/analytics')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.RETAILER)
  getMyAnalytics(@Req() req: { user: { id: string } }) {
    return this.storesService.getAnalytics(req.user.id);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Query('lat') lat?: number,
    @Query('lng') lng?: number,
  ) {
    return this.storesService.findOne(id, lat, lng);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.RETAILER)
  create(@Req() req: { user: { id: string } }, @Body() dto: CreateStoreDto) {
    return this.storesService.create(req.user.id, dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.RETAILER)
  update(
    @Req() req: { user: { id: string } },
    @Param('id') id: string,
    @Body() dto: Partial<CreateStoreDto>,
  ) {
    return this.storesService.updateStore(req.user.id, id, dto);
  }
}
