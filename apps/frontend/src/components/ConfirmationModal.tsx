import React from 'react';
import { X } from 'lucide-react';
import { Button } from './ui/button';

export interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  heading: React.ReactNode;
  description: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?:
    | 'default'
    | 'outline'
    | 'secondary'
    | 'ghost'
    | 'destructive'
    | 'success'
    | 'share'
    | 'link'
    | 'unstyled';
  isConfirming?: boolean;
  position?: { top?: number; right?: number; bottom?: number; left?: number };
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  heading,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'success',
  isConfirming = false,
  position,
}) => {
  if (!isOpen) return null;

  const content = (
    <div
      className={`bg-white rounded-xl ${position ? 'shadow-2xl border border-[#e5e5e5]' : 'shadow-lg'} w-[440px] max-w-full overflow-hidden`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-6 pb-4">
        <h2 className="text-xl font-semibold text-[#171717]">{title}</h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 transition-colors"
          aria-label="Close modal"
        >
          <X size={20} strokeWidth={2} />
        </button>
      </div>

      {/* Body */}
      <div className="px-6 pb-8">
        <h3 className="text-lg font-semibold text-[#171717] mb-2">{heading}</h3>
        <div className="text-[15px] leading-relaxed text-[#737373]">
          {description}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center gap-4 px-6 pb-6 mt-2">
        <Button
          variant="outline"
          onClick={onClose}
          disabled={isConfirming}
          className="flex-1 rounded-[10px] h-12 text-base font-normal border-[#e5e5e5] text-black bg-white hover:bg-gray-50 shadow-sm"
        >
          {cancelText}
        </Button>
        <Button
          variant={confirmVariant}
          onClick={onConfirm}
          disabled={isConfirming}
          className="flex-1 rounded-[10px] h-12 text-base font-normal"
        >
          {isConfirming ? 'Loading...' : confirmText}
        </Button>
      </div>
    </div>
  );

  if (position) {
    return (
      <>
        {/* Invisible backdrop to capture outside clicks and close the popover */}
        <div className="fixed inset-0 z-40" onClick={onClose} />
        <div
          className="fixed z-50 font-['Source_Sans_Pro']"
          style={{ ...position, position: 'fixed' }}
        >
          {content}
        </div>
      </>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm font-['Source_Sans_Pro']">
      {content}
    </div>
  );
};
