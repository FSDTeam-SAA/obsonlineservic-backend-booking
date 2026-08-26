import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Newsletter, NewsletterDocument } from './schemas/newsletter.schema';
import { SubscribeNewsletterDto } from './dto/subscribe-newsletter.dto';

@Injectable()
export class NewsletterService {
  constructor(
    @InjectModel(Newsletter.name)
    private readonly newsletterModel: Model<NewsletterDocument>,
  ) {}

  async subscribe(dto: SubscribeNewsletterDto): Promise<{ message: string }> {
    const existing = await this.newsletterModel.findOne({ email: dto.email.toLowerCase() }).exec();
    if (existing) {
      if (!existing.isActive) {
        existing.isActive = true;
        await existing.save();
      }
      return { message: 'Successfully subscribed to the newsletter' };
    }

    const sub = new this.newsletterModel({ email: dto.email.toLowerCase() });
    await sub.save();
    return { message: 'Successfully subscribed to the newsletter' };
  }

  async findAll() {
    return this.newsletterModel.find().sort({ createdAt: -1 }).exec();
  }
}
