import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BrandsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.brand.findMany({
      orderBy: { name: 'asc' }
    });
  }

  async requestBrand(name: string) {
    // For demo/prototype, we just auto-create the brand
    // In production, this might create a BrandRequest record for admin approval
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    let brand = await this.prisma.brand.findUnique({ where: { slug } });
    if (!brand) {
      brand = await this.prisma.brand.create({
        data: { name, slug },
      });
    }
    return brand;
  }
}
