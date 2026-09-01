import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { OfferPlacement, OfferScope, OfferStatus, OfferType } from '../schemas/offer.schema';

export class QueryOfferDto {
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

  @ApiPropertyOptional({ example: 'Summer' })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ enum: OfferType })
  @IsEnum(OfferType)
  @IsOptional()
  offerType?: OfferType;

  @ApiPropertyOptional({ enum: OfferScope })
  @IsEnum(OfferScope)
  @IsOptional()
  scope?: OfferScope;

  @ApiPropertyOptional({ enum: OfferPlacement })
  @IsEnum(OfferPlacement)
  @IsOptional()
  displayPlacement?: OfferPlacement;

  @ApiPropertyOptional({ enum: OfferStatus })
  @IsEnum(OfferStatus)
  @IsOptional()
  status?: OfferStatus;
}
