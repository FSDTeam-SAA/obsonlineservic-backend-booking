import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { PropertyCategory, PropertyStatus } from '../schemas/property.schema';

export class PropertyGalleryDto {
  @ApiProperty({ example: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=1200' })
  @IsString()
  @IsNotEmpty()
  main: string;

  @ApiPropertyOptional({ example: 'https://images.unsplash.com/photo-1510798831971-661eb04b3739?q=80&w=600' })
  @IsString()
  @IsOptional()
  side1?: string;

  @ApiPropertyOptional({ example: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=600' })
  @IsString()
  @IsOptional()
  side2?: string;

  @ApiPropertyOptional({ example: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=600' })
  @IsString()
  @IsOptional()
  side3?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  photos?: string[];

  @ApiPropertyOptional({ example: 15 })
  @IsNumber()
  @IsOptional()
  totalPhotos?: number;
}

export class PropertySpecDto {
  @ApiProperty({ example: 'GUESTS' })
  @IsString()
  @IsNotEmpty()
  label: string;

  @ApiProperty({ example: 'Up to 6' })
  @IsString()
  @IsNotEmpty()
  value: string;

  @ApiPropertyOptional({ example: 'Users' })
  @IsString()
  @IsOptional()
  iconName?: string;
}

export class PropertyAmenityDto {
  @ApiProperty({ example: 'Private Sauna' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'Flame' })
  @IsString()
  @IsOptional()
  iconName?: string;
}

export class CreatePropertyDto {
  @ApiProperty({ example: 'Luxury Lake Villa' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ example: 'FEATURED LODGE' })
  @IsString()
  @IsOptional()
  badge?: string;

  @ApiPropertyOptional({ enum: PropertyCategory, default: PropertyCategory.WELLNESS_VILLAS })
  @IsEnum(PropertyCategory)
  @IsOptional()
  category?: PropertyCategory;

  @ApiPropertyOptional({ example: '67bd3ab41234567890abcdef' })
  @IsMongoId()
  @IsOptional()
  holidayPark?: string;

  @ApiPropertyOptional({ example: 'Silverlake Retreat, Austria' })
  @IsString()
  @IsOptional()
  holidayParkName?: string;

  @ApiPropertyOptional({ example: 'Salzkammergut Alps, Austria' })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiPropertyOptional({ example: 'Austria' })
  @IsString()
  @IsOptional()
  country?: string;

  @ApiPropertyOptional({ example: 4.9 })
  @IsNumber()
  @IsOptional()
  rating?: number;

  @ApiPropertyOptional({ example: 1248 })
  @IsNumber()
  @IsOptional()
  reviewsCount?: number;

  @ApiPropertyOptional({
    example:
      'An architectural masterpiece perched on the pristine shores of Lake Weissensee, offering private wellness...',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 129 })
  @IsNumber()
  @IsNotEmpty()
  pricePerNight: number;

  @ApiPropertyOptional({ example: '€' })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiPropertyOptional({ example: 'Price for per nights · Up to 4 guests included' })
  @IsString()
  @IsOptional()
  priceSubtext?: string;

  @ApiPropertyOptional({ example: 4 })
  @IsNumber()
  @IsOptional()
  guests?: number;

  @ApiPropertyOptional({ example: 2 })
  @IsNumber()
  @IsOptional()
  beds?: number;

  @ApiPropertyOptional({ example: 2 })
  @IsNumber()
  @IsOptional()
  baths?: number;

  @ApiPropertyOptional({ example: '240 m²' })
  @IsString()
  @IsOptional()
  size?: string;

  @ApiPropertyOptional({ example: 'Free Private' })
  @IsString()
  @IsOptional()
  parking?: string;

  @ApiPropertyOptional({ example: 'Free up to 24 hours' })
  @IsString()
  @IsOptional()
  wifi?: string;

  @ApiPropertyOptional({ example: false })
  @IsBoolean()
  @IsOptional()
  petsAllowed?: boolean;

  @ApiPropertyOptional({ example: 80 })
  @IsNumber()
  @IsOptional()
  cleaningFee?: number;

  @ApiPropertyOptional({ example: 45 })
  @IsNumber()
  @IsOptional()
  taxes?: number;

  @ApiPropertyOptional({ example: 'Best Price Guarantee' })
  @IsString()
  @IsOptional()
  guaranteeText?: string;

  @ApiProperty({ type: PropertyGalleryDto })
  @ValidateNested()
  @Type(() => PropertyGalleryDto)
  @IsNotEmpty()
  gallery: PropertyGalleryDto;

  @ApiPropertyOptional({ type: [PropertyAmenityDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PropertyAmenityDto)
  @IsOptional()
  amenities?: PropertyAmenityDto[];

  @ApiPropertyOptional({ type: [PropertySpecDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PropertySpecDto)
  @IsOptional()
  specs?: PropertySpecDto[];

  @ApiPropertyOptional({ enum: PropertyStatus, default: PropertyStatus.ACTIVE })
  @IsEnum(PropertyStatus)
  @IsOptional()
  status?: PropertyStatus;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  isPopular?: boolean;
}
