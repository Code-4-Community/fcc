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

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const { login, signup } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const locationState = location.state as {
    from?: { pathname: string };
  } | null;
  const from = locationState?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isLogin) {
        await login({ email, password });
        navigate(from, { replace: true });
      } else {
        await signup({ email, password, firstName, lastName });
        setIsLogin(true);
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
            {isLogin ? 'Admin Dashboard' : 'New User'}
          </h1>
        </div>

        {error && <p style={{ color: 'red' }}>{error}</p>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-10">
          {!isLogin && (
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
              <Input
                type="text"
                placeholder="Last Name"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full py-5 focus:ring-[2.5px] focus:ring-[#007B64]"
                id="last-name"
              />
            </>
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full py-5 focus:ring-[2.5px] focus:ring-[#007B64]"
              id="email"
            />
          </div>
          <div>
            <Label
              htmlFor="password"
              className="font-semibold mb-1 text-[#404040]"
            >
              Password
            </Label>
            <InputGroup className="w-full focus-within:border-[#007B64] focus-within:ring-[2.5px] focus-within:ring-[#007B64] py-5">
              <InputGroupInput
                id="inline-end-input"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="focus:ring-[#007B64]"
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

          <Button className="justify-end p-0 text-[#007B64] font-semibold">
            Forgot Password?
          </Button>

          <Button
            id="auth-submit-btn"
            type="submit"
            disabled={isLoading}
            className="py-5 h-14 rounded-full bg-[#007B64] font-semibold text-xl text-white"
          >
            {isLoading ? '...' : isLogin ? 'Login' : 'Create Account'}
          </Button>

          <div className="flex text-gray-500 justify-center items-center">
            <p>
              {isLogin ? "Don't have an account?" : 'Already have an account?'}
            </p>
            <Button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
              className="text-md font-semibold text-[#007B64]"
            >
              {isLogin ? 'Create Account' : 'Sign in'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
