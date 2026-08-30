import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';
import { HolidayPark, HolidayParkDocument } from './schemas/holiday-park.schema';
import { Property, PropertyDocument } from '../property/schemas/property.schema';
import { CreateHolidayParkDto } from './dto/create-holiday-park.dto';
import { UpdateHolidayParkDto } from './dto/update-holiday-park.dto';
import { QueryHolidayParkDto } from './dto/query-holiday-park.dto';
import { QueryPropertyDto } from '../property/dto/query-property.dto';
import { paginate } from '../../common/utils/pagination.util';

@Injectable()
export class HolidayParkService {
  constructor(
    @InjectModel(HolidayPark.name)
    private readonly holidayParkModel: Model<HolidayParkDocument>,
    @InjectModel(Property.name)
    private readonly propertyModel: Model<PropertyDocument>,
  ) {}

  async create(dto: CreateHolidayParkDto): Promise<HolidayPark> {
    const park = new this.holidayParkModel(dto);
    return park.save();
  }

  async findAll(query: QueryHolidayParkDto) {
    const { page = 1, limit = 10, search, country, status, isFeatured } = query;
    const filter: FilterQuery<HolidayParkDocument> = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } },
        { 'location.country': { $regex: search, $options: 'i' } },
        { 'location.city': { $regex: search, $options: 'i' } },
        { 'location.region': { $regex: search, $options: 'i' } },
      ];
    }

    if (country && country !== 'All' && country !== 'All Countries') {
      filter['location.country'] = { $regex: country, $options: 'i' };
    }

    if (status && (status as any) !== 'All') {
      filter.status = status;
    }

    if (isFeatured !== undefined) {
      filter.isFeatured = isFeatured;
    }

    const { skip, take } = paginate(page, limit);

    const [items, total] = await Promise.all([
      this.holidayParkModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(take)
        .exec(),
      this.holidayParkModel.countDocuments(filter).exec(),
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

  async findFeatured(): Promise<HolidayPark[]> {
    return this.holidayParkModel
      .find({ isFeatured: true, status: 'Active' })
      .sort({ rating: -1, createdAt: -1 })
      .limit(10)
      .exec();
  }

  async findById(id: string): Promise<HolidayPark> {
    const park = await this.holidayParkModel.findById(id).exec();
    if (!park) {
      throw new NotFoundException(`Holiday park with ID "${id}" not found`);
    }
    return park;
  }

  async update(id: string, dto: UpdateHolidayParkDto): Promise<HolidayPark> {
    const updated = await this.holidayParkModel
      .findByIdAndUpdate(id, { $set: dto }, { new: true, runValidators: true })
      .exec();

    if (!updated) {
      throw new NotFoundException(`Holiday park with ID "${id}" not found`);
    }
    return updated;
  }

  async remove(id: string): Promise<{ message: string }> {
    const deleted = await this.holidayParkModel.findByIdAndDelete(id).exec();
    if (!deleted) {
      throw new NotFoundException(`Holiday park with ID "${id}" not found`);
    }
    // Cascade delete child properties
    await this.propertyModel.deleteMany({ holidayPark: new Types.ObjectId(id) }).exec();

    return { message: `Holiday park "${deleted.name}" and associated properties deleted successfully` };
  }

  async findPropertiesForPark(parkId: string, query: QueryPropertyDto) {
    const park = await this.findById(parkId);
    const { page = 1, limit = 10, search, category, status } = query;

    const filter: FilterQuery<PropertyDocument> = {
      holidayPark: new Types.ObjectId(parkId),
    };

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { badge: { $regex: search, $options: 'i' } },
      ];
    }

    if (category && (category as any) !== 'All Properties' && (category as any) !== 'All') {
      filter.category = category;
    }

    if (status && (status as any) !== 'All') {
      filter.status = status;
    }

    const { skip, take } = paginate(page, limit);

    const [items, total] = await Promise.all([
      this.propertyModel
        .find(filter)
        .populate('holidayPark', 'name title badgeLocation rating startingPrice location')
        .sort({ isPopular: -1, rating: -1, createdAt: -1 })
        .skip(skip)
        .limit(take)
        .exec(),
      this.propertyModel.countDocuments(filter).exec(),
    ]);

    return {
      park,
      items,
      meta: {
        page,
        limit: take,
        total,
        totalPages: Math.ceil(total / take) || 1,
      },
    };
  }

  async countTotal(): Promise<number> {
    return this.holidayParkModel.countDocuments().exec();
  }
}
