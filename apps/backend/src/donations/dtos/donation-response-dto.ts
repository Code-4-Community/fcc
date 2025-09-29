import { ApiProperty } from '@nestjs/swagger';
import { DonationType, RecurringInterval } from './create-donation-dto';

export enum DonationStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export class DonationResponseDto {
  @ApiProperty({
    description: 'Unique donation identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'donor first name',
    example: 'John',
  })
  firstName: string;

  @ApiProperty({
    description: 'donor last name',
    example: 'Smith',
  })
  lastName: string;

  @ApiProperty({
    description: 'donor email address',
    example: 'john.smith@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'donation amount in dollars',
    example: 100.0,
  })
  amount: number;

  @ApiProperty({
    description: 'whether the donation is anonymous',
    example: false,
  })
  isAnonymous: boolean;

  @ApiProperty({
    description: 'the type of donation',
    enum: DonationType,
    example: DonationType.ONE_TIME,
  })
  donationType: DonationType;

  @ApiProperty({
    description: 'the recurring interval for recurring donations',
    enum: RecurringInterval,
    required: false,
    example: RecurringInterval.MONTHLY,
  })
  recurringInterval?: RecurringInterval;

  @ApiProperty({
    description: 'optional dedication message',
    example: 'for the Fenway community',
    required: false,
  })
  dedicationMessage?: string;

  @ApiProperty({
    description: 'whether to show dedication message publicly',
    example: false,
  })
  showDedicationPublicly: boolean;

  @ApiProperty({
    description: 'the current donation status',
    enum: DonationStatus,
    example: DonationStatus.COMPLETED,
  })
  status: DonationStatus;

  @ApiProperty({
    description: 'timestamp when donation was created',
    example: '2024-01-15T10:30:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'timestamp when donation was last updated',
    example: '2024-01-15T10:35:00Z',
  })
  updatedAt: Date;

  @ApiProperty({
    description: 'payment processor transaction ID',
    example: 'txn_1234567890',
    required: false,
  })
  transactionId?: string;
}
