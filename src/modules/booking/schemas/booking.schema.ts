import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type BookingDocument = HydratedDocument<Booking>;

export enum BookingStatus {
  CONFIRMED = 'Confirmed',
  PENDING = 'Pending',
  CANCELLED = 'Cancelled',
}

export enum PaymentStatus {
  PAID = 'Paid',
  PENDING = 'Pending',
  REFUNDED = 'Refunded',
}

@Schema({ timestamps: true })
export class Booking {
  @Prop({ required: true, unique: true, index: true })
  bookingId: string; // e.g. "OBS-1024"

  @Prop({ type: Types.ObjectId, ref: 'User', required: false, default: null })
  user?: Types.ObjectId;

  @Prop({ required: true, trim: true })
  guest: string;

  @Prop({ required: true, trim: true, lowercase: true })
  email: string;

  @Prop({ default: '' })
  phone: string;

  @Prop({ default: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&h=80&q=80' })
  avatar: string;

  @Prop({ type: Types.ObjectId, ref: 'HolidayPark', required: false, default: null })
  holidayPark?: Types.ObjectId;

  @Prop({ required: true, default: 'Veluwe Forest Resort' })
  park: string;

  @Prop({ type: Types.ObjectId, ref: 'Property', required: false, default: null })
  property?: Types.ObjectId;

  @Prop({ required: true, default: 'Luxury Lake Villa' })
  propertyName: string;

  @Prop({ required: true, default: () => new Date() })
  checkInDate: Date;

  @Prop({ required: true, default: () => new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) })
  checkOutDate: Date;

  @Prop({ default: '' })
  dates: string; // e.g. "20 Aug - 27 Aug 2026"

  @Prop({ type: Number, default: 1 })
  nights: number;

  @Prop({ type: Number, default: 2 })
  guestsCount: number;

  @Prop({ type: Number, default: 129 })
  pricePerNight: number;

  @Prop({ type: Number, default: 80 })
  cleaningFee: number;

  @Prop({ type: Number, default: 45 })
  taxes: number;

  @Prop({ type: Number, default: 0 })
  discount: number;

  @Prop({ default: '' })
  offerCode: string;

  @Prop({ default: '€129' })
  amount: string; // Formatted amount e.g. "£840" or "€770"

  @Prop({ type: Number, required: true })
  totalAmount: number;

  @Prop({ default: '€' })
  currency: string;

  @Prop({ type: String, enum: Object.values(BookingStatus), default: BookingStatus.PENDING })
  status: BookingStatus;

  @Prop({ type: String, enum: Object.values(PaymentStatus), default: PaymentStatus.PENDING })
  paymentStatus: PaymentStatus;

  @Prop({ default: '' })
  specialRequests?: string;
}

export const BookingSchema = SchemaFactory.createForClass(Booking);

BookingSchema.index({ guest: 'text', email: 'text', bookingId: 'text', park: 'text', propertyName: 'text' });
