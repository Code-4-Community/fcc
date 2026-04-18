import { useState } from 'react';

type DonationSummaryProps = {
  setCurrentAmount?: React.Dispatch<React.SetStateAction<number>>;
  baseAmount: number;
  feeRate?: number;
  fixedFee?: number;
};

export const DONATION_FEE_RATE = 2.9;
export const DONATION_FIXED_FEE = 0.3;

export const DonationSummary = ({
  setCurrentAmount,
  baseAmount,
  feeRate,
  fixedFee,
}: DonationSummaryProps) => {
  const [feeApplied, setFeeApplied] = useState(false);

  const rate = feeRate ?? DONATION_FEE_RATE;
  const fee = fixedFee ?? DONATION_FIXED_FEE;
  const feeTotal = (baseAmount * rate) / 100 + fee;

  const handleToggle = () => {
    const next = !feeApplied;
    setFeeApplied(next);
    setCurrentAmount?.(next ? baseAmount + feeTotal : baseAmount);
  };

  const feeText = `Add $${feeTotal.toFixed(2)} to cover transaction fees and tip the fundraising platform to help keep it `;

  const toggleClass = feeApplied
    ? 'border-2 border-[#2C8974] bg-[#F0F0F0]'
    : 'bg-gray-300';

  const circleClass = feeApplied
    ? 'bg-[#2C8974] left-[50%]'
    : 'bg-white left-[10%]';

  return (
    <div className="w-full border-[#4E4E4E] border-[1.5px] rounded-lg p-4 flex flex-col gap-3">
      <div className="flex items-start gap-3 w-full">
        <div
          data-testid="fee-toggle"
          className="flex-shrink-0 cursor-pointer mt-1"
          onClick={handleToggle}
        >
          <div
            className={`relative w-10 aspect-[2/1] rounded-full transition-all duration-300 ease-in-out shadow-[inset_0_0_3px_rgba(0,0,0,0.2)] ${toggleClass}`}
          >
            <div
              className={`absolute top-1/2 w-[40%] h-[70%] rounded-full -translate-y-1/2 transition-all duration-300 ease-in-out ${circleClass}`}
            />
          </div>
        </div>

        <p className="text-sm text-[#333] pb-2">
          {feeText}
          <a
            className="underline text-black"
            target="_blank"
            href="https://www.givelively.org/free#what-it-means"
            rel="noreferrer"
          >
            free for nonprofits.
          </a>
        </p>
      </div>

      <button
        type="button"
        className="self-start ml-[52px] px-4 py-1.5 rounded-full bg-gray-100 text-sm text-gray-500 font-medium hover:bg-gray-200 transition-colors"
      >
        Edit Fees &amp; Tips
      </button>
    </div>
  );
};
