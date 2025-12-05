import { useState } from 'react';
import './donations.css';

interface DonationSummaryData {
  setCurrentAmount: React.Dispatch<React.SetStateAction<number>>;
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
    <div className="donation-summary-container">
      <div className="donation-summary">
        <div
          data-testid="fee-toggle"
          className="toggle-container"
          onClick={() => {
            if (feeApplied) {
              setCurrentAmount(baseAmount);
            } else {
              setCurrentAmount(baseAmount + feeTotal);
            }
            setFeeApplied(!feeApplied);
          }}
        >
          <div className={`toggle-slider ${feeApplied ? 'on' : 'off'}`}>
            <div className="toggle-circle"></div>
          </div>
          <span className="toggle-label">
            Add ${feeTotal.toFixed(2)} to cover transaction fees and tip the
            fundraising platform to help keep it{' '}
            <a
              style={{ color: 'black' }}
              target="_blank"
              href="https://www.givelively.org/free#what-it-means"
              rel="noreferrer"
            >
              free for nonprofits.
            </a>
          </span>
        </div>
        <div className="toggle-fee-edit">Edit Fees & Tips</div>
      </div>
    </div>
  );
};
