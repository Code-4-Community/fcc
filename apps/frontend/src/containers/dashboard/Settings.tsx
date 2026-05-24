import React, { useState } from 'react';
import { useAuth } from '../../components/AuthProvider';
import { getDisplayName } from '../../utils/user';
import { Button } from '../../components/ui/button';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '../../components/ui/input-group';
import { EyeIcon, EyeOffIcon } from 'lucide-react';
import { PasswordCriterion } from '../auth/PasswordCriterion';
import { usePasswordValidation } from '../auth/usePasswordValidation';
import apiClient from '../../api/apiClient';

export default function Settings() {
  const { user, logout } = useAuth();
  const displayUserName = getDisplayName(user);
  const displayEmail = user?.email || 'email@address.com';

  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [nameMessage, setNameMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    hasMinLength,
    hasUppercase,
    hasLowercase,
    hasNumber,
    hasSpecialChar,
    passwordsMatch,
    allCriteriaMet,
  } = usePasswordValidation(newPassword, confirmPassword);

  const handleNameChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setNameMessage(null);

    if (!user?.id) {
      setNameMessage({ type: 'error', text: 'User ID not found.' });
      return;
    }

    try {
      await apiClient.updateUser(user.id, { firstName, lastName });
      setNameMessage({ type: 'success', text: 'Name changed successfully!' });
      // Depending on auth implementation, might need to refresh user context here
    } catch (err: unknown) {
      setNameMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to change name.',
      });
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    setIsLoading(true);
    try {
      await apiClient.changePassword({
        previousPassword: oldPassword,
        proposedPassword: newPassword,
      });
      setMessage({ type: 'success', text: 'Password successfully changed!' });
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'An error occurred while changing your password.';
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-full bg-[#F5F5F5] font-sans">
      <main className="flex-1 p-8">
        <div className="flex gap-8 items-start">
          <div className="flex flex-col gap-8 w-full max-w-[772px]">
            {/* Change Name Section */}
            <form
              onSubmit={handleNameChange}
              className="bg-white flex flex-col gap-6 items-start overflow-clip pb-16 pl-8 pr-16 pt-6 rounded-xl shadow-md w-full"
            >
              <div className="flex flex-col gap-2 w-full">
                <h3 className="font-semibold text-2xl text-black tracking-tight">
                  Change Name
                </h3>
                <hr className="border-t border-[#e5e5e5] w-full" />
              </div>
              {nameMessage && (
                <div
                  className={`p-4 rounded-md w-full ${
                    nameMessage.type === 'success'
                      ? 'bg-green-50 text-green-800 border border-green-200'
                      : 'bg-red-50 text-red-800 border border-red-200'
                  }`}
                >
                  {nameMessage.text}
                </div>
              )}
              <div className="flex flex-col gap-1 w-full">
                <label className="font-semibold text-sm text-black">
                  First Name
                </label>
                <input
                  type="text"
                  placeholder="First Name"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="border-[1.5px] border-[#e5e5e5] px-4 py-2 rounded-[10px] w-full text-base text-black focus:outline-none focus:border-[#409887] focus:ring-1 focus:ring-[#409887]"
                />
              </div>
              <div className="flex flex-col gap-1 w-full">
                <label className="font-semibold text-sm text-black">
                  Last Name
                </label>
                <input
                  type="text"
                  placeholder="Last Name"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="border-[1.5px] border-[#e5e5e5] px-4 py-2 rounded-[10px] w-full text-base text-black focus:outline-none focus:border-[#409887] focus:ring-1 focus:ring-[#409887]"
                />
              </div>
              <Button type="submit" className="mt-2" variant="success">
                Change Name
              </Button>
            </form>

            <form
              onSubmit={handlePasswordChange}
              className="bg-white flex flex-col gap-6 items-start overflow-clip pb-16 pl-8 pr-16 pt-6 rounded-xl shadow-md w-full"
            >
              <div className="flex flex-col gap-2 w-full">
                <h3 className="font-semibold text-2xl text-black tracking-tight">
                  Change Password
                </h3>
                <hr className="border-t border-[#e5e5e5] w-full" />
              </div>
              {message && (
                <div
                  className={`p-4 rounded-md w-full ${
                    message.type === 'success'
                      ? 'bg-green-50 text-green-800 border border-green-200'
                      : 'bg-red-50 text-red-800 border border-red-200'
                  }`}
                >
                  {message.text}
                </div>
              )}
              <div className="flex flex-col gap-1 w-full">
                <label className="font-semibold text-sm text-black">
                  Old password
                </label>
                <InputGroup className="w-full focus-within:border-[#007B64] focus-within:ring-[1px] focus-within:ring-[#007B64] border-[#e5e5e5] border-[1.5px] rounded-[10px] bg-white overflow-hidden py-1">
                  <InputGroupInput
                    type={showOldPassword ? 'text' : 'password'}
                    placeholder="Old password"
                    required
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="focus:ring-0 border-none px-4 py-1 text-base text-black w-full"
                  />
                  <InputGroupAddon
                    align="inline-end"
                    className="hover:cursor-pointer pr-3"
                    onClick={() => setShowOldPassword(!showOldPassword)}
                  >
                    {showOldPassword ? (
                      <EyeIcon size={20} />
                    ) : (
                      <EyeOffIcon size={20} />
                    )}
                  </InputGroupAddon>
                </InputGroup>
              </div>
              <div className="flex flex-col gap-1 w-full">
                <label className="font-semibold text-sm text-black">
                  New password
                </label>
                <InputGroup className="w-full focus-within:border-[#007B64] focus-within:ring-[1px] focus-within:ring-[#007B64] border-[#e5e5e5] border-[1.5px] rounded-[10px] bg-white overflow-hidden py-1">
                  <InputGroupInput
                    type={showNewPassword ? 'text' : 'password'}
                    placeholder="New password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="focus:ring-0 border-none px-4 py-1 text-base text-black w-full"
                  />
                  <InputGroupAddon
                    align="inline-end"
                    className="hover:cursor-pointer pr-3"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? (
                      <EyeIcon size={20} />
                    ) : (
                      <EyeOffIcon size={20} />
                    )}
                  </InputGroupAddon>
                </InputGroup>
              </div>
              <div className="flex flex-col gap-1 w-full">
                <label className="font-semibold text-sm text-black">
                  Confirm new password
                </label>
                <InputGroup className="w-full focus-within:border-[#007B64] focus-within:ring-[1px] focus-within:ring-[#007B64] border-[#e5e5e5] border-[1.5px] rounded-[10px] bg-white overflow-hidden py-1">
                  <InputGroupInput
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm new password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="focus:ring-0 border-none px-4 py-1 text-base text-black w-full"
                  />
                  <InputGroupAddon
                    align="inline-end"
                    className="hover:cursor-pointer pr-3"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeIcon size={20} />
                    ) : (
                      <EyeOffIcon size={20} />
                    )}
                  </InputGroupAddon>
                </InputGroup>
              </div>

              <div className="flex gap-1 flex-wrap w-full py-2">
                <PasswordCriterion
                  name="8+ characters"
                  criterionMet={hasMinLength}
                />
                <PasswordCriterion
                  name="Uppercase"
                  criterionMet={hasUppercase}
                />
                <PasswordCriterion
                  name="Lowercase"
                  criterionMet={hasLowercase}
                />
                <PasswordCriterion
                  name="Special character"
                  criterionMet={hasSpecialChar}
                />
                <PasswordCriterion name="Number" criterionMet={hasNumber} />
                <PasswordCriterion
                  name="Matching"
                  criterionMet={passwordsMatch}
                />
              </div>

              <Button
                type="submit"
                className="mt-2"
                variant="success"
                disabled={!oldPassword || !allCriteriaMet || isLoading}
              >
                {isLoading ? 'Changing...' : 'Change Password'}
              </Button>
            </form>
          </div>

          <div className="flex flex-col items-center">
            <div className="bg-white flex flex-col items-start overflow-clip pb-16 pt-6 px-8 rounded-xl shadow-md w-[336px]">
              <div className="flex flex-col gap-1 w-full">
                <p className="font-semibold text-2xl text-black tracking-tight">
                  {displayUserName}
                </p>
                <p className="text-sm text-[#737373]">{displayEmail}</p>
              </div>

              <div className="w-full mt-12">
                <Button
                  variant="destructive"
                  onClick={logout}
                  className="w-full"
                >
                  Log Out
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
