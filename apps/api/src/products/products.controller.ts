import {
  Body,
  Controller,
  Delete,
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
import { ProductsService } from './products.service';
import { CreateProductDto, ToggleStockDto } from './dto/create-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  findAll(@Query() query: ProductQueryDto) {
    return this.productsService.findAll(query);
  }

  @Get('compare')
  compare(@Query('ids') ids: string) {
    const idList = ids.split(',').filter(Boolean);
    return this.productsService.compare(idList);
  }

  @Get('store/:storeId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.RETAILER)
  findByStore(@Req() req: { user: { id: string } }, @Param('storeId') storeId: string) {
    return this.productsService.findByStore(storeId, req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Get('retailer/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.RETAILER)
  findOneForRetailer(@Req() req: { user: { id: string } }, @Param('id') id: string) {
    return this.productsService.findOneForRetailer(id, req.user.id);
  }

  @Post('store/:storeId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.RETAILER)
  create(
    @Req() req: { user: { id: string } },
    @Param('storeId') storeId: string,
    @Body() dto: CreateProductDto,
  ) {
    return this.productsService.create(storeId, req.user.id, dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.RETAILER)
  update(
    @Req() req: { user: { id: string } },
    @Param('id') id: string,
    @Body() dto: Partial<CreateProductDto>,
  ) {
    return this.productsService.update(id, req.user.id, dto);
  }

  @Patch(':id/sizes/:sizeId/stock')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.RETAILER)
  toggleStock(
    @Req() req: { user: { id: string } },
    @Param('id') id: string,
    @Param('sizeId') sizeId: string,
    @Body() dto: ToggleStockDto,
  ) {
    return this.productsService.toggleSizeStock(id, req.user.id, sizeId, dto.inStock);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.RETAILER)
  remove(@Req() req: { user: { id: string } }, @Param('id') id: string) {
    return this.productsService.remove(id, req.user.id);
  }
}
