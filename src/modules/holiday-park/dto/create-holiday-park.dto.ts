import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { ParkStatus } from '../schemas/holiday-park.schema';

export class LocationDetailsDto {
  @ApiProperty({ example: 'Netherlands' })
  @IsString()
  @IsNotEmpty()
  country: string;

  @ApiPropertyOptional({ example: 'Utrecht' })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiPropertyOptional({ example: 'Veluwe' })
  @IsString()
  @IsOptional()
  region?: string;

  @ApiPropertyOptional({ example: '3811 AB' })
  @IsString()
  @IsOptional()
  postalCode?: string;

  @ApiPropertyOptional({ example: 'Veluwe Forest Resort, NL' })
  @IsString()
  @IsOptional()
  formattedAddress?: string;

  @ApiPropertyOptional({ example: 'https://images.unsplash.com/...' })
  @IsString()
  @IsOptional()
  mapLocationPreview?: string;

  @ApiPropertyOptional({ example: 52.1326 })
  @IsNumber()
  @IsOptional()
  latitude?: number;

  @ApiPropertyOptional({ example: 5.2913 })
  @IsNumber()
  @IsOptional()
  longitude?: number;
}

export class CustomAmenityDto {
  @ApiProperty({ example: 'Forest Spa & Wellness' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ example: 'Rejuvenate with organic herbal saunas...' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 'Leaf' })
  @IsString()
  @IsOptional()
  iconName?: string;
}

export class EcoBadgeDto {
  @ApiPropertyOptional({ example: 'CERTIFIED ECO-PARK' })
  @IsString()
  @IsOptional()
  tagline?: string;

  @ApiPropertyOptional({ example: '100% Sustainable Stay' })
  @IsString()
  @IsOptional()
  title?: string;
}

export class CreateHolidayParkDto {
  @ApiProperty({ example: 'Veluwe Forest Resort' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Veluwe Forest Resort' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ example: 'VELUWE, NETHERLANDS' })
  @IsString()
  @IsOptional()
  badgeLocation?: string;

  @ApiPropertyOptional({ example: 'WELCOME TO PARADISE' })
  @IsString()
  @IsOptional()
  subtitle?: string;

  @ApiPropertyOptional({ example: 'Waterfront cabins with private saunas and uninterrupted lake views.' })
  @IsString()
  @IsOptional()
  shortDescription?: string;

  @ApiPropertyOptional({ example: 'Veluwe Forest Retreat offers a perfect harmony of high-end architectural luxury...' })
  @IsString()
  @IsOptional()
  fullDescription?: string;

  @ApiPropertyOptional({ type: [String], example: ['Veluwe Forest Retreat offers...', 'Whether you want to wake up...'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  paragraphs?: string[];

  @ApiPropertyOptional({ example: 4.88 })
  @IsNumber()
  @IsOptional()
  rating?: number;

  @ApiPropertyOptional({ example: 1248 })
  @IsNumber()
  @IsOptional()
  reviewsCount?: number;

  @ApiPropertyOptional({ example: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=1200' })
  @IsString()
  @IsOptional()
  heroBanner?: string;

  @ApiPropertyOptional({ example: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=600' })
  @IsString()
  @IsOptional()
  coverImage?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  gallery?: string[];

  @ApiPropertyOptional({
    type: [String],
    example: ['Swimming Pool', 'Spa', 'Restaurant', 'Free Parking', 'Free Wi-Fi'],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  amenities?: string[];

  @ApiPropertyOptional({ type: [CustomAmenityDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CustomAmenityDto)
  @IsOptional()
  featuredAmenities?: CustomAmenityDto[];

  @ApiPropertyOptional({ example: 129 })
  @IsNumber()
  @IsOptional()
  startingPrice?: number;

  @ApiPropertyOptional({ example: '€' })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiPropertyOptional({ example: 24 })
  @IsNumber()
  @IsOptional()
  totalProperties?: number;

  @ApiPropertyOptional({ example: 24 })
  @IsNumber()
  @IsOptional()
  availableProperties?: number;

  @ApiPropertyOptional({ example: '180 Guests' })
  @IsString()
  @IsOptional()
  totalCapacity?: string;

  @ApiPropertyOptional({ example: '15:00' })
  @IsString()
  @IsOptional()
  checkInTime?: string;

  @ApiPropertyOptional({ example: '11:00' })
  @IsString()
  @IsOptional()
  checkOutTime?: string;

  @ApiPropertyOptional({ example: '24 Hours' })
  @IsString()
  @IsOptional()
  receptionHours?: string;

  @ApiPropertyOptional({ type: LocationDetailsDto })
  @ValidateNested()
  @Type(() => LocationDetailsDto)
  @IsOptional()
  location?: LocationDetailsDto;

  @ApiPropertyOptional({ type: EcoBadgeDto })
  @ValidateNested()
  @Type(() => EcoBadgeDto)
  @IsOptional()
  ecoBadge?: EcoBadgeDto;

  @ApiPropertyOptional({ enum: ParkStatus, default: ParkStatus.ACTIVE })
  @IsEnum(ParkStatus)
  @IsOptional()
  status?: ParkStatus;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean;
}
