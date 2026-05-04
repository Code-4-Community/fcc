import * as React from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { Button } from '@components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@components/ui/popover';
import { cn } from '@lib/utils';

const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

export type YearMonthValue =
  | { year: number; month: null }
  | { year: number; month: number }; // month is 1-indexed

interface YearMonthPickerProps {
  value?: YearMonthValue;
  onChange?: (value: YearMonthValue) => void;
  placeholder?: string;
}

function formatValue(value?: YearMonthValue): string {
  if (!value) return '';
  if (value.month === null) return String(value.year);
  return `${MONTHS[value.month - 1]} ${value.year}`;
}

export function YearMonthPicker({
  value,
  onChange,
  placeholder = 'Select period',
}: YearMonthPickerProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'w-[160px] justify-start text-left font-normal',
            !value && 'text-muted-foreground',
          )}
        >
          {value ? formatValue(value) : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <YearMonthPickerPanel
          value={value}
          onChange={(v) => {
            onChange?.(v);
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}

interface YearMonthPickerPanelProps {
  value?: YearMonthValue;
  onChange?: (value: YearMonthValue) => void;
}

export function YearMonthPickerPanel({
  value,
  onChange,
}: YearMonthPickerPanelProps) {
  const now = new Date();
  const curYear = now.getFullYear();
  const curMonth = now.getMonth(); // 0-indexed

  const [view, setView] = React.useState<'year' | 'month'>('year');
  const [rangeStart, setRangeStart] = React.useState(() => curYear - 11);
  const [selectedYear, setSelectedYear] = React.useState<number | null>(
    value?.year ?? null,
  );
  const [selectedMonth, setSelectedMonth] = React.useState<number | null>(
    value?.month != null ? value.month - 1 : null, // store 0-indexed internally
  );

  const years = Array.from({ length: 12 }, (_, i) => rangeStart + i);
  const canNextRange = rangeStart + 12 <= curYear;

  function handleApply() {
    if (selectedYear === null) return;
    if (view === 'year') {
      onChange?.({ year: selectedYear, month: null });
    } else {
      if (selectedMonth === null) return;
      onChange?.({ year: selectedYear, month: selectedMonth + 1 });
    }
  }

  function handlePrev() {
    if (view === 'year') {
      setRangeStart((r) => r - 12);
    } else {
      setSelectedYear((y) => (y !== null ? y - 1 : y));
      setSelectedMonth(null);
    }
  }

  function handleNext() {
    if (view === 'year') {
      if (canNextRange) setRangeStart((r) => r + 12);
    } else {
      if (selectedYear !== null && selectedYear < curYear) {
        setSelectedYear(selectedYear + 1);
        setSelectedMonth(null);
      }
    }
  }

  const canApply =
    selectedYear !== null && (view === 'year' || selectedMonth !== null);

  const headerLabel =
    view === 'year'
      ? `${years[0]}–${years[years.length - 1]}`
      : String(selectedYear);

  const nextDisabled =
    view === 'year'
      ? !canNextRange
      : selectedYear === null || selectedYear >= curYear;

  return (
    <div className="p-4 w-[280px] bg-white rounded-md shadow-md">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={handlePrev}
          className="flex items-center justify-center w-8 h-8 rounded-md border border-input bg-background hover:bg-muted transition-colors"
        >
          <ChevronLeftIcon className="h-4 w-4" />
        </button>
        <span className="text-sm font-medium">{headerLabel}</span>
        <button
          onClick={handleNext}
          disabled={nextDisabled}
          className={cn(
            'flex items-center justify-center w-8 h-8 rounded-md border border-input bg-background hover:bg-muted transition-colors',
            nextDisabled && 'opacity-30 cursor-not-allowed pointer-events-none',
          )}
        >
          <ChevronRightIcon className="h-4 w-4" />
        </button>
      </div>

      {view === 'year' ? (
        <div className="grid grid-cols-3 gap-2 mb-4">
          {years.map((y) => {
            const isFuture = y > curYear;
            const isSelected = y === selectedYear;
            return (
              <button
                key={y}
                disabled={isFuture}
                onClick={() => setSelectedYear(y)}
                className={cn(
                  'py-2 text-sm rounded-md border transition-colors',
                  isSelected
                    ? 'bg-[#007B64] text-white border-[#007B64]'
                    : isFuture
                      ? 'text-muted-foreground border-border opacity-40 cursor-not-allowed'
                      : 'border-border hover:bg-muted',
                )}
              >
                {y}
              </button>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2 mb-4">
          {MONTHS.map((m, i) => {
            const isFuture = selectedYear === curYear && i > curMonth;
            const isSelected = i === selectedMonth;
            return (
              <button
                key={m}
                disabled={isFuture}
                onClick={() => setSelectedMonth(i)}
                className={cn(
                  'py-2 text-sm rounded-md border transition-colors',
                  isSelected
                    ? 'bg-[#007B64] text-white border-[#007B64]'
                    : isFuture
                      ? 'text-muted-foreground border-border opacity-40 cursor-not-allowed'
                      : 'border-border hover:bg-muted',
                )}
              >
                {m}
              </button>
            );
          })}
        </div>
      )}

      <div className="flex flex-col gap-2">
        {view === 'year' && (
          <button
            disabled={selectedYear === null}
            onClick={() => {
              if (selectedYear !== null) {
                setView('month');
                setSelectedMonth(null);
              }
            }}
            className={cn(
              'w-full py-2.5 text-sm rounded-md border border-input bg-background transition-colors',
              selectedYear !== null
                ? 'hover:bg-muted cursor-pointer'
                : 'opacity-40 cursor-not-allowed',
            )}
          >
            Select Month →
          </button>
        )}
        <button
          disabled={!canApply}
          onClick={handleApply}
          className={cn(
            'w-full py-2.5 text-sm font-medium rounded-md border transition-colors',
            canApply
              ? 'bg-[#007B64] border-[#007B64] text-white hover:bg-[#005a4d] cursor-pointer'
              : 'bg-muted text-muted-foreground border-border opacity-40 cursor-not-allowed',
          )}
        >
          Apply Dates
        </button>
      </div>
    </div>
  );
}
