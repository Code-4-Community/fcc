import { useState } from 'react';
import { Calendar } from 'lucide-react';

interface RecurrenceOption {
  id: string;
  label: string;
  left: string;
  top: string;
  checkLeft: string;
  checkTop: string;
}

const RECURRENCE_OPTIONS: RecurrenceOption[] = [
  {
    id: 'one-time',
    label: 'One-Time',
    left: 'left-[20px]',
    top: 'top-[128px]',
    checkLeft: 'left-[29.03px]',
    checkTop: 'top-[136px]',
  },
  {
    id: 'weekly',
    label: 'Weekly',
    left: 'left-[126px]',
    top: 'top-[128px]',
    checkLeft: 'left-[136.03px]',
    checkTop: 'top-[136px]',
  },
  {
    id: 'monthly',
    label: 'Monthly',
    left: 'left-[20px]',
    top: 'top-[165px]',
    checkLeft: 'left-[29.03px]',
    checkTop: 'top-[173px]',
  },
  {
    id: 'yearly',
    label: 'Yearly',
    left: 'left-[126px]',
    top: 'top-[165px]',
    checkLeft: 'left-[136.03px]',
    checkTop: 'top-[173px]',
  },
];

const LABEL_POSITIONS: Record<string, { left: string; top: string }> = {
  'one-time': { left: 'left-[49.23px]', top: 'top-[136px]' },
  weekly: { left: 'left-[157px]', top: 'top-[136px]' },
  monthly: { left: 'left-[49px]', top: 'top-[173px]' },
  yearly: { left: 'left-[157px]', top: 'top-[173px]' },
};

const INITIAL_SELECTED = {
  'one-time': true,
  weekly: true,
  monthly: true,
  yearly: true,
};

const INITIAL_RANGE: [number, number] = [0, 1000];

export const DonationInformationModal = () => {
  const [selected, setSelected] =
    useState<Record<string, boolean>>(INITIAL_SELECTED);
  const [amountRange, setAmountRange] =
    useState<[number, number]>(INITIAL_RANGE);
  const [amountFrom, setAmountFrom] = useState('');
  const [amountTo, setAmountTo] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const toggleOption = (id: string) => {
    setSelected((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleReset = () => {
    setSelected(INITIAL_SELECTED);
    setAmountRange(INITIAL_RANGE);
    setAmountFrom('');
    setAmountTo('');
    setDateFrom('');
    setDateTo('');
  };

  const handleApply = () => {
    // TODO: wire up apply logic
  };

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    if (value < amountRange[1]) {
      setAmountRange([value, amountRange[1]]);
    }
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    if (value > amountRange[0]) {
      setAmountRange([amountRange[0], value]);
    }
  };

  const formatDate = (value: string) => {
    if (!value) return '';
    const [year, month, day] = value.split('-');
    return `${month}/${day}/${year}`;
  };

  const placeholderLabelClass =
    "text-neutral-500 text-[10px] font-normal font-['Source_Sans_Pro'] leading-4";
  const blackLabelClass =
    "text-black text-[10px] font-normal font-['Source_Sans_Pro'] leading-4";

  const DateBox = ({
    label,
    value,
    onChange,
    left,
  }: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    left: string;
  }) => (
    <div
      className={`w-24 h-10 ${left} top-[46px] absolute bg-white rounded-[5px] border border-neutral-300 flex flex-col justify-between pt-1 pl-[9px] pr-[11px] pb-1.5`}
    >
      <div className={`w-7 justify-start ${placeholderLabelClass}`}>
        {label}
      </div>
      <div className="flex items-center gap-[8.25px]">
        <Calendar
          className="shrink-0 text-black"
          style={{ width: '10.732px', height: '10.745px' }}
        />
        <div className="relative flex-1 h-4">
          <span
            className={`absolute inset-0 ${blackLabelClass} pointer-events-none`}
          >
            {value ? formatDate(value) : 'MM/DD/YYYY'}
          </span>
          <input
            type="date"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-60 h-96 relative bg-white rounded-xl shadow-[0px_0px_5px_1px_rgba(0,0,0,0.25)] overflow-hidden">
      {/* Date Label */}
      <div className="w-32 left-[20px] top-[21px] absolute justify-start text-black text-xs font-normal font-['Source_Sans_Pro'] leading-4">
        Date
      </div>

      <DateBox
        label="From"
        value={dateFrom}
        onChange={setDateFrom}
        left="left-[20px]"
      />
      <DateBox
        label="To"
        value={dateTo}
        onChange={setDateTo}
        left="left-[126px]"
      />

      {/* Recurrence Label */}
      <div className="w-16 left-[20px] top-[103px] absolute justify-start text-black text-xs font-normal font-['Source_Sans_Pro'] leading-4">
        Recurrence
      </div>

      {/* Recurrence Checkboxes */}
      {RECURRENCE_OPTIONS.map((option) => (
        <div
          key={option.id}
          onClick={() => toggleOption(option.id)}
          className="cursor-pointer"
        >
          <div
            className={`w-24 h-7 ${option.left} ${option.top} absolute bg-white rounded-[5px] border border-neutral-300`}
          />
          <div
            className={`w-3.5 h-3.5 ${option.checkLeft} ${option.checkTop} absolute rounded-[3px] flex items-center justify-center`}
            style={{
              backgroundColor: selected[option.id] ? '#047857' : '#ffffff',
              border: `1px solid ${selected[option.id] ? '#047857' : '#D4D4D4'}`,
            }}
          >
            {selected[option.id] && (
              <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                <path
                  d="M1 3L3 5L7 1"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </div>
          <div
            className={`${LABEL_POSITIONS[option.id].left} ${LABEL_POSITIONS[option.id].top} absolute justify-start ${blackLabelClass}`}
          >
            {option.label}
          </div>
        </div>
      ))}

      {/* Amount Label */}
      <div className="w-32 left-[20px] top-[219px] absolute justify-start text-black text-xs font-normal font-['Source_Sans_Pro'] leading-4">
        Amount
      </div>

      {/* Slider Track */}
      <div className="w-48 h-[1.5px] left-[20px] top-[252px] absolute bg-neutral-900" />

      {/* Slider Min */}
      <input
        type="range"
        min={0}
        max={1000}
        value={amountRange[0]}
        onChange={handleMinChange}
        style={{
          position: 'absolute',
          left: '20px',
          top: '248px',
          width: '192px',
          zIndex: 5,
          WebkitAppearance: 'none',
          background: 'transparent',
        }}
        className="appearance-none bg-transparent cursor-pointer
    [&::-webkit-slider-runnable-track]:bg-transparent
    [&::-webkit-slider-runnable-track]:h-0
    [&::-webkit-slider-thumb]:appearance-none
    [&::-webkit-slider-thumb]:w-2.5
    [&::-webkit-slider-thumb]:h-2.5
    [&::-webkit-slider-thumb]:rounded-full
    [&::-webkit-slider-thumb]:bg-white
    [&::-webkit-slider-thumb]:border-[1.5px]
    [&::-webkit-slider-thumb]:border-black
    [&::-webkit-slider-thumb]:cursor-pointer
    [&::-webkit-slider-thumb]:shadow-[0_0_0_1.5px_black]"
      />

      {/* Slider Max */}
      <input
        type="range"
        min={0}
        max={1000}
        value={amountRange[1]}
        onChange={handleMaxChange}
        style={{
          position: 'absolute',
          left: '20px',
          top: '248px',
          width: '192px',
          zIndex: 4,
          WebkitAppearance: 'none',
          background: 'transparent',
        }}
        className="appearance-none bg-transparent cursor-pointer
    [&::-webkit-slider-runnable-track]:bg-transparent
    [&::-webkit-slider-runnable-track]:h-0
    [&::-webkit-slider-thumb]:appearance-none
    [&::-webkit-slider-thumb]:w-2.5
    [&::-webkit-slider-thumb]:h-2.5
    [&::-webkit-slider-thumb]:rounded-full
    [&::-webkit-slider-thumb]:bg-white
    [&::-webkit-slider-thumb]:border-[1.5px]
    [&::-webkit-slider-thumb]:border-black
    [&::-webkit-slider-thumb]:cursor-pointer
    [&::-webkit-slider-thumb]:shadow-[0_0_0_1.5px_black]"
      />
      {/* Min Label */}
      <div
        className={`w-7 h-3.5 left-[20px] top-[260px] absolute justify-start ${blackLabelClass}`}
      >
        Min
      </div>

      {/* Max Label */}
      <div
        className={`w-7 h-3.5 left-[204px] top-[260px] absolute justify-start ${blackLabelClass}`}
      >
        Max
      </div>

      {/* Amount From Box */}
      <div className="w-24 h-9 left-[20px] top-[284px] absolute bg-white rounded-[5px] border border-neutral-300 flex flex-col justify-between pt-1 pl-[9px] pr-[11px] pb-8">
        <div className={`w-7 justify-start ${placeholderLabelClass}`}>From</div>
        <input
          type="text"
          value={amountFrom}
          onChange={(e) => setAmountFrom(e.target.value)}
          className={`w-full bg-transparent border-none outline-none ${blackLabelClass}`}
        />
      </div>

      {/* Amount To Box */}
      <div className="w-24 h-9 left-[126px] top-[284px] absolute bg-white rounded-[5px] border border-neutral-300 flex flex-col justify-between pt-1 pl-[9px] pr-[11px] pb-8">
        <div className={`w-7 justify-start ${placeholderLabelClass}`}>To</div>
        <input
          type="text"
          value={amountTo}
          onChange={(e) => setAmountTo(e.target.value)}
          className={`w-full bg-transparent border-none outline-none ${blackLabelClass}`}
        />
      </div>

      {/* Reset Button */}
      <button
        onClick={handleReset}
        className="w-12 h-7 px-4 py-1 left-[20px] top-[339px] absolute bg-white rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-200 inline-flex justify-center items-center gap-2.5 cursor-pointer hover:bg-neutral-50 active:bg-neutral-100 transition-colors"
      >
        <span className="text-center text-black text-xs font-normal font-['Source_Sans_Pro'] leading-6">
          Reset
        </span>
      </button>

      {/* Apply Button */}
      <button
        onClick={handleApply}
        className="w-14 h-7 px-4 py-1 left-[168px] top-[339px] absolute bg-emerald-700 rounded-lg inline-flex justify-center items-center gap-2.5 cursor-pointer hover:bg-emerald-800 active:bg-emerald-900 transition-colors"
      >
        <span className="text-center text-white text-xs font-normal font-['Source_Sans_Pro'] leading-6">
          Apply
        </span>
      </button>
    </div>
  );
};
