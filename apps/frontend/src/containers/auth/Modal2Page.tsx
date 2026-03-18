import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HeaderDetailModal } from '@components/HeaderDetailModal/HeaderDetailModal';
import bostonBg from '../../assets/green-boston-background.png';

export const Modal2Page: React.FC = () => {
  const navigate = useNavigate();

  const handleSignIn = () => {
    navigate('/');
  };

  return (
    <div
      className="relative min-h-screen w-full bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${bostonBg})` }}
    >
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
