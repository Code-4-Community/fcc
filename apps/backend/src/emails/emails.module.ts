import { Module } from '@nestjs/common';
import { EmailsController } from './emails.controller';
import { EmailsService } from './emails.service';
import { JwtStrategy } from '../auth/jwt.strategy';
import { CurrentUserInterceptor } from '../interceptors/current-user.interceptor';
import { AuthService } from '../auth/auth.service';
import { AmazonSESWrapper } from './amazon-ses.wrapper';
import { amazonSESClientFactory } from './amazon-ses-client.factory';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UsersModule],
  controllers: [EmailsController],
  providers: [
    EmailsService,
    AmazonSESWrapper,
    amazonSESClientFactory,
    AuthService,
    JwtStrategy,
    CurrentUserInterceptor,
  ],
  exports: [EmailsService],
})
export class EmailsModule {}
