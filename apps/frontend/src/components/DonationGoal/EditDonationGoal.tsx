'use client';

import { useState } from 'react';
import { Calendar } from 'lucide-react';

export default function EditDonationGoal() {
  const initialForm = {
    title: 'Donate to FCC',
    goalAmount: '$10,000',
    startDate: '',
  };

  const [form, setForm] = useState(initialForm);

  const handleResetGoal = () => {
    setForm(initialForm);
  };

  return (
    <div className="flex w-[397px] flex-col gap-6 rounded-[10px] border border-[#E5E5E5] bg-white p-6 shadow-sm">
      {/* Header */}
      <div className="flex w-full items-start justify-between">
        <h4 className="text-[20px] font-normal leading-[40px] tracking-[-0.2px] text-black">
          Edit Donation Goal
        </h4>

        <button
          type="button"
          onClick={handleResetGoal}
          className="flex items-center justify-center gap-[10px] rounded-[10px] bg-[#893C27] px-4 py-1 text-white hover:bg-[#893C27]/90"
        >
          Reset Goal
        </button>
      </div>

      {/* Title Field */}
      <div className="flex w-full flex-col gap-0.5">
        <label className="text-[14px] font-normal leading-6 text-[#171717]">
          Title
        </label>

        <input
          type="text"
          value={form.title}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, title: e.target.value }))
          }
          className="min-h-[36px] w-full rounded-[8px] border border-[#D4D4D4] bg-white px-3 py-[7.5px] text-[14px] font-normal leading-6 text-[#171717] shadow-sm placeholder:text-[#525252] focus:outline-none focus:ring-2 focus:ring-emerald-600"
        />
      </div>

      {/* Goal Amount Field */}
      <div className="flex w-full flex-col gap-0.5">
        <div className="flex w-full items-center justify-between">
          <label className="w-[174.5px] text-[14px] font-normal leading-6 text-[#171717]">
            Goal Amount
          </label>

          <p className="w-[174.5px] text-right text-[12px] font-normal leading-6 text-[#737373]">
            Currently raised: $8,000/$10,000
          </p>
        </div>

        <input
          type="text"
          value={form.goalAmount}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, goalAmount: e.target.value }))
          }
          className="min-h-[36px] w-full rounded-[8px] border border-[#D4D4D4] bg-white px-3 py-[7.5px] text-[14px] font-normal leading-6 text-[#171717] shadow-sm placeholder:text-[#525252] focus:outline-none focus:ring-2 focus:ring-emerald-600"
        />
      </div>

      {/* Start Date Field */}
      <div className="flex w-full flex-col gap-0.5">
        <label className="w-full text-[14px] font-normal leading-6 text-[#171717]">
          Start Date
        </label>

        <div className="relative">
          <Calendar className="pointer-events-none absolute left-3 top-1/2 h-[14px] w-[18px] -translate-y-1/2 text-[#404040]" />

          <input
            type="text"
            placeholder="MM/DD/YY"
            value={form.startDate}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, startDate: e.target.value }))
            }
            className="min-h-[36px] w-full rounded-[8px] border border-[#D4D4D4] bg-white py-[7.5px] pl-9 pr-3 text-[14px] font-normal leading-6 text-[#171717] shadow-sm placeholder:text-[#525252] focus:outline-none focus:ring-2 focus:ring-emerald-600"
          />
        </div>
      </div>

      {/* Bottom Buttons */}
      <div className="flex w-full gap-4">
        <button
          type="button"
          className="flex flex-1 items-center justify-center gap-[10px] rounded-[10px] border border-[#E5E5E5] bg-white px-4 py-1 text-[14px] font-normal leading-6 text-black hover:bg-neutral-50"
        >
          Cancel
        </button>

        <button
          type="button"
          className="flex flex-1 items-center justify-center gap-[10px] rounded-[10px] bg-[#007B64] px-4 py-1 text-[14px] font-normal leading-6 text-white hover:bg-[#007B64]/90"
        >
          Save
        </button>
      </div>
    </div>
  );
}
