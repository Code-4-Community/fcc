import { PaymentsService } from './payments.service';
import { DonationStatus } from '../donations/donation.entity';
import Stripe from 'stripe';

// Define a type-safe mock that matches Stripe's interface structure
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
  // Add other Stripe resources as needed
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
    // Add common error properties that Stripe would include
    raw: {
      type: type.replace('Stripe', '').toLowerCase(),
      code,
      message
    }
  };
}

describe('PaymentsService', () => {
  let svc: PaymentsService;

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Create a new instance with our mock
    svc = new PaymentsService(stripeMock as unknown as Stripe);
    
    // Set up default mock implementations
    stripeMock.paymentIntents.create.mockResolvedValue({
      id: 'pi_test_123',
      client_secret: 'cs_test_secret',
      status: 'requires_payment_method',
      amount: 1000,
      currency: 'usd',
      // Include other properties your service expects
    });
    
    stripeMock.paymentIntents.retrieve.mockResolvedValue({
      id: 'pi_local_mock_1',
      status: 'succeeded',
      amount: 500,
    });

    stripeMock.subscriptions.create.mockResolvedValue({
      id: 'sub_stripe_mock',
      status: 'active',
    });
  });

  describe('createPaymentIntent', () => {
    it('throws for invalid (too small for any currency) amount', async () => {
      await expect(svc.createPaymentIntent(0, 'usd')).rejects.toThrow(
        /Invalid amount/i,
      );
    });

    it('throws for invalid (currency that has decimals) amount', async () => {
      await expect(svc.createPaymentIntent(50.01, 'usd')).rejects.toThrow(
        /Invalid amount/i,
      );
    })

    it('throws for invalid usd of amount < 50 cents', async () => {
      await expect(svc.createPaymentIntent(24, 'usd')).rejects.toThrow(
        /Invalid amount/i,
      );
    })

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
      const pi = await svc.createPaymentIntent(2550, 'USD', { orderId: '123' });
      expect(pi).toHaveProperty('id');
      expect(pi).toHaveProperty('clientSecret');
      expect(pi.amount).toBe(2550);
      expect(pi.currency).toBe('usd');
      expect(pi.status).toBe(DonationStatus.PENDING);
      expect(pi.metadata).toEqual({ orderId: '123' });
    });

    it('handles Stripe API errors correctly', async () => {
      const cardDeclinedError = createStripeError(
        'StripeCardError',
        'card_declined',
        'Your card was declined',
        { decline_code: 'insufficient_funds' }
      );
    
      stripeMock.paymentIntents.create.mockRejectedValueOnce(cardDeclinedError);
      
      await expect(svc.createPaymentIntent(2550, 'usd'))
        .rejects.toMatchObject(cardDeclinedError);
    });
  });

  describe('createSubscription', () => {
    it('throws for invalid customerId', async () => {
      // The current stub does not validate synchronously, but keep symmetry with validators
      await expect(
        svc.createSubscription((undefined as unknown) as string, 'price_123'),
      ).rejects.toThrow(/Invalid customerId|Invalid/);
    });

    it('creates a mock subscription for valid inputs', async () => {
      const sub = await svc.createSubscription('cus_123', 'price_abc');
      expect(sub).toHaveProperty('id');
      expect(sub.customerId).toBe('cus_123');
      expect(sub.priceId).toBe('price_abc');
      expect(sub.status).toBe('active');
    });
  });

  describe('retrievePaymentIntent', () => {
    it('throws for invalid id', async () => {
      await expect(svc.retrievePaymentIntent((undefined as unknown) as string)).rejects.toThrow(/Invalid paymentIntentId/i);
    });

    it('returns payment intent details when given a valid id', async () => {
      const paymentIntentId = 'pi_local_mock_1';
      const pi = await svc.retrievePaymentIntent(paymentIntentId);
      expect(pi).not.toBeNull();
      expect(pi?.paymentIntentId).toBe(paymentIntentId);
      expect(pi?.status).toBe('succeeded');
      expect(pi?.amount).toBe(500);
    });

    it('handles Stripe API errors correctly', async () => {
      // Make the mock throw an error for this test
      const paymentIntentId = 'pi_local_mock_1';

      const noSuchPaymentIntent = createStripeError(
        'StripeInvalidRequestError',
        'resource_missing',
        'No such payment intent',
        { decline_code: 'resource_missing' }
      );

      stripeMock.paymentIntents.retrieve.mockRejectedValueOnce(noSuchPaymentIntent);
      
      await expect(svc.retrievePaymentIntent(paymentIntentId))
        .rejects.toMatchObject(noSuchPaymentIntent);
    });
  });
});