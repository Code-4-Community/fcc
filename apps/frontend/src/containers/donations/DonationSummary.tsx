type DonationSummaryProps = {
  baseAmount: number;
  coverFees: boolean;
  onCoverFeesChange: (value: boolean) => void;
  feeRate?: number;
  fixedFee?: number;
};

export const DONATION_FEE_RATE = 2.9; // percent
export const DONATION_FIXED_FEE = 0.3; // dollars

/**
 * The processing fee a donor covers so the org nets the full base amount.
 * Uses the gross-up formula (fee is charged on the total, not just the base):
 *   charged = (base + fixed) / (1 - rate)   ->   feeTotal = charged - base
 * Returns 0 for non-positive amounts.
 */
export const calculateFeeTotal = (
  baseAmount: number,
  feeRate: number = DONATION_FEE_RATE,
  fixedFee: number = DONATION_FIXED_FEE,
): number => {
  if (baseAmount <= 0) return 0;
  const charged = (baseAmount + fixedFee) / (1 - feeRate / 100);
  return charged - baseAmount;
};

/**
 * The amount actually charged: base plus the covered fee (rounded to cents)
 * when fee coverage is on, otherwise the base. Single source of truth for the
 * donation summary display, the Stripe charge, and the recorded donation.
 */
export const calculateChargeAmount = (
  baseAmount: number,
  coverFees: boolean,
  feeRate: number = DONATION_FEE_RATE,
  fixedFee: number = DONATION_FIXED_FEE,
): number => {
  if (!coverFees || baseAmount <= 0) return baseAmount;
  const charge = baseAmount + calculateFeeTotal(baseAmount, feeRate, fixedFee);
  return Math.round(charge * 100) / 100;
};

export const DonationSummary = ({
  baseAmount,
  coverFees,
  onCoverFeesChange,
  feeRate,
  fixedFee,
}: DonationSummaryProps) => {
  const feeTotal = calculateFeeTotal(baseAmount, feeRate, fixedFee);

  const handleToggle = () => {
    onCoverFeesChange(!coverFees);
  };

  const feeText = `Add $${feeTotal.toFixed(2)} to cover transaction fees and help keep it `;

  const toggleClass = coverFees
    ? 'border-2 border-[#2C8974] bg-[#F0F0F0]'
    : 'bg-gray-300';

  const circleClass = coverFees
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
    </div>
  );
};
