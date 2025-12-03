import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsEnum,
  IsOptional,
  Min,
  IsNotEmpty,
  IsArray,
  IsBoolean,
} from 'class-validator';
import { DonationStatus } from '../../donations/donation.entity';
import Stripe from 'stripe';

export class PaymentIntentResponseDto {
  @ApiProperty({
    description:
      'The unique identifier for the PaymentIntent, equivalent to what Stripe API returns',
    example: 'pi_1J2aBcD3eF4GhIjKlmnoPqr',
  })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({
    description:
      'The client secret used for client-side confirmation, equivalent to what Stripe API returns',
    example: 'pi_1J2aBcD3eF4GhIjKlmnoPqr_secret_AbCdEfGhIjKlMnOp',
  })
  @IsString()
  @IsNotEmpty()
  clientSecret: string;

  @ApiProperty({
    description:
      'The payment amount in smallest currency unit (e.g., cents), equivalent to what Stripe API returns',
    example: 1099,
  })
  @IsNumber()
  @Min(1)
  amount: number;

  @ApiProperty({
    description:
      'The three-letter ISO currency code, equivalent to what Stripe API returns',
    example: 'usd',
  })
  @IsString()
  @IsNotEmpty()
  currency: string;

  @ApiProperty({
    description:
      "An enum value from DonationStatus mapped from Stripe's status to these four statuses",
    example: DonationStatus.PENDING,
  })
  @IsEnum(DonationStatus)
  status: DonationStatus;

  @ApiProperty({
    description:
      'Optional key-value pairs attached to the payment, equivalent to what Stripe API returns',
    example: { orderId: '123' },
  })
  @IsOptional()
  metadata?: Record<string, unknown>;

  @ApiProperty({
    description:
      'The ID of the payment method used, mapped from paymentIntent.payment_method cast as a string',
    example: 'pm_1F4aBcD3eF4GhIjKlmnoPq',
  })
  @IsString()
  @IsOptional()
  paymentMethodId?: string;

  @ApiProperty({
    description:
      'Array of payment method types enabled for this PaymentIntent, equivalent to what Stripe API returns',
    example: ['card'],
  })
  @IsArray()
  paymentMethodTypes: string[];

  @ApiProperty({
    description:
      'Unix timestamp representing when the PaymentIntent was created, equivalent to what Stripe API returns',
    example: 1762000000,
  })
  @IsNumber()
  @Min(0)
  created: number;

  @ApiProperty({
    description:
      "Boolean indicating if the payment requires customer action, determined by checking if paymentIntent.status === 'requires_action'",
    example: false,
  })
  @IsBoolean()
  requiresAction: boolean;

  @ApiProperty({
    description:
      'Details about the required next action (if any), equivalent to what Stripe API returns',
    example: {
      type: 'redirect_to_url',
      redirect_to_url: {
        url: 'https://hooks.stripe.com/redirect/authenticate/src_1Aa2Bb3Cc4',
        return_url: 'https://example.com/checkout/complete',
      },
    },
  })
  @IsOptional()
  nextAction?: Stripe.PaymentIntent.NextAction;

  @ApiProperty({
    description:
      "Object containing error details if the payment failed. Contains properties 'code', 'message', and 'type' mapped from Stripe's paymentIntent.last_payment_error",
    example: {
      code: 'card_declined',
      message: 'Your card was declined.',
      type: 'card_error',
    },
  })
  @IsOptional()
  lastPaymentError?: {
    code: string;
    message: string;
    type: string;
  };

  @ApiProperty({
    description:
      'Unix timestamp representing when the PaymentIntent was canceled (if applicable), equivalent to what Stripe API returns',
    example: 1762000000,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  canceledAt?: number;
}
