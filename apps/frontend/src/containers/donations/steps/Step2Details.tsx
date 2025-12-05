import React, { useState } from 'react';
import type { DonationFormData, FormErrors } from '../donation-form.types';
import { DonationSummary } from '../DonationSummary';

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

export const Step2Details: React.FC<Step2DetailsProps> = ({
  formData,
  errors,
  isSubmitting,
  onChange,
}) => {
  const baseAmount = parseFloat(formData.amount) || 0;
  const [currentAmount, setCurrentAmount] = useState<number>(baseAmount);

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
          <div className="step2-form-group">
            <label htmlFor="firstName">
              First Name <span className="required">*</span>
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              autoComplete="given-name"
              value={formData.firstName}
              onChange={onChange}
              className={errors.firstName ? 'error' : ''}
              disabled={isSubmitting}
              aria-invalid={!!errors.firstName}
              aria-describedby={
                errors.firstName ? 'firstName-error' : undefined
              }
            />
            {errors.firstName && (
              <span id="firstName-error" className="step2-error-message">
                {errors.firstName}
              </span>
            )}
          </div>
          <div className="step2-form-group">
            <label htmlFor="lastName">
              Last Name <span className="required">*</span>
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              autoComplete="family-name"
              value={formData.lastName}
              onChange={onChange}
              className={errors.lastName ? 'error' : ''}
              disabled={isSubmitting}
              aria-invalid={!!errors.lastName}
              aria-describedby={errors.lastName ? 'lastName-error' : undefined}
            />
            {errors.lastName && (
              <span id="lastName-error" className="step2-error-message">
                {errors.lastName}
              </span>
            )}
          </div>
        </div>
        <div className="step2-form-group">
          <label htmlFor="email">
            Email Address <span className="required">*</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            autoComplete="email"
            value={formData.email}
            onChange={onChange}
            className={errors.email ? 'error' : ''}
            disabled={isSubmitting}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'email-error' : undefined}
          />
          {errors.email && (
            <span id="email-error" className="step2-error-message">
              {errors.email}
            </span>
          )}
        </div>
        <div className="step2-form-group">
          <label htmlFor="cardNumber">Card Information</label>
          <div className="step2-card-info-container">
            <div className="step2-form-group">
              <div className="step2-form-group-row-no-border">
                <div className="step2-card-icon ">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="none"
                    preserveAspectRatio="none"
                  >
                    <path
                      d="M3.125 11.25H5.625M3.125 13.125H6.875M1.25 4.375V15.625H18.75V4.375H1.25Z"
                      stroke="#B3B8C7"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <path
                      d="M1.25 6.875V8.125H18.75V6.875H1.25Z"
                      fill="#B3B8C7"
                      stroke="#B3B8C7"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </div>
                <div className="step2-card-number">
                  <input
                    type="text"
                    id="cardNumber"
                    name="cardNumber"
                    placeholder="0000 0000 0000"
                    value={formData.cardNumber}
                    onChange={onChange}
                    disabled={isSubmitting}
                  />
                </div>
                <div className="step2-card-date">
                  <input
                    type="text"
                    name="cardExpiry"
                    placeholder="MM / YY"
                    value={formData.cardExpiry}
                    onChange={onChange}
                    disabled={isSubmitting}
                  />
                </div>
                <div className="step2-card-cvc">
                  <input
                    type="text"
                    name="cardCvc"
                    placeholder="CVC"
                    value={formData.cardCvc}
                    onChange={onChange}
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <DonationSummary
        setCurrentAmount={setCurrentAmount}
        baseAmount={baseAmount}
      />
    </div>
  );
};
