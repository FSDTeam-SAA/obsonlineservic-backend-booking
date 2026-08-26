import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import configs from './config';
import { LoggerModule } from './common/logger/logger.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { HolidayParkModule } from './modules/holiday-park/holiday-park.module';
import { PropertyModule } from './modules/property/property.module';
import { OfferModule } from './modules/offer/offer.module';
import { BookingModule } from './modules/booking/booking.module';
import { ReviewModule } from './modules/review/review.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { NewsletterModule } from './modules/newsletter/newsletter.module';
import { UploadModule } from './modules/upload/upload.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './infrastructure/database/database.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: configs,
      envFilePath: '.env',
    }),

    ThrottlerModule.forRootAsync({
      useFactory: (configService: ConfigService) => [
        {
          ttl: configService.get<number>('app.rateLimitWindow', 15) * 60 * 1000,
          limit: configService.get<number>('app.rateLimitMax', 100),
        },
      ],
      inject: [ConfigService],
    }),

    LoggerModule,
    DatabaseModule,
    AuthModule,
    UserModule,
    HolidayParkModule,
    PropertyModule,
    OfferModule,
    BookingModule,
    ReviewModule,
    DashboardModule,
    NewsletterModule,
    UploadModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}