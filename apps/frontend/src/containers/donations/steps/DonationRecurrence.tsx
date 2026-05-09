import { cn } from '@lib/utils';
import { Label } from '@components/ui/label';
import { Button } from '@components/ui/button';
import {
  DONATION_RECURRENCE_OPTIONS,
  type DonationRecurrenceOption,
} from '../donation-form.config';

type DonationRecurrenceProps = {
  donationType: string;
  recurringInterval: string;
  error?: string;
  isSubmitting: boolean;
  onRecurrenceClick: (option: DonationRecurrenceOption) => void;
  isRecurrenceSelected: (option: DonationRecurrenceOption) => boolean;
};

export const DonationRecurrence = ({
  error,
  isSubmitting,
  onRecurrenceClick,
  isRecurrenceSelected,
}: DonationRecurrenceProps) => {
  return (
    <div className="flex flex-col w-full">
      <Label className="text-xl text-[#57585c] font-normal pb-3">
        Donation Recurrence
      </Label>

      <div className="flex w-full gap-8">
        {DONATION_RECURRENCE_OPTIONS.map((option) => (
          <Button
            key={option.label}
            type="button"
            className={cn(
              'flex-1 h-12 px-4 rounded-lg border-[1.5px] text-base cursor-pointer transition-colors duration-150 ease-in-out font-semibold disabled:opacity-60 disabled:cursor-not-allowed',
              isRecurrenceSelected(option)
                ? 'bg-[#007b64] text-white border-[#007b64]'
                : 'bg-white text-black border-[#4E4E4E]',
            )}
            onClick={() => onRecurrenceClick(option)}
            disabled={isSubmitting}
          >
            {option.label}
          </Button>
        ))}
      </div>

      {error && <span className="mt-2 text-sm text-[#d93025]">{error}</span>}
    </div>
  );
};
