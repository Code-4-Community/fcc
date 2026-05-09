import { cn } from '@lib/utils';
import { Label } from '@components/ui/label';
import { Button } from '@components/ui/button';
import { Input } from '@components/ui/input';
import { DONATION_PRESET_AMOUNTS } from '../donation-form.config';

type DonationAmountProps = {
  amount: string;
  error?: string;
  isSubmitting: boolean;
  onPresetClick: (amount: number) => void;
  isAmountSelected: (amount: number) => boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onAmountBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
};

export const DonationAmount = ({
  amount,
  error,
  isSubmitting,
  onPresetClick,
  isAmountSelected,
  onChange,
  onAmountBlur,
}: DonationAmountProps) => {
  return (
    <div className="flex flex-col w-full">
      <Label
        className="text-xl text-[#57585c] font-normal pb-3"
        htmlFor="amount"
      >
        Donation Amount
      </Label>

      <div className="flex w-full gap-8 pb-4">
        {DONATION_PRESET_AMOUNTS.map((preset) => (
          <Button
            key={preset}
            type="button"
            className={cn(
              'flex-1 h-12 px-4 rounded-lg border-[1.5px] text-base font-semibold cursor-pointer transition-colors duration-150 ease-in-out disabled:opacity-60 disabled:cursor-not-allowed',
              isAmountSelected(preset)
                ? 'bg-[#007b64] text-white border-[#007b64]'
                : 'bg-white text-black border-[#4E4E4E]',
            )}
            onClick={() => onPresetClick(preset)}
            disabled={isSubmitting}
          >
            ${preset}
          </Button>
        ))}
      </div>

      <div className="flex flex-row items-center justify-start gap-[4%] w-full">
        <div className="text-base font-normal whitespace-nowrap">
          Custom Amount
        </div>

        <div className="relative flex items-center w-full">
          <span className="absolute left-3 text-base text-[#555] font-normal">
            $
          </span>
          <Input
            type="text"
            id="amount"
            name="amount"
            inputMode="decimal"
            pattern="\\d+(\\.\\d{1,2})?"
            placeholder="0.00"
            value={amount}
            onChange={onChange}
            onBlur={onAmountBlur}
            className={cn(
              'pl-8 pr-12 h-10 text-base font-normal border-[#4E4E4E] border-[1.5px] shadow-none focus-visible:ring-0 rounded-lg',
              error ? 'border-[#d93025] bg-[#fff6f6]' : '',
            )}
            disabled={isSubmitting}
            aria-invalid={!!error}
            aria-describedby={error ? 'amount-error' : undefined}
          />

          <span className="absolute right-3 text-base text-[#555] font-normal">
            USD
          </span>
        </div>
      </div>

      {error && (
        <span id="amount-error" className="mt-2 text-sm text-[#d93025]">
          {error}
        </span>
      )}
    </div>
  );
};
