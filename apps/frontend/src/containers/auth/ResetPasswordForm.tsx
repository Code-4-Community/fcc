import React, { useState } from 'react';
import { Input } from '@components/ui/input';
import { Label } from '@components/ui/label';
import { Button } from '@components/ui/button';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@components/ui/input-group';
import { EyeIcon, EyeOffIcon } from 'lucide-react';
import { PasswordCriterion } from './PasswordCriterion';
import apiClient from '@api/apiClient';

interface ResetPasswordFormProps {
  email: string;
  onSuccess?: () => void;
}

export const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({
  email,
  onSuccess,
}) => {
  const [confirmationCode, setConfirmationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const hasMinLength = newPassword.length >= 8;
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasLowercase = /[a-z]/.test(newPassword);
  const hasNumber = /\d/.test(newPassword);
  const hasSpecialChar = /[^A-Za-z0-9]/.test(newPassword);
  const passwordsMatch =
    newPassword.length > 0 &&
    confirmPassword.length > 0 &&
    newPassword === confirmPassword;
  const allCriteriaMet =
    hasMinLength &&
    hasUppercase &&
    hasLowercase &&
    hasNumber &&
    hasSpecialChar &&
    passwordsMatch;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await apiClient.confirmPassword({
        email,
        confirmationCode,
        newPassword,
      });
      onSuccess?.();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to reset password');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      <div>
        <Label
          htmlFor="confirmation-code"
          className="font-semibold mb-1 text-[#404040]"
        >
          Confirmation Code
        </Label>
        <Input
          id="confirmation-code"
          type="text"
          placeholder="Enter code from email"
          required
          value={confirmationCode}
          onChange={(e) => setConfirmationCode(e.target.value)}
          className={`w-full py-5 focus:ring-[2.5px] focus:ring-[#007B64] ${
            error ? 'ring-[2.5px] ring-[#B4444D] bg-[#FFFAFA]' : ''
          }`}
        />
      </div>

      <div>
        <Label
          htmlFor="new-password"
          className="font-semibold mb-1 text-[#404040]"
        >
          New Password
        </Label>
        <InputGroup
          className={`w-full focus-within:border-[#007B64] focus-within:ring-[2.5px] focus-within:ring-[#007B64] py-5 ${
            error ? 'border-[#B4444D] ring-[2px] ring-[#B4444D]' : ''
          }`}
        >
          <InputGroupInput
            id="new-password"
            type={showPassword ? 'text' : 'password'}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Password"
            className={`focus:ring-[#007B64] ${error ? 'bg-[#FFFAFA]' : ''}`}
          />
          <InputGroupAddon
            align="inline-end"
            className="hover:cursor-pointer"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeIcon /> : <EyeOffIcon />}
          </InputGroupAddon>
        </InputGroup>
      </div>

      <div>
        <Label
          htmlFor="confirm-password"
          className="font-semibold mb-1 text-[#404040]"
        >
          Confirm Password
        </Label>
        <InputGroup className="w-full focus-within:border-[#007B64] focus-within:ring-[2.5px] focus-within:ring-[#007B64] py-5">
          <InputGroupInput
            id="confirm-password"
            type={showConfirmPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter Password"
            className="focus:ring-[#007B64]"
          />
          <InputGroupAddon
            align="inline-end"
            className="hover:cursor-pointer"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? <EyeIcon /> : <EyeOffIcon />}
          </InputGroupAddon>
        </InputGroup>
      </div>

      <div className="flex gap-1 flex-wrap w-full">
        <PasswordCriterion name="8+ characters" criterionMet={hasMinLength} />
        <PasswordCriterion name="Uppercase" criterionMet={hasUppercase} />
        <PasswordCriterion name="Lowercase" criterionMet={hasLowercase} />
        <PasswordCriterion
          name="Special character"
          criterionMet={hasSpecialChar}
        />
        <PasswordCriterion name="Number" criterionMet={hasNumber} />
        <PasswordCriterion name="Matching" criterionMet={passwordsMatch} />
      </div>

      {error && <p className="text-sm text-[#B4444D]">{error}</p>}

      <Button
        id="reset-password-submit-btn"
        type="submit"
        disabled={!confirmationCode || !allCriteriaMet || isLoading}
        className={`py-5 h-14 rounded-full font-semibold text-xl text-white ${
          !confirmationCode || !allCriteriaMet || isLoading
            ? 'bg-[#737373] cursor-not-allowed'
            : 'bg-[#007B64]'
        }`}
      >
        {isLoading ? '...' : 'Reset Password'}
      </Button>
    </form>
  );
};
