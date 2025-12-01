import { validate } from 'class-validator';
import { CreatePaymentIntentDto } from './dtos/create-payment-intent-dto.ts';
import { PaymentMappers } from './mappers';

describe('PaymentMappers', () => {
  const mockCreateDto = null;
  const mockPaymentIntentResponse = null;
  describe('toCreatePaymentIntentRequest', () => {
    it('should map CreatePaymentIntentDto to CreatePaymentIntentRequest correctly', () => {
      const result = PaymentMappers.toCreatePaymentIntentRequest(mockCreateDto);
      expect(result).toEqual(null);
    });
  });

  describe('toPaymentIntentResponseDto', () => {
    it('should map PaymentIntentResponse to PaymentIntentResponseDto correctly', () => {
      const result = PaymentMappers.toPaymentIntentResponseDto(
        mockPaymentIntentResponse,
      );
    });
  });
});
