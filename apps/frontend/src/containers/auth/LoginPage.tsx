import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../components/AuthProvider';
import { Button } from '../../components/ui/button';
import cityBg from '../../assets/city-bg.png';
import fccMark from '../../assets/fcc-mark.png';
import { Input } from '@components/ui/input';
import { Label } from '@components/ui/label';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@components/ui/input-group';
import { EyeIcon, EyeOffIcon } from 'lucide-react';
import { PasswordCriterion } from './PasswordCriterion';

enum AuthPage {
  Login,
  SignupStepOne,
  SignupStepTwo,
  ForgotPassword,
}

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [authPage, setAuthPage] = useState<AuthPage>(AuthPage.Login);

  const { login, signup } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const locationState = location.state as {
    from?: { pathname: string };
  } | null;
  const from = locationState?.from?.pathname || '/dashboard';

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

  const showAuthFieldError =
    authPage === AuthPage.Login &&
    !!error &&
    error !== 'Account created successfully! Please sign in.';

  const headerText = (() => {
    switch (authPage) {
      case AuthPage.Login:
        return 'Admin Dashboard';
        break;

      case AuthPage.SignupStepOne:
        return 'New User';
        break;

      case AuthPage.SignupStepTwo:
        return 'User Details';
        break;

      case AuthPage.ForgotPassword:
        return 'Forgot Password';
        break;

      default:
        break;
    }
  })();

  const resetFields = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setFirstName('');
    setLastName('');
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (authPage === AuthPage.Login) {
        await login({ email, password });
        navigate(from, { replace: true });
      } else if (authPage === AuthPage.SignupStepTwo) {
        await signup({ email, password, firstName, lastName });
        setAuthPage(AuthPage.Login);
        setError('Account created successfully! Please sign in.');
        setPassword('');
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Authentication failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex justify-center items-center min-h-screen bg-[#007B64]">
      <div
        className="absolute inset-0 bg-no-repeat bg-cover bg-center opacity-30"
        style={{ backgroundImage: `url(${cityBg})` }}
      ></div>
      <div className="relative z-10 p-10 m-auto bg-white rounded-[50px] w-[32rem]">
        <div>
          <img
            src={fccMark}
            alt="FCC Logo"
            className="w-36 h-36 object-contain m-auto"
          />
          <h1 className="font-semibold text-[#007B64] text-4xl text-center">
            {headerText}
          </h1>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 mt-10"
          noValidate
        >
          {authPage === AuthPage.SignupStepTwo && (
            <>
              <div>
                <Label
                  htmlFor="first-name"
                  className="font-semibold mb-1 text-[#404040]"
                >
                  First Name
                </Label>
                <Input
                  type="text"
                  placeholder="First Name"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full py-5 focus:ring-[2.5px] focus:ring-[#007B64]"
                  id="first-name"
                />
              </div>
              <div>
                <Label
                  htmlFor="last-name"
                  className="font-semibold mb-1 text-[#404040]"
                >
                  Last Name
                </Label>
                <Input
                  type="text"
                  placeholder="Last Name"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full py-5 focus:ring-[2.5px] focus:ring-[#007B64] mb-14"
                  id="last-name"
                />
              </div>
            </>
          )}

          {(authPage === AuthPage.Login ||
            authPage === AuthPage.SignupStepOne) && (
            <>
              <div>
                <Label
                  htmlFor="email"
                  className="font-semibold mb-1 text-[#404040]"
                >
                  Email
                </Label>
                <Input
                  type="email"
                  placeholder="Email"
                  required
                  pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full py-5 focus:ring-[2.5px] focus:ring-[#007B64] peer invalid:[&:not(:placeholder-shown):not(:focus)]:ring-[2.5px] invalid:[&:not(:placeholder-shown):not(:focus)]:ring-[#B4444D] invalid:[&:not(:placeholder-shown):not(:focus)]:bg-[#FFFAFA] ${
                    showAuthFieldError
                      ? 'ring-[2.5px] ring-[#B4444D] bg-[#FFFAFA]'
                      : ''
                  }`}
                  id="email"
                />
                <span className="mt-2 hidden text-sm text-[#B4444D] peer-[&:not(:placeholder-shown):not(:focus):invalid]:block">
                  Please enter a valid email address
                </span>
              </div>
              <div>
                <Label
                  htmlFor="password"
                  className="font-semibold mb-1 text-[#404040]"
                >
                  Password
                </Label>
                <InputGroup
                  className={`w-full focus-within:border-[#007B64] focus-within:ring-[2.5px] focus-within:ring-[#007B64] py-5 ${
                    showAuthFieldError
                      ? 'border-[#B4444D] ring-[2px] ring-[#B4444D]'
                      : ''
                  }`}
                >
                  <InputGroupInput
                    id="inline-end-input"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className={`focus:ring-[#007B64] ${
                      showAuthFieldError ? 'bg-[#FFFAFA]' : ''
                    }`}
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
              {authPage === AuthPage.SignupStepOne && (
                <div>
                  <Label
                    htmlFor="password"
                    className="font-semibold mb-1 text-[#404040]"
                  >
                    Confirm Password
                  </Label>
                  <InputGroup className="w-full focus-within:border-[#007B64] focus-within:ring-[2.5px] focus-within:ring-[#007B64] py-5">
                    <InputGroupInput
                      id="inline-end-input"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter Password"
                      className="focus:ring-[#007B64]"
                    />
                    <InputGroupAddon
                      align="inline-end"
                      className="hover:cursor-pointer"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    >
                      {showConfirmPassword ? <EyeIcon /> : <EyeOffIcon />}
                    </InputGroupAddon>
                  </InputGroup>
                </div>
              )}
            </>
          )}

          {authPage === AuthPage.SignupStepOne ? (
            <div className="flex gap-1 flex-wrap w-full">
              <PasswordCriterion
                name="8+ characters"
                criterionMet={hasMinLength}
              />
              <PasswordCriterion name="Uppercase" criterionMet={hasUppercase} />
              <PasswordCriterion name="Lowercase" criterionMet={hasLowercase} />
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
          ) : (
            authPage === AuthPage.Login && (
              <div className="flex items-center w-full">
                {error && (
                  <p className="text-sm text-[#B4444D] mr-2">{error}</p>
                )}
                <Button className="p-0 text-[#007B64] font-semibold ml-auto">
                  Forgot Password?
                </Button>
              </div>
            )
          )}

          {authPage === AuthPage.Login ? (
            <Button
              id="auth-submit-btn"
              type="submit"
              className={`py-5 h-14 rounded-full font-semibold text-xl text-white ${
                !email || !password
                  ? 'bg-[#737373] cursor-not-allowed'
                  : 'bg-[#007B64]'
              }`}
            >
              {isLoading ? '...' : 'Login'}
            </Button>
          ) : authPage === AuthPage.SignupStepOne ? (
            <Button
              className={`py-5 h-14 rounded-full font-semibold text-xl text-white ${
                !allCriteriaMet
                  ? 'bg-[#737373] cursor-not-allowed'
                  : 'bg-[#007B64]'
              }`}
              onClick={(e) => {
                e.preventDefault();
                setAuthPage(AuthPage.SignupStepTwo);
              }}
            >
              Create Account
            </Button>
          ) : (
            <Button
              id="auth-submit-btn"
              type="submit"
              disabled={isLoading || !allCriteriaMet}
              className={`py-5 h-14 rounded-full font-semibold text-xl text-white ${
                !firstName || !lastName
                  ? 'bg-[#737373] cursor-not-allowed'
                  : 'bg-[#007B64]'
              }`}
            >
              {isLoading ? '...' : 'Finish Profile'}
            </Button>
          )}

          <div className="flex text-gray-500 justify-center items-center">
            <p>
              {authPage === AuthPage.Login
                ? "Don't have an account?"
                : 'Already have an account?'}
            </p>
            <Button
              type="button"
              onClick={() => {
                setAuthPage(
                  authPage === AuthPage.Login
                    ? AuthPage.SignupStepOne
                    : AuthPage.Login,
                );
                setError('');
                resetFields();
              }}
              className="text-md font-semibold text-[#007B64]"
            >
              {authPage === AuthPage.Login ? 'Create Account' : 'Sign in'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
