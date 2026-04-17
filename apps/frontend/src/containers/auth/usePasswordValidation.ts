import { useMemo } from 'react';

interface PasswordValidation {
  hasMinLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
  passwordsMatch: boolean;
  allCriteriaMet: boolean;
}

export const usePasswordValidation = (
  password: string,
  confirmPassword: string,
): PasswordValidation => {
  return useMemo(() => {
    const hasMinLength = password.length >= 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[^A-Za-z0-9]/.test(password);
    const passwordsMatch =
      password.length > 0 &&
      confirmPassword.length > 0 &&
      password === confirmPassword;
    const allCriteriaMet =
      hasMinLength &&
      hasUppercase &&
      hasLowercase &&
      hasNumber &&
      hasSpecialChar &&
      passwordsMatch;

    return {
      hasMinLength,
      hasUppercase,
      hasLowercase,
      hasNumber,
      hasSpecialChar,
      passwordsMatch,
      allCriteriaMet,
    };
  }, [password, confirmPassword]);
};
