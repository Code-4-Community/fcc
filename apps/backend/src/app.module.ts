import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { PaymentsModule } from './payments/payments.module';
import { DonationsModule } from './donations/donations.module';
import AppDataSource from './data-source';

@Module({
  imports: [
    TypeOrmModule.forRoot(AppDataSource.options),
    UsersModule,
    AuthModule,
    PaymentsModule,
    DonationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
