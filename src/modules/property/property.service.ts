import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';
import { Property, PropertyDocument } from './schemas/property.schema';
import { HolidayPark, HolidayParkDocument } from '../holiday-park/schemas/holiday-park.schema';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { QueryPropertyDto } from './dto/query-property.dto';
import { paginate } from '../../common/utils/pagination.util';

@Injectable()
export class PropertyService {
  constructor(
    @InjectModel(Property.name)
    private readonly propertyModel: Model<PropertyDocument>,
    @InjectModel(HolidayPark.name)
    private readonly holidayParkModel: Model<HolidayParkDocument>,
  ) {}

  async create(dto: CreatePropertyDto): Promise<Property> {
    const payload: any = { ...dto };
    if (dto.holidayPark) {
      payload.holidayPark = new Types.ObjectId(dto.holidayPark);
      const park = await this.holidayParkModel.findById(dto.holidayPark).exec();
      if (park) {
        payload.holidayParkName = park.name || park.title;
        if (park.badgeLocation) {
          const parts = park.badgeLocation.split(',').map((s) => s.trim()).filter(Boolean);
          if (parts.length > 0) {
            payload.country = parts[parts.length - 1];
            payload.location = park.badgeLocation;
          }
        }
        if (park.location?.country) {
          payload.country = park.location.country;
          const locParts = [park.location.city, park.location.region, park.location.country].filter(Boolean);
          if (locParts.length > 0) {
            payload.location = locParts.join(', ');
          }
        }
      }
    }
    const prop = new this.propertyModel(payload);
    const saved = await prop.save();

    // Update parent park's property counts
    if (dto.holidayPark) {
      const count = await this.propertyModel.countDocuments({ holidayPark: new Types.ObjectId(dto.holidayPark) }).exec();
      await this.holidayParkModel.findByIdAndUpdate(dto.holidayPark, { $set: { totalProperties: count } }).exec();
    }

    return saved;
  }

  async findAll(query: QueryPropertyDto) {
    const {
      page = 1,
      limit = 10,
      search,
      category,
      holidayPark,
      country,
      guests,
      beds,
      minPrice,
      maxPrice,
      petsAllowed,
      status,
      isPopular,
    } = query;

    const filter: FilterQuery<PropertyDocument> = {};
    const andConditions: FilterQuery<PropertyDocument>[] = [];

    if (search && search.trim()) {
      const trimmedSearch = search.trim();
      andConditions.push({
        $or: [
          { title: { $regex: trimmedSearch, $options: 'i' } },
          { location: { $regex: trimmedSearch, $options: 'i' } },
          { holidayParkName: { $regex: trimmedSearch, $options: 'i' } },
          { badge: { $regex: trimmedSearch, $options: 'i' } },
          { country: { $regex: trimmedSearch, $options: 'i' } },
          { category: { $regex: trimmedSearch, $options: 'i' } },
          { description: { $regex: trimmedSearch, $options: 'i' } },
        ],
      });
    }

    if (category && category !== 'All Properties' && category !== 'All') {
      andConditions.push({ category: { $regex: category, $options: 'i' } });
    }

    if (holidayPark) {
      filter.holidayPark = new Types.ObjectId(holidayPark);
    }

    if (country && country !== 'All' && country !== 'All Countries') {
      const matchingParks = await this.holidayParkModel
        .find({
          $or: [
            { 'location.country': { $regex: country, $options: 'i' } },
            { badgeLocation: { $regex: country, $options: 'i' } },
            { name: { $regex: country, $options: 'i' } },
            { title: { $regex: country, $options: 'i' } },
          ],
        })
        .select('_id')
        .exec();

      const parkIds = matchingParks.map((p) => p._id);

      const countryOrConditions: FilterQuery<PropertyDocument>[] = [
        { country: { $regex: country, $options: 'i' } },
        { location: { $regex: country, $options: 'i' } },
        { holidayParkName: { $regex: country, $options: 'i' } },
        { title: { $regex: country, $options: 'i' } },
      ];

      if (parkIds.length > 0) {
        countryOrConditions.push({ holidayPark: { $in: parkIds } });
      }

      andConditions.push({ $or: countryOrConditions });
    }

    if (andConditions.length > 0) {
      filter.$and = andConditions;
    }

    if (guests) {
      filter.guests = { $gte: guests };
    }

    if (beds) {
      filter.beds = { $gte: beds };
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.pricePerNight = {};
      if (minPrice !== undefined) filter.pricePerNight.$gte = minPrice;
      if (maxPrice !== undefined) filter.pricePerNight.$lte = maxPrice;
    }

    if (petsAllowed !== undefined) {
      filter.petsAllowed = petsAllowed;
    }

    if (status && (status as any) !== 'All') {
      filter.status = status;
    }

    if (isPopular !== undefined) {
      filter.isPopular = isPopular;
    }

    const { skip, take } = paginate(page, limit);

    const [items, total] = await Promise.all([
      this.propertyModel
        .find(filter)
        .populate('holidayPark', 'name title badgeLocation rating startingPrice')
        .sort({ isPopular: -1, rating: -1, createdAt: -1 })
        .skip(skip)
        .limit(take)
        .exec(),
      this.propertyModel.countDocuments(filter).exec(),
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

  async findPopular(): Promise<Property[]> {
    return this.propertyModel
      .find({ isPopular: true, status: 'Active' })
      .populate('holidayPark', 'name title badgeLocation')
      .sort({ rating: -1 })
      .limit(8)
      .exec();
  }

  async findById(id: string): Promise<Property> {
    const prop = await this.propertyModel
      .findById(id)
      .populate('holidayPark')
      .exec();

    if (!prop) {
      throw new NotFoundException(`Property with ID "${id}" not found`);
    }
    return prop;
  }

  async update(id: string, dto: UpdatePropertyDto): Promise<Property> {
    const existing = await this.propertyModel.findById(id).exec();
    if (!existing) {
      throw new NotFoundException(`Property with ID "${id}" not found`);
    }

    const previousParkId = existing.holidayPark ? existing.holidayPark.toString() : null;

    const payload: any = { ...dto };
    if (dto.holidayPark) {
      payload.holidayPark = new Types.ObjectId(dto.holidayPark);
      const park = await this.holidayParkModel.findById(dto.holidayPark).exec();
      if (park) {
        payload.holidayParkName = park.name || park.title;
        if (park.badgeLocation) {
          const parts = park.badgeLocation.split(',').map((s) => s.trim()).filter(Boolean);
          if (parts.length > 0) {
            payload.country = parts[parts.length - 1];
            payload.location = park.badgeLocation;
          }
        }
        if (park.location?.country) {
          payload.country = park.location.country;
          const locParts = [park.location.city, park.location.region, park.location.country].filter(Boolean);
          if (locParts.length > 0) {
            payload.location = locParts.join(', ');
          }
        }
      }
    } else if (dto.holidayPark === null || (dto as any).holidayPark === '') {
      payload.holidayPark = null;
      payload.holidayParkName = '';
    }

    const updated = await this.propertyModel
      .findByIdAndUpdate(id, { $set: payload }, { new: true, runValidators: true })
      .exec();

    if (!updated) {
      throw new NotFoundException(`Property with ID "${id}" not found`);
    }

    // Recalculate count for current park if assigned
    if (updated.holidayPark) {
      const count = await this.propertyModel.countDocuments({ holidayPark: updated.holidayPark }).exec();
      await this.holidayParkModel.findByIdAndUpdate(updated.holidayPark, { $set: { totalProperties: count } }).exec();
    }

    // Recalculate count for previous park if it changed
    const newParkId = updated.holidayPark ? updated.holidayPark.toString() : null;
    if (previousParkId && previousParkId !== newParkId) {
      const prevCount = await this.propertyModel.countDocuments({ holidayPark: new Types.ObjectId(previousParkId) }).exec();
      await this.holidayParkModel.findByIdAndUpdate(previousParkId, { $set: { totalProperties: prevCount } }).exec();
    }

    return updated;
  }

  async remove(id: string): Promise<{ message: string }> {
    const deleted = await this.propertyModel.findByIdAndDelete(id).exec();
    if (!deleted) {
      throw new NotFoundException(`Property with ID "${id}" not found`);
    }

    if (deleted.holidayPark) {
      const count = await this.propertyModel.countDocuments({ holidayPark: deleted.holidayPark }).exec();
      await this.holidayParkModel.findByIdAndUpdate(deleted.holidayPark, { $set: { totalProperties: count } }).exec();
    }

    return { message: `Property "${deleted.title}" deleted successfully` };
  }

  async countTotal(): Promise<number> {
    return this.propertyModel.countDocuments().exec();
  }
}
