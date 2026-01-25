import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { DonationsModule } from '../donations/donations.module';

@Module({
  imports: [ConfigModule, DonationsModule],
  controllers: [PaymentsController],
  providers: [
    {
      provide: 'STRIPE_CLIENT',
      useFactory: (configService: ConfigService) => {
        return new Stripe(configService.get<string>('STRIPE_SECRET_KEY'), {
          apiVersion: '2025-10-29.clover',
        });
      },
      inject: [ConfigService],
    },
    PaymentsService,
  ],
  exports: [PaymentsService],
})
export class PaymentsModule {}
