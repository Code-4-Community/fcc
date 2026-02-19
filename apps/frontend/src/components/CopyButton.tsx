import { Button } from '@components/ui/button';
import React from 'react';

interface CopyButtonProps {
  text: string;
  copyAction: () => void;
}

const CopyButton = ({ text, copyAction }: CopyButtonProps) => {
  return (
    <div>
      <Button
        variant="unstyled"
        size="sm"
        style={{
          backgroundColor: '#007b64',
          color: 'white',
          padding: '1.5rem',
          fontWeight: 'bold',
        }}
        className="w-[13rem] gap-3 rounded-[10px] min-h-[2.5rem] flex justify-center items-center text-center text-[1.3rem] hover:opacity-90 transition-opacity"
        onClick={copyAction}
      >
        {text}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width="24"
          height="24"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ marginLeft: '10px' }}
        >
          <path
            fill="none"
            d="M12 2v13m4-9l-4-4l-4 4m-4 6v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"
          />
        </svg>
      </Button>
    </div>
  );
};

export default CopyButton;
