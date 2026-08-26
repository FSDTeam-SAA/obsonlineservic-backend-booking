import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class ValidateOfferDto {
  @ApiProperty({ example: 'SUMMER2026' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ example: 645 })
  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  bookingAmount: number;

  @ApiPropertyOptional({ example: '67bd3ab41234567890abcdef' })
  @IsMongoId()
  @IsOptional()
  holidayParkId?: string;

  @ApiPropertyOptional({ example: '67bd3ab41234567890abcdef' })
  @IsMongoId()
  @IsOptional()
  propertyId?: string;
}
