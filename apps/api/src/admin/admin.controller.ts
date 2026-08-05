import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { UserRole, VerificationStatus } from '@local-fashion/shared-types';
import { JwtAuthGuard, Roles } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { AdminService } from './admin.service';
import { IsEnum } from 'class-validator';

class UpdateStatusDto {
  @IsEnum(VerificationStatus)
  status!: VerificationStatus;
}

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stores/pending')
  findPending() {
    return this.adminService.findPendingStores();
  }

  @Get('stores/active')
  findActive() {
    return this.adminService.findActiveStores();
  }

  @Get('users')
  findAllUsers() {
    return this.adminService.findAllUsers();
  }

  @Get('orders')
  findAllOrders() {
    return this.adminService.findAllOrders();
  }

  @Patch('stores/:id/status')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateStatusDto) {
    return this.adminService.updateStoreStatus(id, dto.status as 'pending' | 'approved' | 'rejected');
  }

  @Get('analytics')
  findAnalytics() {
    return this.adminService.getAnalytics();
  }

  @Post('categories')
  createCategory(@Body() body: { name: string; imageUrl?: string; parentId?: string }) {
    return this.adminService.createCategory(body.name, body.imageUrl, body.parentId);
  }

  @Post('brands')
  createBrand(@Body() body: { name: string }) {
    return this.adminService.createBrand(body.name);
  }

  @Delete('categories/:id')
  deleteCategory(@Param('id') id: string) {
    return this.adminService.deleteCategory(id);
  }

  @Delete('brands/:id')
  deleteBrand(@Param('id') id: string) {
    return this.adminService.deleteBrand(id);
  }

  @Get('products')
  findAllProducts(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    return this.adminService.findAllProducts(
      skip ? parseInt(skip, 10) : 0,
      take ? parseInt(take, 10) : 50,
    );
  }

  @Delete('products/:id')
  deleteProduct(@Param('id') id: string) {
    return this.adminService.deleteProduct(id);
  }
}
