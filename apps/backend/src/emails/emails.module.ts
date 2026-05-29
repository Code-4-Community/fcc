import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailsController } from './emails.controller';
import { EmailsService } from './emails.service';
import { AmazonSESWrapper, AMAZON_SES_WRAPPER } from './amazon-ses.wrapper';
import { amazonSESClientFactory } from './amazon-ses-client.factory';
import { UsersModule } from '../users/users.module';
import { DonationsModule } from '../donations/donations.module';
import { EmailTemplate } from './email-template.entity';
import { EmailSubscriber } from './email-subscriber.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([EmailTemplate, EmailSubscriber]),
    UsersModule,
    forwardRef(() => DonationsModule),
  ],
  controllers: [EmailsController],
  providers: [
    EmailsService,
    {
      provide: AMAZON_SES_WRAPPER,
      useClass: AmazonSESWrapper,
    },
    amazonSESClientFactory,
  ],
  exports: [EmailsService],
})
export class EmailsModule {}
