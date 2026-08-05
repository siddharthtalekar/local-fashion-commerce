import { Controller, Get, Post, Body } from '@nestjs/common';
import { BrandsService } from './brands.service';

@Controller('brands')
export class BrandsController {
  constructor(private readonly brandsService: BrandsService) {}

  @Get()
  findAll() {
    return this.brandsService.findAll();
  }

  @Post('request')
  requestBrand(@Body() dto: { name: string }) {
    return this.brandsService.requestBrand(dto.name);
  }
}
