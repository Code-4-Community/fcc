import { useState } from 'react';

type DateSort = 'most-recent' | 'oldest' | null;
type AmountSort = 'greatest' | 'least' | null;

const INITIAL_DATE_SORT: DateSort = 'most-recent';
const INITIAL_AMOUNT_SORT: AmountSort = null;

export const SortModal = () => {
  const [dateSort, setDateSort] = useState<DateSort>(INITIAL_DATE_SORT);
  const [amountSort, setAmountSort] = useState<AmountSort>(INITIAL_AMOUNT_SORT);

  const handleReset = () => {
    setDateSort(null);
    setAmountSort(null);
  };
  const handleApply = () => {
    // TODO: wire up apply logic
  };

  const labelClass =
    "text-black text-xs font-normal font-['Source_Sans_Pro'] leading-4";
  const optionLabelClass =
    "text-black text-[10px] font-normal font-['Source_Sans_Pro'] leading-4";

  const RadioOption = ({
    label,
    checked,
    onClick,
    top,
    boxTop,
  }: {
    label: string;
    checked: boolean;
    onClick: () => void;
    top: string;
    boxTop: string;
  }) => (
    <div onClick={onClick} className="cursor-pointer">
      {/* Box */}
      <div
        className="w-48 h-7 left-[21.43px] absolute bg-white rounded-[5px] shadow-[0px_0px_4px_0px_rgba(0,0,0,0.25)]"
        style={{ top: boxTop }}
      />
      {/* Radio circle */}
      <div
        className="w-3 h-3 left-[31.38px] absolute rounded-full flex items-center justify-center"
        style={{
          top,
          outline: `1px solid ${checked ? '#24A0ED' : '#737373'}`,
        }}
      >
        {checked && <div className="w-2 h-2 bg-sky-500 rounded-full" />}
      </div>
      {/* Label */}
      <div
        className={`w-32 h-4 left-[52.39px] absolute justify-start ${optionLabelClass}`}
        style={{ top: `calc(${top} - 1px)` }}
      >
        {label}
      </div>
    </div>
  );

  return (
    <div className="w-60 h-72 relative bg-white rounded-xl shadow-[0px_0px_4px_1px_rgba(0,0,0,0.25)] overflow-hidden">
      {/* Date Label */}
      <div
        className={`w-7 h-5 left-[21.43px] top-[16.15px] absolute justify-start ${labelClass}`}
      >
        Date
      </div>

      <RadioOption
        label="Most Recent - Oldest"
        checked={dateSort === 'most-recent'}
        onClick={() => setDateSort('most-recent')}
        boxTop="42.65px"
        top="52.59px"
      />

      <RadioOption
        label="Oldest - Most Recent"
        checked={dateSort === 'oldest'}
        onClick={() => setDateSort('oldest')}
        boxTop="84.62px"
        top="94.56px"
      />

      {/* Amount Label */}
      <div
        className={`w-32 h-5 left-[21.43px] top-[126.58px] absolute justify-start ${labelClass}`}
      >
        Amount
      </div>

      <RadioOption
        label="Greatest - Least"
        checked={amountSort === 'greatest'}
        onClick={() => setAmountSort('greatest')}
        boxTop="153.08px"
        top="163.02px"
      />

      <RadioOption
        label="Least - Greatest"
        checked={amountSort === 'least'}
        onClick={() => setAmountSort('least')}
        boxTop="195.05px"
        top="204.99px"
      />

      {/* Reset Button */}
      <button
        onClick={handleReset}
        className="w-14 h-8 px-4 py-1 left-[21.43px] top-[248.06px] absolute bg-white rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-200 inline-flex justify-center items-center gap-2.5 cursor-pointer hover:bg-neutral-50 active:bg-neutral-100 transition-colors"
      >
        <span className="text-center text-black text-xs font-normal font-['Source_Sans_Pro'] leading-6">
          Reset
        </span>
      </button>

      {/* Apply Button */}
      <button
        onClick={handleApply}
        className="w-14 h-8 px-4 py-1 left-[159.65px] top-[248.06px] absolute bg-emerald-700 rounded-lg inline-flex justify-center items-center gap-2.5 cursor-pointer hover:bg-emerald-800 active:bg-emerald-900 transition-colors"
      >
        <span className="text-center text-white text-xs font-normal font-['Source_Sans_Pro'] leading-6">
          Apply
        </span>
      </button>
    </div>
  );
};
