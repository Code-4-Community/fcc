import { Module } from '@nestjs/common';
import { EmailsController } from './emails.controller';
import { EmailsService } from './emails.service';
import { AmazonSESWrapper, AMAZON_SES_WRAPPER } from './amazon-ses.wrapper';
import { amazonSESClientFactory } from './amazon-ses-client.factory';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UsersModule],
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
