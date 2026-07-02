import React, { useState, useCallback, useEffect } from 'react';
import { useStripe } from '@stripe/react-stripe-js';
import type { DonationFormData } from '../donation-form.types';
import apiClient from '../../../api/apiClient';
import { calculateChargeAmount } from '../DonationSummary';
import { Card } from '@components/ui/card';

export interface SubscriptionInfo {
  stripeSubscriptionId: string;
  stripeCustomerId: string;
}

interface Step3ConfirmProps {
  formData: DonationFormData;
  paymentMethodId: string | null;
  onBeforePayment: (
    paymentIntentId: string,
    subscriptionInfo?: SubscriptionInfo,
  ) => Promise<string>;
  onPaymentSuccess: (donationId: string) => void;
  onPaymentError: (error: string) => void;
  isSubmitting: boolean;
  setIsSubmitting: (value: boolean) => void;
  onSubmitRef?: React.MutableRefObject<(() => void) | null>;
}

export const Step3Confirm: React.FC<Step3ConfirmProps> = ({
  formData,
  paymentMethodId,
  onBeforePayment,
  onPaymentSuccess,
  onPaymentError,
  isSubmitting, // eslint-disable-line @typescript-eslint/no-unused-vars
  setIsSubmitting,
  onSubmitRef,
}) => {
  const stripe = useStripe();
  const [error, setError] = useState<string | null>(null);

  const amount = calculateChargeAmount(
    parseFloat(formData.amount) || 0,
    formData.coverFees,
  );

  const handleConfirmPayment = useCallback(async () => {
    if (!stripe) {
      setError('Stripe has not loaded yet. Please try again.');
      return;
    }

    if (!paymentMethodId) {
      setError(
        'Card information not found. Please go back and re-enter your card details.',
      );
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Step 1: Create the payment. Recurring donations create a Stripe
      // Subscription whose first invoice yields a PaymentIntent we confirm with
      // the exact same code as a one-time payment; one-time donations create a
      // plain PaymentIntent.
      const amountInCents = Math.round(amount * 100);

      let clientSecret: string;
      let paymentIntentId: string;
      let subscriptionInfo: SubscriptionInfo | undefined;

      if (formData.donationType === 'recurring') {
        const subscriptionResponse = await apiClient.createSubscription({
          amount: amountInCents,
          currency: 'usd',
          interval: formData.recurringInterval,
          email: formData.email,
          name: `${formData.firstName} ${formData.lastName}`.trim(),
          metadata: {
            email: formData.email,
            donationType: formData.donationType,
            recurringInterval: formData.recurringInterval,
          },
        });
        clientSecret = subscriptionResponse.clientSecret;
        paymentIntentId = subscriptionResponse.id;
        subscriptionInfo = {
          stripeSubscriptionId: subscriptionResponse.subscriptionId,
          stripeCustomerId: subscriptionResponse.customerId,
        };
      } else {
        const paymentIntentResponse = await apiClient.createPaymentIntent({
          amount: amountInCents,
          currency: 'usd',
          metadata: {
            email: formData.email,
            donationType: formData.donationType,
          },
        });
        clientSecret = paymentIntentResponse.clientSecret;
        paymentIntentId = paymentIntentResponse.id;
      }

      const donationId = await onBeforePayment(
        paymentIntentId,
        subscriptionInfo,
      );

      const { error: stripeError, paymentIntent } =
        await stripe.confirmCardPayment(clientSecret, {
          payment_method: paymentMethodId,
        });

      if (stripeError) {
        setError(stripeError.message || 'Payment failed. Please try again.');
        onPaymentError(stripeError.message || 'Payment failed');
        return;
      }

      if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Explicitly trigger a backend sync for localhost environments without webhooks listening
        try {
          await apiClient.syncPaymentIntent(paymentIntentId);
        } catch (e) {
          console.warn('Failed to explicitly sync payment intent', e);
        }
        onPaymentSuccess(donationId);
      } else {
        setError('Payment was not completed. Please try again.');
        onPaymentError('Payment was not completed');
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      onPaymentError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }, [
    stripe,
    paymentMethodId,
    amount,
    formData.email,
    formData.donationType,
    formData.recurringInterval,
    formData.firstName,
    formData.lastName,
    onBeforePayment,
    setIsSubmitting,
    onPaymentSuccess,
    onPaymentError,
  ]);

  useEffect(() => {
    if (onSubmitRef) {
      onSubmitRef.current = handleConfirmPayment;
    }
  }, [onSubmitRef, handleConfirmPayment]);

  return (
    <section className="font-sans">
      <h1 className="font-semibold text-2xl">Confirm Payment</h1>
      <h3 className="text-[#55565A] font-light">
        Please confirm your information before proceeding.
      </h3>
      <Card className="p-5 mt-4 mb-4 bg-[#EFEFEF] rounded-lg shadow-none ring-0">
        <h2 className="self-start text-s font-bold">Transaction Details</h2>
        <dl className="flex flex-col justify-between gap-4">
          <div className="flex justify-between">
            <dt>Donor</dt>
            <dd>
              {formData.firstName} {formData.lastName}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt>Email</dt>
            <dd>{formData.email}</dd>
          </div>
          <div className="flex justify-between">
            <dt>Anonymous?</dt>
            <dd>{formData.isAnonymous ? 'Yes' : 'No'}</dd>
          </div>
          <hr className="h-[1px] bg-black border-none" />
          <div className="flex justify-between">
            <dt>Recurrence</dt>
            <dd>
              {formData.donationType === 'one_time'
                ? 'One-time'
                : `Recurring (${formData.recurringInterval})`}
            </dd>
          </div>
          <div className="flex justify-between font-bold">
            <dt>Donation Amount</dt>
            <dd>${amount.toFixed(2)}</dd>
          </div>
        </dl>
      </Card>

      {error && (
        <div className="p-3 mb-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
    </section>
  );
};
