import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsEmail,
  IsEnum,
  IsInt,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { BookingStatus, PaymentStatus } from '../schemas/booking.schema';

export class CreateBookingDto {
  @ApiProperty({ example: 'Clara Oswald' })
  @IsString()
  @IsNotEmpty()
  guest: string;

  @ApiProperty({ example: 'clara@tardis.org' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiPropertyOptional({ example: '+31 6 12345678' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ example: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330' })
  @IsString()
  @IsOptional()
  avatar?: string;

  @ApiPropertyOptional({ example: '67bd3ab41234567890abcdef' })
  @IsMongoId()
  @IsOptional()
  holidayPark?: string;

  @ApiPropertyOptional({ example: 'Århus Lakeside Retreat' })
  @IsString()
  @IsOptional()
  park?: string;

  @ApiProperty({ example: '67bd3ab41234567890abcdef' })
  @IsMongoId()
  @IsNotEmpty()
  property: string;

  @ApiPropertyOptional({ example: 'Lakeside Cabin 4' })
  @IsString()
  @IsOptional()
  propertyName?: string;

  @ApiProperty({ example: '2026-08-20T15:00:00.000Z' })
  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  checkInDate: Date;

  @ApiProperty({ example: '2026-08-27T11:00:00.000Z' })
  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  checkOutDate: Date;

  @ApiPropertyOptional({ example: 4, default: 2 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  guestsCount?: number;

  @ApiPropertyOptional({ example: 'SUMMER2026' })
  @IsString()
  @IsOptional()
  offerCode?: string;

  @ApiPropertyOptional({ example: '€', default: '€' })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiPropertyOptional({ example: 'Late check-in requested' })
  @IsString()
  @IsOptional()
  specialRequests?: string;
}

export class UpdateBookingStatusDto {
  @ApiProperty({ enum: BookingStatus, example: BookingStatus.CONFIRMED })
  @IsEnum(BookingStatus)
  @IsNotEmpty()
  status: BookingStatus;

  @ApiPropertyOptional({ enum: PaymentStatus })
  @IsEnum(PaymentStatus)
  @IsOptional()
  paymentStatus?: PaymentStatus;
}
