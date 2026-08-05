import { IsDateString, IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { OfferType } from '@local-fashion/shared-types';

export class CreateOfferDto {
  @IsString()
  title!: string;

  @IsString()
  description!: string;

  @IsEnum(OfferType)
  type!: OfferType;

  @IsOptional()
  @IsInt()
  @Min(0)
  value?: number;

  @IsOptional()
  @IsString()
  productId?: string;

  @IsDateString()
  validFrom!: string;

  @IsDateString()
  validTo!: string;
}
