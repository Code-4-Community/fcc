import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsOptional,
  Min,
  IsNotEmpty,
  IsIn,
} from 'class-validator';
import { PaymentIntentMetadata } from '../../payments/payments.service';

export class CreateSubscriptionDto {
  @ApiProperty({
    description: 'The payment amount in smallest currency unit (e.g., cents)',
    example: 1099,
  })
  @IsNumber()
  @Min(1)
  amount: number;

  @ApiProperty({
    description: 'The three-letter ISO currency code',
    example: 'usd',
  })
  @IsString()
  @IsNotEmpty()
  currency: string;

  @ApiProperty({
    description: 'The recurring interval',
    example: 'monthly',
  })
  @IsString()
  @IsIn(['weekly', 'monthly', 'bimonthly', 'quarterly', 'annually'])
  interval: string;

  @ApiProperty({
    description: 'The email address of the customer',
    example: 'donor@example.com',
  })
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'The full name of the customer',
    example: 'John Doe',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Optional key-value pairs attached to the payment',
    example: { campaignId: '123' },
    required: false,
  })
  @IsOptional()
  metadata?: PaymentIntentMetadata;
}
