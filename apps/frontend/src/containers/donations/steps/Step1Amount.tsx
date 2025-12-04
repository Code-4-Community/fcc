import React from 'react';
import type {
  DonationFormData,
  FormErrors,
  DedicationKind,
} from '../donation-form.types';

import {
  DONATION_PRESET_AMOUNTS,
  DONATION_RECURRENCE_OPTIONS,
  type DonationRecurrenceOption,
} from '../donation-form.config';

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

// helpers to synthesize events so we can reuse DonationForm.handleInputChange

const triggerTextChange = (
  onChange: Step1AmountProps['onChange'],
  name: string,
  value: string,
) => {
  onChange({
    target: {
      name,
      value,
      type: 'text',
    },
  } as React.ChangeEvent<HTMLInputElement>);
};

const triggerCheckboxToggle = (
  onChange: Step1AmountProps['onChange'],
  name: string,
  checked: boolean,
) => {
  onChange({
    target: {
      name,
      type: 'checkbox',
      checked,
      value: checked ? 'on' : '',
    },
  } as React.ChangeEvent<HTMLInputElement>);
};

export const Step1Amount: React.FC<Step1AmountProps> = ({
  formData,
  errors,
  isSubmitting,
  onChange,
}) => {
  // donation amount presets
  const handlePresetAmountClick = (amount: number) => {
    triggerTextChange(onChange, 'amount', String(amount));
  };

  const isAmountSelected = (amount: number) =>
    formData.amount === String(amount);

  // donation recurrence btns
  const handleRecurrenceClick = (option: DonationRecurrenceOption) => {
    // always set donationType
    triggerTextChange(onChange, 'donationType', option.donationType);

    // for recurring options, also set the recurringInterval field
    if (option.donationType === 'recurring' && option.recurringInterval) {
      triggerTextChange(
        onChange,
        'recurringInterval',
        option.recurringInterval,
      );
    }
  };

  const isRecurrenceSelected = (option: DonationRecurrenceOption) => {
    if (option.donationType === 'one_time') {
      return formData.donationType === 'one_time';
    }
    return (
      formData.donationType === 'recurring' &&
      option.recurringInterval === formData.recurringInterval
    );
  };

  // dedication btns
  const handleDedicationKindClick = (kind: DedicationKind) => {
    triggerTextChange(onChange, 'dedicationKind', kind);
  };

  const isDedicationKindSelected = (kind: DedicationKind) =>
    formData.dedicationKind === kind;

  return (
    <section>
      <h3>Step 1: Choose amount &amp; frequency</h3>

      <div className="form-group">
        <label>Donation Recurrence</label>
        <div className="recurrence-options">
          {DONATION_RECURRENCE_OPTIONS.map((option) => (
            <button
              key={option.label}
              type="button"
              className={
                'recurrence-option' +
                (isRecurrenceSelected(option) ? ' selected' : '')
              }
              onClick={() => handleRecurrenceClick(option)}
              disabled={isSubmitting}
            >
              {option.label}
            </button>
          ))}
        </div>
        {errors.recurringInterval && (
          <span className="error-message">{errors.recurringInterval}</span>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="amount">
          Donation Amount <span className="required">*</span>
        </label>

        <div className="amount-grid">
          {DONATION_PRESET_AMOUNTS.map((amount) => (
            <button
              key={amount}
              type="button"
              className={
                'amount-button' + (isAmountSelected(amount) ? ' selected' : '')
              }
              onClick={() => handlePresetAmountClick(amount)}
              disabled={isSubmitting}
            >
              ${amount}
            </button>
          ))}
        </div>

        <div className="amount-custom-row">
          <span className="amount-custom-label">Custom Amount</span>
          <div className="amount-custom-input">
            <span className="amount-currency-prefix">$</span>
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
            <span className="amount-currency-suffix">USD</span>
          </div>
        </div>

        {errors.amount && (
          <span id="amount-error" className="error-message">
            {errors.amount}
          </span>
        )}
      </div>

      <div className="form-group">
        <label>Donation Anonymity</label>
        <div
          className="toggle-container"
          role="switch"
          aria-checked={formData.isAnonymous}
          onClick={() =>
            triggerCheckboxToggle(
              onChange,
              'isAnonymous',
              !formData.isAnonymous,
            )
          }
        >
          <div
            className={'toggle-slider ' + (formData.isAnonymous ? 'on' : 'off')}
          >
            <div className="toggle-circle" />
          </div>
          <span className="toggle-label">
            Display name as anonymous when publicly shown
          </span>
        </div>
      </div>

      <div className="form-group">
        <label>Dedicate This Donation</label>
        <div
          className="toggle-container"
          role="switch"
          aria-checked={!!formData.isDedicated}
          onClick={() =>
            triggerCheckboxToggle(
              onChange,
              'isDedicated',
              !formData.isDedicated,
            )
          }
        >
          <div
            className={'toggle-slider ' + (formData.isDedicated ? 'on' : 'off')}
          >
            <div className="toggle-circle" />
          </div>
        </div>

        {formData.isDedicated && (
          <>
            <div className="recurrence-options">
              <button
                type="button"
                className={
                  'recurrence-option' +
                  (isDedicationKindSelected('honor') ? ' selected' : '')
                }
                onClick={() => handleDedicationKindClick('honor')}
                disabled={isSubmitting}
              >
                In Honor Of
              </button>
              <button
                type="button"
                className={
                  'recurrence-option' +
                  (isDedicationKindSelected('memory') ? ' selected' : '')
                }
                onClick={() => handleDedicationKindClick('memory')}
                disabled={isSubmitting}
              >
                In Memory Of
              </button>
            </div>

            <div className="form-group">
              <label htmlFor="dedicationMessage">Write a message..</label>
              <textarea
                id="dedicationMessage"
                name="dedicationMessage"
                value={formData.dedicationMessage}
                onChange={onChange}
                rows={4}
                disabled={isSubmitting}
                placeholder="Write a message.."
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
          </>
        )}
      </div>
    </section>
  );
};
