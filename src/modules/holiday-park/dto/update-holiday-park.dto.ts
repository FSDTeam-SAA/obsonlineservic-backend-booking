import { PartialType } from '@nestjs/swagger';
import { CreateHolidayParkDto } from './create-holiday-park.dto';

export class UpdateHolidayParkDto extends PartialType(CreateHolidayParkDto) {}
