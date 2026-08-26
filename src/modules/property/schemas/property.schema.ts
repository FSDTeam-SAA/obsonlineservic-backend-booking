import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type PropertyDocument = HydratedDocument<Property>;

export enum PropertyCategory {
  ALL = 'All Properties',
  LAKEFRONT = 'Lakefront',
  CABINS_AND_LODGES = 'Cabins & Lodges',
  WELLNESS_VILLAS = 'Wellness Villas',
}

export enum PropertyStatus {
  ACTIVE = 'Active',
  DRAFT = 'Draft',
  ARCHIVED = 'Archived',
}

@Schema({ _id: false })
export class PropertyGallery {
  @Prop({ required: true })
  main: string;

  @Prop({ default: '' })
  side1: string;

  @Prop({ default: '' })
  side2: string;

  @Prop({ default: '' })
  side3: string;

  @Prop({ type: [String], default: [] })
  photos: string[];

  @Prop({ type: Number, default: 4 })
  totalPhotos: number;
}
export const PropertyGallerySchema = SchemaFactory.createForClass(PropertyGallery);

@Schema({ _id: false })
export class PropertySpec {
  @Prop({ required: true })
  label: string;

  @Prop({ required: true })
  value: string;

  @Prop({ default: 'Users' })
  iconName: string;
}
export const PropertySpecSchema = SchemaFactory.createForClass(PropertySpec);

@Schema({ _id: false })
export class PropertyAmenity {
  @Prop({ required: true })
  name: string;

  @Prop({ default: 'Sparkles' })
  iconName: string;
}
export const PropertyAmenitySchema = SchemaFactory.createForClass(PropertyAmenity);

@Schema({ timestamps: true })
export class Property {
  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ default: 'PREMIUM VILLA' })
  badge: string;

  @Prop({
    type: String,
    enum: Object.values(PropertyCategory),
    default: PropertyCategory.WELLNESS_VILLAS,
  })
  category: PropertyCategory;

  @Prop({ type: Types.ObjectId, ref: 'HolidayPark', required: false, default: null })
  holidayPark?: Types.ObjectId;

  @Prop({ default: '' })
  holidayParkName: string;

  @Prop({ default: 'Veluwe Forest Resort, NL' })
  location: string;

  @Prop({ default: 'Netherlands' })
  country: string;

  @Prop({ type: Number, default: 4.88 })
  rating: number;

  @Prop({ type: Number, default: 1248 })
  reviewsCount: number;

  @Prop({ default: '' })
  description: string;

  @Prop({ type: Number, default: 129 })
  pricePerNight: number;

  @Prop({ default: '€' })
  currency: string;

  @Prop({ default: 'Price for per nights · Up to 4 guests included' })
  priceSubtext: string;

  @Prop({ type: Number, default: 4 })
  guests: number;

  @Prop({ type: Number, default: 2 })
  beds: number;

  @Prop({ type: Number, default: 2 })
  baths: number;

  @Prop({ default: '240 m²' })
  size: string;

  @Prop({ default: 'Free Private' })
  parking: string;

  @Prop({ default: 'Free up to 24 hours' })
  wifi: string;

  @Prop({ default: false })
  petsAllowed: boolean;

  @Prop({ type: Number, default: 80 })
  cleaningFee: number;

  @Prop({ type: Number, default: 45 })
  taxes: number;

  @Prop({ default: 'Best Price Guarantee' })
  guaranteeText: string;

  @Prop({ type: PropertyGallerySchema, required: true })
  gallery: PropertyGallery;

  @Prop({ type: [PropertyAmenitySchema], default: [] })
  amenities: PropertyAmenity[];

  @Prop({ type: [PropertySpecSchema], default: [] })
  specs: PropertySpec[];

  @Prop({ type: String, enum: Object.values(PropertyStatus), default: PropertyStatus.ACTIVE })
  status: PropertyStatus;

  @Prop({ default: true })
  isPopular: boolean;
}

export const PropertySchema = SchemaFactory.createForClass(Property);

PropertySchema.index({ title: 'text', location: 'text', description: 'text' });
