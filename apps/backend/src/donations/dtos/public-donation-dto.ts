import { ApiProperty } from '@nestjs/swagger';
import { DonationType, RecurringInterval } from './create-donation-dto';
import { DonationStatus } from './donation-response-dto';

export class PublicDonationDto {
  @ApiProperty({
    description: 'unique donation identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'donor name, hidden if anonymous',
    example: 'John Smith',
    required: false,
  })
  donorName?: string;

  @ApiProperty({
    description: 'donation amount, in dollars',
    example: 100.0,
  })
  amount: number;

  @ApiProperty({
    description: 'whether or not the donation is anonymous',
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
    description:
      'the dedication message, shown if showDedicationPublicly is true',
    example: 'for the Fenway community',
    required: false,
  })
  dedicationMessage?: string;

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
}
