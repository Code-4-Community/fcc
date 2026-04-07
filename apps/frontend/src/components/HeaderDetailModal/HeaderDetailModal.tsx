import React from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import fccLogo from '../../assets/fcc-logo.png';

interface HeaderDetailModalProps {
  heading: string;
  details: string;
  onSignInClick?: () => void;
}

export const HeaderDetailModal: React.FC<HeaderDetailModalProps> = ({
  heading,
  details,
  onSignInClick,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-[420px] bg-white shadow-2xl ring-0 rounded-[30px] px-5">
        <CardContent className="flex flex-col items-center gap-3 py-24 px-8 text-center">
          <img src={fccLogo} alt="FCC logo" className="w-[145px] h-[145px]" />
          <h1 className="text-2xl font-semibold text-[#0c7962]">{heading}</h1>
          <p className="w-full text-base text-neutral-500 text-left whitespace-pre-line leading-tight">
            {details}
          </p>
          <Button
            variant="success"
            onClick={onSignInClick}
            className="w-full h-12 text-base rounded-[50px] mt-5"
          >
            Sign in
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
