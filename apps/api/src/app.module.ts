import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { CitiesModule } from './cities/cities.module';
import { StoresModule } from './stores/stores.module';
import { ProductsModule } from './products/products.module';
import { CategoriesModule } from './categories/categories.module';
import { OffersModule } from './offers/offers.module';
import { IntentsModule } from './intents/intents.module';
import { SearchModule } from './search/search.module';
import { AdminModule } from './admin/admin.module';
import { WishlistsModule } from './wishlists/wishlists.module';
import { CartModule } from './cart/cart.module';
import { ProfileModule } from './profile/profile.module';
import { OrdersModule } from './orders/orders.module';
import { NotificationsModule } from './notifications/notifications.module';
import { BrandsModule } from './brands/brands.module';
import { AddressesModule } from './addresses/addresses.module';
import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 60 }]),
    PrismaModule,
    AuthModule,
    CitiesModule,
    StoresModule,
    ProductsModule,
    CategoriesModule,
    OffersModule,
    IntentsModule,
    SearchModule,
    AdminModule,
    WishlistsModule,
    CartModule,
    ProfileModule,
    OrdersModule,
    NotificationsModule,
    BrandsModule,
    AddressesModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
