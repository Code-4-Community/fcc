import { Injectable, Inject, Logger } from '@nestjs/common';
import Stripe from 'stripe';
import {
  DonationStatus,
  RecurringInterval,
} from '../donations/donation.entity';

/**
 * Flexible definition for metadata, may want to change to be stricter later
 */
export type PaymentIntentMetadata = Record<string, string>;

/**
 * Interface for object shape returned by service methods that output detailed payment intent info
 *
 * id - The unique identifier for the PaymentIntent, equivalent to what Stripe API returns
 * clientSecret - The client secret used for client-side confirmation, equivalent to what Stripe API returns
 * amount - The payment amount in smallest currency unit (e.g., cents), equivalent to what Stripe API returns
 * currency - The three-letter ISO currency code (e.g., 'usd'), equivalent to what Stripe API returns
 * status - An enum value from DonationStatus (PENDING, SUCCEEDED, FAILED, CANCELLED), mapped from Stripe's status to these four statuses
 * metadata - Optional key-value pairs attached to the payment, equivalent to what Stripe API returns
 * paymentMethodId - The ID of the payment method used, mapped from paymentIntent.payment_method cast as a string
 * paymentMethodTypes - Array of payment method types enabled for this PaymentIntent, equivalent to what Stripe API returns
 * created - Unix timestamp representing when the PaymentIntent was created, equivalent to what Stripe API returns
 * requiresAction - Boolean indicating if the payment requires customer action, determined by checking if paymentIntent.status === 'requires_action'
 * nextAction - Details about the required next action (if any), equivalent to what Stripe API returns
 * lastPaymentError - Object containing error details if the payment failed, with properties -
 * code - The error code, mapped from paymentIntent.last_payment_error.code
 * message - The error message, mapped from paymentIntent.last_payment_error.message
 * type - The error type, mapped from paymentIntent.last_payment_error.type
 * canceledAt - Unix timestamp representing when the PaymentIntent was canceled (if applicable), equivalent to what Stripe API returns
 */
interface PaymentIntentResponse {
  id: string;
  clientSecret: string;
  amount: number;
  currency: string;
  status: DonationStatus;
  metadata?: Record<string, unknown>;
  paymentMethodId?: string;
  paymentMethodTypes: string[];
  created: number;
  requiresAction: boolean;
  nextAction?: unknown;
  lastPaymentError?: {
    code: string;
    message: string;
    type: string;
  };
  canceledAt?: number;
}

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
    if (typeof amount === 'undefined') {
      this.logger.warn(
        'createPaymentIntent called with invalid amount: ' + amount,
      );
      return 'Invalid amount: amount needs to be defined';
    }

    if (!Number.isFinite(amount) || amount < 0) {
      this.logger.warn(
        'createPaymentIntent called with invalid amount: ' + amount,
      );
      return 'Invalid amount: must be a number >= 0';
    }

    if (amount % 1 !== 0) {
      this.logger.warn('createPaymentIntent called with decimals: ' + amount);
      return 'Invalid amount: amount is already in lowest currency unit, so there should be no decimals';
    }

    if (!currency || typeof currency !== 'string') {
      this.logger.warn(
        'createPaymentIntent called with invalid currency: ' + currency,
      );
      return 'Invalid currency';
    }

    if (currency === 'usd' && amount < 50) {
      this.logger.warn(
        'createPaymentIntent called with less than 50 cents (USD): was called with ' +
          amount,
      );
      return 'Invalid amount, US currency donations must be at least 50 cents';
    }

    if (!/^[a-z]{3}$/i.test(currency)) {
      this.logger.warn(
        'createPaymentIntent called with malformed currency: ' + currency,
      );
      return 'Invalid currency format; expected 3-letter ISO code like "usd"';
    }

    if (metadata !== undefined && typeof metadata !== 'object') {
      this.logger.warn('createPaymentIntent called with invalid metadata');
      return 'Invalid metadata';
    }

    return '';
  }

  /**
   * Create a payment intent.
   *
   * @param amount number - amount in smallest currency unit e.g. cents (required, positive integer)
   * @param currency string - ISO currency code, e.g. 'usd' (required)
   * @param metadata object - optional key/value metadata to attach to the payment
   * @returns Promise resolving to a PaymentIntent-like object
   */
  async createPaymentIntent(
    amount: number,
    currency: string,
    metadata?: PaymentIntentMetadata,
  ): Promise<PaymentIntentResponse> {
    if (currency) {
      currency = currency.toLowerCase();
    }
    const errorMsg = this.validateCreatePaymentIntentParams(
      amount,
      currency,
      metadata,
    );
    if (errorMsg !== '') {
      throw new Error(errorMsg);
    }

    try {
      const paymentIntent: Stripe.PaymentIntent =
        await this.stripe.paymentIntents.create({
          amount,
          currency,
          metadata,
          payment_method_types: ['card', 'us_bank_accounts'],
        });

      this.logger.debug(
        `createPaymentIntent (${amount}, ${currency}, ${metadata}) -> ${paymentIntent.id}`,
      );

      return this.mapPaymentIntentToResponse(paymentIntent);
    } catch (error) {
      this.logger.error(`Error retrieving payment intent: ${error.message}`);
      throw error;
    }
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
  private validateCreateSubscriptionParams(
    customerId: string,
    priceId: string,
  ): string {
    const customerIdPattern = /^cus_[a-zA-Z0-9]{14,}$/;
    const priceIdPattern = /^price_[a-zA-Z0-9]{14,}$/;

    if (!customerId || typeof customerId !== 'string') {
      this.logger.warn('createSubscription called with invalid customerId');
      return 'Invalid customerId';
    }

    if (!priceId || typeof priceId !== 'string') {
      this.logger.warn('createSubscription called with invalid priceId');
      return 'Invalid priceId';
    }

    if (!customerIdPattern.test(customerId)) {
      return 'Invalid customerId format';
    }

    if (!priceIdPattern.test(priceId)) {
      return 'Invalid priceId format';
    }

    return '';
  }

  /**
   * Creates a subscription for a customer.
   *
   * @param customerId string - ID of the customer in the payment provider
   * @param priceId string - ID of the price/product to subscribe the customer to
   * @returns Promise resolving to a Subscription-like object
   */
  async createSubscription(
    customerId: string,
    priceId: string,
  ): Promise<{
    id: string;
    customerId: string;
    priceId: string;
    interval: RecurringInterval;
    status: string;
  }> {
    try {
      const errorMsg = this.validateCreateSubscriptionParams(
        customerId,
        priceId,
      );
      if (errorMsg !== '') {
        throw new Error(errorMsg);
      }
      const subscription: Stripe.Subscription =
        await this.stripe.subscriptions.create({
          customer: customerId,
          items: [
            {
              price: priceId,
            },
          ],
        });

      this.logger.debug(`createSubscription (stub) -> ${subscription.id}`);
      return {
        id: subscription.id,
        customerId: subscription.customer as string,
        priceId: subscription.items.data[0].price.id,
        interval: subscription.items.data[0].price.recurring
          .interval as RecurringInterval,
        status: subscription.status,
      };
    } catch (error) {
      this.logger.error(`Error creating subscription: ${error.message}`);
      throw error;
    }
  }

  /**
   * Validates the parameters for retrieve payment intent
   *
   * @param paymentIntentId
   * @param status
   */
  private validateRetrievePaymentIntentParams(paymentIntentId: string): string {
    if (!paymentIntentId || typeof paymentIntentId !== 'string') {
      this.logger.warn('retrievePaymentIntent called with invalid id');
      return 'Invalid paymentIntentId';
    }
    return '';
  }

  /**
   * Retrieve a payment intent by id.
   *
   * @param paymentIntentId string - provider payment intent id
   * @returns Promise resolving to a PaymentIntent-like object
   */
  async retrievePaymentIntent(
    paymentIntentId: string,
  ): Promise<PaymentIntentResponse> {
    try {
      const errorMsg =
        this.validateRetrievePaymentIntentParams(paymentIntentId);
      if (errorMsg !== '') {
        throw new Error(errorMsg);
      }
      const paymentIntent: Stripe.PaymentIntent =
        await this.stripe.paymentIntents.retrieve(paymentIntentId);

      return this.mapPaymentIntentToResponse(paymentIntent);
    } catch (err) {
      this.logger.error(`Error retrieving payment intent: ${err.message}`);
      throw err;
    }
  }

  /**
   * Maps a Stripe PaymentIntent status to one of the four DonationStatus enum values
   *
   * @param stripeStatus The status string from Stripe PaymentIntent
   * @returns The corresponding DonationStatus enum value (PENDING, SUCCEEDED, FAILED, CANCELLED)
   */
  private mapStripeStatusToDonationStatus(
    stripeStatus: string,
  ): DonationStatus {
    switch (stripeStatus) {
      case 'succeeded':
        return DonationStatus.SUCCEEDED;

      case 'canceled':
        return DonationStatus.CANCELLED;

      case 'requires_payment_method':
        return DonationStatus.FAILED;

      case 'processing':
      case 'requires_confirmation':
      case 'requires_action':
      case 'requires_capture':
        return DonationStatus.PENDING;

      default:
        return DonationStatus.PENDING;
    }
  }

  /**
   * Maps Stripe API payment Intent to response returned by service methods for a payment intent
   *
   * @param paymentIntent the payment intent object returned directly by the stripe api
   * @returns A PaymentIntentResponse object that is closer to data used in backend
   */
  private mapPaymentIntentToResponse(
    paymentIntent: Stripe.PaymentIntent,
  ): PaymentIntentResponse {
    return {
      id: paymentIntent.id,
      clientSecret: paymentIntent.client_secret,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      status: this.mapStripeStatusToDonationStatus(paymentIntent.status),
      metadata: paymentIntent.metadata,
      paymentMethodId: paymentIntent.payment_method as string,
      paymentMethodTypes: paymentIntent.payment_method_types,
      created: paymentIntent.created,
      requiresAction: paymentIntent.status === 'requires_action',
      nextAction: paymentIntent.next_action,
      lastPaymentError: paymentIntent.last_payment_error
        ? {
            code: paymentIntent.last_payment_error.code,
            message: paymentIntent.last_payment_error.message,
            type: paymentIntent.last_payment_error.type,
          }
        : undefined,
      canceledAt: paymentIntent.canceled_at,
    };
  }
}
