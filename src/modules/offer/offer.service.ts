import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';
import { Offer, OfferDocument, OfferScope, OfferStatus, OfferType } from './schemas/offer.schema';
import { CreateOfferDto } from './dto/create-offer.dto';
import { UpdateOfferDto } from './dto/update-offer.dto';
import { QueryOfferDto } from './dto/query-offer.dto';
import { ValidateOfferDto } from './dto/validate-offer.dto';
import { paginate } from '../../common/utils/pagination.util';

@Injectable()
export class OfferService {
  constructor(
    @InjectModel(Offer.name)
    private readonly offerModel: Model<OfferDocument>,
  ) {}

  async create(dto: CreateOfferDto): Promise<Offer> {
    const payload: any = { ...dto };
    if (dto.applicableParks?.length) {
      payload.applicableParks = dto.applicableParks.map((id) => new Types.ObjectId(id));
    }
    if (dto.applicableProperties?.length) {
      payload.applicableProperties = dto.applicableProperties.map((id) => new Types.ObjectId(id));
    }
    if (dto.offerCode) {
      payload.offerCode = dto.offerCode.trim().toUpperCase();
    }
    const offer = new this.offerModel(payload);
    return offer.save();
  }

  async findAll(query: QueryOfferDto) {
    const { page = 1, limit = 10, search, offerType, scope, status } = query;
    const filter: FilterQuery<OfferDocument> = {};

    if (search) {
      filter.$or = [
        { offerName: { $regex: search, $options: 'i' } },
        { offerCode: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { applicableParkNames: { $regex: search, $options: 'i' } },
      ];
    }

    if (offerType) {
      filter.offerType = offerType;
    }

    if (scope) {
      filter.scope = scope;
    }

    if (status && (status as any) !== 'All') {
      filter.status = status;
    }

    const { skip, take } = paginate(page, limit);

    const [items, total] = await Promise.all([
      this.offerModel
        .find(filter)
        .populate('applicableParks', 'name title')
        .populate('applicableProperties', 'title pricePerNight')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(take)
        .exec(),
      this.offerModel.countDocuments(filter).exec(),
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

  async findActive(): Promise<Offer[]> {
    const now = new Date();
    return this.offerModel
      .find({
        status: OfferStatus.ACTIVE,
        validFrom: { $lte: now },
        validUntil: { $gte: now },
      })
      .sort({ createdAt: -1 })
      .limit(6)
      .exec();
  }

  async findById(id: string): Promise<Offer> {
    const offer = await this.offerModel
      .findById(id)
      .populate('applicableParks', 'name title location')
      .populate('applicableProperties', 'title pricePerNight')
      .exec();

    if (!offer) {
      throw new NotFoundException(`Offer with ID "${id}" not found`);
    }
    return offer;
  }

  async validateCode(dto: ValidateOfferDto) {
    const now = new Date();
    const code = dto.code.trim().toUpperCase();

    const offer = await this.offerModel
      .findOne({
        offerCode: code,
        status: OfferStatus.ACTIVE,
        validFrom: { $lte: now },
        validUntil: { $gte: now },
      })
      .exec();

    if (!offer) {
      throw new BadRequestException('Invalid, inactive, or expired promo code');
    }

    if (offer.maxUses > 0 && offer.usedCount >= offer.maxUses) {
      throw new BadRequestException('This promo code has reached its maximum usage limit');
    }

    if (offer.minBookingAmount > 0 && dto.bookingAmount < offer.minBookingAmount) {
      throw new BadRequestException(
        `Minimum booking amount for this offer is €${offer.minBookingAmount}`,
      );
    }

    // Check scope applicability
    if (offer.scope === OfferScope.HOLIDAY_PARKS && dto.holidayParkId) {
      const match = offer.applicableParks.some(
        (parkId) => parkId.toString() === dto.holidayParkId,
      );
      if (!match && offer.applicableParks.length > 0) {
        throw new BadRequestException('This offer is not applicable to the selected holiday park');
      }
    }

    if (offer.scope === OfferScope.PROPERTIES && dto.propertyId) {
      const match = offer.applicableProperties.some(
        (propId) => propId.toString() === dto.propertyId,
      );
      if (!match && offer.applicableProperties.length > 0) {
        throw new BadRequestException('This offer is not applicable to the selected property');
      }
    }

    // Calculate discount
    let discount = 0;
    if (offer.offerType === OfferType.PERCENTAGE) {
      const pct = offer.discountPercentage || 0;
      discount = (dto.bookingAmount * pct) / 100;
    } else {
      discount = offer.fixedDiscount || 0;
    }

    if (offer.maxDiscount > 0 && discount > offer.maxDiscount) {
      discount = offer.maxDiscount;
    }

    const finalAmount = Math.max(0, dto.bookingAmount - discount);

    return {
      valid: true,
      offerId: offer._id,
      offerName: offer.offerName,
      offerCode: offer.offerCode,
      discountValue: offer.discountValue,
      calculatedDiscount: Number(discount.toFixed(2)),
      originalAmount: dto.bookingAmount,
      finalAmount: Number(finalAmount.toFixed(2)),
    };
  }

  async update(id: string, dto: UpdateOfferDto): Promise<Offer> {
    const payload: any = { ...dto };
    if (dto.applicableParks?.length) {
      payload.applicableParks = dto.applicableParks.map((pid) => new Types.ObjectId(pid));
    }
    if (dto.applicableProperties?.length) {
      payload.applicableProperties = dto.applicableProperties.map((pid) => new Types.ObjectId(pid));
    }
    if (dto.offerCode) {
      payload.offerCode = dto.offerCode.trim().toUpperCase();
    }

    const updated = await this.offerModel
      .findByIdAndUpdate(id, { $set: payload }, { new: true, runValidators: true })
      .exec();

    if (!updated) {
      throw new NotFoundException(`Offer with ID "${id}" not found`);
    }
    return updated;
  }

  async remove(id: string): Promise<{ message: string }> {
    const deleted = await this.offerModel.findByIdAndDelete(id).exec();
    if (!deleted) {
      throw new NotFoundException(`Offer with ID "${id}" not found`);
    }
    return { message: `Offer "${deleted.offerName}" deleted successfully` };
  }

  async countActive(): Promise<number> {
    const now = new Date();
    return this.offerModel.countDocuments({
      status: OfferStatus.ACTIVE,
      validFrom: { $lte: now },
      validUntil: { $gte: now },
    }).exec();
  }
}
