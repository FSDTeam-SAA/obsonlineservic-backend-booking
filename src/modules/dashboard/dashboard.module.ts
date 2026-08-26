import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { HolidayParkModule } from '../holiday-park/holiday-park.module';
import { PropertyModule } from '../property/property.module';
import { OfferModule } from '../offer/offer.module';
import { BookingModule } from '../booking/booking.module';

@Module({
  imports: [HolidayParkModule, PropertyModule, OfferModule, BookingModule],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}
