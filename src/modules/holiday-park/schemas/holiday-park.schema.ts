import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type HolidayParkDocument = HydratedDocument<HolidayPark>;

@Schema({ _id: false })
export class LocationDetails {
  @Prop({ required: true, default: 'Netherlands' })
  country: string;

  @Prop({ default: '' })
  city: string;

  @Prop({ default: '' })
  region: string;

  @Prop({ default: '' })
  postalCode: string;

  @Prop({ default: '' })
  formattedAddress: string;

  @Prop({ default: '' })
  mapLocationPreview: string;

  @Prop({ type: Number, default: 0 })
  latitude: number;

  @Prop({ type: Number, default: 0 })
  longitude: number;
}
export const LocationDetailsSchema = SchemaFactory.createForClass(LocationDetails);

@Schema({ _id: false })
export class CustomAmenity {
  @Prop({ required: true })
  title: string;

  @Prop({ default: '' })
  description: string;

  @Prop({ default: 'Sparkles' })
  iconName: string;
}
export const CustomAmenitySchema = SchemaFactory.createForClass(CustomAmenity);

@Schema({ _id: false })
export class EcoBadge {
  @Prop({ default: 'CERTIFIED ECO-PARK' })
  tagline: string;

  @Prop({ default: '100% Sustainable Stay' })
  title: string;
}
export const EcoBadgeSchema = SchemaFactory.createForClass(EcoBadge);

export enum ParkStatus {
  ACTIVE = 'Active',
  DRAFT = 'Draft',
  ARCHIVED = 'Archived',
}

@Schema({ timestamps: true })
export class HolidayPark {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ default: '' })
  badgeLocation: string;

  @Prop({ default: '' })
  subtitle: string;

  @Prop({ default: '' })
  shortDescription: string;

  @Prop({ default: '' })
  fullDescription: string;

  @Prop({ type: [String], default: [] })
  paragraphs: string[];

  @Prop({ type: Number, default: 4.88 })
  rating: number;

  @Prop({ type: Number, default: 1248 })
  reviewsCount: number;

  @Prop({ default: '' })
  heroBanner: string;

  @Prop({ default: '' })
  coverImage: string;

  @Prop({ type: [String], default: [] })
  gallery: string[];

  @Prop({ type: [String], default: [] })
  amenities: string[];

  @Prop({ type: [CustomAmenitySchema], default: [] })
  featuredAmenities: CustomAmenity[];

  @Prop({ type: Number, default: 129 })
  startingPrice: number;

  @Prop({ default: '€' })
  currency: string;

  @Prop({ type: Number, default: 24 })
  totalProperties: number;

  @Prop({ type: Number, default: 24 })
  availableProperties: number;

  @Prop({ default: '180 Guests' })
  totalCapacity: string;

  @Prop({ default: '15:00' })
  checkInTime: string;

  @Prop({ default: '11:00' })
  checkOutTime: string;

  @Prop({ default: '24 Hours' })
  receptionHours: string;

  @Prop({ type: LocationDetailsSchema, default: () => ({}) })
  location: LocationDetails;

  @Prop({ type: EcoBadgeSchema, default: () => ({}) })
  ecoBadge: EcoBadge;

  @Prop({ type: String, enum: Object.values(ParkStatus), default: ParkStatus.ACTIVE })
  status: ParkStatus;

  @Prop({ default: true })
  isFeatured: boolean;
}

export const HolidayParkSchema = SchemaFactory.createForClass(HolidayPark);

// Text index for search
HolidayParkSchema.index({ name: 'text', title: 'text', 'location.country': 'text', 'location.city': 'text' });
