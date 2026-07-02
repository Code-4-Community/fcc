import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsController } from './payments.controller';
import { PaymentIntentResponse, PaymentsService } from './payments.service';
import { CreatePaymentIntentDto } from './dtos/create-payment-intent-dto';
import { DonationStatus } from '../donations/donation.entity';
import { PaymentIntentResponseDto } from './dtos/payment-intent-response-dto';
import { DonationsService } from '../donations/donations.service';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { RawBodyRequest } from '@nestjs/common';
import { Request } from 'express';

const mockWithAllOptionalParameters: PaymentIntentResponse = {
  id: 'pi_1J2aBcD3eF4GhIjKlmnoPqr',
  clientSecret: 'pi_1234567890abcdef_secret_1234567890abcdef',
  amount: 1099,
  currency: 'usd',
  status: DonationStatus.CANCELLED,
  metadata: { orderId: '123' },
  paymentMethodId: 'pm_1F4aBcD3eF4GhIjKlmnoPq',
  paymentMethodTypes: ['card'],
  created: 1764789115,
  requiresAction: false,
  nextAction: {
    type: 'redirect_to_url',
    redirect_to_url: {
      url: 'https://hooks.stripe.com/redirect/authenticate/src_1Aa2Bb3Cc4',
      return_url: 'https://example.com/checkout/complete',
    },
  },
  lastPaymentError: {
    code: 'card_declined',
    message: 'Your card was declined.',
    type: 'card_error',
  },
  canceledAt: 1764789116,
};

const mockWithNoOptionalParameters: PaymentIntentResponse = {
  id: 'pi_1J2aBcD3eF4GhIjKlmnoPqr',
  clientSecret: 'pi_1234567890abcdef_secret_1234567890abcdef',
  amount: 1099,
  currency: 'usd',
  status: DonationStatus.SUCCEEDED,
  metadata: undefined,
  paymentMethodTypes: ['card'],
  created: 1764789115,
  requiresAction: false,
};

const createPaymentIntentInput: CreatePaymentIntentDto = {
  amount: 1099,
  currency: 'usd',
  metadata: { orderId: '123' },
};
describe('PaymentsControler', () => {
  let controller: PaymentsController;

  const mockService = {
    createPaymentIntent: jest.fn(),
    createSubscription: jest.fn(),
    retrievePaymentIntent: jest.fn(),
    constructWebhookEvent: jest.fn(),
    mapPaymentIntentToResponse: jest.fn(),
    getExactFeeForPaymentIntent: jest.fn(),
    getPaymentIntentIdForInvoice: jest.fn(),
  };
  const mockDonationsService = {
    syncPaymentIntentStatus: jest.fn(),
    recordRenewalCharge: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentsController],
      providers: [
        {
          provide: PaymentsService,
          useValue: mockService,
        },
        {
          provide: DonationsService,
          useValue: mockDonationsService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    controller = module.get<PaymentsController>(PaymentsController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create intent', () => {
    it('should create a payment intent and return a valid payment intent DTO with all optional parameters', async () => {
      mockService.createPaymentIntent.mockReturnValueOnce(
        mockWithAllOptionalParameters,
      );
      const result = await controller.createIntent(createPaymentIntentInput);
      const expected: PaymentIntentResponseDto = {
        id: 'pi_1J2aBcD3eF4GhIjKlmnoPqr',
        clientSecret: 'pi_1234567890abcdef_secret_1234567890abcdef',
        amount: 1099,
        currency: 'usd',
        status: DonationStatus.CANCELLED,
        metadata: { orderId: '123' },
        paymentMethodId: 'pm_1F4aBcD3eF4GhIjKlmnoPq',
        paymentMethodTypes: ['card'],
        created: 1764789115,
        requiresAction: false,
        nextAction: {
          type: 'redirect_to_url',
          redirect_to_url: {
            url: 'https://hooks.stripe.com/redirect/authenticate/src_1Aa2Bb3Cc4',
            return_url: 'https://example.com/checkout/complete',
          },
        },
        lastPaymentError: {
          code: 'card_declined',
          message: 'Your card was declined.',
          type: 'card_error',
        },
        canceledAt: 1764789116,
      };
      expect(result).toStrictEqual(expected);
      expect(mockDonationsService.syncPaymentIntentStatus).toHaveBeenCalledWith(
        {
          donationId: undefined,
          transactionId: 'pi_1J2aBcD3eF4GhIjKlmnoPqr',
          status: DonationStatus.CANCELLED,
        },
      );
    });

    it('it should create a payment intent and return all the fields given with no optional parameters', async () => {
      mockService.createPaymentIntent.mockReturnValueOnce(
        mockWithNoOptionalParameters,
      );
      const result = await controller.createIntent(createPaymentIntentInput);
      const expected: PaymentIntentResponseDto = {
        id: 'pi_1J2aBcD3eF4GhIjKlmnoPqr',
        clientSecret: 'pi_1234567890abcdef_secret_1234567890abcdef',
        amount: 1099,
        canceledAt: undefined,
        currency: 'usd',
        status: DonationStatus.SUCCEEDED,
        paymentMethodTypes: ['card'],
        created: 1764789115,
        requiresAction: false,
        lastPaymentError: undefined,
        metadata: undefined,
        nextAction: undefined,
        paymentMethodId: undefined,
      };
      expect(result).toStrictEqual(expected);
      expect(mockDonationsService.syncPaymentIntentStatus).toHaveBeenCalledWith(
        {
          donationId: undefined,
          transactionId: 'pi_1J2aBcD3eF4GhIjKlmnoPqr',
          status: DonationStatus.SUCCEEDED,
        },
      );
    });
  });

  describe('createSubscription', () => {
    it('maps the DTO and returns the subscription response DTO without syncing a donation', async () => {
      mockService.createSubscription.mockResolvedValueOnce({
        subscriptionId: 'sub_123',
        customerId: 'cus_123',
        paymentIntentId: 'pi_sub_123',
        clientSecret: 'pi_sub_123_secret_abc',
        status: 'incomplete',
        amount: 1099,
        currency: 'usd',
      });

      const result = await controller.createSubscription({
        amount: 1099,
        currency: 'usd',
        interval: 'monthly',
        email: 'donor@example.com',
        name: 'Jane Donor',
      });

      expect(mockService.createSubscription).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: 1099,
          currency: 'usd',
          interval: 'monthly',
          email: 'donor@example.com',
          name: 'Jane Donor',
        }),
      );
      expect(result).toEqual({
        id: 'pi_sub_123',
        clientSecret: 'pi_sub_123_secret_abc',
        subscriptionId: 'sub_123',
        customerId: 'cus_123',
        status: 'incomplete',
        amount: 1099,
        currency: 'usd',
      });
      expect(
        mockDonationsService.syncPaymentIntentStatus,
      ).not.toHaveBeenCalled();
    });
  });

  describe('handleWebhook - subscription renewals', () => {
    const buildInvoiceEvent = (
      type: string,
      billingReason: string,
    ): Stripe.Event =>
      ({
        type,
        data: {
          object: {
            id: 'in_renewal_1',
            billing_reason: billingReason,
            amount_paid: 2000,
            amount_due: 2000,
            parent: {
              subscription_details: { subscription: 'sub_renew_1' },
            },
          },
        },
      }) as unknown as Stripe.Event;

    beforeEach(() => {
      mockConfigService.get.mockReturnValue('whsec_123');
    });

    const runWebhook = async (event: Stripe.Event) => {
      mockService.constructWebhookEvent.mockReturnValue(event);
      const req = {
        rawBody: Buffer.from('payload'),
      } as RawBodyRequest<Request>;
      return controller.handleWebhook(req, 'sig');
    };

    it('records a renewal donation on invoice.paid for a subscription_cycle', async () => {
      mockService.getPaymentIntentIdForInvoice.mockResolvedValue('pi_renew_1');
      mockService.getExactFeeForPaymentIntent.mockResolvedValue(90);

      await runWebhook(buildInvoiceEvent('invoice.paid', 'subscription_cycle'));

      expect(mockDonationsService.recordRenewalCharge).toHaveBeenCalledWith({
        stripeSubscriptionId: 'sub_renew_1',
        transactionId: 'pi_renew_1',
        amount: 2000,
        status: DonationStatus.SUCCEEDED,
        feeAmount: 90,
      });
    });

    it('skips the first invoice (subscription_create)', async () => {
      await runWebhook(
        buildInvoiceEvent('invoice.paid', 'subscription_create'),
      );
      expect(mockDonationsService.recordRenewalCharge).not.toHaveBeenCalled();
      expect(mockService.getPaymentIntentIdForInvoice).not.toHaveBeenCalled();
    });

    it('records a FAILED renewal row on invoice.payment_failed', async () => {
      mockService.getPaymentIntentIdForInvoice.mockResolvedValue('pi_renew_2');

      await runWebhook(
        buildInvoiceEvent('invoice.payment_failed', 'subscription_cycle'),
      );

      expect(mockDonationsService.recordRenewalCharge).toHaveBeenCalledWith({
        stripeSubscriptionId: 'sub_renew_1',
        transactionId: 'pi_renew_2',
        amount: 2000,
        status: DonationStatus.FAILED,
      });
    });

    it('does not record when the payment intent cannot be resolved', async () => {
      mockService.getPaymentIntentIdForInvoice.mockResolvedValue(undefined);

      await runWebhook(buildInvoiceEvent('invoice.paid', 'subscription_cycle'));

      expect(mockDonationsService.recordRenewalCharge).not.toHaveBeenCalled();
    });
  });

  describe('handleWebhook', () => {
    it('should construct event and sync donation for payment intent events', async () => {
      const paymentIntent = {
        id: 'pi_webhook_123',
        object: 'payment_intent',
      } as Stripe.PaymentIntent;
      mockConfigService.get.mockReturnValue('whsec_123');
      const paymentIntentResponse: PaymentIntentResponse = {
        id: 'pi_webhook_123',
        clientSecret: 'secret',
        amount: 100,
        currency: 'usd',
        status: DonationStatus.SUCCEEDED,
        paymentMethodTypes: ['card'],
        created: 0,
        requiresAction: false,
        metadata: {},
      };
      mockService.constructWebhookEvent.mockReturnValue({
        type: 'payment_intent.succeeded',
        data: { object: paymentIntent },
      } as Stripe.Event);
      mockService.mapPaymentIntentToResponse.mockReturnValue(
        paymentIntentResponse,
      );
      mockService.getExactFeeForPaymentIntent.mockResolvedValue(150);

      const req = {
        rawBody: Buffer.from('payload'),
      } as RawBodyRequest<Request>;
      const result = await controller.handleWebhook(req, 'sig');

      expect(result).toEqual({ received: true });
      expect(mockService.constructWebhookEvent).toHaveBeenCalledWith(
        req.rawBody,
        'sig',
        'whsec_123',
      );
      expect(mockDonationsService.syncPaymentIntentStatus).toHaveBeenCalledWith(
        {
          donationId: undefined,
          transactionId: 'pi_webhook_123',
          status: DonationStatus.SUCCEEDED,
          feeAmount: 150,
        },
      );
    });

    it('should throw when stripe signature missing', async () => {
      await expect(
        controller.handleWebhook(
          { rawBody: Buffer.from('payload') } as RawBodyRequest<Request>,
          undefined,
        ),
      ).rejects.toThrow('Missing Stripe signature header');
    });
  });
});
