import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type OfferDocument = HydratedDocument<Offer>;

export enum OfferType {
  PERCENTAGE = 'percentage',
  FIXED = 'fixed',
}

export enum OfferScope {
  ENTIRE_PLATFORM = 'entire_platform',
  HOLIDAY_PARKS = 'holiday_parks',
  PROPERTIES = 'properties',
}

export enum OfferStatus {
  ACTIVE = 'Active',
  EXPIRED = 'Expired',
  DRAFT = 'Draft',
  INACTIVE = 'Inactive',
}

export enum OfferPlacement {
  FEATURED = 'featured',
  SPECIAL_PACKAGES = 'special_packages',
}

@Schema({ timestamps: true })
export class Offer {
  @Prop({ required: true, trim: true })
  offerName: string;

  @Prop({ trim: true, uppercase: true, sparse: true, default: null })
  offerCode?: string;

  @Prop({ type: String, enum: Object.values(OfferType), default: OfferType.PERCENTAGE })
  offerType: OfferType;

  @Prop({ required: true, default: '15%' })
  discountValue: string;

  @Prop({ type: Number, default: 15 })
  discountPercentage: number;

  @Prop({ type: Number, default: 0 })
  fixedDiscount: number;

  @Prop({ default: '' })
  description: string;

  @Prop({ type: Number, default: 0 })
  minBookingAmount: number;

  @Prop({ type: Number, default: 0 })
  maxDiscount: number;

  @Prop({ type: Number, default: 1000 })
  maxUses: number;

  @Prop({ type: Number, default: 1 })
  maxUsesPerGuest: number;

  @Prop({ type: Number, default: 0 })
  usedCount: number;

  @Prop({ type: String, enum: Object.values(OfferScope), default: OfferScope.ENTIRE_PLATFORM })
  scope: OfferScope;

  @Prop({ type: String, enum: Object.values(OfferPlacement), default: OfferPlacement.FEATURED })
  displayPlacement: OfferPlacement;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'HolidayPark' }], default: [] })
  applicableParks: Types.ObjectId[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Property' }], default: [] })
  applicableProperties: Types.ObjectId[];

  @Prop({ type: [String], default: [] })
  applicableParkNames: string[];

  @Prop({ required: true, default: () => new Date() })
  validFrom: Date;

  @Prop({ required: true, default: () => new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) })
  validUntil: Date;

  @Prop({ type: String, enum: Object.values(OfferStatus), default: OfferStatus.ACTIVE })
  status: OfferStatus;
}

export const OfferSchema = SchemaFactory.createForClass(Offer);

OfferSchema.index({ offerName: 'text', offerCode: 'text', description: 'text' });
