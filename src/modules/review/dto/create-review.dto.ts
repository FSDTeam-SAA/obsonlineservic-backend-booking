import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreateReviewDto {
  @ApiPropertyOptional({ example: '67bd3ab41234567890abcdef' })
  @IsMongoId()
  @IsOptional()
  property?: string;

  @ApiPropertyOptional({ example: '67bd3ab41234567890abcdef' })
  @IsMongoId()
  @IsOptional()
  holidayPark?: string;

  @ApiProperty({ example: 'Marvin McKinney' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'Netherlands', default: 'Netherlands' })
  @IsString()
  @IsOptional()
  country?: string;

  @ApiPropertyOptional({ example: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150' })
  @IsString()
  @IsOptional()
  avatar?: string;

  @ApiProperty({ example: 5, minimum: 1, maximum: 5 })
  @IsNumber()
  @Min(1)
  @Max(5)
  @IsNotEmpty()
  rating: number;

  @ApiProperty({ example: 'An absolutely premium experience! Everything was perfect.' })
  @IsString()
  @IsNotEmpty()
  comment: string;
}

export class UpdateReviewDto extends PartialType(CreateReviewDto) {
  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  isPublished?: boolean;
}

export class QueryReviewDto {
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

  @ApiPropertyOptional({ example: '67bd3ab41234567890abcdef' })
  @IsMongoId()
  @IsOptional()
  property?: string;

  @ApiPropertyOptional({ example: '67bd3ab41234567890abcdef' })
  @IsMongoId()
  @IsOptional()
  holidayPark?: string;
}
