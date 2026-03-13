import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HeaderDetailModal } from '@components/HeaderDetailModal/HeaderDetailModal';
import bostonBg from '../../assets/green-boston-background.png';

export const Modal1Page: React.FC = () => {
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
        heading="Check your email"
        details="Instructions have been sent to your inbox."
        onSignInClick={handleSignIn}
      />
    </div>
  );
};
