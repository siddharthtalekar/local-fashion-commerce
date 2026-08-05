import { Controller, Get } from '@nestjs/common';
import { CategoriesService } from './categories.service';

@Controller()
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get('categories')
  findCategories() {
    return this.categoriesService.findAllCategories();
  }

  @Get('brands')
  findBrands() {
    return this.categoriesService.findAllBrands();
  }
}
