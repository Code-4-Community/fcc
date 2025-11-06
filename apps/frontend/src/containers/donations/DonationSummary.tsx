import { useState } from 'react';

interface DonationSummaryData {
  baseAmount: number;
}

const FEE_RATE: number = 2.9;
const FIXED_FEE: number = 0.3;

export const DonationSummary: React.FC<DonationSummaryData> = ({
  baseAmount,
}) => {
  const [fee, setFee] = useState<boolean>(false);
  const [amount, setAmount] = useState<number>(Number(baseAmount.toFixed(2)));

  const feeRate = Number(process.env.FEE_RATE) ?? FEE_RATE;
  const fixedFee = Number(process.env.FIXED_FEE) ?? FIXED_FEE;

  return (
    <div style={{ border: '2px solid black', padding: '8px' }}>
      <label>Total: {amount}</label>
      <div
        className="toggle-container"
        onClick={() => {
          if (fee) {
            setAmount(Number(baseAmount.toFixed(2)));
          }
          // fee is applied
          else {
            const fee = (baseAmount * feeRate) / 100 + fixedFee;
            setAmount(Number((baseAmount + fee).toFixed(2)));
          }
          setFee(!fee);
        }}
      >
        <div className={`toggle-slider ${fee ? 'on' : 'off'}`}>
          <div className="toggle-circle"></div>
        </div>
        <span className="toggle-label">
          ${Number(feeRate.toFixed(2))} transaction fee
        </span>
      </div>
    </div>
  );
};
