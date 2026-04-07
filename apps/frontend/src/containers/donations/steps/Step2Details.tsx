import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { CardElement, useElements, useStripe } from '@stripe/react-stripe-js';
import type { DonationFormData, FormErrors } from '../donation-form.types';
import { DonationSummary } from '../DonationSummary';
import { Input } from '@components/ui/input';
import { Label } from '@components/ui/label';

export interface Step2DetailsRef {
  createPaymentMethod: () => Promise<string>;
}

interface Step2DetailsProps {
  formData: DonationFormData;
  errors: Partial<FormErrors>;
  isSubmitting: boolean;
  onChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => void;
}

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
      <div className="step2-container">
        <div className="step2-total-container">
          <div className="step2-total-label">Total</div>
          <div className="step2-total-amount-label">
            ${currentAmount.toFixed(2)}
          </div>
        </div>
        <div className="step2-payment-details-label">Payment Details</div>
        <div className="step2-payment-details-container">
          <div className="step2-name-container">
            <div className="flex flex-col text-sm w-full">
              <Label htmlFor="firstName">
                First Name <span className="text-[#d93025]">*</span>
              </Label>
              <Input
                type="text"
                id="firstName"
                name="firstName"
                autoComplete="given-name"
                value={formData.firstName}
                onChange={onChange}
                className={
                  errors.firstName ? 'border-[#d93025] bg-[#fff6f6]' : ''
                }
                disabled={isSubmitting}
                aria-invalid={!!errors.firstName}
                aria-describedby={
                  errors.firstName ? 'firstName-error' : undefined
                }
              />
              {errors.firstName && (
                <span id="firstName-error" className="text-xs text-[#d93025]">
                  {errors.firstName}
                </span>
              )}
            </div>
            <div className="flex flex-col text-sm w-full">
              <Label htmlFor="lastName">
                Last Name <span className="text-[#d93025]">*</span>
              </Label>
              <Input
                type="text"
                id="lastName"
                name="lastName"
                autoComplete="family-name"
                value={formData.lastName}
                onChange={onChange}
                className={
                  errors.lastName ? 'border-[#d93025] bg-[#fff6f6]' : ''
                }
                disabled={isSubmitting}
                aria-invalid={!!errors.lastName}
                aria-describedby={
                  errors.lastName ? 'lastName-error' : undefined
                }
              />
              {errors.lastName && (
                <span id="lastName-error" className="text-xs text-[#d93025]">
                  {errors.lastName}
                </span>
              )}
            </div>
          </div>
          <div className="flex flex-col text-sm w-full max-w-[85%]">
            <Label htmlFor="email">
              Email Address <span className="text-[#d93025]">*</span>
            </Label>
            <Input
              type="email"
              id="email"
              name="email"
              autoComplete="email"
              value={formData.email}
              onChange={onChange}
              className={errors.email ? 'border-[#d93025] bg-[#fff6f6]' : ''}
              disabled={isSubmitting}
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'email-error' : undefined}
            />
            {errors.email && (
              <span id="email-error" className="text-xs text-[#d93025]">
                {errors.email}
              </span>
            )}
          </div>
          <div className="step2-form-group">
            <label>Card Information</label>
            <div
              style={{
                border: '1px solid #ccc',
                borderRadius: '8px',
                padding: '12px 10px',
                backgroundColor: '#fff',
                width: '100%',
              }}
            >
              <CardElement
                options={cardElementOptions}
                onChange={(event) => {
                  setCardError(event.error ? event.error.message : null);
                }}
              />
            </div>
            {cardError && (
              <span className="step2-error-message">{cardError}</span>
            )}
          </div>
        </div>
        <DonationSummary
          setCurrentAmount={setCurrentAmount}
          baseAmount={baseAmount}
        />
      </div>
    );
  },
);
