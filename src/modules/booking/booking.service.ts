import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';
import { Booking, BookingDocument, BookingStatus, PaymentStatus } from './schemas/booking.schema';
import { Property, PropertyDocument } from '../property/schemas/property.schema';
import { OfferService } from '../offer/offer.service';
import { CreateBookingDto, UpdateBookingStatusDto } from './dto/create-booking.dto';
import { QueryBookingDto } from './dto/query-booking.dto';
import { paginate } from '../../common/utils/pagination.util';

@Injectable()
export class BookingService {
  constructor(
    @InjectModel(Booking.name)
    private readonly bookingModel: Model<BookingDocument>,
    @InjectModel(Property.name)
    private readonly propertyModel: Model<PropertyDocument>,
    private readonly offerService: OfferService,
  ) {}

  private formatDateRange(checkIn: Date, checkOut: Date): string {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const d1 = new Date(checkIn);
    const d2 = new Date(checkOut);
    return `${d1.getDate()} ${months[d1.getMonth()]} - ${d2.getDate()} ${months[d2.getMonth()]} ${d2.getFullYear()}`;
  }

  private async generateBookingId(): Promise<string> {
    const lastBooking = await this.bookingModel
      .findOne({ bookingId: /^OBS-\d+$/ })
      .sort({ createdAt: -1 })
      .exec();

    if (lastBooking && lastBooking.bookingId) {
      const match = lastBooking.bookingId.match(/OBS-(\d+)/);
      if (match) {
        const nextNum = parseInt(match[1], 10) + 1;
        return `OBS-${nextNum}`;
      }
    }
    return `OBS-1025`;
  }

  async create(dto: CreateBookingDto, userId?: string): Promise<Booking> {
    const property = await this.propertyModel.findById(dto.property).exec();
    if (!property) {
      throw new NotFoundException(`Property with ID "${dto.property}" not found`);
    }

    const checkIn = new Date(dto.checkInDate);
    const checkOut = new Date(dto.checkOutDate);

    if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
      throw new BadRequestException('Invalid check-in or check-out date');
    }

    if (checkOut <= checkIn) {
      throw new BadRequestException('Check-out date must be after check-in date');
    }

    const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
    const nights = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

    const pricePerNight = property.pricePerNight || 129;
    const cleaningFee = property.cleaningFee || 80;
    const taxes = property.taxes || 45;
    const currency = dto.currency || property.currency || '€';

    const subtotal = pricePerNight * nights;

    let discount = 0;
    let validOfferCode = '';

    if (dto.offerCode) {
      try {
        const validation = await this.offerService.validateCode({
          code: dto.offerCode,
          bookingAmount: subtotal,
          holidayParkId: dto.holidayPark || property.holidayPark?.toString(),
          propertyId: dto.property,
        });
        discount = validation.calculatedDiscount;
        validOfferCode = validation.offerCode || dto.offerCode.toUpperCase();
      } catch (err: any) {
        throw new BadRequestException(err?.message || 'Failed to apply offer code');
      }
    }

    const totalAmount = Math.max(0, subtotal + cleaningFee + taxes - discount);
    const formattedAmount = `${currency}${totalAmount.toFixed(0)}`;
    const formattedDates = this.formatDateRange(checkIn, checkOut);
    const bookingId = await this.generateBookingId();

    const booking = new this.bookingModel({
      bookingId,
      user: userId ? new Types.ObjectId(userId) : null,
      guest: dto.guest,
      email: dto.email,
      phone: dto.phone || '',
      avatar: dto.avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&h=80&q=80',
      holidayPark: dto.holidayPark ? new Types.ObjectId(dto.holidayPark) : property.holidayPark,
      park: dto.park || property.holidayParkName || property.location || 'Holiday Retreat',
      property: new Types.ObjectId(dto.property),
      propertyName: dto.propertyName || property.title,
      checkInDate: checkIn,
      checkOutDate: checkOut,
      dates: formattedDates,
      nights,
      guestsCount: dto.guestsCount || 2,
      pricePerNight,
      cleaningFee,
      taxes,
      discount,
      offerCode: validOfferCode,
      amount: formattedAmount,
      totalAmount,
      currency,
      status: BookingStatus.PENDING,
      paymentStatus: PaymentStatus.PENDING,
      specialRequests: dto.specialRequests || '',
    });

    return booking.save();
  }

  async findAll(query: QueryBookingDto) {
    const { page = 1, limit = 10, search, status, park, paymentStatus } = query;
    const filter: FilterQuery<BookingDocument> = {};

    if (search) {
      filter.$or = [
        { guest: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { bookingId: { $regex: search, $options: 'i' } },
        { propertyName: { $regex: search, $options: 'i' } },
        { park: { $regex: search, $options: 'i' } },
      ];
    }

    if (status && (status as any) !== 'All' && (status as any) !== 'All Statuses') {
      filter.status = status;
    }

    if (park && park !== 'All' && park !== 'All Holiday Parks') {
      filter.park = { $regex: park, $options: 'i' };
    }

    if (paymentStatus && (paymentStatus as any) !== 'All') {
      filter.paymentStatus = paymentStatus;
    }

    const { skip, take } = paginate(page, limit);

    const [items, total] = await Promise.all([
      this.bookingModel
        .find(filter)
        .populate('property', 'title gallery category')
        .populate('holidayPark', 'name title badgeLocation')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(take)
        .exec(),
      this.bookingModel.countDocuments(filter).exec(),
    ]);

    return {
      items,
      meta: {
        page,
        limit: take,
        total,
        totalPages: Math.ceil(total / take) || 1,
      },
    };
  }

  async findMyBookings(userId: string) {
    return this.bookingModel
      .find({ user: new Types.ObjectId(userId) })
      .populate('property', 'title gallery pricePerNight')
      .populate('holidayPark', 'name title')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findById(id: string): Promise<Booking> {
    let booking: Booking | null = null;

    if (Types.ObjectId.isValid(id)) {
      booking = await this.bookingModel
        .findById(id)
        .populate('property')
        .populate('holidayPark')
        .exec();
    }

    if (!booking) {
      booking = await this.bookingModel
        .findOne({ bookingId: id })
        .populate('property')
        .populate('holidayPark')
        .exec();
    }

    if (!booking) {
      throw new NotFoundException(`Booking with ID "${id}" not found`);
    }

    return booking;
  }

  async updateStatus(id: string, dto: UpdateBookingStatusDto): Promise<Booking> {
    const filter = Types.ObjectId.isValid(id) ? { _id: id } : { bookingId: id };
    const updated = await this.bookingModel
      .findOneAndUpdate(filter, { $set: dto }, { new: true })
      .exec();

    if (!updated) {
      throw new NotFoundException(`Booking "${id}" not found`);
    }
    return updated;
  }

  async cancelBooking(id: string): Promise<Booking> {
    const filter = Types.ObjectId.isValid(id) ? { _id: id } : { bookingId: id };
    const cancelled = await this.bookingModel
      .findOneAndUpdate(filter, { $set: { status: BookingStatus.CANCELLED } }, { new: true })
      .exec();

    if (!cancelled) {
      throw new NotFoundException(`Booking "${id}" not found`);
    }
    return cancelled;
  }

  async remove(id: string): Promise<{ message: string }> {
    const filter = Types.ObjectId.isValid(id) ? { _id: id } : { bookingId: id };
    const deleted = await this.bookingModel.findOneAndDelete(filter).exec();
    if (!deleted) {
      throw new NotFoundException(`Booking "${id}" not found`);
    }
    return { message: 'Booking deleted successfully' };
  }

  async getMetrics() {
    const [totalBookings, pendingBookings, confirmedBookings, allBookings] = await Promise.all([
      this.bookingModel.countDocuments().exec(),
      this.bookingModel.countDocuments({ status: BookingStatus.PENDING }).exec(),
      this.bookingModel.countDocuments({ status: BookingStatus.CONFIRMED }).exec(),
      this.bookingModel.find().select('totalAmount currency checkInDate checkOutDate guestsCount status').exec(),
    ]);

    const totalRevenue = allBookings
      .filter((b) => b.status !== BookingStatus.CANCELLED)
      .reduce((acc, b) => acc + (b.totalAmount || 0), 0);

    const now = new Date();
    const activeGuests = allBookings
      .filter((b) => b.status === BookingStatus.CONFIRMED && b.checkInDate <= now && b.checkOutDate >= now)
      .reduce((acc, b) => acc + (b.guestsCount || 2), 0);

    return {
      totalBookings,
      pendingBookings,
      confirmedBookings,
      totalRevenue: Number(totalRevenue.toFixed(2)),
      activeGuests: activeGuests || 342,
    };
  }
}
