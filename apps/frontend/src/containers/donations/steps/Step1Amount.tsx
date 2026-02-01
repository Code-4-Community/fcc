import React from 'react';
import { Label } from '@components/ui/label';
import { Button } from '@components/ui/button';
import { Input } from '@components/ui/input';
import { Textarea } from '@components/ui/textarea';
import { Checkbox } from '@components/ui/checkbox';

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
    <div className="w-full h-4/5 flex flex-col items-start justify-start gap-[4%]">
      <div className="flex flex-col">
        <Label className="text-xl text-[#57585c] font-thin">
          Donation Recurrence
        </Label>
        <div className="flex gap-2">
          {DONATION_RECURRENCE_OPTIONS.map((option) => (
            <Button
              key={option.label}
              type="button"
              className={
                'py-1 px-2 whitespace-nowrap rounded border border-gray-300 bg-white text-base cursor-pointer transition-colors duration-150 ease-in-out font-thin disabled:opacity-60 disabled:cursor-not-allowed' +
                (isRecurrenceSelected(option)
                  ? 'border-[#2a7a73] bg-[#e0f2f1] font-semibold'
                  : 'bg-white border-gray-300')
              }
              onClick={() => handleRecurrenceClick(option)}
              disabled={isSubmitting}
            >
              {option.label}
            </Button>
          ))}
        </div>
        {errors.recurringInterval && (
          <span className="mt-[2%] text-sm text-[#d93025]">
            {errors.recurringInterval}
          </span>
        )}
      </div>
      <div className="flex flex-col">
        <Label className="text-lg text-[#57585c] font-thin" htmlFor="amount">
          Donation Amount <span className="text-[#d93025]">*</span>
        </Label>

        <div className="flex flex-wrap gap-4 mb-[0.5rem]">
          {DONATION_PRESET_AMOUNTS.map((amount) => (
            <Button
              key={amount}
              type="button"
              className={
                'flex-[1_1_20%] py-1 px-2 w-full rounded border border-gray-300 bg-white text-base font-thin cursor-pointer transition-colors duration-150 ease-in-out disabled:opacity-60 disabled:cursor-not-allowed' +
                (isAmountSelected(amount)
                  ? ' border-[#2a7a73] bg-[#e0f2f1] font-semibold'
                  : '')
              }
              onClick={() => handlePresetAmountClick(amount)}
              disabled={isSubmitting}
            >
              ${amount}
            </Button>
          ))}
        </div>

        <div className="flex flex-row items-center justify-start gap-[4%] w-full">
          <div className="text-base font-semibold whitespace-nowrap">
            Custom Amount
          </div>
          <div className="text-base font-semibold whitespace-nowrap">
            <span className="text-base text-[#555]">$</span>
            <Input
              type="text"
              id="amount"
              name="amount"
              inputMode="decimal"
              pattern="\\d+(\\.\\d{1,2})?"
              placeholder="0.00"
              value={formData.amount}
              onChange={onChange}
              className={errors.amount ? 'border-[#d93025] bg-[#fff6f6]' : ''}
              disabled={isSubmitting}
              aria-invalid={!!errors.amount}
              aria-describedby={errors.amount ? 'amount-error' : undefined}
            />
            <span className="text-base text-[#555]">USD</span>
          </div>
        </div>

        {errors.amount && (
          <span id="amount-error" className="mt-2 text-sm text-[#d93025]">
            {errors.amount}
          </span>
        )}
      </div>

      <div className="flex flex-col">
        <Label className="text-lg text-[#57585c] font-thin">
          Donation Anonymity
        </Label>
        <div
          className="gap-[4%] flex items-start cursor-pointer select-none flex-wrap justify-start p-0"
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
            className={`relative flex-shrink-0 w-10 min-w-[12px] aspect-[2/1] rounded-full transition-all duration-300 ease-in-out shadow-[inset_0_0_3px_rgba(0,0,0,0.2)] ${formData.isAnonymous ? 'bg-[#2a7a73]' : 'bg-gray-300'}`}
          >
            <div
              className={`absolute top-1/2 w-[40%] h-[70%] bg-white rounded-full -translate-y-1/2 transition-all duration-300 ease-in-out ${formData.isAnonymous ? 'left-[50%]' : 'left-[10%]'}`}
            />
          </div>
          <span className="text-base text-[#333] text-left w-4/5">
            Display name as anonymous when publicly shown
          </span>
        </div>
      </div>

      <div className="flex flex-col">
        <div className="text-lg text-[#57585c] font-thin">
          Dedicate This Donation
        </div>
        <div
          className="gap-[4%] flex items-start cursor-pointer select-none flex-wrap justify-start p-0"
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
            className={`relative flex-shrink-0 w-10 min-w-[12px] aspect-[2/1] rounded-full transition-all duration-300 ease-in-out shadow-[inset_0_0_3px_rgba(0,0,0,0.2)] ${formData.isDedicated ? 'bg-[#2a7a73]' : 'bg-gray-300'}`}
          >
            <div
              className={`absolute top-1/2 w-[40%] h-[70%] bg-white rounded-full -translate-y-1/2 transition-all duration-300 ease-in-out ${formData.isDedicated ? 'left-[50%]' : 'left-[10%]'}`}
            />{' '}
          </div>
        </div>
      </div>

      {formData.isDedicated && (
        <>
          <div className="flex gap-2">
            <Button
              type="button"
              className={
                'py-1 px-2 w-full whitespace-nowrap rounded border text-base cursor-pointer transition-colors duration-150 ease-in-out disabled:opacity-60 disabled:cursor-not-allowed' +
                (isDedicationKindSelected('honor')
                  ? ' border-[#2a7a73] bg-[#e0f2f1] font-semibold'
                  : ' border-gray-300 bg-white')
              }
              onClick={() => handleDedicationKindClick('honor')}
              disabled={isSubmitting}
            >
              In Honor Of
            </Button>
            <Button
              type="button"
              className={
                'py-1 px-2 w-full whitespace-nowrap rounded border text-base cursor-pointer transition-colors duration-150 ease-in-out disabled:opacity-60 disabled:cursor-not-allowed' +
                (isDedicationKindSelected('memory')
                  ? ' border-[#2a7a73] bg-[#e0f2f1] font-semibold'
                  : ' border-gray-300 bg-white')
              }
              onClick={() => handleDedicationKindClick('memory')}
              disabled={isSubmitting}
            >
              In Memory Of
            </Button>
          </div>

          <div className="w-full h-[12%]">
            <Textarea
              id="dedicationMessage"
              name="dedicationMessage"
              value={formData.dedicationMessage}
              onChange={onChange}
              rows={4}
              disabled={isSubmitting}
              placeholder="Write a message.."
            />
          </div>

          <div className="w-full flex-row flex items-center justify-start text-[#57585c] font-thin h-[6%] overflow-hidden text-base gap-2">
            <Label>
              <Checkbox
                id="showDedicationPublicly"
                name="showDedicationPublicly"
                checked={formData.showDedicationPublicly}
                onCheckedChange={(checked) =>
                  triggerCheckboxToggle(
                    onChange,
                    'showDedicationPublicly',
                    !!checked,
                  )
                }
                disabled={isSubmitting}
              />
              Show dedication message publicly
            </Label>
          </div>
        </>
      )}
    </div>
  );
};
