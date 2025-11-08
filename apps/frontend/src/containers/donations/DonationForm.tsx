import apiClient, {
  type CreateDonationResponse,
  type CreateDonationRequest,
} from '../../api/apiClient';
import React, { useState, FormEvent } from 'react';
import './donations.css';
import { DonationSummary } from './DonationSummary';

type RecurringInterval = 'weekly' | 'bimonthly' | 'monthly' | 'quarterly';

interface DonationFormData {
  firstName: string;
  lastName: string;
  email: string; // validated
  amount: string; // decimal, validated positive
  isAnonymous: boolean;
  donationType: 'one_time' | 'recurring';
  dedicationMessage: string; // optional
  showDedicationPublicly: boolean;
  recurringInterval: RecurringInterval;
}

interface DonationFormProps {
  onSuccess: (donationId: string) => void;
  onError: (error: Error) => void;
}

interface FormErrors {
  firstName: string;
  lastName: string;
  email: string;
  amount: string;
  recurringInterval: string;
}

export const DonationForm: React.FC<DonationFormProps> = ({
  onSuccess,
  onError,
}) => {
  const [formData, setFormData] = useState<DonationFormData>({
    firstName: '',
    lastName: '',
    email: '',
    amount: '',
    isAnonymous: false,
    donationType: 'one_time',
    dedicationMessage: '',
    showDedicationPublicly: false,
    recurringInterval: 'monthly',
  });

  const [errors, setErrors] = useState<Partial<FormErrors>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<FormErrors> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    const amountNum = parseFloat(formData.amount);
    const amountOK =
      /^\d+(\.\d{1,2})?$/.test(formData.amount) &&
      !isNaN(amountNum) &&
      amountNum > 0;
    if (!amountOK) {
      newErrors.amount = 'Enter a positive amount (max 2 decimals)';
    }

    if (formData.donationType === 'recurring' && !formData.recurringInterval) {
      newErrors.recurringInterval = 'Please select recurring interval';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, type, value } = e.target;
    const next =
      type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;

    // update form based on input type
    setFormData((prev) => ({
      ...prev,
      [name]: next,
    }));

    // clear field error
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }

    // if donationType becomes one_time, clear error
    if (
      name === 'donationType' &&
      value === 'one_time' &&
      errors.recurringInterval
    ) {
      setErrors((prev) => ({ ...prev, recurringInterval: undefined }));
    }

    // clear any prev submission errors
    setSubmitError(null);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isSubmitting) {
      return; // prevent over clicking
    }

    // validate form before submission
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // prep payload for API
      const payload: CreateDonationRequest = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        amount: parseFloat(formData.amount),
        isAnonymous: formData.isAnonymous,
        donationType: formData.donationType,
        dedicationMessage: formData.dedicationMessage,
        showDedicationPublicly: formData.showDedicationPublicly,
        // if donationType = recurring
        ...(formData.donationType === 'recurring' && {
          recurringInterval: formData.recurringInterval,
        }),
      };

      // submit donation to API
      const response: CreateDonationResponse =
        await apiClient.createDonation(payload);

      onSuccess(response.id);
      setErrors({});

      // reset form to initial state after successful submit
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        amount: '',
        isAnonymous: false,
        donationType: 'one_time',
        dedicationMessage: '',
        showDedicationPublicly: false,
        recurringInterval: 'monthly',
      });
    } catch (error) {
      const err = error as Error;
      setSubmitError(err.message || 'Failed to submit donation');

      onError(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="donation-form" onSubmit={handleSubmit} noValidate>
      <h2>Make a Donation</h2>

      {submitError && (
        <div className="error-banner" role="alert" aria-live="assertive">
          {submitError}
        </div>
      )}

      <div className="form-group">
        <label htmlFor="firstName">
          First Name <span className="required">*</span>
        </label>
        <input
          type="text"
          id="firstName"
          name="firstName"
          autoComplete="given-name"
          required
          aria-invalid={!!errors.firstName}
          aria-describedby={errors.firstName ? 'firstName-error' : undefined}
          value={formData.firstName}
          onChange={handleInputChange}
          className={errors.firstName ? 'error' : ''}
          disabled={isSubmitting}
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
          required
          aria-invalid={!!errors.lastName}
          aria-describedby={errors.lastName ? 'lastName-error' : undefined}
          value={formData.lastName}
          onChange={handleInputChange}
          className={errors.lastName ? 'error' : ''}
          disabled={isSubmitting}
        />
        {errors.lastName && (
          <span id="lastName-error" className="error-message">
            {errors.lastName}
          </span>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="email">
          Email <span className="required">*</span>
        </label>
        <input
          type="email"
          id="email"
          name="email"
          autoComplete="email"
          required
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? 'email-error' : undefined}
          value={formData.email}
          onChange={handleInputChange}
          className={errors.email ? 'error' : ''}
          disabled={isSubmitting}
        />
        {errors.email && (
          <span id="email-error" className="error-message">
            {errors.email}
          </span>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="amount">
          Donation Amount <span className="required">*</span>
        </label>
        <input
          type="text"
          id="amount"
          name="amount"
          inputMode="decimal"
          pattern="\d+(\.\d{1,2})?"
          placeholder="0.00"
          value={formData.amount}
          onChange={handleInputChange}
          className={errors.amount ? 'error' : ''}
          disabled={isSubmitting}
          aria-invalid={!!errors.amount}
          aria-describedby={errors.amount ? 'amount-error' : undefined}
        />
        {errors.amount && (
          <span id="amount-error" className="error-message">
            {errors.amount}
          </span>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="donationType">
          Donation Type <span className="required">*</span>
        </label>
        <select
          id="donationType"
          name="donationType"
          value={formData.donationType}
          onChange={handleInputChange}
          disabled={isSubmitting}
        >
          <option value="one_time">One-time</option>
          <option value="recurring">Recurring</option>
        </select>
      </div>

      {formData.donationType === 'recurring' && (
        <div className="form-group">
          <label htmlFor="recurringInterval">
            Recurring Interval <span className="required">*</span>
          </label>
          <select
            id="recurringInterval"
            name="recurringInterval"
            value={formData.recurringInterval}
            onChange={handleInputChange}
            className={errors.recurringInterval ? 'error' : ''}
            disabled={isSubmitting}
            aria-invalid={!!errors.recurringInterval}
            aria-describedby={
              errors.recurringInterval ? 'recurringInterval-error' : undefined
            }
          >
            <option value="weekly">Weekly</option>
            <option value="bimonthly">Bi-monthly</option>
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
          </select>
          {errors.recurringInterval && (
            <span className="error-message">{errors.recurringInterval}</span>
          )}
        </div>
      )}

      <div className="form-group checkbox-group">
        <label>
          <input
            type="checkbox"
            name="isAnonymous"
            checked={formData.isAnonymous}
            onChange={handleInputChange}
            disabled={isSubmitting}
          />
          Make this donation anonymous
        </label>
      </div>

      <div className="form-group">
        <label htmlFor="dedicationMessage">Dedication Message (optional)</label>
        <textarea
          id="dedicationMessage"
          name="dedicationMessage"
          value={formData.dedicationMessage}
          onChange={handleInputChange}
          rows={4}
          disabled={isSubmitting}
          placeholder="Add a special message or dedication..."
        />
      </div>

      <div className="form-group checkbox-group">
        <label>
          <input
            type="checkbox"
            name="showDedicationPublicly"
            checked={formData.showDedicationPublicly}
            onChange={handleInputChange}
            disabled={isSubmitting}
          />
          Show dedication message publicly
        </label>
      </div>

      <button type="submit" className="submit-button" disabled={isSubmitting}>
        {isSubmitting ? 'Processing...' : 'Submit Donation'}
      </button>
      <DonationSummary baseAmount={10} />
    </form>
  );
};
