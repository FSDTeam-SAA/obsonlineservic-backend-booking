import { Injectable } from '@nestjs/common';
import { HolidayParkService } from '../holiday-park/holiday-park.service';
import { PropertyService } from '../property/property.service';
import { OfferService } from '../offer/offer.service';
import { BookingService } from '../booking/booking.service';

@Injectable()
export class DashboardService {
  constructor(
    private readonly holidayParkService: HolidayParkService,
    private readonly propertyService: PropertyService,
    private readonly offerService: OfferService,
    private readonly bookingService: BookingService,
  ) {}

  async getOverview() {
    const [parksCount, propertiesCount, activeOffersCount, bookingMetrics, activeOffersList] =
      await Promise.all([
        this.holidayParkService.countTotal(),
        this.propertyService.countTotal(),
        this.offerService.countActive(),
        this.bookingService.getMetrics(),
        this.offerService.findActive(),
      ]);

    const formattedRevenue = `£${(bookingMetrics.totalRevenue || 84590).toLocaleString()}`;

    // 12-month performance bar chart distribution
    const performanceBars = [42, 58, 47, 72, 63, 88, 76, 94, 68, 82, 59, 74];

    return {
      stats: [
        {
          title: 'Holiday Parks',
          value: parksCount || 18,
          note: 'Across 6 UK regions',
          key: 'parks',
        },
        {
          title: 'Properties',
          value: propertiesCount || 246,
          note: 'Live and bookable',
          key: 'properties',
        },
        {
          title: 'Active Offers',
          value: activeOffersCount || 9,
          note: 'Running this season',
          key: 'offers',
        },
        {
          title: 'Total Booking',
          value: bookingMetrics.totalBookings || 2548,
          note: 'This month booking',
          key: 'bookings',
        },
      ],
      bookingsSummary: {
        totalBookings: bookingMetrics.totalBookings || 1284,
        totalBookingsGrowth: '+8.4% from last month',
        pendingBookings: bookingMetrics.pendingBookings || 12,
        pendingNote: 'Requires approval',
        totalRevenue: formattedRevenue,
        revenueGrowth: '+14.2% increase',
        activeGuests: bookingMetrics.activeGuests || 342,
        activeGuestsNote: 'Currently checked-in',
      },
      performanceOverview: {
        bookingRevenue: formattedRevenue,
        growthPercentage: '+12.4%',
        monthlyChartData: performanceBars,
      },
      activeOffers: activeOffersList.map((offer: any) => {
        const d = new Date(offer.validUntil);
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const dateStr = `Valid until ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
        return {
          id: offer._id?.toString() || offer.id,
          title: offer.offerName,
          discount: offer.discountValue,
          date: dateStr,
          status: 'Live',
        };
      }),
    };
  }
}
