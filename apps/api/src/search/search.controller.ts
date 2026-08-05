import { Controller, Get, Query } from '@nestjs/common';
import { SearchService } from './search.service';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  search(
    @Query('q') q: string,
    @Query('citySlug') citySlug?: string,
    @Query('limit') limit?: number,
  ) {
    return this.searchService.search(q ?? '', citySlug, limit ?? 20);
  }
}
