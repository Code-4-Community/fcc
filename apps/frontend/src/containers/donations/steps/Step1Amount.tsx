import React from 'react';
import { Label } from '@components/ui/label';
import { Button } from '@components/ui/button';
import { Input } from '@components/ui/input';
import { Textarea } from '@components/ui/textarea';
import { Checkbox } from '@components/ui/checkbox';
import { ToggleSwitch } from '@components/ToggleSwitch';
import { DonationRecurrence } from './DonationRecurrence';
import { DonationAmount } from './DonationAmount';
import { DedicationSection } from './DedicationSection';
import type {
  DonationFormData,
  FormErrors,
  DedicationKind,
} from '../donation-form.types';
import { type DonationRecurrenceOption } from '../donation-form.config';

type Step1AmountProps = {
  formData: DonationFormData;
  errors: Partial<FormErrors>;
  isSubmitting: boolean;
  onChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => void;
};

const triggerTextChange = (
  onChange: Step1AmountProps['onChange'],
  name: string,
  value: string,
) => {
  onChange({
    target: { name, value, type: 'text' },
  } as React.ChangeEvent<HTMLInputElement>);
};

const triggerCheckboxToggle = (
  onChange: Step1AmountProps['onChange'],
  name: string,
  checked: boolean,
) => {
  onChange({
    target: { name, type: 'checkbox', checked, value: checked ? 'on' : '' },
  } as React.ChangeEvent<HTMLInputElement>);
};

export const Step1Amount = ({
  formData,
  errors,
  isSubmitting,
  onChange,
}: Step1AmountProps) => {
  const handlePresetAmountClick = (amount: number) =>
    triggerTextChange(onChange, 'amount', String(amount));

  const isAmountSelected = (amount: number) =>
    formData.amount === String(amount);

  const handleRecurrenceClick = (option: DonationRecurrenceOption) => {
    triggerTextChange(onChange, 'donationType', option.donationType);
    if (option.donationType === 'recurring' && option.recurringInterval) {
      triggerTextChange(
        onChange,
        'recurringInterval',
        option.recurringInterval,
      );
    }
  };

  const isRecurrenceSelected = (option: DonationRecurrenceOption) => {
    if (option.donationType === 'one_time')
      return formData.donationType === 'one_time';
    return (
      formData.donationType === 'recurring' &&
      option.recurringInterval === formData.recurringInterval
    );
  };

  const handleDedicationKindClick = (kind: DedicationKind) =>
    triggerTextChange(onChange, 'dedicationKind', kind);

  const handleAmountBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (!value) return;
    const number = parseFloat(value);
    if (isNaN(number)) return;
    triggerTextChange(onChange, 'amount', number.toFixed(2));
  };

  return (
    <div className="w-full flex flex-col items-start justify-start gap-6 font-sans">
      <DonationRecurrence
        donationType={formData.donationType}
        recurringInterval={formData.recurringInterval}
        error={errors.recurringInterval}
        isSubmitting={isSubmitting}
        onRecurrenceClick={handleRecurrenceClick}
        isRecurrenceSelected={isRecurrenceSelected}
      />

      <DonationAmount
        amount={formData.amount}
        error={errors.amount}
        isSubmitting={isSubmitting}
        onPresetClick={handlePresetAmountClick}
        isAmountSelected={isAmountSelected}
        onChange={onChange}
        onAmountBlur={handleAmountBlur}
      />

      <ToggleSwitch
        label="Donation Anonymity"
        description="Display name as anonymous when publicly shown"
        checked={formData.isAnonymous}
        onToggle={() =>
          triggerCheckboxToggle(onChange, 'isAnonymous', !formData.isAnonymous)
        }
        disabled={isSubmitting}
      />

      <ToggleSwitch
        label="Dedicate This Donation"
        description="Dedicate this donation"
        checked={!!formData.isDedicated}
        onToggle={() =>
          triggerCheckboxToggle(onChange, 'isDedicated', !formData.isDedicated)
        }
        disabled={isSubmitting}
      />

      {formData.isDedicated && (
        <DedicationSection
          dedicationKind={formData.dedicationKind ?? 'honor'}
          dedicationMessage={formData.dedicationMessage}
          showDedicationPublicly={formData.showDedicationPublicly}
          isSubmitting={isSubmitting}
          onDedicationKindClick={handleDedicationKindClick}
          onMessageChange={onChange}
          onShowPubliclyToggle={(checked) =>
            triggerCheckboxToggle(onChange, 'showDedicationPublicly', checked)
          }
        />
      )}
    </div>
  );
};
