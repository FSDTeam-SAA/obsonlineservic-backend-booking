import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HolidayPark, HolidayParkSchema } from './schemas/holiday-park.schema';
import { HolidayParkService } from './holiday-park.service';
import { HolidayParkController } from './holiday-park.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: HolidayPark.name, schema: HolidayParkSchema },
    ]),
  ],
  controllers: [HolidayParkController],
  providers: [HolidayParkService],
  exports: [HolidayParkService, MongooseModule],
})
export class HolidayParkModule {}
