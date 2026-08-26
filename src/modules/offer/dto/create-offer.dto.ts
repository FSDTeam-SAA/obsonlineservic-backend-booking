import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { OfferScope, OfferStatus, OfferType } from '../schemas/offer.schema';

export class CreateOfferDto {
  @ApiProperty({ example: 'Early Summer Escape' })
  @IsString()
  @IsNotEmpty()
  offerName: string;

  @ApiPropertyOptional({ example: 'SUMMER2026' })
  @IsString()
  @IsOptional()
  offerCode?: string;

  @ApiPropertyOptional({ enum: OfferType, default: OfferType.PERCENTAGE })
  @IsEnum(OfferType)
  @IsOptional()
  offerType?: OfferType;

  @ApiProperty({ example: '15%' })
  @IsString()
  @IsNotEmpty()
  discountValue: string;

  @ApiPropertyOptional({ example: 15 })
  @IsNumber()
  @IsOptional()
  discountPercentage?: number;

  @ApiPropertyOptional({ example: 0 })
  @IsNumber()
  @IsOptional()
  fixedDiscount?: number;

  @ApiPropertyOptional({ example: 'Describe the atmosphere, surroundings and experience...' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 250 })
  @IsNumber()
  @IsOptional()
  minBookingAmount?: number;

  @ApiPropertyOptional({ example: 100 })
  @IsNumber()
  @IsOptional()
  maxDiscount?: number;

  @ApiPropertyOptional({ example: 500 })
  @IsNumber()
  @IsOptional()
  maxUses?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsNumber()
  @IsOptional()
  maxUsesPerGuest?: number;

  @ApiPropertyOptional({ enum: OfferScope, default: OfferScope.ENTIRE_PLATFORM })
  @IsEnum(OfferScope)
  @IsOptional()
  scope?: OfferScope;

  @ApiPropertyOptional({ type: [String], example: ['67bd3ab41234567890abcdef'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  applicableParks?: string[];

  @ApiPropertyOptional({ type: [String], example: ['67bd3ab41234567890abcdef'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  applicableProperties?: string[];

  @ApiPropertyOptional({ type: [String], example: ['Århus Lakeside Retreat'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  applicableParkNames?: string[];

  @ApiProperty({ example: '2026-06-01T00:00:00.000Z' })
  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  validFrom: Date;

  @ApiProperty({ example: '2026-08-31T23:59:59.000Z' })
  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  validUntil: Date;

  @ApiPropertyOptional({ enum: OfferStatus, default: OfferStatus.ACTIVE })
  @IsEnum(OfferStatus)
  @IsOptional()
  status?: OfferStatus;
}
