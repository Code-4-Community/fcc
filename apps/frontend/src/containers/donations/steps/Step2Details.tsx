import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { CardElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { Input } from '@components/ui/input';
import { FormField } from './FormField';
import { DonationSummary } from '../DonationSummary';
import type { DonationFormData, FormErrors } from '../donation-form.types';

export interface Step2DetailsRef {
  createPaymentMethod: () => Promise<string>;
}

type Step2DetailsProps = {
  formData: DonationFormData;
  errors: Partial<FormErrors>;
  isSubmitting: boolean;
  onChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => void;
};

const cardElementOptions = {
  style: {
    base: {
      fontSize: '16px',
      fontFamily: 'Source Sans 3, system-ui, sans-serif',
      color: '#30313d',
      '::placeholder': {
        color: '#B3B8C7',
      },
    },
    invalid: {
      color: '#df1b41',
    },
  },
};

export const Step2Details = forwardRef<Step2DetailsRef, Step2DetailsProps>(
  function Step2Details({ formData, errors, isSubmitting, onChange }, ref) {
    const stripe = useStripe();
    const elements = useElements();
    const baseAmount = parseFloat(formData.amount) || 0;
    const [currentAmount, setCurrentAmount] = useState<number>(baseAmount);
    const [cardError, setCardError] = useState<string | null>(null);

    useImperativeHandle(ref, () => ({
      async createPaymentMethod(): Promise<string> {
        if (!stripe || !elements) {
          throw new Error('Stripe has not loaded yet. Please try again.');
        }

        const cardElement = elements.getElement(CardElement);
        if (!cardElement) {
          throw new Error('Card information not found.');
        }

        const { error, paymentMethod } = await stripe.createPaymentMethod({
          type: 'card',
          card: cardElement,
          billing_details: {
            name: `${formData.firstName} ${formData.lastName}`,
            email: formData.email,
          },
        });

        if (error || !paymentMethod) {
          throw new Error(error?.message ?? 'Failed to process card');
        }

        return paymentMethod.id;
      },
    }));

    return (
      <div className="w-full flex flex-col gap-6 font-sans">
        <div className="flex flex-col items-center justify-center w-full">
          <span className="text-base text-[#57585c] font-normal">Total</span>
          <span className="text-4xl font-bold text-black">
            ${currentAmount.toFixed(2)}
          </span>
        </div>

        <div className="flex flex-col gap-4 w-full">
          <h1 className="text-black text-2xl pb-3">Payment Details</h1>

          <div className="flex gap-4 w-full">
            <FormField
              id="firstName"
              label="First Name"
              required
              error={errors.firstName}
            >
              <Input
                type="text"
                id="firstName"
                name="firstName"
                autoComplete="given-name"
                value={formData.firstName}
                onChange={onChange}
                disabled={isSubmitting}
                aria-invalid={!!errors.firstName}
                aria-describedby={
                  errors.firstName ? 'firstName-error' : undefined
                }
                className="border border-black"
              />
            </FormField>

            <FormField
              id="lastName"
              label="Last Name"
              required
              error={errors.lastName}
            >
              <Input
                type="text"
                id="lastName"
                name="lastName"
                autoComplete="family-name"
                value={formData.lastName}
                onChange={onChange}
                disabled={isSubmitting}
                aria-invalid={!!errors.lastName}
                aria-describedby={errors.lastName ? 'lastName-error' : undefined}
                className="border border-black"
              />
            </FormField>
          </div>

          <FormField
            id="email"
            label="Email Address"
            required
            error={errors.email}
          >
            <Input
              type="email"
              id="email"
              name="email"
              autoComplete="email"
              value={formData.email}
              onChange={onChange}
              disabled={isSubmitting}
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'email-error' : undefined}
              className="border border-black"
            />
          </FormField>

          <FormField
            id="cardInformation"
            label="Card Information"
            required
            error={cardError ?? undefined}
          >
            <div className="w-full border border-black rounded px-3 py-2 bg-white">
              <CardElement
                options={cardElementOptions}
                onChange={(event) => {
                  setCardError(event.error ? event.error.message : null);
                }}
              />
            </div>
          </FormField>
        </div>

        <DonationSummary
          setCurrentAmount={setCurrentAmount}
          baseAmount={baseAmount}
        />
      </div>
    );
  },
);