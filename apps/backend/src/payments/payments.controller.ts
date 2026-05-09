import {
  BadRequestException,
  Body,
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Param,
  RawBodyRequest,
  ValidationPipe,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import Stripe from 'stripe';
import { PaymentsService, PaymentIntentResponse } from './payments.service';
import { PaymentIntentResponseDto } from './dtos/payment-intent-response-dto';
import { CreatePaymentIntentDto } from './dtos/create-payment-intent-dto';
import { PaymentMappers } from './mappers';
import { DonationsService } from '../donations/donations.service';
import { DonationStatus } from '../donations/donation.entity';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly donationsService: DonationsService,
    private readonly configService: ConfigService,
  ) {}

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
    await this.syncDonationFromPaymentIntent(paymentIntentResponse);
    return PaymentMappers.toPaymentIntentResponseDto(paymentIntentResponse);
  }

  @Post('/intent/:id/sync')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'manually trigger a sync for a payment intent status',
    description:
      'fetches the latest intent status from Stripe and syncs the associated donation manually (useful for frontend checks or when webhooks miss)',
  })
  async syncIntent(@Param('id') intentId: string) {
    const paymentIntentResponse =
      await this.paymentsService.retrievePaymentIntent(intentId);
    await this.syncDonationFromPaymentIntent(paymentIntentResponse);
    return { success: true, status: paymentIntentResponse.status };
  }

  @Post('/webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Stripe webhook handler',
    description:
      'handles asynchronous Stripe payment intent events to keep donation statuses in sync',
  })
  @ApiResponse({ status: 200, description: 'webhook received' })
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') stripeSignature?: string,
  ): Promise<{ received: boolean }> {
    if (!stripeSignature) {
      throw new BadRequestException('Missing Stripe signature header');
    }

    const webhookSecret = this.configService.get<string>(
      'STRIPE_WEBHOOK_SECRET',
    );
    if (!webhookSecret) {
      throw new BadRequestException('Stripe webhook secret is not configured');
    }

    let event: Stripe.Event;
    try {
      if (!req.rawBody) {
        throw new BadRequestException('Request raw body is missing');
      }
      event = this.paymentsService.constructWebhookEvent(
        req.rawBody,
        stripeSignature,
        webhookSecret,
      );
    } catch (error) {
      throw new BadRequestException('Invalid Stripe webhook signature');
    }

    if (event.type.startsWith('payment_intent.')) {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const response =
        this.paymentsService.mapPaymentIntentToResponse(paymentIntent);
      await this.syncDonationFromPaymentIntent(response);
    } else if (
      event.type === 'charge.dispute.created' ||
      event.type === 'charge.refunded'
    ) {
      const charge = event.data.object as Stripe.Charge;
      if (charge.payment_intent) {
        await this.syncDonationFromPaymentIntent({
          id: charge.payment_intent as string,
          status: DonationStatus.CANCELLED,
          amount: charge.amount,
          currency: charge.currency,
          clientSecret: '',
          paymentMethodTypes: [],
          created: charge.created,
          requiresAction: false,
        });
      }
    }

    return { received: true };
  }

  private async syncDonationFromPaymentIntent(
    paymentIntent: PaymentIntentResponse,
  ): Promise<void> {
    await this.donationsService.syncPaymentIntentStatus({
      donationId: this.extractDonationId(paymentIntent.metadata),
      transactionId: paymentIntent.id,
      status: paymentIntent.status,
    });
  }

  private extractDonationId(
    metadata?: Record<string, unknown>,
  ): number | undefined {
    // Donation is looked up via transactionId (payment intent ID),
    // so donationId in metadata is not needed
    return undefined;
  }
}
