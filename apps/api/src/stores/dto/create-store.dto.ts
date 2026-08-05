import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  IsObject,
} from 'class-validator';

export class CreateStoreDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  address!: string;

  @IsString()
  cityId!: string;

  @IsNumber()
  latitude!: number;

  @IsNumber()
  longitude!: number;

  @IsString()
  phone!: string;

  @IsString()
  whatsapp!: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  categoryTags?: string[];

  @IsOptional()
  @IsObject()
  openingHours?: Record<string, string>;

  @IsOptional()
  @IsString()
  coverImageUrl?: string;
}
