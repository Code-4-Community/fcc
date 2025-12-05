Stripe Integration Documentation

This document outlines our Stripe integration for handling payments and subscriptions in the application.

Configuration

The application uses Stripe for payment processing. The integration requires the following environment variables:

STRIPE_SECRET_KEY: Used for server-side API calls to Stripe
STRIPE_PUBLISHABLE_KEY: Used for client-side Stripe Elements integration

To acquire these keys

1. Login to Stripe using the FCC gmail and password posted in Slack: https://dashboard.stripe.com/
2. Confirm that the top says "You're testing in a sandbox—your place to experiment with Stripe functionality." or there's some sort of indication that you're in the sandbox environment
3. On the bottom left click the "Developers" dropdown heading
4. Click the "API keys" dropdown option
5. Under the "Standard keys" section and under the "Token" heading in the table, copy each key

Implementation Overview

The Stripe integration is implemented in the PaymentsModule and PaymentsService classes.

The PaymentsModule configures the Stripe client as a provider

The PaymentsService class implements methods that call Stripe API and return data with the expectation that it will be passed to the front end

The PaymentsService provides the following methods:

async createPaymentIntent(
amount: number - Payment amount in the smallest currency unit (e.g., cents for USD)
currency: string - Three-letter ISO currency code (e.g., "usd")
metadata?: PaymentIntentMetadata - Optional key-value pairs to attach to the payment intent
): Promise<PaymentIntentResponse>

async retrievePaymentIntent(
paymentIntentId: string - Stripe payment intent ID to retrieve
): Promise<PaymentIntentResponse>

Where PaymentIntentResponse is:
id: string;
clientSecret: string;
amount: number;
currency: string;
status: DonationStatus;
metadata?: Record<string, unknown>;
paymentMethodId?: string;
paymentMethodTypes: string[];
created: number;
requiresAction: boolean;
nextAction?: unknown;
lastPaymentError?: {
code: string;
message: string;
type: string;
};
canceledAt?: number;

async createSubscription(
customerId: string - Stripe customer ID (must start with "cus*")
priceId: string - Stripe price ID (must start with "price*")
): Promise<{
id: string;
customerId: string;
priceId: string;
interval: RecurringInterval;
status: string;
}>

Testing

The Stripe integration can be tested using:

- Stripe's test mode or sandbox with test API keys
- Stripe's test cards found from: https://docs.stripe.com/testing
- The provided unit tests with mocked Stripe responses
