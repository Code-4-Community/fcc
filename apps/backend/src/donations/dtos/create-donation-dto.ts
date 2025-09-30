import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  IsNumber,
  IsBoolean,
  IsEnum,
  IsOptional,
  Min,
  IsNotEmpty,
} from 'class-validator';

export enum DonationType {
  ONE_TIME = 'one_time',
  RECURRING = 'recurring',
}

export enum RecurringInterval {
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  BIMONTHLY = 'bimonthly',
  QUARTERLY = 'quarterly',
  ANNUALLY = 'annually',
}

export class CreateDonationDto {
  @ApiProperty({
    description: 'donor first name',
    example: 'John',
  })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({
    description: 'donor last name',
    example: 'Smith',
  })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({
    description: 'donor email address',
    example: 'john.smith@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'the donation amount in dollars',
    example: 100.0,
    minimum: 0.01,
  })
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiProperty({
    description: 'whether the donation should be anonymous',
    example: false,
    required: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  isAnonymous?: boolean = false;

  @ApiProperty({
    description: 'the type of donation',
    enum: DonationType,
    example: DonationType.ONE_TIME,
  })
  @IsEnum(DonationType)
  donationType: DonationType;

  @ApiProperty({
    description: 'recurring interval for recurring donations',
    enum: RecurringInterval,
    required: false,
    example: RecurringInterval.MONTHLY,
  })
  @IsEnum(RecurringInterval)
  @IsOptional()
  recurringInterval?: RecurringInterval;

  @ApiProperty({
    description: 'optional dedication message',
    example: 'for the Fenway community',
    required: false,
  })
  @IsString()
  @IsOptional()
  dedicationMessage?: string;

  @ApiProperty({
    description: 'whether to show dedication message publicly',
    example: false,
    required: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  showDedicationPublicly?: boolean = false;
}
