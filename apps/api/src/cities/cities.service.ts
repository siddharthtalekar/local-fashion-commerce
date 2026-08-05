import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CitiesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.city.findMany({ orderBy: { name: 'asc' } });
  }

  async findBySlug(slug: string) {
    const city = await this.prisma.city.findUnique({ where: { slug } });
    if (!city) throw new NotFoundException('City not found');
    return city;
  }

  async resolveCityId(citySlug?: string): Promise<string | undefined> {
    const slug = citySlug ?? process.env.PILOT_CITY_SLUG ?? 'pune';
    const city = await this.prisma.city.findUnique({ where: { slug } });
    return city?.id;
  }
}
