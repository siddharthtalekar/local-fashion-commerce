import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { toBrandDto, toCategoryDto } from '../common/mappers';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  findAllCategories() {
    return this.prisma.category
      .findMany({ orderBy: { name: 'asc' } })
      .then((cats) => cats.map(toCategoryDto));
  }

  findAllBrands() {
    return this.prisma.brand
      .findMany({ orderBy: { name: 'asc' } })
      .then((brands) => brands.map(toBrandDto));
  }
}
