import { Label } from '@components/ui/label';

type ToggleSwitchProps = {
  label: string;
  description: string;
  checked: boolean;
  onToggle: () => void;
  disabled?: boolean;
};

export const ToggleSwitch = ({
  label,
  description,
  checked,
  onToggle,
  disabled = false,
}: ToggleSwitchProps) => {
  return (
    <div className="flex flex-col w-full">
      <Label className="text-lg text-[#57585c] font-normal">{label}</Label>

      <div className="flex flex-row items-center justify-between w-full">
        <span className="text-base text-[#333] whitespace-nowrap">
          {description}
        </span>

        <div
          className={`flex items-center ml-4 ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
          role="switch"
          aria-checked={checked}
          onClick={() => !disabled && onToggle()}
        >
          <div
            className={`relative flex-shrink-0 w-10 aspect-[2/1] rounded-full transition-all duration-300 ease-in-out
            ${checked ? 'border-2 border-[#2C8974] bg-[#F0F0F0]' : 'bg-gray-300'}`}
          >
            <div
              className={`absolute top-1/2 w-[40%] h-[70%] rounded-full -translate-y-1/2 transition-all duration-300 ease-in-out
              ${checked ? 'bg-[#2C8974] left-[50%]' : 'bg-white left-[10%]'}`}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
