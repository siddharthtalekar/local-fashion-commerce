import { Module } from '@nestjs/common';
import { CitiesModule } from '../cities/cities.module';
import { OffersController } from './offers.controller';
import { OffersService } from './offers.service';

@Module({
  imports: [CitiesModule],
  controllers: [OffersController],
  providers: [OffersService],
})
export class OffersModule {}
