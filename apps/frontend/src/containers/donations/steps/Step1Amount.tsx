import React from 'react';
import type { DonationFormData, FormErrors } from '../donation-form.types';

interface Step1AmountProps {
  formData: DonationFormData;
  errors: Partial<FormErrors>;
  isSubmitting: boolean;
  onChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => void;
}

export const Step1Amount: React.FC<Step1AmountProps> = ({
  formData,
  errors,
  isSubmitting,
  onChange,
}) => {
  return (
    <section>
      <h3>Step 1: Choose amount</h3>

      <div className="form-group">
        <label htmlFor="amount">
          Donation Amount <span className="required">*</span>
        </label>
        <input
          type="text"
          id="amount"
          name="amount"
          inputMode="decimal"
          pattern="\\d+(\\.\\d{1,2})?"
          placeholder="0.00"
          value={formData.amount}
          onChange={onChange}
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
          onChange={onChange}
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
            onChange={onChange}
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
            <span id="recurringInterval-error" className="error-message">
              {errors.recurringInterval}
            </span>
          )}
        </div>
      )}

      <div className="form-group checkbox-group">
        <label>
          <input
            type="checkbox"
            name="isAnonymous"
            checked={formData.isAnonymous}
            onChange={onChange}
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
          onChange={onChange}
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
            onChange={onChange}
            disabled={isSubmitting}
          />
          Show dedication message publicly
        </label>
      </div>
    </section>
  );
};
