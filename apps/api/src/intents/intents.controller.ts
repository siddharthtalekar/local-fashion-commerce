import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { UserRole } from '@local-fashion/shared-types';
import { JwtAuthGuard, Roles } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { IntentsService } from './intents.service';
import { CreateIntentDto } from './dto/create-intent.dto';

@Controller('intents')
export class IntentsController {
  constructor(private readonly intentsService: IntentsService) {}

  @Post()
  create(@Body() dto: CreateIntentDto) {
    return this.intentsService.create(dto);
  }

  @Get('analytics/store/:storeId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.RETAILER)
  analytics(@Req() req: { user: { id: string } }, @Param('storeId') storeId: string) {
    return this.intentsService.getStoreAnalytics(storeId, req.user.id);
  }
}
