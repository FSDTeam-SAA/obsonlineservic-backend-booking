import {
  Controller,
  Get,
  Post,
  Patch,
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
import { BookingService } from './booking.service';
import { CreateBookingDto, UpdateBookingStatusDto } from './dto/create-booking.dto';
import { QueryBookingDto } from './dto/query-booking.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { RoleType } from '../../common/enums/role.enum';

@ApiTags('Bookings')
@Controller('bookings')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Public()
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new reservation / booking' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Booking created successfully' })
  create(@Body() dto: CreateBookingDto) {
    return this.bookingService.create(dto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Post('auth-booking')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a booking for the currently logged-in user' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Booking created and tied to user' })
  createUserBooking(
    @CurrentUser('_id') userId: string,
    @Body() dto: CreateBookingDto,
  ) {
    return this.bookingService.create(dto, userId);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: '[Admin] List bookings with search and status/park filtering' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Bookings list fetched' })
  findAll(@Query() query: QueryBookingDto) {
    return this.bookingService.findAll(query);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Get('my-bookings')
  @ApiOperation({ summary: 'Get current user\'s booking history' })
  @ApiResponse({ status: HttpStatus.OK, description: 'User bookings fetched' })
  findMyBookings(@CurrentUser('_id') userId: string) {
    return this.bookingService.findMyBookings(userId);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get booking details by ID (Mongo ID or OBS-1024 code)' })
  @ApiParam({ name: 'id', description: 'Booking ID or OBS code' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Booking details' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Booking not found' })
  findOne(@Param('id') id: string) {
    return this.bookingService.findById(id);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: '[Admin] Update booking status (Confirmed, Pending, Cancelled)' })
  @ApiParam({ name: 'id', description: 'Booking ID or OBS code' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Status updated' })
  updateStatus(@Param('id') id: string, @Body() dto: UpdateBookingStatusDto) {
    return this.bookingService.updateStatus(id, dto);
  }

  @Delete(':id/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel a booking by ID or OBS code' })
  @ApiParam({ name: 'id', description: 'Booking ID or OBS code' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Booking cancelled' })
  cancel(@Param('id') id: string) {
    return this.bookingService.cancelBooking(id);
  }
}
