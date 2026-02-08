import { Button } from '@components/ui/button';
import React from 'react';

const ShareDialog = () => {
  return (
    <div>
      <Button
        variant="default"
        size="lg"
        className="bg-[#037a62] text-white font-bold p-6"
      >
        Spread the word!
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width="24"
          height="24"
          fill="none"
          stroke="#FFFFFF"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
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

export default ShareDialog;
