import {
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class ProductSizeInput {
  @IsString()
  size!: string;

  @IsBoolean()
  inStock!: boolean;
}

export class CreateProductDto {
  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  categoryId!: string;

  @IsString()
  brandId!: string;

  @IsInt()
  @Min(0)
  price!: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  discountedPrice?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  colors?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductSizeInput)
  sizes!: ProductSizeInput[];

  @IsArray()
  @IsString({ each: true })
  imageUrls!: string[];
}

export class ToggleStockDto {
  @IsBoolean()
  inStock!: boolean;
}
