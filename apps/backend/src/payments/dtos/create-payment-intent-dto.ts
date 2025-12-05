import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsOptional,
  Min,
  IsNotEmpty,
} from 'class-validator';
import { PaymentIntentMetadata } from '../../payments/payments.service';

export class CreatePaymentIntentDto {
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
    description: 'Optional key-value pairs attached to the payment',
    example: { orderId: '123' },
  })
  @IsOptional()
  metadata?: PaymentIntentMetadata;
}
