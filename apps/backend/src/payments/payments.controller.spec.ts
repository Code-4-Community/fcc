import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsController } from './payments.controller';
import { PaymentIntentResponse, PaymentsService } from './payments.service';
import { CreatePaymentIntentDto } from './dtos/create-payment-intent-dto';
import { DonationStatus } from '../donations/donation.entity';
import { PaymentIntentResponseDto } from './dtos/payment-intent-response-dto';

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
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentsController],
      providers: [
        {
          provide: PaymentsService,
          useValue: mockService,
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
    });
  });
});
