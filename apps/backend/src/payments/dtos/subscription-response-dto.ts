import { ApiProperty } from '@nestjs/swagger';

/**
 * Response for a created donation subscription.
 *
 * `id` and `clientSecret` intentionally mirror PaymentIntentResponseDto so the
 * frontend confirms the first charge with the exact same code as a one-time payment.
 */
export class SubscriptionResponseDto {
  @ApiProperty({
    description:
      'The first PaymentIntent id for the subscription (used as the donation transactionId)',
    example: 'pi_3ABC123',
  })
  id: string;

  @ApiProperty({
    description: 'The client secret used for client-side confirmation',
    example: 'pi_3ABC123_secret_XYZ',
  })
  clientSecret: string;

  @ApiProperty({
    description: 'The Stripe subscription id',
    example: 'sub_1ABC123',
  })
  subscriptionId: string;

  @ApiProperty({
    description: 'The Stripe customer id',
    example: 'cus_ABC123',
  })
  customerId: string;

  @ApiProperty({
    description: 'The Stripe subscription status',
    example: 'incomplete',
  })
  status: string;

  @ApiProperty({
    description: 'The recurring amount in smallest currency unit (e.g., cents)',
    example: 1099,
  })
  amount: number;

  @ApiProperty({
    description: 'The three-letter ISO currency code',
    example: 'usd',
  })
  currency: string;
}
