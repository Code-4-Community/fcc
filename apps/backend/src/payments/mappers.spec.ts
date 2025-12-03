import { validate } from 'class-validator';
import { CreatePaymentIntentDto } from './dtos/create-payment-intent-dto';
import { CreatePaymentIntentRequest, PaymentMappers } from './mappers';
import { DonationStatus } from '../donations/donation.entity';
import { PaymentIntentResponseDto } from './dtos/payment-intent-response-dto';
import { PaymentIntentResponse } from './payments.service';
describe('PaymentMappers', () => {
  const mockCreateDto: CreatePaymentIntentDto = {
    amount: 1099,
    currency: 'usd',
    metadata: { orderId: '123' },
  };
  const mockPaymentIntentResponse: PaymentIntentResponse = {
    id: 'pi_1J2aBcD3eF4GhIjKlmnoPqr',
    clientSecret: 'pi_1J2aBcD3eF4GhIjKlmnoPqr_secret_AbCdEfGhIjKlMnOp',
    amount: 1099,
    currency: 'usd',
    status: DonationStatus.CANCELLED,
    metadata: { orderId: '123' },
    paymentMethodId: 'pm_1F4aBcD3eF4GhIjKlmnoPq',
    paymentMethodTypes: ['card'],
    created: 1762000000,
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
    canceledAt: 1762000001,
  };
  describe('toCreatePaymentIntentRequest', () => {
    it('should map CreatePaymentIntentDto to CreatePaymentIntentRequest correctly', () => {
      const result = PaymentMappers.toCreatePaymentIntentRequest(mockCreateDto);
      const expected: CreatePaymentIntentRequest = {
        amount: 1099,
        currency: 'usd',
        metadata: { orderId: '123' },
      };
      expect(result).toEqual(expected);
    });
  });

  describe('toPaymentIntentResponseDto', () => {
    it('should map PaymentIntentResponse to PaymentIntentResponseDto correctly', () => {
      const result = PaymentMappers.toPaymentIntentResponseDto(
        mockPaymentIntentResponse,
      );
      const expected: PaymentIntentResponseDto = {
        id: 'pi_1J2aBcD3eF4GhIjKlmnoPqr',
        clientSecret: 'pi_1J2aBcD3eF4GhIjKlmnoPqr_secret_AbCdEfGhIjKlMnOp',
        amount: 1099,
        currency: 'usd',
        status: DonationStatus.CANCELLED,
        metadata: { orderId: '123' },
        paymentMethodId: 'pm_1F4aBcD3eF4GhIjKlmnoPq',
        paymentMethodTypes: ['card'],
        created: 1762000000,
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
        canceledAt: 1762000001,
      };
      expect(result).toEqual(expected);
    });
  });
});
