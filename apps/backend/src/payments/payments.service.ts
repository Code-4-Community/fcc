import { Injectable, Inject, Logger } from '@nestjs/common';
import Stripe from 'stripe';
import { DonationStatus } from '../donations/dtos/donation-response-dto';
import { RecurringInterval } from '../donations/dtos/create-donation-dto';

/**
 * Flexible definition for metadata, may want to change to be stricter later
 */
export type PaymentIntentMetadata = Record<string, string>;

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(@Inject('STRIPE_CLIENT') private stripe: Stripe) {}

  /**
   * Validates the parameters for createPaymentIntent
   * 
   * @param amount number - amount in smallest currency unit (required, positive integer)
   * @param currency string - ISO currency code, e.g. 'usd' (required)
   * @param metadata object - optional key/value metadata to attach to the payment
   * @returns string - either an empty string to signify good paramters, or an error message
   */
  private validateCreatePaymentIntentParams(
    amount: number,
    currency: string,
    metadata?: PaymentIntentMetadata,
  ): string {
    if (!Number.isFinite(amount) || amount < 0.01) {
      this.logger.warn(
        'createPaymentIntent called with invalid amount: ' + amount,
      );
      return 'Invalid amount: must be a number >= 0.01 (dollars)';
    }
    if (!currency || typeof currency !== 'string') {
      this.logger.warn(
        'createPaymentIntent called with invalid currency: ' + currency,
      );
      return 'Invalid currency';
    }
  }

  /**
   * Create a payment intent.
   *
   * Notes:
   * - `amount` is expected in the smallest currency unit (e.g. cents).
   * - This is a stub. Replace the body with a call to your payment provider SDK and
   *   map the provider response to the returned shape.
   *
   * @param amount number - amount in smallest currency unit (required, positive integer)
   * @param currency string - ISO currency code, e.g. 'usd' (required)
   * @param metadata object - optional key/value metadata to attach to the payment
   * @returns Promise resolving to a PaymentIntent-like object
   */
  async createPaymentIntent(
    amount: number,
    currency: string,
    metadata?: PaymentIntentMetadata,
  ): Promise<{
    id: string;
    clientSecret?: string;
    amount: number;
    currency: string;
    status: DonationStatus;
    metadata?: PaymentIntentMetadata;
    transactionId?: string;
  }> {
    if (!Number.isFinite(amount) || amount < 0.01) {
      this.logger.warn(
        'createPaymentIntent called with invalid amount: ' + amount,
      );
      throw new Error('Invalid amount: must be a number >= 0.01 (dollars)');
    }
    if (!currency || typeof currency !== 'string') {
      this.logger.warn(
        'createPaymentIntent called with invalid currency: ' + currency,
      );
      throw new Error('Invalid currency');
    }

    // Convert to lowercase for consistency
    currency = currency.toLowerCase();
    
    // Implement actual Stripe call here
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      metadata,
      automatic_payment_methods: { enabled: true }
    });

    this.logger.debug(`createPaymentIntent (stub) -> ${paymentIntent.id}`);

    return {
      id: paymentIntent.id,
      clientSecret: paymentIntent.client_secret,
      amount,
      currency,
      status: DonationStatus.PENDING,
      metadata
    };
  }

  /**
   * Validates the parameters for a subscription.
   *
   * @param customerId string - ID of the customer in the payment provider
   * @param priceId string - ID of the price/product to subscribe the customer to
   * @param interval enum RecurringInterval - billing interval
   *                ( 'weekly' | 'monthly' | 'bimonthly' | 'quarterly' | 'annually')
   * @returns string - either an empty string to signify good paramters, or an error message
   */
  private validateSubscriptionParams(
    customerId: string,
    priceId: string,
    interval: RecurringInterval,
  ): string {
    if (!customerId || typeof customerId !== 'string') {
      this.logger.warn('createSubscription called with invalid customerId');
      return 'Invalid customerId';
    }
    if (!priceId || typeof priceId !== 'string') {
      this.logger.warn('createSubscription called with invalid priceId');
      return 'Invalid priceId';
    }
    if (!interval || typeof interval !== 'string') {
      this.logger.warn('createSubscription called with invalid interval');
      return 'Invalid interval';
    }
  }

  /**
   * Creates a subscription for a customer.
   *
   * Notes:
   * - Replace the stub body with a real provider subscription creation call.
   *
   * @param customerId string - ID of the customer in the payment provider
   * @param priceId string - ID of the price/product to subscribe the customer to
   * @param interval enum RecurringInterval - billing interval
   *                ( 'weekly' | 'monthly' | 'bimonthly' | 'quarterly' | 'annually')
   * @returns Promise resolving to a Subscription-like object
   */
  async createSubscription(
    customerId: string,
    priceId: string,
    interval: RecurringInterval,
  ): Promise<{
    id: string;
    customerId: string;
    priceId: string;
    interval: RecurringInterval;
    status: string;
  }> {
    // TODO: Call provider SDK to create subscription, return provider response.
    const mockSub = {
      id: `sub_mock_${Date.now()}`,
      customerId,
      priceId,
      interval,
      status: 'active',
    };

    this.logger.debug(`createSubscription (stub) -> ${mockSub.id}`);
    return mockSub;
  }

  /**
   * Retrieve a payment intent by id.
   *
   * Notes:
   * - Stubbed to return a mock object. In a real implementation, map provider fields
   *   to the returned shape and return null or throw a NotFound-like error when appropriate.
   *
   * @param paymentIntentId string - provider payment intent id
   * @returns Promise resolving to a PaymentIntent-like object
   */
  async retrievePaymentIntent(paymentIntentId: string): Promise<{
    id: string;
    amount: number;
    currency: string;
    status: DonationStatus;
    metadata?: PaymentIntentMetadata;
    transactionId?: string;
  } | null> {
    if (!paymentIntentId || typeof paymentIntentId !== 'string') {
      this.logger.warn('retrievePaymentIntent called with invalid id');
      throw new Error('Invalid paymentIntentId');
    }

    // TODO: Replace with real provider retrieval.
    // Return a mock matching the DonationResponseDto expectations (amount in dollars, optional transactionId, DonationStatus)
    const mock = {
      id: paymentIntentId,
      amount: 0,
      currency: 'usd',
      status: DonationStatus.COMPLETED,
      metadata: {},
      transactionId: `txn_mock_${Math.random().toString(36).slice(2, 12)}`,
    };

    this.logger.debug(`retrievePaymentIntent (stub) -> ${paymentIntentId}`);
    return mock;
  }
}
