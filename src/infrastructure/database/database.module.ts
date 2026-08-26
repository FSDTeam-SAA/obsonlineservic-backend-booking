import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { AppLogger } from '../../common/logger/app-logger.service';
import mongoose from 'mongoose';
import { SeedService } from './seed.service';
import { User, UserSchema } from '../../modules/auth/schemas/user.schema';
import { HolidayPark, HolidayParkSchema } from '../../modules/holiday-park/schemas/holiday-park.schema';
import { Property, PropertySchema } from '../../modules/property/schemas/property.schema';
import { Offer, OfferSchema } from '../../modules/offer/schemas/offer.schema';
import { Booking, BookingSchema } from '../../modules/booking/schemas/booking.schema';
import { Review, ReviewSchema } from '../../modules/review/schemas/review.schema';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: (configService: ConfigService, logger: AppLogger) => {
        mongoose.set('strictQuery', true);
        logger.setContext('Database');

        const uri = configService.get<string>('database.uri');
        const env = configService.get<string>('app.env');

        mongoose.connection.on('connected', () => {
          if (env !== 'production') logger.log('MongoDB connected successfully');
        });

        mongoose.connection.on('error', (err) => {
          logger.error('MongoDB connection error', err);
        });

        mongoose.connection.on('disconnected', () => {
          logger.warn('MongoDB disconnected');
        });

        return { uri };
      },
      inject: [ConfigService, AppLogger],
    }),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: HolidayPark.name, schema: HolidayParkSchema },
      { name: Property.name, schema: PropertySchema },
      { name: Offer.name, schema: OfferSchema },
      { name: Booking.name, schema: BookingSchema },
      { name: Review.name, schema: ReviewSchema },
    ]),
  ],
  providers: [SeedService],
  exports: [MongooseModule, SeedService],
})
export class DatabaseModule {}
