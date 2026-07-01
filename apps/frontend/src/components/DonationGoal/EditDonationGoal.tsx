'use client';

import { useState } from 'react';
import { Calendar } from 'lucide-react';

interface EditDonationGoalProps {
  initialData?: {
    title?: string;
    goalAmount?: string;
    startDate?: string;
    endDate?: string;
    amountRaised?: number;
    targetAmount?: number;
  };
  onCancel?: () => void;
  onSave?: (data: NormalizedGoal) => void;
}

// Cleaned, validated payload handed to onSave: numeric amount and ISO
// (YYYY-MM-DD) dates so consumers don't have to re-parse display strings.
interface NormalizedGoal {
  title: string;
  targetAmount: number;
  startDate: string;
  endDate: string;
}

const TITLE_MAX_LENGTH = 100;

export default function EditDonationGoal({
  initialData,
  onCancel,
  onSave,
}: EditDonationGoalProps) {
  const initialForm = {
    title: initialData?.title || '',
    goalAmount: initialData?.goalAmount || '',
    startDate: initialData?.startDate || '',
    endDate: initialData?.endDate || '',
  };

  const [form, setForm] = useState(initialForm);

  // Parses an MM/DD/YYYY string into a Date, returning null if the string
  // isn't a real calendar date (rejects things like 13/40/2026 or 02/30/2026).
  const parseDate = (value: string): Date | null => {
    const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value.trim());
    if (!match) return null;

    const month = Number(match[1]);
    const day = Number(match[2]);
    const year = Number(match[3]);

    const date = new Date(year, month - 1, day);
    if (
      date.getFullYear() !== year ||
      date.getMonth() !== month - 1 ||
      date.getDate() !== day
    ) {
      return null;
    }

    return date;
  };

  // Formats a Date as a local YYYY-MM-DD string (no timezone shift).
  const toISODate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Validates the form and, if valid, returns a normalized payload.
  // Returns null (after alerting the user) when anything fails to validate.
  const buildPayload = (): NormalizedGoal | null => {
    // Title: optional, but trim whitespace and cap the length. An empty
    // title is allowed — the live site falls back to its generic heading.
    const title = form.title.trim();
    if (title.length > TITLE_MAX_LENGTH) {
      window.alert(`Title must be ${TITLE_MAX_LENGTH} characters or fewer.`);
      return null;
    }

    // Amount: required, finite, positive, whole dollars (the goal amount is
    // stored as an integer, so cents aren't supported).
    const amountValue = form.goalAmount.replace(/[$,]/g, '').trim();
    if (!amountValue) {
      window.alert('Goal amount is required.');
      return null;
    }
    const amount = Number(amountValue);
    if (!Number.isFinite(amount)) {
      window.alert('Enter a valid goal amount.');
      return null;
    }
    if (amount <= 0) {
      window.alert('Goal amount must be greater than $0.');
      return null;
    }
    if (!Number.isInteger(amount)) {
      window.alert('Goal amount must be a whole dollar amount.');
      return null;
    }

    // Dates: both required, must be real MM/DD/YYYY calendar dates, end not
    // before start, and the goal can't end in the past.
    const start = parseDate(form.startDate);
    const end = parseDate(form.endDate);

    if (!form.startDate.trim()) {
      window.alert('Start date is required.');
      return null;
    }
    if (!start) {
      window.alert('Enter a valid start date in MM/DD/YYYY format.');
      return null;
    }

    if (!form.endDate.trim()) {
      window.alert('End date is required.');
      return null;
    }
    if (!end) {
      window.alert('Enter a valid end date in MM/DD/YYYY format.');
      return null;
    }

    if (end < start) {
      window.alert('End date cannot be before the start date.');
      return null;
    }

    const startISO = toISODate(start);
    const endISO = toISODate(end);

    // Compare against "today" as a UTC date string, matching how the backend
    // determines the active goal (`new Date().toISOString().split('T')[0]`).
    // Dates are stored date-only, so a lexicographic YYYY-MM-DD compare is safe.
    const todayUTC = new Date().toISOString().split('T')[0];
    if (endISO < todayUTC) {
      window.alert('End date cannot be in the past.');
      return null;
    }

    return {
      title,
      targetAmount: amount,
      startDate: startISO,
      endDate: endISO,
    };
  };

  const handleResetGoal = () => {
    if (
      window.confirm(
        'Are you sure you want to reset the goal values to their original state?',
      )
    ) {
      setForm(initialForm);
    }
  };

  const handleSave = () => {
    const payload = buildPayload();
    if (!payload) return;

    if (
      window.confirm(
        'Are you sure you want to save these changes to the live donation goal?',
      )
    ) {
      onSave?.(payload);
    }
  };

  return (
    <div
      className="flex h-full w-full flex-col gap-3 overflow-y-auto rounded-[10px] border border-[#E5E5E5] bg-[#FCFCFC] p-4 font-['Source_Sans_Pro'] shadow-[0px_4px_12px_rgba(0,0,0,0.1)]"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="mb-1 flex w-full shrink-0 items-start justify-between border-b border-[#E5E5E5] pb-2">
        <h4 className="text-[18px] font-semibold leading-tight tracking-[-0.2px] text-black">
          Edit Donation Goal
        </h4>

        <button
          type="button"
          onClick={handleResetGoal}
          className="flex items-center justify-center gap-1 rounded-[6px] bg-[#893C27] px-2 py-1 text-[12px] font-normal text-white hover:bg-[#893C27]/90"
        >
          Reset Goal
        </button>
      </div>

      {/* Title Field */}
      <div className="flex w-full shrink-0 flex-col gap-1">
        <label className="text-[13px] font-normal leading-tight text-[#171717]">
          Title displayed on{' '}
          <span className="font-bold">live donation site</span>
        </label>

        <input
          type="text"
          value={form.title}
          maxLength={TITLE_MAX_LENGTH}
          placeholder="Enter goal title..."
          onChange={(e) =>
            setForm((prev) => ({ ...prev, title: e.target.value }))
          }
          className="h-[32px] w-full rounded-[6px] border border-[#D4D4D4] bg-white px-3 text-[13px] font-normal text-[#171717] shadow-sm focus:outline-none focus:ring-1 focus:ring-emerald-600"
        />
      </div>

      {/* Goal Amount Field */}
      <div className="flex w-full shrink-0 flex-col gap-1">
        <div className="flex w-full items-center justify-between">
          <label className="text-[13px] font-normal leading-tight text-[#171717]">
            Goal Amount
          </label>

          <p className="text-right text-[11px] font-normal text-[#737373]">
            Currently raised: $
            {initialData?.amountRaised?.toLocaleString() ?? '0'}/$
            {initialData?.targetAmount?.toLocaleString() ?? '0'}
          </p>
        </div>

        <input
          type="text"
          value={form.goalAmount}
          placeholder="$0.00"
          onChange={(e) =>
            setForm((prev) => ({ ...prev, goalAmount: e.target.value }))
          }
          className="h-[32px] w-full rounded-[6px] border border-[#D4D4D4] bg-white px-3 text-[13px] font-normal text-[#171717] shadow-sm focus:outline-none focus:ring-1 focus:ring-emerald-600"
        />
      </div>

      {/* Start Date Field */}
      <div className="flex w-full shrink-0 flex-col gap-1">
        <label className="text-[13px] font-normal leading-tight text-[#171717]">
          Start Date
        </label>

        <div className="relative">
          <Calendar className="pointer-events-none absolute left-2 top-1/2 h-[14px] w-[14px] -translate-y-1/2 text-[#404040]" />

          <input
            type="text"
            placeholder="MM/DD/YYYY"
            value={form.startDate}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, startDate: e.target.value }))
            }
            className="h-[32px] w-full rounded-[6px] border border-[#D4D4D4] bg-white pl-8 pr-3 text-[13px] font-normal text-[#171717] shadow-sm placeholder:text-[#525252] focus:outline-none focus:ring-1 focus:ring-emerald-600"
          />
        </div>
      </div>

      {/* End Date Field */}
      <div className="flex w-full shrink-0 flex-col gap-1">
        <label className="text-[13px] font-normal leading-tight text-[#171717]">
          End Date
        </label>

        <div className="relative">
          <Calendar className="pointer-events-none absolute left-2 top-1/2 h-[14px] w-[14px] -translate-y-1/2 text-[#404040]" />

          <input
            type="text"
            placeholder="MM/DD/YYYY"
            value={form.endDate}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, endDate: e.target.value }))
            }
            className="h-[32px] w-full rounded-[6px] border border-[#D4D4D4] bg-white pl-8 pr-3 text-[13px] font-normal text-[#171717] shadow-sm placeholder:text-[#525252] focus:outline-none focus:ring-1 focus:ring-emerald-600"
          />
        </div>
      </div>

      <div className="flex-grow" />

      {/* Bottom Buttons */}
      <div className="mt-auto flex w-full shrink-0 gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex h-[32px] flex-1 items-center justify-center rounded-[6px] border border-[#E5E5E5] bg-white text-[13px] font-normal text-black hover:bg-neutral-50"
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={handleSave}
          className="flex h-[32px] flex-1 items-center justify-center rounded-[6px] bg-[#007B64] text-[13px] font-normal text-white hover:bg-[#007B64]/90"
        >
          Save
        </button>
      </div>
    </div>
  );
}
