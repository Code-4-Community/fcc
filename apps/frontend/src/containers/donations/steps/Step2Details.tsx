import React from 'react';
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

  return (
    <section>
      <h3>Step 2: Payment details</h3>

      <div className="form-row">
        <div className="form-group">
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
            aria-describedby={errors.firstName ? 'firstName-error' : undefined}
          />
          {errors.firstName && (
            <span id="firstName-error" className="error-message">
              {errors.firstName}
            </span>
          )}
        </div>

        <div className="form-group">
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
            <span id="lastName-error" className="error-message">
              {errors.lastName}
            </span>
          )}
        </div>
      </div>

      <div className="form-group">
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
          <span id="email-error" className="error-message">
            {errors.email}
          </span>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="cardNumber">Card Information</label>
        <input
          type="text"
          id="cardNumber"
          name="cardNumber"
          placeholder="0000 0000 0000 0000"
          value={formData.cardNumber}
          onChange={onChange}
          disabled={isSubmitting}
        />
        <div className="form-row">
          <input
            type="text"
            name="cardExpiry"
            placeholder="MM / YY"
            value={formData.cardExpiry}
            onChange={onChange}
            disabled={isSubmitting}
          />
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

      <DonationSummary baseAmount={baseAmount} />
    </section>
  );
};
