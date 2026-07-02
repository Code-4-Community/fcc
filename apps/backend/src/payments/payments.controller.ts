import {
  BadRequestException,
  Body,
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  Logger,
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
import { CreateSubscriptionDto } from './dtos/create-subscription-dto';
import { SubscriptionResponseDto } from './dtos/subscription-response-dto';
import { PaymentMappers } from './mappers';
import { DonationsService } from '../donations/donations.service';
import { DonationStatus } from '../donations/donation.entity';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  private readonly logger = new Logger(PaymentsController.name);

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

  @Post('/subscription')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'create a recurring donation subscription in Stripe',
    description:
      "creates a Stripe Subscription (payment_behavior 'default_incomplete') and returns the first PaymentIntent's id + client secret so the frontend confirms it exactly like a one-time payment",
  })
  @ApiResponse({
    status: 201,
    description: 'subscription successfully created in Stripe',
    type: SubscriptionResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'validation error',
  })
  async createSubscription(
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    createSubscriptionDto: CreateSubscriptionDto,
  ): Promise<SubscriptionResponseDto> {
    const params = PaymentMappers.toCreateSubscriptionParams(
      createSubscriptionDto,
    );
    // Note: no donation sync here — the donation row is created by the frontend
    // via POST /donations (onBeforePayment), and its status/fee are set by the
    // existing payment_intent.succeeded webhook once the first charge confirms.
    const subscriptionResponse =
      await this.paymentsService.createSubscription(params);
    return PaymentMappers.toSubscriptionResponseDto(subscriptionResponse);
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

      let feeAmount: number | undefined;
      if (event.type === 'payment_intent.succeeded') {
        feeAmount = await this.paymentsService.getExactFeeForPaymentIntent(
          paymentIntent.id,
        );
      }

      await this.syncDonationFromPaymentIntent(response, feeAmount);
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
    } else if (
      event.type === 'invoice.paid' ||
      event.type === 'invoice.payment_failed'
    ) {
      await this.handleSubscriptionRenewalInvoice(event);
    }

    return { received: true };
  }

  /**
   * Records subscription renewal charges (month 2+) as their own donation rows so
   * they count toward the goal. The first invoice (billing_reason
   * 'subscription_create') is skipped — it is already recorded via the frontend
   * donation row + the first-charge payment_intent.succeeded event.
   */
  private async handleSubscriptionRenewalInvoice(
    event: Stripe.Event,
  ): Promise<void> {
    const invoice = event.data.object as Stripe.Invoice;

    if (invoice.billing_reason !== 'subscription_cycle') {
      return;
    }

    const subscriptionRef = invoice.parent?.subscription_details?.subscription;
    const stripeSubscriptionId =
      typeof subscriptionRef === 'string'
        ? subscriptionRef
        : subscriptionRef?.id;

    if (!stripeSubscriptionId) {
      this.logger.warn(
        `Renewal invoice ${invoice.id} has no subscription id; skipping`,
      );
      return;
    }

    if (event.type === 'invoice.payment_failed') {
      this.logger.warn(
        `Renewal payment failed for subscription ${stripeSubscriptionId} (invoice ${invoice.id})`,
      );
    }

    const paymentIntentId = invoice.id
      ? await this.paymentsService.getPaymentIntentIdForInvoice(invoice.id)
      : undefined;

    if (!paymentIntentId) {
      this.logger.warn(
        `Could not resolve payment intent for renewal invoice ${invoice.id} ` +
          `(subscription ${stripeSubscriptionId}); renewal not recorded`,
      );
      return;
    }

    if (event.type === 'invoice.paid') {
      const feeAmount =
        await this.paymentsService.getExactFeeForPaymentIntent(paymentIntentId);
      await this.donationsService.recordRenewalCharge({
        stripeSubscriptionId,
        transactionId: paymentIntentId,
        amount: invoice.amount_paid,
        status: DonationStatus.SUCCEEDED,
        feeAmount,
      });
    } else {
      await this.donationsService.recordRenewalCharge({
        stripeSubscriptionId,
        transactionId: paymentIntentId,
        amount: invoice.amount_due,
        status: DonationStatus.FAILED,
      });
    }
  }

  private async syncDonationFromPaymentIntent(
    paymentIntent: PaymentIntentResponse,
    feeAmount?: number,
  ): Promise<void> {
    await this.donationsService.syncPaymentIntentStatus({
      donationId: this.extractDonationId(paymentIntent.metadata),
      transactionId: paymentIntent.id,
      status: paymentIntent.status,
      feeAmount,
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
