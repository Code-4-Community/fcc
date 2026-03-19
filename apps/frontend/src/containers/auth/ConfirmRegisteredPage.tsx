import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HeaderDetailModal } from '@components/HeaderDetailModal/HeaderDetailModal';
import bostonBg from '../../assets/green-boston-background.png';

export const ConfirmRegisteredPage: React.FC = () => {
  const navigate = useNavigate();

  const handleSignIn = () => {
    navigate('/');
  };

  return (
    <div className="relative min-h-screen w-full bg-[#007B64]">
      <div
        className="absolute inset-0 bg-no-repeat bg-cover bg-center opacity-30"
        style={{ backgroundImage: `url(${bostonBg})` }}
      />
      <HeaderDetailModal
        heading="Welcome!"
        details={
          'Your account has been successfully created.\n\nPlease wait for confirmation that your account has been verified by an admin.'
        }
        onSignInClick={handleSignIn}
      />
    </div>
  );
};
