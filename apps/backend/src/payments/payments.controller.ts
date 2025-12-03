import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  ValidationPipe,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { PaymentIntentResponseDto } from './dtos/payment-intent-response-dto';
import { CreatePaymentIntentDto } from './dtos/create-payment-intent-dto';
import { PaymentMappers } from './mappers';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('/intent')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'create a payment intent in Stripe',
    description:
      'submit a new payment intent with amount, currency, and optional metadata',
  })
  @ApiResponse({
    status: 201,
    description: 'payment intent successfully created in Stripe',
    type: PaymentIntentResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'validation error',
  })
  async createIntent(
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    createPaymentIntentDto: CreatePaymentIntentDto,
  ): Promise<PaymentIntentResponseDto> {
    const request = PaymentMappers.toCreatePaymentIntentRequest(
      createPaymentIntentDto,
    );
    const paymentIntentResponse =
      await this.paymentsService.createPaymentIntent(request);
    return PaymentMappers.toPaymentIntentResponseDto(paymentIntentResponse);
  }
}
