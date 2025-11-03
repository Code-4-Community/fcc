import { useState } from 'react';

interface DonationSummaryData {
  baseAmount: number;
  feeRate?: number;
  fixedFee?: number;
}

export const DonationSummary: React.FC<DonationSummaryData> = ({
  baseAmount,
  feeRate = 2.9,
  fixedFee = 0.3,
}) => {
  const [fee, setFee] = useState<boolean>(false);
  const [amount, setAmount] = useState<number>(Number(baseAmount.toFixed(2)));

  return (
    <>
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
    </>
  );
};
