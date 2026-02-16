import { Button } from '@components/ui/button';
import React, { useState } from 'react';
import ShareIcon from '@containers/ShareIcon';
import Facebook_icon from '../../components/ShareOptionsImages/Facebook_icon.png';
import X_icon from '../../components/ShareOptionsImages/X_icon.png';
import Linkedin_icon from '../../components/ShareOptionsImages/Linkedin_icon.png';

const ShareOptions = () => {
  const [isCopying, setIsCopying] = useState(false);

  const handleSpreadTheWordClick = async () => {
    const message = `Want to support your community? Join me in donating to the Fenway Community Center!\n${window.location.href}`;
    try {
      setIsCopying(true);
      await navigator.clipboard.writeText(message);
      setTimeout(() => setIsCopying(false), 1000);
    } catch (err) {
      console.error('Failed to copy message to clipboard');
      alert('Failed to copy message to clipboard');
    }
  };

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
          marginTop: '1.5rem',
        }}
        className="flex-1 gap-3 rounded-[10px] m-auto min-h-[2.5rem] flex justify-center items-center text-center text-[1.3rem] hover:opacity-90 transition-opacity"
        onClick={handleSpreadTheWordClick}
      >
        {isCopying ? 'Copied!' : 'Spread the word!'}
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
          style={{
            marginLeft: '10px',
            fontWeight: 'bold',
          }}
        >
          <path
            fill="none"
            d="M12 2v13m4-9l-4-4l-4 4m-4 6v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"
          />
        </svg>
      </Button>
      <div className="flex justify-center">
        <ShareIcon icon={Facebook_icon} />
        <ShareIcon icon={X_icon} />
        <ShareIcon icon={Linkedin_icon} />
      </div>
    </div>
  );
};

export default ShareOptions;
