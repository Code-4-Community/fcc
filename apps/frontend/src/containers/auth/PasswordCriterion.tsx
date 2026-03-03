import { Check, X } from 'lucide-react';
import React from 'react';

interface PasswordCriterionProps {
  name: string;
  criterionMet: boolean;
}

export const PasswordCriterion: React.FC<PasswordCriterionProps> = ({
  name,
  criterionMet,
}) => {
  const Icon = criterionMet ? Check : X;
  const color = criterionMet ? '#12BA82' : '#737373';

  return (
    <div className="flex items-center gap-2 rounded-full border border-[#E5E5E5] py-1 px-3">
      <div
        className="flex items-center justify-center rounded-full"
        style={{
          backgroundColor: color,
          width: 20,
          height: 20,
        }}
      >
        <Icon className="w-3 h-3 text-white" strokeWidth={4} />
      </div>
      <p style={{ color }}>{name}</p>
    </div>
  );
};
