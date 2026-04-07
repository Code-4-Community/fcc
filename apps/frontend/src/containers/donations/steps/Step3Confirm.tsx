import React, { useState } from 'react';
import { useStripe } from '@stripe/react-stripe-js';
import type { DonationFormData } from '../donation-form.types';
import apiClient from '../../../api/apiClient';
import { Card, CardHeader, CardTitle, CardContent } from '@components/ui/card';

interface Step3ConfirmProps {
  formData: DonationFormData;
  paymentMethodId: string | null;
  onPaymentSuccess: (paymentIntentId: string) => void;
  onPaymentError: (error: string) => void;
  isSubmitting: boolean;
  setIsSubmitting: (value: boolean) => void;
}

export const Step3Confirm: React.FC<Step3ConfirmProps> = ({
  formData,
  paymentMethodId,
  onPaymentSuccess,
  onPaymentError,
  isSubmitting,
  setIsSubmitting,
}) => {
  const stripe = useStripe();
  const [error, setError] = useState<string | null>(null);

  const amount = parseFloat(formData.amount) || 0;

  const handleConfirmPayment = async () => {
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
      // Step 1: Create PaymentIntent
      const amountInCents = Math.round(amount * 100);
      const paymentIntentResponse = await apiClient.createPaymentIntent({
        amount: amountInCents,
        currency: 'usd',
        metadata: {
          email: formData.email,
          donationType: formData.donationType,
        },
      });

      // Step 2: Confirm the payment with Stripe
      const { error: stripeError, paymentIntent } =
        await stripe.confirmCardPayment(paymentIntentResponse.clientSecret, {
          payment_method: paymentMethodId,
        });

      if (stripeError) {
        setError(stripeError.message || 'Payment failed. Please try again.');
        onPaymentError(stripeError.message || 'Payment failed');
        return;
      }

      if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Step 3: Payment successful - notify parent
        onPaymentSuccess(paymentIntent.id);
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
  };

  return (
    <section className="font-['Source_Sans_3']">
      <h1 className="font-semibold text-2xl">Confirm Payment</h1>
      <h3 className="text-[#55565A] font-light">
        Please confirm your information before proceeding.
      </h3>
      <Card className="p-5 mt-4 mb-4 bg-[#EFEFEF] rounded-none shadow-none ring-0">
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

      <button
        type="button"
        onClick={handleConfirmPayment}
        disabled={isSubmitting || !stripe}
        className="w-full py-3 bg-[#007b64] text-white font-bold rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {isSubmitting ? 'Processing...' : 'Confirm Donation'}
      </button>
    </section>
  );
};
