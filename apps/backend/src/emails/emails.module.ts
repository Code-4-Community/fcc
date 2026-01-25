import { Module } from '@nestjs/common';
import { EmailsController } from './emails.controller';
import { EmailsService } from './emails.service';
import { JwtStrategy } from '../auth/jwt.strategy';
import { CurrentUserInterceptor } from '../interceptors/current-user.interceptor';
import { AuthService } from '../auth/auth.service';

@Module({
  controllers: [EmailsController],
  providers: [EmailsService, AuthService, JwtStrategy, CurrentUserInterceptor],
})
export class EmailsModule {}
