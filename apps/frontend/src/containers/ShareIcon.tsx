import { Button } from '@components/ui/button';
import React from 'react';

export interface ShareIconProps {
  icon: string;
  onClick?: () => void;
}

export const ShareIcon: React.FC<ShareIconProps> = ({ icon, onClick }) => {
  return (
    <Button
      size="xs"
      onClick={onClick}
      className="bg-inherit h-8 w-8 p-0 flex items-center justify-center mt-8"
    >
      <img
        src={icon}
        alt="Share Icon"
        style={{
          maxWidth: '2.5rem',
          height: 'auto',
          objectFit: 'contain',
          marginLeft: '1.2rem',
          marginRight: '1.2rem',
          marginTop: '2rem',
        }}
      />
    </Button>
  );
};

export default ShareIcon;
