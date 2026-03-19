import React, { useState } from 'react';
import { useNavigate, useLocation, replace } from 'react-router-dom';
import { useAuth } from '../../components/AuthProvider';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import bostonBg from '../../assets/green-boston-background.png';
import fccLogo from '../../assets/fcc-logo.png';
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
  Signup,
  ForgotPassword,
}

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
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
        return 'Admin Log In';

      case AuthPage.Signup:
        return 'New User';

      case AuthPage.ForgotPassword:
        return 'Forgot Password';

      default:
        break;
    }
  })();

  const resetFields = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setUsername('');
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
      } else if (authPage === AuthPage.Signup) {
        // TODO: signup should take in just email, password, and username
        // await signup({ email, password, firstName, lastName });
        navigate('/confirm-registered', { replace: true });
        setError('Account created successfully! Please sign in.');
      } else if (authPage === AuthPage.ForgotPassword) {
        // TODO: Show view confirming email was sent
        navigate('/confirm-sent-email', { replace: true });
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
        style={{ backgroundImage: `url(${bostonBg})` }}
      ></div>
      <Card className="relative z-10 p-10 m-auto bg-white rounded-[50px] w-[32rem]">
        <CardContent className="p-0">
          <div
            className={
              authPage === AuthPage.Signup
                ? 'flex items-center justify-center gap-4'
                : ''
            }
          >
            <img
              src={fccLogo}
              alt="FCC Logo"
              className={
                authPage === AuthPage.Signup
                  ? 'w-20 h-20 object-contain shrink-0'
                  : 'w-36 h-36 object-contain m-auto'
              }
            />
            <h1
              className={`font-semibold text-[#007B64] ${authPage === AuthPage.Signup ? 'text-3xl text-left' : 'text-4xl text-center'}`}
            >
              {headerText}
            </h1>
          </div>

          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-4 mt-10"
            noValidate
          >
            {authPage === AuthPage.Signup && (
              <div>
                <Label
                  htmlFor="username"
                  className="font-semibold mb-1 text-[#404040]"
                >
                  Username
                </Label>
                <Input
                  type="text"
                  placeholder="Username"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full py-5 focus:ring-[2.5px] focus:ring-[#007B64]"
                  id="username"
                />
              </div>
            )}

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

            {authPage !== AuthPage.ForgotPassword && (
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
                    id="password"
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
            )}

            {authPage === AuthPage.Signup && (
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
            )}

            {authPage === AuthPage.Signup ? (
              <div className="flex gap-1 flex-wrap w-full">
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
            ) : (
              authPage === AuthPage.Login && (
                <div className="flex items-center w-full">
                  {error && (
                    <p className="text-sm text-[#B4444D] mr-2">{error}</p>
                  )}
                  <Button
                    type="button"
                    className="p-0 text-[#007B64] font-semibold ml-auto"
                    onClick={(e) => {
                      e.preventDefault();
                      resetFields();
                      setAuthPage(AuthPage.ForgotPassword);
                    }}
                  >
                    Forgot Password?
                  </Button>
                </div>
              )
            )}

            {authPage === AuthPage.Login ? (
              <Button
                id="auth-submit-btn"
                type="submit"
                disabled={!email || !password || showAuthFieldError}
                className={`py-5 h-14 rounded-full font-semibold text-xl text-white ${
                  !email || !password || showAuthFieldError
                    ? 'bg-[#737373] cursor-not-allowed'
                    : 'bg-[#007B64]'
                }`}
              >
                {isLoading ? '...' : 'Login'}
              </Button>
            ) : authPage === AuthPage.ForgotPassword ? (
              <Button
                id="auth-submit-btn"
                type="submit"
                disabled={!email || isLoading || showAuthFieldError}
                className={`py-5 h-14 rounded-full font-semibold text-xl text-white ${
                  !email || isLoading || showAuthFieldError
                    ? 'bg-[#737373] cursor-not-allowed'
                    : 'bg-[#007B64]'
                }`}
              >
                {isLoading ? '...' : 'Send'}
              </Button>
            ) : (
              <Button
                className={`py-5 h-14 rounded-full font-semibold text-xl text-white ${
                  !email || !allCriteriaMet
                    ? 'bg-[#737373] cursor-not-allowed'
                    : 'bg-[#007B64]'
                }`}
                disabled={!email || !allCriteriaMet}
                onClick={handleSubmit}
              >
                Continue
              </Button>
            )}

            <div className="flex text-gray-500 justify-center items-center">
              {authPage === AuthPage.ForgotPassword ? (
                <>
                  <p>Go back to </p>
                  <Button
                    type="button"
                    onClick={() => {
                      setAuthPage(AuthPage.Login);
                      resetFields();
                      setError('');
                    }}
                    className="text-md font-semibold text-[#007B64]"
                  >
                    Sign in
                  </Button>
                </>
              ) : (
                <>
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
                          ? AuthPage.Signup
                          : AuthPage.Login,
                      );
                      setError('');
                      resetFields();
                    }}
                    className="text-md font-semibold text-[#007B64]"
                  >
                    {authPage === AuthPage.Login ? 'Create Account' : 'Sign in'}
                  </Button>
                </>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
