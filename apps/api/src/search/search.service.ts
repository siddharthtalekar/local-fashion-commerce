import { Injectable } from '@nestjs/common';
import { VerificationStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CitiesService } from '../cities/cities.service';
import { toProductSummaryDto } from '../common/mappers';

@Injectable()
export class SearchService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly citiesService: CitiesService,
  ) {}

  async search(q: string, citySlug?: string, limit = 20) {
    const cityId = await this.citiesService.resolveCityId(citySlug);

    const products = await this.prisma.product.findMany({
      where: {
        store: {
          verificationStatus: "approved",
          ...(cityId ? { cityId } : {}),
        },
        OR: [
          { title: { contains: q,  } },
          { description: { contains: q,  } },
          { brand: { name: { contains: q,  } } },
          { category: { name: { contains: q,  } } },
          { tags: { contains: q.toLowerCase() } },
        ],
      },
      include: {
        brand: true,
        category: true,
        store: true,
        sizes: true,
        images: { orderBy: { sortOrder: 'asc' } },
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    return products.map((p) => toProductSummaryDto(p));
  }
}
