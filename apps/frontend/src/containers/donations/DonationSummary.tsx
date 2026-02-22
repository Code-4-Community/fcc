import { useState } from 'react';

interface DonationSummaryData {
  setCurrentAmount?: React.Dispatch<React.SetStateAction<number>>;
  baseAmount: number;
  feeRate?: number;
  fixedFee?: number;
}

export const DONATION_FEE_RATE = 2.9;
export const DONATION_FIXED_FEE = 0.3;

export const DonationSummary: React.FC<DonationSummaryData> = ({
  setCurrentAmount,
  baseAmount,
  feeRate,
  fixedFee,
}) => {
  const [feeApplied, setFeeApplied] = useState<boolean>(false);

  const rate = feeRate ?? DONATION_FEE_RATE;
  const fee = fixedFee ?? DONATION_FIXED_FEE;
  const feeTotal = (baseAmount * rate) / 100 + fee;

  return (
    <div className="w-[85%] flex flex-col">
      <div className="w-full aspect-[5/1] pb-[4%] text-sm font-sans flex flex-row flex-wrap text-center border border-[#ddd] rounded-lg">
        <div
          data-testid="fee-toggle"
          className="gap-[4%] flex items-start cursor-pointer select-none flex-wrap justify-center p-[4%]"
          onClick={() => {
            if (setCurrentAmount) {
              if (feeApplied) {
                setCurrentAmount(baseAmount);
              } else {
                setCurrentAmount(baseAmount + feeTotal);
              }
            }
            setFeeApplied(!feeApplied);
          }}
        >
          <div
            className={`
              relative flex-shrink-0 w-[8%] min-w-[12px] aspect-[2/1] 
              rounded-full transition-all duration-300 ease-in-out
              shadow-[inset_0_0_3px_rgba(0,0,0,0.2)]
              ${feeApplied ? 'bg-[#2a7a73]' : 'bg-[#ccc]'}
            `}
          >
            <div
              className={`
                absolute top-1/2 w-[40%] h-[70%] bg-white rounded-full
                -translate-y-1/2 transition-all duration-300 ease-in-out
                ${feeApplied ? 'left-[50%]' : 'left-[10%]'}
              `}
            />
          </div>

          <span className="text-sm text-[#333] text-left w-[80%]">
            Add ${feeTotal.toFixed(2)} to cover transaction fees and tip the
            fundraising platform to help keep it{' '}
            <a
              className="text-black"
              target="_blank"
              href="https://www.givelively.org/free#what-it-means"
              rel="noreferrer"
            >
              free for nonprofits.
            </a>
          </span>
        </div>

        <div className="flex p-[2%] justify-center items-center rounded-lg bg-[#efefef] text-[#b2b2b2] text-xs ml-[17.5%]">
          Edit Fees & Tips
        </div>

        <div data-testid="donation-total" className="font-bold">
          ${(feeApplied ? baseAmount + feeTotal : baseAmount).toFixed(2)}
        </div>
      </div>
    </div>
  );
};
