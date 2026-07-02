import { Injectable, Inject, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import {
  DonationStatus,
  RecurringInterval,
} from '../donations/donation.entity';
import { CreatePaymentIntentRequest } from './mappers';

/**
 * Flexible definition for metadata, may want to change to be stricter later
 */
export type PaymentIntentMetadata = Record<string, string>;

/**
 * Parameters accepted by {@link PaymentsService.createSubscription}.
 */
export type CreateSubscriptionParams = {
  email: string;
  name: string;
  amount: number; // smallest currency unit (e.g. cents)
  currency: string;
  interval: RecurringInterval | string;
  metadata?: Stripe.MetadataParam;
};

/**
 * Shape returned by {@link PaymentsService.createSubscription}. `paymentIntentId`/
 * `clientSecret` intentionally mirror {@link PaymentIntentResponse} so the frontend
 * card-confirmation flow is identical to one-time payments.
 */
export type SubscriptionResponse = {
  subscriptionId: string;
  customerId: string;
  paymentIntentId: string;
  clientSecret: string;
  status: string;
  amount: number;
  currency: string;
};

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
export type PaymentIntentResponse = {
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
  nextAction?: Stripe.PaymentIntent.NextAction;
  lastPaymentError?: {
    code: string;
    message: string;
    type: string;
  };
  canceledAt?: number;
};

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  /** Cached Stripe Product id for donation subscriptions (see resolveDonationProductId). */
  private cachedDonationProductId?: string;

  constructor(
    @Inject('STRIPE_CLIENT') private stripe: Stripe,
    private readonly configService: ConfigService,
  ) {}

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
    metadata?: Stripe.MetadataParam,
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

    if (
      metadata !== undefined &&
      !PaymentsService.isValidStripeMetadata(metadata)
    ) {
      this.logger.warn('createPaymentIntent called with invalid metadata');
      return 'Invalid metadata';
    }

    return '';
  }

  /**
   * Runtime check to ensure metadata is a valid Stripe.MetadataParam-like object
   * (an object whose keys are strings and whose values are strings).
   * Also enforces common Stripe limits: max 50 keys, key length <= 40, value length <= 500.
   */
  private static isValidStripeMetadata(metadata?: unknown): boolean {
    if (metadata === undefined || metadata === null) return true;
    if (typeof metadata !== 'object') return false;
    if (Array.isArray(metadata)) return false;

    const obj = metadata as Record<string, unknown>;
    const keys = Object.keys(obj);
    if (keys.length > 50) return false;

    for (const key of keys) {
      if (typeof key !== 'string') return false;
      if (key.length === 0 || key.length > 40) return false;
      const val = obj[key];
      if (val === undefined || val === null) return false;
      if (typeof val !== 'string') return false;
      if ((val as string).length > 500) return false;
    }

    return true;
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
    request: CreatePaymentIntentRequest,
  ): Promise<PaymentIntentResponse> {
    if (request.currency) {
      request.currency = request.currency.toLowerCase();
    }
    const errorMsg = this.validateCreatePaymentIntentParams(
      request.amount,
      request.currency,
      request.metadata,
    );
    if (errorMsg !== '') {
      throw new Error(errorMsg);
    }

    try {
      const paymentIntent: Stripe.PaymentIntent =
        await this.stripe.paymentIntents.create({
          amount: request.amount,
          currency: request.currency,
          metadata: request.metadata,
          payment_method_types: ['card'],
        });

      this.logger.debug(
        `createPaymentIntent (${request.amount}, ${request.currency}, ${request.metadata}) -> ${paymentIntent.id}`,
      );

      return this.mapPaymentIntentToResponse(paymentIntent);
    } catch (error) {
      this.logger.error(`Error retrieving payment intent: ${error.message}`);
      throw error;
    }
  }

  /**
   * Maps our RecurringInterval enum to Stripe's price `recurring` shape.
   * Stripe only supports day/week/month/year, so bimonthly/quarterly are
   * expressed via `interval_count`.
   *
   * @returns the Stripe recurring config, or null if the interval is unknown
   */
  private mapIntervalToStripeRecurring(
    interval: RecurringInterval | string,
  ): { interval: 'week' | 'month' | 'year'; interval_count: number } | null {
    switch (interval) {
      case RecurringInterval.WEEKLY:
        return { interval: 'week', interval_count: 1 };
      case RecurringInterval.MONTHLY:
        return { interval: 'month', interval_count: 1 };
      case RecurringInterval.BIMONTHLY:
        return { interval: 'month', interval_count: 2 };
      case RecurringInterval.QUARTERLY:
        return { interval: 'month', interval_count: 3 };
      case RecurringInterval.ANNUALLY:
        return { interval: 'year', interval_count: 1 };
      default:
        return null;
    }
  }

  /**
   * Resolves the Stripe Product id used for donation subscriptions. Prefers the
   * configured STRIPE_DONATION_PRODUCT_ID; if unset, creates a product once and
   * caches it for the lifetime of the process (logging the id so it can be added
   * to the environment to avoid creating duplicates on restart).
   */
  private async resolveDonationProductId(): Promise<string> {
    if (this.cachedDonationProductId) {
      return this.cachedDonationProductId;
    }

    const configured = this.configService.get<string>(
      'STRIPE_DONATION_PRODUCT_ID',
    );
    if (configured) {
      this.cachedDonationProductId = configured;
      return configured;
    }

    const product = await this.stripe.products.create({ name: 'FCC Donation' });
    this.logger.warn(
      `STRIPE_DONATION_PRODUCT_ID not configured; created Stripe product ${product.id}. ` +
        `Set STRIPE_DONATION_PRODUCT_ID=${product.id} to reuse it and avoid duplicates.`,
    );
    this.cachedDonationProductId = product.id;
    return product.id;
  }

  /**
   * Finds an existing Stripe customer by email, or creates a new one.
   */
  private async resolveCustomerId(
    email: string,
    name: string,
  ): Promise<string> {
    const existing = await this.stripe.customers.list({ email, limit: 1 });
    if (existing.data.length > 0) {
      return existing.data[0].id;
    }
    const created = await this.stripe.customers.create({ email, name });
    return created.id;
  }

  /**
   * Creates a recurring donation as a Stripe Subscription.
   *
   * Uses `payment_behavior: 'default_incomplete'` so the subscription's first
   * invoice yields a PaymentIntent the frontend confirms with the exact same code
   * as a one-time payment. The returned `paymentIntentId` matches the id Stripe
   * later sends in the `payment_intent.succeeded` webhook, so the existing sync
   * path marks the donation succeeded with no changes.
   *
   * @param params email/name/amount/currency/interval/metadata for the donation
   * @returns subscription id, customer id, and the first PaymentIntent id + client secret
   */
  async createSubscription(
    params: CreateSubscriptionParams,
  ): Promise<SubscriptionResponse> {
    const currency = params.currency
      ? params.currency.toLowerCase()
      : params.currency;

    const errorMsg = this.validateCreatePaymentIntentParams(
      params.amount,
      currency,
      params.metadata,
    );
    if (errorMsg !== '') {
      throw new Error(errorMsg);
    }

    const recurring = this.mapIntervalToStripeRecurring(params.interval);
    if (!recurring) {
      this.logger.warn(
        `createSubscription called with invalid interval: ${params.interval}`,
      );
      throw new Error('Invalid interval');
    }

    if (!params.email || typeof params.email !== 'string') {
      throw new Error('Invalid email');
    }

    try {
      const customerId = await this.resolveCustomerId(
        params.email,
        params.name,
      );
      const product = await this.resolveDonationProductId();

      const subscription = await this.stripe.subscriptions.create({
        customer: customerId,
        items: [
          {
            price_data: {
              currency,
              unit_amount: params.amount,
              recurring,
              product,
            },
          },
        ],
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.confirmation_secret'],
        metadata: params.metadata,
      });

      const invoice = subscription.latest_invoice as Stripe.Invoice | null;
      const clientSecret = invoice?.confirmation_secret?.client_secret;
      if (!clientSecret) {
        throw new Error(
          'Subscription created but no confirmation secret was returned',
        );
      }

      // confirmation_secret holds a PaymentIntent client secret ("pi_x_secret_y");
      // the PaymentIntent id is the portion before "_secret_".
      const paymentIntentId = clientSecret.split('_secret_')[0];
      if (!paymentIntentId.startsWith('pi_')) {
        throw new Error(
          'Unexpected client secret format from subscription invoice',
        );
      }

      this.logger.debug(
        `createSubscription -> ${subscription.id} (pi ${paymentIntentId})`,
      );

      return {
        subscriptionId: subscription.id,
        customerId,
        paymentIntentId,
        clientSecret,
        status: subscription.status,
        amount: params.amount,
        currency,
      };
    } catch (error) {
      this.logger.error(`Error creating subscription: ${error.message}`);
      throw error;
    }
  }

  /**
   * Resolves the PaymentIntent id that paid a given invoice. On this Stripe API
   * version invoices no longer expose `payment_intent` directly, so we read the
   * expanded `payments` list. Returns undefined if none is found.
   */
  async getPaymentIntentIdForInvoice(
    invoiceId: string,
  ): Promise<string | undefined> {
    try {
      const invoice = await this.stripe.invoices.retrieve(invoiceId, {
        expand: ['payments'],
      });
      const payments = invoice.payments?.data ?? [];
      for (const invoicePayment of payments) {
        const payment = invoicePayment.payment;
        if (payment?.type === 'payment_intent' && payment.payment_intent) {
          return typeof payment.payment_intent === 'string'
            ? payment.payment_intent
            : payment.payment_intent.id;
        }
      }
      return undefined;
    } catch (err) {
      this.logger.error(
        `Error resolving payment intent for invoice ${invoiceId}: ${err.message}`,
      );
      return undefined;
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

  constructWebhookEvent(
    payload: Buffer | string,
    signature: string,
    webhookSecret: string,
  ): Stripe.Event {
    return this.stripe.webhooks.constructEvent(
      payload,
      signature,
      webhookSecret,
    );
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
   * Retrieves the exact processing fee for a successful payment intent
   * by expanding the balance transaction from its latest charge.
   *
   * @param paymentIntentId the payment intent ID
   * @returns the fee amount in cents, or undefined if not found
   */
  async getExactFeeForPaymentIntent(
    paymentIntentId: string,
  ): Promise<number | undefined> {
    try {
      const intent = await this.stripe.paymentIntents.retrieve(
        paymentIntentId,
        {
          expand: ['latest_charge.balance_transaction'],
        },
      );

      const charge = intent.latest_charge as Stripe.Charge;
      if (charge && charge.balance_transaction) {
        const balanceTx =
          charge.balance_transaction as Stripe.BalanceTransaction;
        return balanceTx.fee;
      }
      return undefined;
    } catch (err) {
      this.logger.error(
        `Error retrieving exact fee for payment intent ${paymentIntentId}: ${err.message}`,
      );
      return undefined;
    }
  }

  /**
   * Maps Stripe API payment Intent to response returned by service methods for a payment intent
   *
   * @param paymentIntent the payment intent object returned directly by the stripe api
   * @returns A PaymentIntentResponse object that is closer to data used in backend
   */
  public mapPaymentIntentToResponse(
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
