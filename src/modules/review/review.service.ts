import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';
import { Review, ReviewDocument } from './schemas/review.schema';
import { CreateReviewDto, QueryReviewDto } from './dto/create-review.dto';
import { paginate } from '../../common/utils/pagination.util';

@Injectable()
export class ReviewService {
  constructor(
    @InjectModel(Review.name)
    private readonly reviewModel: Model<ReviewDocument>,
  ) {}

  async create(dto: CreateReviewDto, userId?: string): Promise<Review> {
    const payload: any = { ...dto };
    if (dto.property) payload.property = new Types.ObjectId(dto.property);
    if (dto.holidayPark) payload.holidayPark = new Types.ObjectId(dto.holidayPark);
    if (userId) payload.user = new Types.ObjectId(userId);

    const review = new this.reviewModel(payload);
    return review.save();
  }

  async findAll(query: QueryReviewDto) {
    const { page = 1, limit = 10, property, holidayPark } = query;
    const filter: FilterQuery<ReviewDocument> = { isPublished: true };

    if (property) {
      filter.property = new Types.ObjectId(property);
    }

    if (holidayPark) {
      filter.holidayPark = new Types.ObjectId(holidayPark);
    }

    const { skip, take } = paginate(page, limit);

    const [items, total] = await Promise.all([
      this.reviewModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(take)
        .exec(),
      this.reviewModel.countDocuments(filter).exec(),
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

  async remove(id: string): Promise<{ message: string }> {
    const deleted = await this.reviewModel.findByIdAndDelete(id).exec();
    if (!deleted) {
      throw new NotFoundException(`Review with ID "${id}" not found`);
    }
    return { message: 'Review deleted successfully' };
  }
}
