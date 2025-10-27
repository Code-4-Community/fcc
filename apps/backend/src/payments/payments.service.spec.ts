import { PaymentsService } from './payments.service';
import { DonationStatus } from '../donations/donation.entity';
import Stripe from 'stripe';

const stripeMock = {
  paymentIntents: {
    create: jest.fn(),
    retrieve: jest.fn(),
    update: jest.fn(),
    cancel: jest.fn(),
  },
  subscriptions: {
    create: jest.fn(),
    retrieve: jest.fn(),
    update: jest.fn(),
    cancel: jest.fn(),
  },
};

// Mock the Stripe constructor to return our mock
jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => stripeMock);
});

// Helper function for creating Stripe-like errors
function createStripeError(type, code, message, extraProps = {}) {
  return {
    type,
    code,
    message,
    ...extraProps,
    raw: {
      type: type.replace('Stripe', '').toLowerCase(),
      code,
      message,
    },
  };
}

const paymentIntentMock1 = {
  id: 'pi_1234567890abcdefghijklmn',
  object: 'payment_intent',
  amount: 50,
  amount_capturable: 0,
  amount_received: 0,
  application: null,
  application_fee_amount: null,
  automatic_payment_methods: { enabled: true },
  canceled_at: null,
  cancellation_reason: null,
  capture_method: 'automatic',
  client_secret: 'pi_1234567890abcdef_secret_1234567890abcdef',
  confirmation_method: 'automatic',
  created: Math.floor(Date.now() / 1000),
  currency: 'usd',
  customer: null,
  description: null,
  invoice: null,
  last_payment_error: null,
  latest_charge: null,
  livemode: false,
  metadata: { orderId: '123' },
  next_action: null,
  on_behalf_of: null,
  payment_method: null,
  payment_method_options: {
    card: { request_three_d_secure: 'automatic' },
  },
  payment_method_types: ['card'],
  processing: null,
  receipt_email: null,
  review: null,
  setup_future_usage: null,
  shipping: null,
  statement_descriptor: null,
  statement_descriptor_suffix: null,
  status: 'processing',
  transfer_data: null,
  transfer_group: null,
};

const paymentIntentMock2 = {
  id: 'pi_1234567890abcdefghijklmn',
  object: 'payment_intent',
  amount: 500,
  amount_capturable: 0,
  amount_received: 500,
  application: null,
  application_fee_amount: null,
  automatic_payment_methods: { enabled: true },
  canceled_at: null,
  cancellation_reason: null,
  capture_method: 'automatic',
  client_secret: 'pi_1234567890abcdefghijklmn_secret_1234567890abcdef',
  confirmation_method: 'automatic',
  created: Math.floor(Date.now() / 1000),
  currency: 'usd',
  customer: null,
  description: null,
  invoice: null,
  last_payment_error: null,
  latest_charge: 'ch_1234567890abcdef',
  livemode: false,
  metadata: { orderId: '123' },
  next_action: null,
  on_behalf_of: null,
  payment_method: 'pm_1234567890abcdef',
  payment_method_options: {
    card: { request_three_d_secure: 'automatic' },
  },
  payment_method_types: ['card'],
  processing: null,
  receipt_email: null,
  review: null,
  setup_future_usage: null,
  shipping: null,
  statement_descriptor: null,
  statement_descriptor_suffix: null,
  status: 'succeeded',
  transfer_data: null,
  transfer_group: null,
};

const subscriptionMock1 = {
  id: 'sub_1234567890abcdef',
  object: 'subscription',
  application: null,
  application_fee_percent: null,
  automatic_tax: { enabled: false },
  billing_cycle_anchor: Math.floor(Date.now() / 1000),
  billing_thresholds: null,
  cancel_at: null,
  cancel_at_period_end: false,
  canceled_at: null,
  collection_method: 'charge_automatically',
  created: Math.floor(Date.now() / 1000),
  current_period_end: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60, // 30 days from now
  current_period_start: Math.floor(Date.now() / 1000),
  customer: 'cus_1234abcdefgh5678',
  days_until_due: null,
  default_payment_method: null,
  default_source: null,
  default_tax_rates: [],
  discount: null,
  ended_at: null,
  items: {
    object: 'list',
    data: [
      {
        id: 'si_1234567890abcdef',
        object: 'subscription_item',
        billing_thresholds: null,
        created: Math.floor(Date.now() / 1000),
        metadata: { orderId: '123' },
        price: {
          id: 'price_1234abcdefgh5678',
          object: 'price',
          active: true,
          billing_scheme: 'per_unit',
          created: Math.floor(Date.now() / 1000),
          currency: 'usd',
          livemode: false,
          lookup_key: null,
          metadata: { orderId: '123' },
          nickname: null,
          product: 'prod_1234567890abcdef',
          recurring: {
            aggregate_usage: null,
            interval: 'month', // Ensure interval is present
            interval_count: 1,
            usage_type: 'licensed',
          },
          tax_behavior: 'unspecified',
          tiers_mode: null,
          transform_quantity: null,
          type: 'recurring',
          unit_amount: 1000,
          unit_amount_decimal: '1000',
        },
        quantity: 1,
        subscription: 'sub_1234567890abcdef',
        tax_rates: [],
      },
    ],
    has_more: false,
    total_count: 1,
    url: '/v1/subscription_items?subscription=sub_1234567890abcdef',
  },
  latest_invoice: 'in_1234567890abcdef',
  livemode: false,
  metadata: { orderId: '123' },
  next_pending_invoice_item_invoice: null,
  pause_collection: null,
  payment_settings: {
    payment_method_options: null,
    payment_method_types: null,
    save_default_payment_method: 'off',
  },
  pending_invoice_item_interval: null,
  pending_setup_intent: null,
  pending_update: null,
  schedule: null,
  start_date: Math.floor(Date.now() / 1000),
  status: 'active',
  transfer_data: null,
  trial_end: null,
  trial_start: null,
};

describe('PaymentsService', () => {
  let svc: PaymentsService;

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    // Create a new instance with our mock
    svc = new PaymentsService(stripeMock as unknown as Stripe);

    // Set up default mock implementations with more realistic Stripe responses
    stripeMock.paymentIntents.create.mockResolvedValue(paymentIntentMock1);

    stripeMock.paymentIntents.retrieve.mockResolvedValue(paymentIntentMock2);

    stripeMock.subscriptions.create.mockResolvedValue(subscriptionMock1);
  });

  describe('createPaymentIntent', () => {
    it('throws for invalid (negative) amount', async () => {
      await expect(svc.createPaymentIntent(-1, 'usd')).rejects.toThrow(
        'Invalid amount: must be a number >= 0',
      );
    });

    it('throws for invalid amount (negative value) where currency is not usd', async () => {
      await expect(svc.createPaymentIntent(-1, 'eur')).rejects.toThrow(
        'Invalid amount: must be a number >= 0',
      );
    });

    it('returns a well-formed payment intent for valid input (amount=0) where currency is not usd', async () => {
      stripeMock.paymentIntents.create.mockResolvedValue({
        id: 'pi_1234567890abcdefghijklmn',
        object: 'payment_intent',
        amount: 0,
        amount_capturable: 0,
        amount_received: 0,
        application: null,
        application_fee_amount: null,
        automatic_payment_methods: { enabled: true },
        canceled_at: null,
        cancellation_reason: null,
        capture_method: 'automatic',
        client_secret: 'pi_1234567890abcdef_secret_1234567890abcdef',
        confirmation_method: 'automatic',
        created: Math.floor(Date.now() / 1000),
        currency: 'eur',
        customer: null,
        description: null,
        invoice: null,
        last_payment_error: null,
        latest_charge: null,
        livemode: false,
        metadata: { orderId: '123' },
        next_action: null,
        on_behalf_of: null,
        payment_method: null,
        payment_method_options: {
          card: { request_three_d_secure: 'automatic' },
        },
        payment_method_types: ['card'],
        processing: null,
        receipt_email: null,
        review: null,
        setup_future_usage: null,
        shipping: null,
        statement_descriptor: null,
        statement_descriptor_suffix: null,
        status: 'processing',
        transfer_data: null,
        transfer_group: null,
      });

      const pi = await svc.createPaymentIntent(0, 'eur', { orderId: '123' });

      expect(pi).toHaveProperty('id');
      expect(pi).toHaveProperty('clientSecret');
      expect(pi.amount).toBe(0);
      expect(pi.currency).toBe('eur');
      expect(pi.status).toBe(DonationStatus.PENDING);
      expect(pi.metadata).toEqual({ orderId: '123' });
    });

    it('throws for invalid (currency that has decimals) amount', async () => {
      await expect(svc.createPaymentIntent(50.01, 'usd')).rejects.toThrow(
        'Invalid amount: amount is already in lowest currency unit, so there should be no decimals',
      );
    });

    it('throws for invalid usd of amount < 50 cents', async () => {
      await expect(svc.createPaymentIntent(24, 'usd')).rejects.toThrow(
        'Invalid amount, US currency donations must be at least 50 cents',
      );
    });

    it('returns a well-formed payment intent for valid input (amount=50) where currency is usd', async () => {
      const pi = await svc.createPaymentIntent(50, 'usd', {});
      expect(pi).toHaveProperty('id');
      expect(pi).toHaveProperty('clientSecret');
      expect(pi.amount).toBe(50);
      expect(pi.currency).toBe('usd');
      expect(pi.status).toBe(DonationStatus.PENDING);
      expect(pi.metadata).toEqual({ orderId: '123' });
    });

    it('throws for null currency', async () => {
      await expect(svc.createPaymentIntent(10, null)).rejects.toThrow(
        /Invalid currency/i,
      );
    });

    it('throws for undefined currency', async () => {
      await expect(svc.createPaymentIntent(10, null)).rejects.toThrow(
        /Invalid currency/i,
      );
    });

    it('throws for non-string currency', async () => {
      await expect(
        svc.createPaymentIntent(10, 0 as unknown as string),
      ).rejects.toThrow(/Invalid currency/i);
    });

    it('throws for currency length < 3', async () => {
      await expect(svc.createPaymentIntent(10, 'a')).rejects.toThrow(
        /Invalid currency/i,
      );
    });

    it('throws for currency length > 3', async () => {
      await expect(svc.createPaymentIntent(10, 'aaaa')).rejects.toThrow(
        /Invalid currency/i,
      );
    });

    it('returns a well-formed payment intent for valid input', async () => {
      // Update the expected return shape to match the new PaymentIntentResponse format
      const pi = await svc.createPaymentIntent(50, 'usd', { orderId: '123' });

      // Check the returned object has all expected properties from PaymentIntentResponse
      expect(pi).toHaveProperty('id');
      expect(pi).toHaveProperty('clientSecret');
      expect(pi).toHaveProperty('amount', 50);
      expect(pi).toHaveProperty('currency', 'usd');
      expect(pi).toHaveProperty('status', DonationStatus.PENDING);
      expect(pi).toHaveProperty('metadata', { orderId: '123' });

      // Additional fields that should be present in the new response format
      expect(pi).toHaveProperty('paymentMethodTypes');
      expect(pi).toHaveProperty('created');
      expect(pi).toHaveProperty('requiresAction');
      // Optional fields that might be undefined in a new payment intent
      expect(pi).toHaveProperty('lastPaymentError');
      expect(pi).toHaveProperty('canceledAt');
    });

    it('handles Stripe API errors correctly', async () => {
      const cardDeclinedError = createStripeError(
        'StripeCardError',
        'card_declined',
        'Your card was declined',
        { decline_code: 'insufficient_funds' },
      );

      stripeMock.paymentIntents.create.mockRejectedValueOnce(cardDeclinedError);

      await expect(svc.createPaymentIntent(2550, 'usd')).rejects.toMatchObject(
        cardDeclinedError,
      );
    });
  });

  describe('createSubscription', () => {
    it('throws for undefined customerId', async () => {
      await expect(
        svc.createSubscription(undefined, 'price_1234abcdefgh5678'),
      ).rejects.toThrow('Invalid customerId');
    });

    it('throws for null customerId', async () => {
      await expect(
        svc.createSubscription(null, 'price_1234abcdefgh5678'),
      ).rejects.toThrow('Invalid customerId');
    });

    it('throws for undefined priceId', async () => {
      await expect(
        svc.createSubscription('cus_1234abcdefgh5678', undefined),
      ).rejects.toThrow('Invalid priceId');
    });

    it('throws for null priceId', async () => {
      await expect(
        svc.createSubscription('cus_1234abcdefgh5678', null),
      ).rejects.toThrow('Invalid priceId');
    });

    it('handles Stripe API errors correctly', async () => {
      const paymentMethodNotSupportedError = createStripeError(
        'StripeInvalidRequestError',
        'payment_method_not_available',
        'This payment method type is not supported for subscription payments',
        { payment_method: { id: 'pm_1234567890abcdef' } },
      );

      stripeMock.subscriptions.create.mockRejectedValueOnce(
        paymentMethodNotSupportedError,
      );

      await expect(
        svc.createSubscription(
          'cus_1234abcdefgh5678',
          'price_1234abcdefgh5678',
        ),
      ).rejects.toMatchObject(paymentMethodNotSupportedError);
    });

    it('creates a mock subscription for valid inputs', async () => {
      const sub = await svc.createSubscription(
        'cus_1234abcdefgh5678',
        'price_1234abcdefgh5678',
      );
      expect(sub).toHaveProperty('id');
      expect(sub.customerId).toBe('cus_1234abcdefgh5678');
      expect(sub.priceId).toBe('price_1234abcdefgh5678');
      expect(sub.status).toBe('active');
    });
  });

  describe('retrievePaymentIntent', () => {
    it('throws for undefined id', async () => {
      await expect(svc.retrievePaymentIntent(undefined)).rejects.toThrow(
        /Invalid paymentIntentId/i,
      );
    });

    it('throws for id of invalid type', async () => {
      await expect(
        svc.retrievePaymentIntent(3 as unknown as string),
      ).rejects.toThrow(/Invalid paymentIntentId/i);
    });

    it('throws for an empty id', async () => {
      await expect(svc.retrievePaymentIntent('')).rejects.toThrow(
        /Invalid paymentIntentId/i,
      );
    });

    it('returns payment intent details when given a valid id', async () => {
      const paymentIntentId = 'pi_1234567890abcdefghijklmn';
      const pi = await svc.retrievePaymentIntent(paymentIntentId);

      // Verify all fields from the PaymentIntentResponse interface
      expect(pi).toHaveProperty('id', paymentIntentId);
      expect(pi).toHaveProperty(
        'clientSecret',
        'pi_1234567890abcdefghijklmn_secret_1234567890abcdef',
      );
      expect(pi).toHaveProperty('amount', 500); // This matches our mock's return value
      expect(pi).toHaveProperty('currency', 'usd');
      expect(pi).toHaveProperty('status', DonationStatus.SUCCEEDED); // Should map from 'succeeded'
      expect(pi).toHaveProperty('metadata', { orderId: '123' });
      expect(pi).toHaveProperty('paymentMethodId', 'pm_1234567890abcdef');
      expect(pi).toHaveProperty('paymentMethodTypes', ['card']);
      expect(pi).toHaveProperty('created');
      expect(pi).toHaveProperty('requiresAction', false); // Since status is 'succeeded'
      expect(pi).toHaveProperty('lastPaymentError', undefined);
      expect(pi).toHaveProperty('canceledAt', null);

      // Verify that status mapping works correctly
      expect(pi.status).toBe(DonationStatus.SUCCEEDED); // Specific check for status mapping
    });

    it('handles Stripe API errors correctly', async () => {
      // Make the mock throw an error for this test
      const paymentIntentId = 'pi_1234567890abcdefghijklmn';

      const noSuchPaymentIntent = createStripeError(
        'StripeInvalidRequestError',
        'resource_missing',
        'No such payment intent',
        { decline_code: 'resource_missing' },
      );

      stripeMock.paymentIntents.retrieve.mockRejectedValueOnce(
        noSuchPaymentIntent,
      );

      await expect(
        svc.retrievePaymentIntent(paymentIntentId),
      ).rejects.toMatchObject(noSuchPaymentIntent);
    });
  });
});
