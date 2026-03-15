import { cn } from '@lib/utils';
import { Label } from '@components/ui/label';
import { Button } from '@components/ui/button';
import { Textarea } from '@components/ui/textarea';
import { Checkbox } from '@components/ui/checkbox';
import type { DedicationKind } from '../donation-form.types';

type DedicationSectionProps = {
  dedicationKind: DedicationKind;
  dedicationMessage: string;
  showDedicationPublicly: boolean;
  isSubmitting: boolean;
  onDedicationKindClick: (kind: DedicationKind) => void;
  onMessageChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onShowPubliclyToggle: (checked: boolean) => void;
};

export const DedicationSection = ({
  dedicationKind,
  dedicationMessage,
  showDedicationPublicly,
  isSubmitting,
  onDedicationKindClick,
  onMessageChange,
  onShowPubliclyToggle,
}: DedicationSectionProps) => {
  const buttonClass =
    'flex-1 h-12 px-4 whitespace-nowrap rounded border text-base cursor-pointer transition-colors duration-150 ease-in-out font-semibold disabled:opacity-60 disabled:cursor-not-allowed';
  const activeClass = 'bg-[#007b64] text-white border-[#007b64]';
  const inactiveClass = 'bg-white text-black border-gray-300';

  return (
    <div className="flex flex-col w-full gap-4">
      <div className="flex w-full gap-4">
        <Button
          type="button"
          className={cn(
            buttonClass,
            dedicationKind === 'honor' ? activeClass : inactiveClass,
          )}
          onClick={() => onDedicationKindClick('honor')}
          disabled={isSubmitting}
        >
          In Honor Of
        </Button>

        <Button
          type="button"
          className={cn(
            buttonClass,
            dedicationKind === 'memory' ? activeClass : inactiveClass,
          )}
          onClick={() => onDedicationKindClick('memory')}
          disabled={isSubmitting}
        >
          In Memory Of
        </Button>
      </div>

      <Textarea
        id="dedicationMessage"
        name="dedicationMessage"
        value={dedicationMessage}
        onChange={onMessageChange}
        rows={4}
        disabled={isSubmitting}
        placeholder="Write a message.."
      />

      <div className="flex items-center gap-2 text-[#57585c] text-base font-normal">
        <Checkbox
          id="showDedicationPublicly"
          name="showDedicationPublicly"
          checked={showDedicationPublicly}
          onCheckedChange={(checked) => onShowPubliclyToggle(!!checked)}
          disabled={isSubmitting}
        />

        <Label htmlFor="showDedicationPublicly">
          Show dedication message publicly
        </Label>
      </div>
    </div>
  );
};
