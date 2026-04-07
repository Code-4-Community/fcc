import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Donation } from './donation.entity';
import { DonationsController } from './donations.controller';
import { DonationsService } from './donations.service';
import { DonationsRepository } from './donations.repository';
import { User } from '../users/user.entity';
import { AuthService } from '../auth/auth.service';
import { UsersService } from '../users/users.service';
import { CurrentUserInterceptor } from '../interceptors/current-user.interceptor';

@Module({
  imports: [TypeOrmModule.forFeature([Donation, User])],
  controllers: [DonationsController],
  providers: [
    DonationsService,
    DonationsRepository,
    AuthService,
    UsersService,
    CurrentUserInterceptor,
  ],
  exports: [DonationsService, DonationsRepository],
})
export class DonationsModule {}
