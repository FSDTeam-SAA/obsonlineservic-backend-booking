import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HolidayPark, HolidayParkSchema } from './schemas/holiday-park.schema';
import { Property, PropertySchema } from '../property/schemas/property.schema';
import { HolidayParkService } from './holiday-park.service';
import { HolidayParkController } from './holiday-park.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: HolidayPark.name, schema: HolidayParkSchema },
      { name: Property.name, schema: PropertySchema },
    ]),
  ],
  controllers: [HolidayParkController],
  providers: [HolidayParkService],
  exports: [HolidayParkService, MongooseModule],
})
export class HolidayParkModule {}
