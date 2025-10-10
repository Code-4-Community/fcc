import { PaymentsService } from './payments.service';
import { DonationStatus } from '../donations/dtos/donation-response-dto';
import { RecurringInterval } from '../donations/dtos/create-donation-dto';
import Stripe from 'stripe';

// Create a shared mock object
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

// Mock the entire Stripe package
jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => stripeMock);
});

describe('PaymentsService (stubs)', () => {
  let svc: PaymentsService;

  beforeEach(() => {
    svc = new PaymentsService(stripeMock as unknown as Stripe);
    jest.clearAllMocks(); // Clear call counts and mock implementations

    // Set default mock implementations for this test
    stripeMock.paymentIntents.create.mockResolvedValue({
      id: 'pi_stripe_mock',
      client_secret: 'cs_stripe_mock',
      amount: 100,
      currency: 'usd',
      status: 'requires_payment_method',
    });

    stripeMock.subscriptions.create.mockResolvedValue({
      id: 'sub_stripe_mock',
      status: 'active',
    });
  });

  describe('createPaymentIntent', () => {
    it('throws for invalid (too small) amount', async () => {
      await expect(svc.createPaymentIntent(0, 'usd')).rejects.toThrow(
        /Invalid amount/i,
      );
    });

    it('throws for invalid currency', async () => {
      await expect(svc.createPaymentIntent(10, (undefined as unknown) as string)).rejects.toThrow(
        /Invalid currency/i,
      );
    });

    it('returns a well-formed payment intent for valid input', async () => {
      const pi = await svc.createPaymentIntent(25.5, 'USD', { orderId: '123' });
      expect(pi).toHaveProperty('id');
      expect(pi).toHaveProperty('clientSecret');
      expect(pi.amount).toBe(25.5);
      expect(pi.currency).toBe('usd');
      expect(pi.status).toBe(DonationStatus.PENDING);
      expect(pi.metadata).toEqual({ orderId: '123' });
    });

    it('handles Stripe API errors correctly', async () => {
      // Make the mock throw an error for this test
      stripeMock.paymentIntents.create.mockRejectedValue({
        type: 'StripeCardError',
        message: 'Your card was declined',
        code: 'card_declined'
      });
      
      await expect(svc.createPaymentIntent(25.5, 'USD')).rejects.toThrow(/card was declined/i);
    });
  });

  describe('createSubscription', () => {
    it('throws for invalid customerId', async () => {
      // The current stub does not validate synchronously, but keep symmetry with validators
      await expect(
        svc.createSubscription((undefined as unknown) as string, 'price_123', RecurringInterval.MONTHLY),
      ).rejects.toThrow(/Invalid customerId|Invalid/);
    });

    it('creates a mock subscription for valid inputs', async () => {
      const sub = await svc.createSubscription('cus_123', 'price_abc', RecurringInterval.MONTHLY);
      expect(sub).toHaveProperty('id');
      expect(sub.customerId).toBe('cus_123');
      expect(sub.priceId).toBe('price_abc');
      expect(sub.interval).toBe(RecurringInterval.MONTHLY);
      expect(sub.status).toBe('active');
    });
  });

  describe('retrievePaymentIntent', () => {
    it('throws for invalid id', async () => {
      await expect(svc.retrievePaymentIntent((undefined as unknown) as string)).rejects.toThrow(/Invalid paymentIntentId/i);
    });

    it('returns a mock payment intent when given a valid id', async () => {
      const id = 'pi_local_mock_1';
      const pi = await svc.retrievePaymentIntent(id);
      expect(pi).not.toBeNull();
      expect(pi?.id).toBe(id);
      expect(typeof pi?.transactionId).toBe('string');
      expect(pi?.status).toBe(DonationStatus.COMPLETED);
    });
  });
});
