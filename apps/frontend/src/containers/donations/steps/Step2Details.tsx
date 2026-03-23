import React, { useState } from 'react';
import { Input } from '@components/ui/input';
import { FormField } from './FormField';
import { DonationSummary } from '../DonationSummary';
import type { DonationFormData, FormErrors } from '../donation-form.types';

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

const CardIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="none"
    className="w-5 h-5 flex-shrink-0"
  >
    <path
      d="M3.125 11.25H5.625M3.125 13.125H6.875M1.25 4.375V15.625H18.75V4.375H1.25Z"
      stroke="#B3B8C7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M1.25 6.875V8.125H18.75V6.875H1.25Z"
      fill="#B3B8C7"
      stroke="#B3B8C7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const Step2Details = ({
  formData,
  errors,
  isSubmitting,
  onChange,
}: Step2DetailsProps) => {
  const baseAmount = parseFloat(formData.amount) || 0;
  const [currentAmount, setCurrentAmount] = useState<number>(baseAmount);

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
          <FormField id="firstName" label="First Name" error={errors.firstName}>
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

        <FormField id="cardNumber" label="Card Information">
          <div className="flex items-center gap-2 w-full border border-black rounded px-3 h-10">
            <CardIcon />

            <Input
              type="text"
              id="cardNumber"
              name="cardNumber"
              placeholder="0000 0000 0000"
              value={formData.cardNumber}
              onChange={onChange}
              disabled={isSubmitting}
              className="border-none shadow-none flex-1 p-0 h-full focus-visible:ring-0"
            />

            <Input
              type="text"
              name="cardExpiry"
              placeholder="MM / YY"
              value={formData.cardExpiry}
              onChange={onChange}
              disabled={isSubmitting}
              className="border-none shadow-none w-20 p-0 h-full focus-visible:ring-0"
            />

            <Input
              type="text"
              name="cardCvc"
              placeholder="CVC"
              value={formData.cardCvc}
              onChange={onChange}
              disabled={isSubmitting}
              className="border-none shadow-none w-14 p-0 h-full focus-visible:ring-0"
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
};
