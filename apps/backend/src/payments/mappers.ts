import Stripe from 'stripe';
import { PaymentIntentResponseDto } from './dtos/payment-intent-response-dto';
import { PaymentIntentResponse } from './payments.service';
import { CreatePaymentIntentDto } from './dtos/create-payment-intent-dto';

export interface CreatePaymentIntentRequest {
  amount: number;
  currency: string;
  metadata?: Stripe.MetadataParam;
}

export class PaymentMappers {
  static toCreatePaymentIntentRequest(
    dto: CreatePaymentIntentDto,
  ): CreatePaymentIntentRequest {
    return {
      amount: dto.amount,
      currency: dto.currency,
      metadata:
        dto.metadata == undefined
          ? undefined
          : PaymentMappers.normalizeMetadata(dto.metadata),
    };
  }

  private static normalizeMetadata(
    metadata?: Record<string, unknown>,
  ): Stripe.MetadataParam {
    if (!metadata) return {};
    const result: Stripe.MetadataParam = {};
    for (const [key, value] of Object.entries(metadata)) {
      if (value === undefined || value === null) continue;
      if (typeof value === 'string') result[key] = value;
      else if (typeof value === 'number' || typeof value === 'boolean')
        result[key] = String(value);
      else {
        try {
          result[key] = JSON.stringify(value);
        } catch {
          result[key] = String(value as unknown as string);
        }
      }
    }
    return result;
  }

  static toPaymentIntentResponseDto(
    paymentIntentResponse: PaymentIntentResponse,
  ): PaymentIntentResponseDto {
    return {
      id: paymentIntentResponse.id,
      clientSecret: paymentIntentResponse.clientSecret,
      amount: paymentIntentResponse.amount,
      currency: paymentIntentResponse.currency,
      status: paymentIntentResponse.status,
      metadata: paymentIntentResponse.metadata,
      paymentMethodId: paymentIntentResponse.paymentMethodId,
      paymentMethodTypes: paymentIntentResponse.paymentMethodTypes,
      created: paymentIntentResponse.created,
      requiresAction: paymentIntentResponse.requiresAction,
      nextAction: paymentIntentResponse.nextAction,
      lastPaymentError: paymentIntentResponse.lastPaymentError,
      canceledAt: paymentIntentResponse.canceledAt,
    };
  }
}
