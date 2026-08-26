import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { HolidayParkService } from './holiday-park.service';
import { CreateHolidayParkDto } from './dto/create-holiday-park.dto';
import { UpdateHolidayParkDto } from './dto/update-holiday-park.dto';
import { QueryHolidayParkDto } from './dto/query-holiday-park.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { RoleType } from '../../common/enums/role.enum';

@ApiTags('Holiday Parks')
@Controller('holiday-parks')
export class HolidayParkController {
  constructor(private readonly holidayParkService: HolidayParkService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'List holiday parks with search, filtering, and pagination' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Holiday parks fetched successfully' })
  findAll(@Query() query: QueryHolidayParkDto) {
    return this.holidayParkService.findAll(query);
  }

  @Public()
  @Get('featured')
  @ApiOperation({ summary: 'Get featured holiday parks for homepage carousel' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Featured holiday parks fetched' })
  findFeatured() {
    return this.holidayParkService.findFeatured();
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get single holiday park details by ID' })
  @ApiParam({ name: 'id', description: 'Holiday Park ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Holiday park details' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Holiday park not found' })
  findOne(@Param('id') id: string) {
    return this.holidayParkService.findById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.ADMIN)
  @ApiBearerAuth('access-token')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '[Admin] Create a new holiday park' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Holiday park created' })
  create(@Body() dto: CreateHolidayParkDto) {
    return this.holidayParkService.create(dto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: '[Admin] Update a holiday park' })
  @ApiParam({ name: 'id', description: 'Holiday Park ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Holiday park updated' })
  update(@Param('id') id: string, @Body() dto: UpdateHolidayParkDto) {
    return this.holidayParkService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.ADMIN)
  @ApiBearerAuth('access-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '[Admin] Delete a holiday park' })
  @ApiParam({ name: 'id', description: 'Holiday Park ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Holiday park deleted' })
  remove(@Param('id') id: string) {
    return this.holidayParkService.remove(id);
  }
}
