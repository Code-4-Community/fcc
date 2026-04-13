'use client';

import { useState } from 'react';
import { Calendar } from 'lucide-react';
import { Button } from '../ui/button';

interface EditDonationGoalProps {
  initialData?: {
    title?: string;
    goalAmount?: string;
    startDate?: string;
    endDate?: string;
  };
  onCancel?: () => void;
  onSave?: (data: any) => void;
}

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
    if (
      window.confirm(
        'Are you sure you want to save these changes to the live donation goal?',
      )
    ) {
      onSave?.(form);
    }
  };

  return (
    <div
      className="flex aspect-[7/10] w-full flex-col gap-3 rounded-[10px] border border-[#E5E5E5] bg-[#FCFCFC] p-4 font-['Source_Sans_Pro'] shadow-[0px_4px_12px_rgba(0,0,0,0.1)]"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="mb-1 flex w-full items-start justify-between border-b border-[#E5E5E5] pb-2">
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
      <div className="flex w-full flex-col gap-1">
        <label className="text-[13px] font-normal leading-tight text-[#171717]">
          Title displayed on{' '}
          <span className="font-bold">live donation site</span>
        </label>

        <input
          type="text"
          value={form.title}
          placeholder="Enter goal title..."
          onChange={(e) =>
            setForm((prev) => ({ ...prev, title: e.target.value }))
          }
          className="h-[32px] w-full rounded-[6px] border border-[#D4D4D4] bg-white px-3 text-[13px] font-normal text-[#171717] shadow-sm focus:outline-none focus:ring-1 focus:ring-emerald-600"
        />
      </div>

      {/* Goal Amount Field */}
      <div className="flex w-full flex-col gap-1">
        <div className="flex w-full items-center justify-between">
          <label className="text-[13px] font-normal leading-tight text-[#171717]">
            Goal Amount
          </label>

          <p className="text-right text-[11px] font-normal text-[#737373]">
            Currently raised: $8,000/$10,000
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
      <div className="flex w-full flex-col gap-1">
        <label className="text-[13px] font-normal leading-tight text-[#171717]">
          Start Date
        </label>

        <div className="relative">
          <Calendar className="pointer-events-none absolute left-2 top-1/2 h-[14px] w-[14px] -translate-y-1/2 text-[#404040]" />

          <input
            type="text"
            placeholder="YYYY-MM-DD or YYYY/MM/DD"
            value={form.startDate}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, startDate: e.target.value }))
            }
            className="h-[32px] w-full rounded-[6px] border border-[#D4D4D4] bg-white pl-8 pr-3 text-[13px] font-normal text-[#171717] shadow-sm placeholder:text-[#525252] focus:outline-none focus:ring-1 focus:ring-emerald-600"
          />
        </div>
      </div>

      {/* End Date Field */}
      <div className="flex w-full flex-col gap-1">
        <label className="text-[13px] font-normal leading-tight text-[#171717]">
          End Date
        </label>

        <div className="relative">
          <Calendar className="pointer-events-none absolute left-2 top-1/2 h-[14px] w-[14px] -translate-y-1/2 text-[#404040]" />

          <input
            type="text"
            placeholder="YYYY-MM-DD or YYYY/MM/DD"
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
      <div className="flex w-full gap-2">
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
