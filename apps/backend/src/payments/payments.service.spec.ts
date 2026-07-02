import { PaymentsService } from './payments.service';
import { ConfigService } from '@nestjs/config';
import { DonationStatus } from '../donations/donation.entity';
import Stripe from 'stripe';
import { CreatePaymentIntentRequest } from './mappers';

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
  customers: {
    list: jest.fn(),
    create: jest.fn(),
  },
  products: {
    create: jest.fn(),
  },
  invoices: {
    retrieve: jest.fn(),
  },
};

const configServiceMock = {
  get: jest.fn(),
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

const paymentIntentCanceledMock = {
  ...paymentIntentMock2,
  status: 'canceled',
};

const paymentIntentFailedMock = {
  ...paymentIntentMock2,
  status: 'requires_payment_method',
};

const paymentIntentProcessingMock = {
  ...paymentIntentMock2,
  status: 'processing',
};

const paymentIntentRequiresConfirmationMock = {
  ...paymentIntentMock2,
  status: 'requires_confirmation',
};

const paymentIntentRequiresActionMock = {
  ...paymentIntentMock2,
  status: 'requires_action',
};

const paymentIntentRequiresCaptureMock = {
  ...paymentIntentMock2,
  status: 'requires_capture',
};

const paymentIntentOtherStatusMock = {
  ...paymentIntentMock2,
  status: 'unknown',
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
  latest_invoice: {
    id: 'in_1234567890abcdef',
    object: 'invoice',
    confirmation_secret: {
      client_secret: 'pi_sub1234567890_secret_abcdefghij',
      type: 'payment_intent',
    },
  },
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

    // Create a new instance with our mocks
    svc = new PaymentsService(
      stripeMock as unknown as Stripe,
      configServiceMock as unknown as ConfigService,
    );

    // Set up default mock implementations with more realistic Stripe responses
    stripeMock.paymentIntents.create.mockResolvedValue(paymentIntentMock1);

    stripeMock.paymentIntents.retrieve.mockResolvedValue(paymentIntentMock2);

    stripeMock.subscriptions.create.mockResolvedValue(subscriptionMock1);

    // Subscription-flow defaults: no existing customer, product created on the fly
    configServiceMock.get.mockReturnValue(undefined);
    stripeMock.customers.list.mockResolvedValue({ data: [] });
    stripeMock.customers.create.mockResolvedValue({
      id: 'cus_new1234567890',
    });
    stripeMock.products.create.mockResolvedValue({ id: 'prod_created123' });
  });

  describe('createPaymentIntent', () => {
    it('throws for invalid (negative) amount', async () => {
      await expect(
        svc.createPaymentIntent({
          amount: -1,
          currency: 'usd',
        } as CreatePaymentIntentRequest),
      ).rejects.toThrow('Invalid amount: must be a number >= 0');
    });

    it('throws for invalid amount (negative value) where currency is not usd', async () => {
      await expect(
        svc.createPaymentIntent({
          amount: -1,
          currency: 'eur',
        } as CreatePaymentIntentRequest),
      ).rejects.toThrow('Invalid amount: must be a number >= 0');
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

      const pi = await svc.createPaymentIntent({
        amount: 0,
        currency: 'eur',
        metadata: { orderId: '123' },
      } as CreatePaymentIntentRequest);

      expect(pi).toHaveProperty('id');
      expect(pi).toHaveProperty('clientSecret');
      expect(pi.amount).toBe(0);
      expect(pi.currency).toBe('eur');
      expect(pi.status).toBe(DonationStatus.PENDING);
      expect(pi.metadata).toEqual({ orderId: '123' });
    });

    it('throws for invalid (currency that has decimals) amount', async () => {
      await expect(
        svc.createPaymentIntent({
          amount: 50.01,
          currency: 'usd',
        } as CreatePaymentIntentRequest),
      ).rejects.toThrow(
        'Invalid amount: amount is already in lowest currency unit, so there should be no decimals',
      );
    });

    it('throws for invalid usd of amount < 50 cents', async () => {
      await expect(
        svc.createPaymentIntent({
          amount: 24,
          currency: 'usd',
        } as CreatePaymentIntentRequest),
      ).rejects.toThrow(
        'Invalid amount, US currency donations must be at least 50 cents',
      );
    });

    it('returns a well-formed payment intent for valid input (amount=50) where currency is usd', async () => {
      const pi = await svc.createPaymentIntent({
        amount: 50,
        currency: 'usd',
        metadata: {},
      } as CreatePaymentIntentRequest);
      expect(pi).toHaveProperty('id');
      expect(pi).toHaveProperty('clientSecret');
      expect(pi.amount).toBe(50);
      expect(pi.currency).toBe('usd');
      expect(pi.status).toBe(DonationStatus.PENDING);
      expect(pi.metadata).toEqual({ orderId: '123' });
    });

    it('throws for null currency', async () => {
      await expect(
        svc.createPaymentIntent({
          amount: 10,
          currency: null,
        } as CreatePaymentIntentRequest),
      ).rejects.toThrow(/Invalid currency/i);
    });

    it('throws for undefined currency', async () => {
      await expect(
        svc.createPaymentIntent({
          amount: 10,
          currency: null,
        } as CreatePaymentIntentRequest),
      ).rejects.toThrow(/Invalid currency/i);
    });

    it('throws for non-string currency', async () => {
      await expect(
        svc.createPaymentIntent({
          amount: 10,
          currency: 0 as unknown as string,
        } as CreatePaymentIntentRequest),
      ).rejects.toThrow(/Invalid currency/i);
    });

    it('throws for currency length < 3', async () => {
      await expect(
        svc.createPaymentIntent({
          amount: 10,
          currency: 'a',
        } as CreatePaymentIntentRequest),
      ).rejects.toThrow(/Invalid currency/i);
    });

    it('throws for currency length > 3', async () => {
      await expect(
        svc.createPaymentIntent({
          amount: 10,
          currency: 'aaaa',
        } as CreatePaymentIntentRequest),
      ).rejects.toThrow(/Invalid currency/i);
    });

    it('returns a well-formed payment intent for valid input', async () => {
      // Update the expected return shape to match the new PaymentIntentResponse format
      const pi = await svc.createPaymentIntent({
        amount: 50,
        currency: 'usd',
        metadata: { orderId: '123' },
      } as CreatePaymentIntentRequest);

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

      await expect(
        svc.createPaymentIntent({
          amount: 2550,
          currency: 'usd',
        } as CreatePaymentIntentRequest),
      ).rejects.toMatchObject(cardDeclinedError);
    });
  });

  describe('createSubscription', () => {
    const validParams = {
      email: 'donor@example.com',
      name: 'Jane Donor',
      amount: 1000,
      currency: 'usd',
      interval: 'monthly',
    };

    it('throws for an amount below the USD minimum', async () => {
      await expect(
        svc.createSubscription({ ...validParams, amount: 10 }),
      ).rejects.toThrow(
        'Invalid amount, US currency donations must be at least 50 cents',
      );
    });

    it('throws for an invalid interval', async () => {
      await expect(
        svc.createSubscription({ ...validParams, interval: 'fortnightly' }),
      ).rejects.toThrow('Invalid interval');
    });

    it('throws for a missing email', async () => {
      await expect(
        svc.createSubscription({
          ...validParams,
          email: undefined as unknown as string,
        }),
      ).rejects.toThrow('Invalid email');
    });

    it('reuses an existing Stripe customer when one is found by email', async () => {
      stripeMock.customers.list.mockResolvedValue({
        data: [{ id: 'cus_existing123' }],
      });

      const result = await svc.createSubscription(validParams);

      expect(stripeMock.customers.create).not.toHaveBeenCalled();
      expect(result.customerId).toBe('cus_existing123');
    });

    it('creates a new customer when none exists', async () => {
      const result = await svc.createSubscription(validParams);

      expect(stripeMock.customers.create).toHaveBeenCalledWith({
        email: validParams.email,
        name: validParams.name,
      });
      expect(result.customerId).toBe('cus_new1234567890');
    });

    it('creates a product when STRIPE_DONATION_PRODUCT_ID is unset', async () => {
      await svc.createSubscription(validParams);
      expect(stripeMock.products.create).toHaveBeenCalledWith({
        name: 'FCC Donation',
      });
    });

    it('uses the configured product id without creating one', async () => {
      configServiceMock.get.mockReturnValue('prod_configured999');

      await svc.createSubscription(validParams);

      expect(stripeMock.products.create).not.toHaveBeenCalled();
      const createArgs = stripeMock.subscriptions.create.mock.calls[0][0];
      expect(createArgs.items[0].price_data.product).toBe('prod_configured999');
    });

    it('derives the PaymentIntent id and client secret from confirmation_secret', async () => {
      const result = await svc.createSubscription(validParams);

      expect(result.subscriptionId).toBe('sub_1234567890abcdef');
      expect(result.clientSecret).toBe('pi_sub1234567890_secret_abcdefghij');
      expect(result.paymentIntentId).toBe('pi_sub1234567890');
      expect(result.amount).toBe(1000);
      expect(result.currency).toBe('usd');
    });

    it('creates the subscription with default_incomplete and expands confirmation_secret', async () => {
      await svc.createSubscription(validParams);
      const createArgs = stripeMock.subscriptions.create.mock.calls[0][0];
      expect(createArgs.payment_behavior).toBe('default_incomplete');
      expect(createArgs.expand).toContain('latest_invoice.confirmation_secret');
      expect(createArgs.payment_settings.save_default_payment_method).toBe(
        'on_subscription',
      );
    });

    it.each([
      ['weekly', 'week', 1],
      ['monthly', 'month', 1],
      ['bimonthly', 'month', 2],
      ['quarterly', 'month', 3],
      ['annually', 'year', 1],
    ])(
      'maps interval %s to { %s, count %d }',
      async (interval, expectedInterval, expectedCount) => {
        await svc.createSubscription({ ...validParams, interval });
        const createArgs = stripeMock.subscriptions.create.mock.calls[0][0];
        expect(createArgs.items[0].price_data.recurring).toEqual({
          interval: expectedInterval,
          interval_count: expectedCount,
        });
      },
    );

    it('throws when the invoice has no confirmation secret', async () => {
      stripeMock.subscriptions.create.mockResolvedValueOnce({
        ...subscriptionMock1,
        latest_invoice: { id: 'in_x', object: 'invoice' },
      });

      await expect(svc.createSubscription(validParams)).rejects.toThrow(
        'no confirmation secret',
      );
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

      await expect(svc.createSubscription(validParams)).rejects.toMatchObject(
        paymentMethodNotSupportedError,
      );
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

    describe('stripe to DonationStatus values map correctly', () => {
      it("maps stripe status 'succeeded' to DonationStatus.SUCCEEDED", async () => {
        stripeMock.paymentIntents.retrieve.mockResolvedValue(
          paymentIntentMock2,
        );
        const paymentIntentId = 'pi_1234567890abcdefghijklmn';
        const pi = await svc.retrievePaymentIntent(paymentIntentId);
        // Verify that status mapping works correctly
        expect(pi.status).toBe(DonationStatus.SUCCEEDED); // Specific check for status mapping
      });

      it("maps stripe status 'canceled' to DonationStatus.CANCELLED", async () => {
        stripeMock.paymentIntents.retrieve.mockResolvedValue(
          paymentIntentCanceledMock,
        );
        const paymentIntentId = 'pi_1234567890abcdefghijklmn';
        const pi = await svc.retrievePaymentIntent(paymentIntentId);
        // Verify that status mapping works correctly
        expect(pi.status).toBe(DonationStatus.CANCELLED); // Specific check for status mapping
      });
      it("maps stripe status 'requires_payment_method' to DonationStatus.FAILED", async () => {
        stripeMock.paymentIntents.retrieve.mockResolvedValue(
          paymentIntentFailedMock,
        );
        const paymentIntentId = 'pi_1234567890abcdefghijklmn';
        const pi = await svc.retrievePaymentIntent(paymentIntentId);
        // Verify that status mapping works correctly
        expect(pi.status).toBe(DonationStatus.FAILED); // Specific check for status mapping
      });

      it("maps stripe status 'processing' to DonationStatus.PENDING", async () => {
        stripeMock.paymentIntents.retrieve.mockResolvedValue(
          paymentIntentProcessingMock,
        );
        const paymentIntentId = 'pi_1234567890abcdefghijklmn';
        const pi = await svc.retrievePaymentIntent(paymentIntentId);
        // Verify that status mapping works correctly
        expect(pi.status).toBe(DonationStatus.PENDING); // Specific check for status mapping
      });

      it("maps stripe status 'requires_confirmation' to DonationStatus.PENDING", async () => {
        stripeMock.paymentIntents.retrieve.mockResolvedValue(
          paymentIntentRequiresConfirmationMock,
        );
        const paymentIntentId = 'pi_1234567890abcdefghijklmn';
        const pi = await svc.retrievePaymentIntent(paymentIntentId);
        // Verify that status mapping works correctly
        expect(pi.status).toBe(DonationStatus.PENDING); // Specific check for status mapping
      });

      it("maps stripe status 'requires_action' to DonationStatus.PENDING", async () => {
        stripeMock.paymentIntents.retrieve.mockResolvedValue(
          paymentIntentRequiresActionMock,
        );
        const paymentIntentId = 'pi_1234567890abcdefghijklmn';
        const pi = await svc.retrievePaymentIntent(paymentIntentId);
        // Verify that status mapping works correctly
        expect(pi.status).toBe(DonationStatus.PENDING); // Specific check for status mapping
      });

      it("maps stripe status 'requires_capture' to DonationStatus.PENDING", async () => {
        stripeMock.paymentIntents.retrieve.mockResolvedValue(
          paymentIntentRequiresCaptureMock,
        );
        const paymentIntentId = 'pi_1234567890abcdefghijklmn';
        const pi = await svc.retrievePaymentIntent(paymentIntentId);
        // Verify that status mapping works correctly
        expect(pi.status).toBe(DonationStatus.PENDING); // Specific check for status mapping
      });

      it('maps any other stripe status to DonationStatus.PENDING', async () => {
        stripeMock.paymentIntents.retrieve.mockResolvedValue(
          paymentIntentOtherStatusMock,
        );
        const paymentIntentId = 'pi_1234567890abcdefghijklmn';
        const pi = await svc.retrievePaymentIntent(paymentIntentId);
        // Verify that status mapping works correctly
        expect(pi.status).toBe(DonationStatus.PENDING); // Specific check for status mapping
      });
    });
  });
});
