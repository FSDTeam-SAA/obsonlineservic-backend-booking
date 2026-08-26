import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';
import { Property, PropertyDocument } from './schemas/property.schema';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { QueryPropertyDto } from './dto/query-property.dto';
import { paginate } from '../../common/utils/pagination.util';

@Injectable()
export class PropertyService {
  constructor(
    @InjectModel(Property.name)
    private readonly propertyModel: Model<PropertyDocument>,
  ) {}

  async create(dto: CreatePropertyDto): Promise<Property> {
    const payload: any = { ...dto };
    if (dto.holidayPark) {
      payload.holidayPark = new Types.ObjectId(dto.holidayPark);
    }
    const prop = new this.propertyModel(payload);
    return prop.save();
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

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { holidayParkName: { $regex: search, $options: 'i' } },
        { badge: { $regex: search, $options: 'i' } },
      ];
    }

    if (category && (category as any) !== 'All Properties' && (category as any) !== 'All') {
      filter.category = category;
    }

    if (holidayPark) {
      filter.holidayPark = new Types.ObjectId(holidayPark);
    }

    if (country && country !== 'All' && country !== 'All Countries') {
      filter.$or = [
        { country: { $regex: country, $options: 'i' } },
        { location: { $regex: country, $options: 'i' } },
      ];
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
    const payload: any = { ...dto };
    if (dto.holidayPark) {
      payload.holidayPark = new Types.ObjectId(dto.holidayPark);
    }

    const updated = await this.propertyModel
      .findByIdAndUpdate(id, { $set: payload }, { new: true, runValidators: true })
      .exec();

    if (!updated) {
      throw new NotFoundException(`Property with ID "${id}" not found`);
    }
    return updated;
  }

  async remove(id: string): Promise<{ message: string }> {
    const deleted = await this.propertyModel.findByIdAndDelete(id).exec();
    if (!deleted) {
      throw new NotFoundException(`Property with ID "${id}" not found`);
    }
    return { message: `Property "${deleted.title}" deleted successfully` };
  }

  async countTotal(): Promise<number> {
    return this.propertyModel.countDocuments().exec();
  }
}
