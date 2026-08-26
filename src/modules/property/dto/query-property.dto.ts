import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { PropertyCategory, PropertyStatus } from '../schemas/property.schema';

export class QueryPropertyDto {
  @ApiPropertyOptional({ example: 1, default: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({ example: 10, default: 10 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  limit?: number = 10;

  @ApiPropertyOptional({ example: 'Villa' })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ enum: PropertyCategory })
  @IsEnum(PropertyCategory)
  @IsOptional()
  category?: PropertyCategory;

  @ApiPropertyOptional({ example: '67bd3ab41234567890abcdef' })
  @IsMongoId()
  @IsOptional()
  holidayPark?: string;

  @ApiPropertyOptional({ example: 'Austria' })
  @IsString()
  @IsOptional()
  country?: string;

  @ApiPropertyOptional({ example: 4 })
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  guests?: number;

  @ApiPropertyOptional({ example: 2 })
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  beds?: number;

  @ApiPropertyOptional({ example: 50 })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  minPrice?: number;

  @ApiPropertyOptional({ example: 500 })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  maxPrice?: number;

  @ApiPropertyOptional({ example: true })
  @Type(() => Boolean)
  @IsBoolean()
  @IsOptional()
  petsAllowed?: boolean;

  @ApiPropertyOptional({ enum: PropertyStatus })
  @IsEnum(PropertyStatus)
  @IsOptional()
  status?: PropertyStatus;

  @ApiPropertyOptional({ example: true })
  @Type(() => Boolean)
  @IsBoolean()
  @IsOptional()
  isPopular?: boolean;
}
