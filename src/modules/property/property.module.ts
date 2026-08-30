import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Property, PropertySchema } from './schemas/property.schema';
import { HolidayPark, HolidayParkSchema } from '../holiday-park/schemas/holiday-park.schema';
import { PropertyService } from './property.service';
import { PropertyController } from './property.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Property.name, schema: PropertySchema },
      { name: HolidayPark.name, schema: HolidayParkSchema },
    ]),
  ],
  controllers: [PropertyController],
  providers: [PropertyService],
  exports: [PropertyService, MongooseModule],
})
export class PropertyModule {}
