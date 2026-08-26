import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ReviewDocument = HydratedDocument<Review>;

@Schema({ timestamps: true })
export class Review {
  @Prop({ type: Types.ObjectId, ref: 'Property', required: false, default: null })
  property?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'HolidayPark', required: false, default: null })
  holidayPark?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: false, default: null })
  user?: Types.ObjectId;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ default: 'Netherlands' })
  country: string;

  @Prop({ default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150' })
  avatar: string;

  @Prop({ type: Number, required: true, min: 1, max: 5, default: 5 })
  rating: number;

  @Prop({ type: Number, default: 5 })
  maxRating: number;

  @Prop({ required: true })
  comment: string;

  @Prop({ default: true })
  isPublished: boolean;
}

export const ReviewSchema = SchemaFactory.createForClass(Review);
