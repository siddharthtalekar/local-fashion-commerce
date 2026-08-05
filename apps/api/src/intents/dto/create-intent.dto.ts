import { IsEnum, IsObject, IsOptional, IsString } from 'class-validator';
import { IntentType } from '@local-fashion/shared-types';

export class CreateIntentDto {
  @IsEnum(IntentType)
  type!: IntentType;

  @IsString()
  storeId!: string;

  @IsOptional()
  @IsString()
  productId?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}
