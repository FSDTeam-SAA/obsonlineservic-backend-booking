import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../../modules/auth/schemas/user.schema';
import { RoleType } from '../../common/enums/role.enum';
import { HolidayPark, HolidayParkDocument, ParkStatus } from '../../modules/holiday-park/schemas/holiday-park.schema';
import { Property, PropertyDocument, PropertyCategory, PropertyStatus } from '../../modules/property/schemas/property.schema';
import { Offer, OfferDocument, OfferPlacement, OfferScope, OfferStatus, OfferType } from '../../modules/offer/schemas/offer.schema';
import { Booking, BookingDocument, BookingStatus, PaymentStatus } from '../../modules/booking/schemas/booking.schema';
import { Review, ReviewDocument } from '../../modules/review/schemas/review.schema';

@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(HolidayPark.name) private readonly holidayParkModel: Model<HolidayParkDocument>,
    @InjectModel(Property.name) private readonly propertyModel: Model<PropertyDocument>,
    @InjectModel(Offer.name) private readonly offerModel: Model<OfferDocument>,
    @InjectModel(Booking.name) private readonly bookingModel: Model<BookingDocument>,
    @InjectModel(Review.name) private readonly reviewModel: Model<ReviewDocument>,
  ) {}

  async seed() {
    this.logger.log('Starting database seeding...');

    // 1. Seed Users
    await this.seedUsers();

    // 2. Seed Holiday Parks
    const parks = await this.seedHolidayParks();

    // 3. Seed Properties
    const properties = await this.seedProperties(parks);

    // 4. Seed Offers
    await this.seedOffers(parks, properties);

    // 5. Seed Bookings
    await this.seedBookings(parks, properties);

    // 6. Seed Reviews
    await this.seedReviews(parks, properties);

    this.logger.log('Database seeding completed successfully!');
  }

  private async seedUsers() {
    const adminEmail = 'admin@example.com';
    const userEmail = 'user@example.com';

    let admin = await this.userModel.findOne({ email: adminEmail }).exec();
    if (!admin) {
      admin = new this.userModel({
        name: 'Elena Marsh',
        email: adminEmail,
        password: 'Password123!',
        role: RoleType.ADMIN,
        phone: '(307) 555-0133',
        profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80',
        isVerified: true,
        address: { country: 'United Kingdom', cityState: 'London', postalCode: 'SW1A 1AA', roadArea: 'Whitehall' },
      });
      await admin.save();
      this.logger.log(`Created Admin user: ${adminEmail}`);
    }

    let regularUser = await this.userModel.findOne({ email: userEmail }).exec();
    if (!regularUser) {
      regularUser = new this.userModel({
        name: 'Clara Oswald',
        email: userEmail,
        password: 'Password123!',
        role: RoleType.USER,
        phone: '(307) 555-0199',
        profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&h=80&q=80',
        isVerified: true,
        address: { country: 'Netherlands', cityState: 'Utrecht', postalCode: '3811 AB', roadArea: 'Veluwe' },
      });
      await regularUser.save();
      this.logger.log(`Created Regular user: ${userEmail}`);
    }
  }

  private async seedHolidayParks(): Promise<HolidayParkDocument[]> {
    const count = await this.holidayParkModel.countDocuments().exec();
    if (count > 0) {
      this.logger.log(`Found ${count} holiday parks already in database.`);
      return this.holidayParkModel.find().exec();
    }

    const parksData = [
      {
        name: 'Veluwe Forest Resort',
        title: 'Veluwe Forest Resort',
        badgeLocation: 'VELUWE, NETHERLANDS',
        subtitle: 'WELCOME TO PARADISE',
        shortDescription: 'Waterfront cabins with private saunas, floating decks and uninterrupted lake views.',
        fullDescription: 'Veluwe Forest Retreat offers a perfect harmony of high-end architectural luxury and untouched natural beauty. Set inside Netherlands most celebrated national park, our retreat is designed for those seeking peace, wellness, and refined comfort.',
        paragraphs: [
          'Veluwe Forest Retreat offers a perfect harmony of high-end architectural luxury and untouched natural beauty. Set inside Netherlands most celebrated national park, our retreat is designed for those seeking peace, wellness, and refined comfort.',
          'Whether you want to wake up to the sound of whispering pines, indulge in a restorative spa session, or explore private pristine lake waters, every corner of our park is crafted to reconnect you with what matters.',
          'Discover the thrill of hiking through ancient forests, the tranquility of stargazing under clear night skies, or the joy of sharing stories around a crackling campfire—our park offers unforgettable moments for every adventurer.',
          'Imagine mornings filled with bird songs and afternoons spent kayaking on crystal-clear streams; our park is a sanctuary where every path leads to new discoveries and cherished memories.',
        ],
        rating: 4.88,
        reviewsCount: 1248,
        heroBanner: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=1200',
        coverImage: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=600&auto=format&fit=crop',
        gallery: [
          'https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=1200',
          'https://images.unsplash.com/photo-1510798831971-661eb04b3739?q=80&w=600',
          'https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=600',
          'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=600',
        ],
        amenities: ['Swimming Pool', 'Spa', 'Restaurant', 'Free Parking', 'Free Wi-Fi', 'Kids Playground', 'Pet Friendly', 'Bike Rental', 'EV Charging', 'Gym'],
        featuredAmenities: [
          { title: 'Forest Spa & Wellness', description: 'Rejuvenate with organic herbal saunas, outdoor hot tubs, and massage therapies overlooking the pine forest.', iconName: 'Leaf' },
          { title: 'The Wildwood Restaurant', description: 'Savor exquisite organic farm-to-table dishes prepared by award-winning chefs using locally sourced wild ingredients.', iconName: 'UtensilsCrossed' },
          { title: 'Heated Natural Pool', description: 'Swim in our gorgeous eco-pool, naturally heated and integrated perfectly into the surrounding landscape.', iconName: 'Waves' },
          { title: 'Premium Bike Rental', description: 'Explore miles of dedicated national park trails with our fleet of premium mountain and electric bikes.', iconName: 'Bike' },
          { title: 'Nature Adventure Park', description: 'A safe, creative outdoor play sanctuary crafted from natural timbers to spark children imagination.', iconName: 'Trees' },
          { title: 'Private Lakeside Beach', description: 'Relax on the sandy shores of our crystal lake, featuring a private wooden deck, paddleboards, and cozy fire pits.', iconName: 'Umbrella' },
        ],
        startingPrice: 129,
        currency: '€',
        totalProperties: 24,
        availableProperties: 24,
        totalCapacity: '180 Guests',
        checkInTime: '15:00',
        checkOutTime: '11:00',
        receptionHours: '24 Hours',
        location: {
          country: 'Netherlands',
          city: 'Utrecht',
          region: 'Veluwe',
          postalCode: '3811 AB',
          formattedAddress: 'Veluwe Forest Resort, NL',
          mapLocationPreview: 'https://images.unsplash.com/photo-1510798831971-661eb04b3739?q=80&w=600',
          latitude: 52.1326,
          longitude: 5.2913,
        },
        ecoBadge: { tagline: 'CERTIFIED ECO-PARK', title: '100% Sustainable Stay' },
        status: ParkStatus.ACTIVE,
        isFeatured: true,
      },
      {
        name: 'Silverlake Retreat',
        title: 'Silverlake Retreat',
        badgeLocation: 'SALZKAMMERGUT, AUSTRIA',
        subtitle: 'ALPINE WATERFRONT WONDER',
        shortDescription: 'Waterfront cabins with private saunas, floating decks and uninterrupted lake views.',
        fullDescription: 'Perched on the pristine shores of Lake Weissensee in the Austrian Alps.',
        rating: 4.88,
        reviewsCount: 940,
        heroBanner: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200',
        coverImage: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=600',
        gallery: ['https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=1200'],
        amenities: ['Swimming Pool', 'Spa', 'Restaurant', 'Free Parking', 'Free Wi-Fi'],
        startingPrice: 129,
        currency: '€',
        totalProperties: 42,
        availableProperties: 42,
        totalCapacity: '210 Guests',
        checkInTime: '15:00',
        checkOutTime: '11:00',
        receptionHours: '24 Hours',
        location: { country: 'Austria', city: 'Salzkammergut', region: 'Alps', postalCode: '9762', formattedAddress: 'Salzkammergut Alps, Austria' },
        ecoBadge: { tagline: 'CERTIFIED ECO-PARK', title: '100% Sustainable Stay' },
        status: ParkStatus.ACTIVE,
        isFeatured: true,
      },
      {
        name: 'Mountain View Resort',
        title: 'Mountain View Resort',
        badgeLocation: 'ASPEN, COLORADO',
        subtitle: 'LUXURY HIGH-ALTITUDE LODGES',
        shortDescription: 'Panoramic alpine lodges with private hot tubs and ski-in/ski-out access.',
        fullDescription: 'Nestled in the Rocky Mountains with private chef service and heated decks.',
        rating: 4.92,
        reviewsCount: 680,
        heroBanner: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=1200',
        coverImage: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=600',
        gallery: ['https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=1200'],
        amenities: ['Spa', 'Restaurant', 'Free Parking', 'Free Wi-Fi', 'Gym'],
        startingPrice: 179,
        currency: '€',
        totalProperties: 25,
        availableProperties: 25,
        totalCapacity: '150 Guests',
        location: { country: 'United States', city: 'Aspen', region: 'Colorado', formattedAddress: 'Aspen, Colorado' },
        status: ParkStatus.ACTIVE,
        isFeatured: true,
      },
      {
        name: 'Coastal Breeze Hotel',
        title: 'Coastal Breeze Hotel',
        badgeLocation: 'CAPE TOWN, SOUTH AFRICA',
        subtitle: 'OCEANFRONT PARADISE',
        shortDescription: 'Cliffside villas with infinity pools overlooking the Atlantic Ocean.',
        rating: 4.85,
        reviewsCount: 520,
        coverImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=600',
        gallery: ['https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=600'],
        amenities: ['Swimming Pool', 'Restaurant', 'Free Wi-Fi', 'Bar'],
        startingPrice: 145,
        currency: '€',
        totalProperties: 40,
        availableProperties: 40,
        totalCapacity: '200 Guests',
        location: { country: 'South Africa', city: 'Cape Town', formattedAddress: 'Cape Town, South Africa' },
        status: ParkStatus.ACTIVE,
        isFeatured: true,
      },
      {
        name: 'Århus Lakeside Retreat',
        title: 'Århus Lakeside Retreat',
        badgeLocation: 'ÅRHUS, DENMARK',
        subtitle: 'SCANDINAVIAN WATERFRONT SERENITY',
        shortDescription: 'Nordic minimalist timber cabins over crystal-clear fjords.',
        rating: 4.95,
        reviewsCount: 880,
        coverImage: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=600',
        gallery: ['https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=600'],
        amenities: ['Spa', 'Restaurant', 'Free Parking', 'Free Wi-Fi', 'Bike Rental'],
        startingPrice: 135,
        currency: '£',
        totalProperties: 32,
        availableProperties: 32,
        totalCapacity: '180 Guests',
        location: { country: 'Denmark', city: 'Århus', formattedAddress: 'Århus, Denmark' },
        status: ParkStatus.ACTIVE,
        isFeatured: true,
      },
      {
        name: 'Nordic Fjord Expedition',
        title: 'Nordic Fjord Expedition',
        badgeLocation: 'BERGEN, NORWAY',
        subtitle: 'FJORD ESCAPE',
        shortDescription: 'Bespoke mountain cabins surrounded by cascading waterfalls.',
        rating: 4.91,
        reviewsCount: 750,
        coverImage: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=600',
        gallery: ['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=600'],
        amenities: ['Sauna', 'Free Parking', 'Free Wi-Fi', 'Kayaks'],
        startingPrice: 165,
        currency: '£',
        totalProperties: 28,
        availableProperties: 28,
        totalCapacity: '140 Guests',
        location: { country: 'Norway', city: 'Bergen', formattedAddress: 'Bergen, Norway' },
        status: ParkStatus.ACTIVE,
        isFeatured: true,
      },
      {
        name: 'Sicilian Citrus Grove Getaway',
        title: 'Sicilian Citrus Grove Getaway',
        badgeLocation: 'SICILY, ITALY',
        subtitle: 'MEDITERRANEAN CHARM',
        shortDescription: 'Rustic stone villas immersed in organic lemon and orange orchards.',
        rating: 4.86,
        reviewsCount: 610,
        coverImage: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=600',
        gallery: ['https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=600'],
        amenities: ['Pool', 'Wine Tasting', 'Free Wi-Fi', 'Terrace'],
        startingPrice: 110,
        currency: '€',
        totalProperties: 18,
        availableProperties: 18,
        totalCapacity: '90 Guests',
        location: { country: 'Italy', city: 'Sicily', formattedAddress: 'Sicily, Italy' },
        status: ParkStatus.ACTIVE,
        isFeatured: true,
      },
    ];

    const created = await this.holidayParkModel.insertMany(parksData);
    this.logger.log(`Seeded ${created.length} holiday parks.`);
    return created as HolidayParkDocument[];
  }

  private async seedProperties(parks: HolidayParkDocument[]): Promise<PropertyDocument[]> {
    const count = await this.propertyModel.countDocuments().exec();
    if (count > 0) {
      this.logger.log(`Found ${count} properties already in database.`);
      return this.propertyModel.find().exec();
    }

    const defaultPark = parks[0] || null;
    const austriaPark = parks.find((p) => p.name.includes('Silverlake')) || defaultPark;
    const arhusPark = parks.find((p) => p.name.includes('Århus')) || defaultPark;
    const fjordPark = parks.find((p) => p.name.includes('Nordic')) || defaultPark;
    const citrusPark = parks.find((p) => p.name.includes('Sicilian')) || defaultPark;

    const propertiesData = [
      {
        title: 'Luxury Lake Villa',
        badge: 'FEATURED LODGE',
        category: PropertyCategory.WELLNESS_VILLAS,
        holidayPark: austriaPark?._id,
        holidayParkName: austriaPark?.name || 'Silverlake Retreat',
        location: 'Silverlake Retreat, Austria',
        country: 'Austria',
        rating: 4.9,
        reviewsCount: 1248,
        description: 'An architectural masterpiece perched on the pristine shores of Lake Weissensee, offering private wellness, floor-to-ceiling alpine vistas, and bespoke luxury.',
        pricePerNight: 129,
        currency: '€',
        priceSubtext: 'Price for per nights · Up to 4 guests included',
        guests: 6,
        beds: 3,
        baths: 3.5,
        size: '240 m²',
        parking: 'Free Private',
        wifi: 'Free up to 24 hours',
        petsAllowed: true,
        cleaningFee: 80,
        taxes: 45,
        guaranteeText: 'Best Price Guarantee',
        gallery: {
          main: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=1200&auto=format&fit=crop',
          side1: 'https://images.unsplash.com/photo-1510798831971-661eb04b3739?q=80&w=600&auto=format&fit=crop',
          side2: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=600&auto=format&fit=crop',
          side3: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=600&auto=format&fit=crop',
          photos: [
            'https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=1200',
            'https://images.unsplash.com/photo-1510798831971-661eb04b3739?q=80&w=600',
            'https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=600',
            'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=600',
          ],
          totalPhotos: 15,
        },
        specs: [
          { label: 'GUESTS', value: 'Up to 6', iconName: 'Users' },
          { label: 'BEDROOM', value: '3 Rooms', iconName: 'Bed' },
          { label: 'BATHROOMS', value: '3.5 Baths', iconName: 'Bath' },
          { label: 'SIZE', value: '240 m²', iconName: 'Maximize' },
          { label: 'PARKING', value: 'Free Private', iconName: 'Car' },
          { label: 'WIFI', value: 'Free up to 24 hours', iconName: 'Wifi' },
        ],
        amenities: [
          { name: 'Private Sauna', iconName: 'Flame' },
          { name: 'Lake View', iconName: 'Waves' },
          { name: 'Kitchen', iconName: 'Utensils' },
          { name: 'Coffee Machine', iconName: 'Coffee' },
          { name: 'Smart TV', iconName: 'Tv' },
          { name: 'Air Conditioning', iconName: 'Wind' },
          { name: 'Heating', iconName: 'Flame' },
          { name: 'Parking', iconName: 'Car' },
        ],
        status: PropertyStatus.ACTIVE,
        isPopular: true,
      },
      {
        title: 'Veluwe Forest Resort - Premium Villa',
        badge: 'PREMIUM VILLA',
        category: PropertyCategory.WELLNESS_VILLAS,
        holidayPark: defaultPark?._id,
        holidayParkName: defaultPark?.name || 'Veluwe Forest Resort',
        location: 'Veluwe Forest Resort, NL',
        country: 'Netherlands',
        rating: 4.88,
        reviewsCount: 840,
        description: 'Immerse yourself in forest tranquility with a private wood-fired sauna and glass solarium.',
        pricePerNight: 129,
        currency: '€',
        priceSubtext: 'Price for per nights · Up to 4 guests included',
        guests: 4,
        beds: 2,
        baths: 2,
        size: '180 m²',
        petsAllowed: true,
        cleaningFee: 75,
        taxes: 40,
        gallery: {
          main: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=600&auto=format&fit=crop',
          side1: 'https://images.unsplash.com/photo-1510798831971-661eb04b3739?q=80&w=600',
          side2: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=600',
          side3: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=600',
          totalPhotos: 12,
        },
        status: PropertyStatus.ACTIVE,
        isPopular: true,
      },
      {
        title: 'Veluwe Forest Resort - Luxury Villa',
        badge: 'LUXURY VILLA',
        category: PropertyCategory.LAKEFRONT,
        holidayPark: defaultPark?._id,
        holidayParkName: defaultPark?.name || 'Veluwe Forest Resort',
        location: 'Veluwe Forest Resort, NL',
        country: 'Netherlands',
        rating: 4.88,
        reviewsCount: 910,
        description: 'Lakefront private villa with private jetty and panoramic sunset viewing balcony.',
        pricePerNight: 129,
        currency: '€',
        priceSubtext: 'Price for per nights · Up to 4 guests included',
        guests: 4,
        beds: 2,
        baths: 2,
        size: '195 m²',
        petsAllowed: false,
        cleaningFee: 80,
        taxes: 45,
        gallery: {
          main: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=600&auto=format&fit=crop',
          totalPhotos: 8,
        },
        status: PropertyStatus.ACTIVE,
        isPopular: true,
      },
      {
        title: 'Veluwe Forest Resort - A-Frame Lodge',
        badge: 'A-FRAME LODGE',
        category: PropertyCategory.CABINS_AND_LODGES,
        holidayPark: defaultPark?._id,
        holidayParkName: defaultPark?.name || 'Veluwe Forest Resort',
        location: 'Veluwe Forest Resort, NL',
        country: 'Netherlands',
        rating: 4.88,
        reviewsCount: 760,
        description: 'Iconic Scandinavian triangular lodge with double-height glass front and cozy wood burner.',
        pricePerNight: 129,
        currency: '€',
        priceSubtext: 'Price for per nights · Up to 4 guests included',
        guests: 4,
        beds: 2,
        baths: 2,
        size: '160 m²',
        petsAllowed: true,
        cleaningFee: 70,
        taxes: 35,
        gallery: {
          main: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=600&auto=format&fit=crop',
          totalPhotos: 10,
        },
        status: PropertyStatus.ACTIVE,
        isPopular: true,
      },
      {
        title: 'Veluwe Forest Resort - Alpine Chalet',
        badge: 'ALPINE CHALET',
        category: PropertyCategory.WELLNESS_VILLAS,
        holidayPark: defaultPark?._id,
        holidayParkName: defaultPark?.name || 'Veluwe Forest Resort',
        location: 'Veluwe Forest Resort, NL',
        country: 'Netherlands',
        rating: 4.88,
        reviewsCount: 650,
        description: 'Timber and natural slate luxury chalet equipped with outdoor Finnish cedar hot tub.',
        pricePerNight: 129,
        currency: '€',
        priceSubtext: 'Price for per nights · Up to 4 guests included',
        guests: 4,
        beds: 2,
        baths: 2,
        size: '175 m²',
        petsAllowed: false,
        cleaningFee: 75,
        taxes: 40,
        gallery: {
          main: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=600&auto=format&fit=crop',
          totalPhotos: 9,
        },
        status: PropertyStatus.ACTIVE,
        isPopular: true,
      },
      {
        title: 'Lakeside Cabin 4',
        badge: 'LAKESIDE',
        category: PropertyCategory.LAKEFRONT,
        holidayPark: arhusPark?._id,
        holidayParkName: arhusPark?.name || 'Århus Lakeside Retreat',
        location: 'Århus, Denmark',
        country: 'Denmark',
        rating: 4.92,
        reviewsCount: 340,
        description: 'Modern eco-cabin nestled right above the waters edge with private kayak dock.',
        pricePerNight: 120,
        currency: '£',
        priceSubtext: 'Price per night',
        guests: 2,
        beds: 1,
        baths: 1,
        size: '95 m²',
        petsAllowed: true,
        cleaningFee: 50,
        taxes: 30,
        gallery: {
          main: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=600',
          totalPhotos: 6,
        },
        status: PropertyStatus.ACTIVE,
        isPopular: false,
      },
      {
        title: 'Fjord View Lodge 2',
        badge: 'FJORD RETREAT',
        category: PropertyCategory.CABINS_AND_LODGES,
        holidayPark: fjordPark?._id,
        holidayParkName: fjordPark?.name || 'Nordic Fjord Expedition',
        location: 'Bergen, Norway',
        country: 'Norway',
        rating: 4.96,
        reviewsCount: 510,
        description: 'High luxury fjord sanctuary featuring private thermal pools and outdoor fireplace.',
        pricePerNight: 180,
        currency: '£',
        priceSubtext: 'Price per night',
        guests: 6,
        beds: 3,
        baths: 2,
        size: '220 m²',
        petsAllowed: false,
        cleaningFee: 90,
        taxes: 50,
        gallery: {
          main: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=600',
          totalPhotos: 14,
        },
        status: PropertyStatus.ACTIVE,
        isPopular: true,
      },
      {
        title: 'Citrus Villa 12',
        badge: 'MEDITERRANEAN VILLA',
        category: PropertyCategory.WELLNESS_VILLAS,
        holidayPark: citrusPark?._id,
        holidayParkName: citrusPark?.name || 'Sicilian Citrus Grove Getaway',
        location: 'Sicily, Italy',
        country: 'Italy',
        rating: 4.87,
        reviewsCount: 420,
        description: 'Historic refurbished stone villa with private swimming pool and citrus orchard patio.',
        pricePerNight: 140,
        currency: '€',
        priceSubtext: 'Price per night',
        guests: 4,
        beds: 2,
        baths: 2,
        size: '160 m²',
        petsAllowed: true,
        cleaningFee: 65,
        taxes: 35,
        gallery: {
          main: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=600',
          totalPhotos: 11,
        },
        status: PropertyStatus.ACTIVE,
        isPopular: false,
      },
    ];

    const created = await this.propertyModel.insertMany(propertiesData);
    this.logger.log(`Seeded ${created.length} properties.`);
    return created as PropertyDocument[];
  }

  private async seedOffers(parks: HolidayParkDocument[], properties: PropertyDocument[]) {
    const count = await this.offerModel.countDocuments().exec();
    if (count > 0) {
      this.logger.log(`Found ${count} offers already in database.`);
      return;
    }

    const offersData = [
      {
        offerName: 'Summer Escape 2026',
        offerCode: 'SUMMER2026',
        offerType: OfferType.PERCENTAGE,
        discountValue: '15%',
        discountPercentage: 15,
        description: 'Save 15% on all summer reservations across participating holiday parks.',
        minBookingAmount: 250,
        maxDiscount: 150,
        maxUses: 1000,
        scope: OfferScope.ENTIRE_PLATFORM,
        displayPlacement: OfferPlacement.FEATURED,
        applicableParkNames: ['All Holiday Parks'],
        validFrom: new Date('2026-06-01T00:00:00.000Z'),
        validUntil: new Date('2026-08-31T23:59:59.000Z'),
        status: OfferStatus.ACTIVE,
      },
      {
        offerName: 'Autumn Weekend Special',
        offerCode: 'AUTUMN20',
        offerType: OfferType.PERCENTAGE,
        discountValue: '20%',
        discountPercentage: 20,
        description: 'Enjoy crisp autumn getaways with 20% off all weekend stays in September.',
        minBookingAmount: 200,
        maxDiscount: 120,
        scope: OfferScope.ENTIRE_PLATFORM,
        displayPlacement: OfferPlacement.FEATURED,
        applicableParkNames: ['All Holiday Parks'],
        validFrom: new Date('2026-09-01T00:00:00.000Z'),
        validUntil: new Date('2026-09-30T23:59:59.000Z'),
        status: OfferStatus.ACTIVE,
      },
      {
        offerName: 'Early Bird 2027',
        offerCode: 'EARLY2027',
        offerType: OfferType.PERCENTAGE,
        discountValue: '10%',
        discountPercentage: 10,
        description: 'Book your 2027 retreat early and secure an exclusive 10% discount.',
        minBookingAmount: 300,
        scope: OfferScope.HOLIDAY_PARKS,
        displayPlacement: OfferPlacement.SPECIAL_PACKAGES,
        applicableParks: parks.slice(0, 2).map((p) => p._id),
        applicableParkNames: ['Silverlake Retreat', 'Veluwe Forest Resort'],
        validFrom: new Date('2026-11-15T00:00:00.000Z'),
        validUntil: new Date('2027-01-15T23:59:59.000Z'),
        status: OfferStatus.ACTIVE,
      },
      {
        offerName: 'Family Fun Package',
        offerCode: 'FAMILY75',
        offerType: OfferType.FIXED,
        discountValue: '£75 off',
        fixedDiscount: 75,
        description: 'Direct £75 voucher on family bookings with 4 or more guests.',
        minBookingAmount: 400,
        scope: OfferScope.HOLIDAY_PARKS,
        displayPlacement: OfferPlacement.SPECIAL_PACKAGES,
        applicableParks: parks.slice(2, 4).map((p) => p._id),
        applicableParkNames: ['Mountain View Resort'],
        validFrom: new Date('2026-07-01T00:00:00.000Z'),
        validUntil: new Date('2026-10-31T23:59:59.000Z'),
        status: OfferStatus.ACTIVE,
      },
      {
        offerName: 'Winter Retreat',
        offerCode: 'WINTER25',
        offerType: OfferType.PERCENTAGE,
        discountValue: '25%',
        discountPercentage: 25,
        description: 'Cozy up in a heated chalet with 25% off winter holiday breaks.',
        minBookingAmount: 350,
        maxDiscount: 200,
        scope: OfferScope.ENTIRE_PLATFORM,
        displayPlacement: OfferPlacement.SPECIAL_PACKAGES,
        applicableParkNames: ['Selected Holiday Park'],
        validFrom: new Date('2026-12-01T00:00:00.000Z'),
        validUntil: new Date('2027-02-28T23:59:59.000Z'),
        status: OfferStatus.ACTIVE,
      },
    ];

    await this.offerModel.insertMany(offersData);
    this.logger.log(`Seeded ${offersData.length} promotional offers.`);
  }

  private async seedBookings(parks: HolidayParkDocument[], properties: PropertyDocument[]) {
    const count = await this.bookingModel.countDocuments().exec();
    if (count > 0) {
      this.logger.log(`Found ${count} bookings already in database.`);
      return;
    }

    const bookingsData = [
      {
        bookingId: 'OBS-1024',
        guest: 'Clara Oswald',
        email: 'clara@tardis.org',
        park: 'Århus Lakeside Retreat',
        propertyName: 'Lakeside Cabin 4',
        property: properties.find((p) => p.title.includes('Lakeside Cabin 4'))?._id || properties[0]?._id,
        checkInDate: new Date('2026-08-20T15:00:00.000Z'),
        checkOutDate: new Date('2026-08-27T11:00:00.000Z'),
        dates: '20 Aug - 27 Aug 2026',
        nights: 7,
        guestsCount: 2,
        pricePerNight: 120,
        cleaningFee: 50,
        taxes: 30,
        amount: '£840',
        totalAmount: 840,
        currency: '£',
        status: BookingStatus.CONFIRMED,
        paymentStatus: PaymentStatus.PAID,
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&h=80&q=80',
      },
      {
        bookingId: 'OBS-1023',
        guest: 'John Smith',
        email: 'smith@hastings.co.uk',
        park: 'Nordic Fjord Expedition',
        propertyName: 'Fjord View Lodge 2',
        property: properties.find((p) => p.title.includes('Fjord View Lodge 2'))?._id || properties[0]?._id,
        checkInDate: new Date('2026-08-22T15:00:00.000Z'),
        checkOutDate: new Date('2026-08-29T11:00:00.000Z'),
        dates: '22 Aug - 29 Aug 2026',
        nights: 7,
        guestsCount: 4,
        pricePerNight: 180,
        cleaningFee: 90,
        taxes: 50,
        amount: '£1,250',
        totalAmount: 1250,
        currency: '£',
        status: BookingStatus.PENDING,
        paymentStatus: PaymentStatus.PENDING,
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&h=80&q=80',
      },
      {
        bookingId: 'OBS-1022',
        guest: 'Sarah Jane',
        email: 'sarah.jane@met.gov',
        park: 'Sicilian Citrus Grove Getaway',
        propertyName: 'Citrus Villa 12',
        property: properties.find((p) => p.title.includes('Citrus Villa 12'))?._id || properties[0]?._id,
        checkInDate: new Date('2026-08-18T15:00:00.000Z'),
        checkOutDate: new Date('2026-08-25T11:00:00.000Z'),
        dates: '18 Aug - 25 Aug 2026',
        nights: 7,
        guestsCount: 4,
        pricePerNight: 140,
        cleaningFee: 65,
        taxes: 35,
        amount: '£980',
        totalAmount: 980,
        currency: '£',
        status: BookingStatus.CONFIRMED,
        paymentStatus: PaymentStatus.PAID,
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=80&h=80&q=80',
      },
      {
        bookingId: 'OBS-1021',
        guest: 'Rose Tyler',
        email: 'rose@badwolf.co.uk',
        park: 'Århus Lakeside Retreat',
        propertyName: 'Lakeside Cabin 1',
        property: properties[0]?._id,
        checkInDate: new Date('2026-08-15T15:00:00.000Z'),
        checkOutDate: new Date('2026-08-22T11:00:00.000Z'),
        dates: '15 Aug - 22 Aug 2026',
        nights: 7,
        guestsCount: 2,
        amount: '£720',
        totalAmount: 720,
        currency: '£',
        status: BookingStatus.CANCELLED,
        paymentStatus: PaymentStatus.REFUNDED,
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=80&h=80&q=80',
      },
      {
        bookingId: 'OBS-1020',
        guest: 'Rory Williams',
        email: 'rory@leadworth.nhs.uk',
        park: 'Nordic Fjord Expedition',
        propertyName: 'Alpine Hut 3',
        property: properties[0]?._id,
        checkInDate: new Date('2026-08-10T15:00:00.000Z'),
        checkOutDate: new Date('2026-08-17T11:00:00.000Z'),
        dates: '10 Aug - 17 Aug 2026',
        nights: 7,
        guestsCount: 2,
        amount: '£610',
        totalAmount: 610,
        currency: '£',
        status: BookingStatus.CONFIRMED,
        paymentStatus: PaymentStatus.PAID,
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=80&h=80&q=80',
      },
    ];

    await this.bookingModel.insertMany(bookingsData);
    this.logger.log(`Seeded ${bookingsData.length} mock bookings.`);
  }

  private async seedReviews(parks: HolidayParkDocument[], properties: PropertyDocument[]) {
    const count = await this.reviewModel.countDocuments().exec();
    if (count > 0) {
      this.logger.log(`Found ${count} reviews already in database.`);
      return;
    }

    const mainProperty = properties[0];

    const reviewsData = [
      {
        property: mainProperty?._id,
        name: 'Marvin McKinney',
        country: 'Netherlands',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop',
        rating: 5,
        maxRating: 5,
        comment: 'An absolutely premium experience! Everything from the modern minimalist architecture to the quality of the bedding was perfect.',
        isPublished: true,
      },
      {
        property: mainProperty?._id,
        name: 'Jane Cooper',
        country: 'Netherlands',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=150&auto=format&fit=crop',
        rating: 5,
        maxRating: 5,
        comment: 'The private sauna overlooking the lake at sunset was pure magic. Exceptional attention to detail throughout the chalet.',
        isPublished: true,
      },
      {
        property: mainProperty?._id,
        name: 'Guy Hawkins',
        country: 'United Kingdom',
        avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=150&auto=format&fit=crop',
        rating: 5,
        maxRating: 5,
        comment: 'Exceeded every expectation. High-speed internet, luxurious beds, and the tranquility of the forest surrounding us made this our best holiday ever.',
        isPublished: true,
      },
    ];

    await this.reviewModel.insertMany(reviewsData);
    this.logger.log(`Seeded ${reviewsData.length} reviews.`);
  }
}
