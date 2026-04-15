import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent } from '@components/ui/card';
import { Button } from '@components/ui/button';
import bostonBg from '../../assets/green-boston-background.png';
import fccLogo from '../../assets/fcc-logo.png';
import { ResetPasswordForm } from './ResetPasswordForm';

export const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const email = (location.state as { email?: string } | null)?.email;

  useEffect(() => {
    if (!email) {
      navigate('/login', { replace: true });
    }
  }, [email, navigate]);

  if (!email) {
    return null;
  }

  return (
    <div className="relative flex justify-center items-center min-h-screen bg-[#007B64]">
      <div
        className="absolute inset-0 bg-no-repeat bg-cover bg-center opacity-30"
        style={{ backgroundImage: `url(${bostonBg})` }}
      />
      <Card className="relative z-10 p-10 m-auto bg-white rounded-[50px] w-[32rem]">
        <CardContent className="p-0">
          <img
            src={fccLogo}
            alt="FCC Logo"
            className="w-36 h-36 object-contain m-auto"
          />
          <h1 className="text-4xl font-semibold text-[#007B64] text-center mt-4">
            Reset Password
          </h1>
          <p className="text-center text-sm text-gray-600 mt-2 mb-6">
            We've sent a confirmation code to your email. Enter it below with
            your new password.
          </p>

          <ResetPasswordForm
            email={email}
            onSuccess={() => {
              navigate('/login', {
                state: {
                  message: 'Password reset successfully. Please sign in.',
                },
              });
            }}
          />

          <div className="flex text-gray-500 justify-center items-center mt-4">
            <p>Return to </p>
            <Button
              type="button"
              onClick={() => navigate('/login')}
              className="text-md font-semibold text-[#007B64]"
            >
              Sign in
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
