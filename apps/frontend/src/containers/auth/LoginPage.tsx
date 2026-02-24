import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../components/AuthProvider';
import { Button } from '../../components/ui/button';
import cityBg from '../../assets/city-bg.png';
import fccMark from '../../assets/fcc-mark.png';
import { Input } from '@components/ui/input';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

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
      <div className="relative z-10 p-10 max-w-lg m-auto bg-white rounded-[50px]">
        <div>
          <img
            src={fccMark}
            alt="FCC Logo"
            className="w-36 h-36 object-contain m-auto"
          />
          <h1 className="font-semibold text-[#007B64] text-4xl text-center">
            {isLogin ? 'Sign in' : 'Sign up'}
          </h1>
        </div>

        {error && <p style={{ color: 'red' }}>{error}</p>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-10">
          {!isLogin && (
            <>
              <Input
                type="text"
                placeholder="First Name"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-80 py-5 focus:ring-[#007B64] placeholder:text-black"
              />
              <Input
                type="text"
                placeholder="Last Name"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-80 py-5 focus:ring-[#007B64] placeholder:text-black"
              />
            </>
          )}
          <Input
            type="email"
            placeholder="Email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-80 py-5 focus:ring-[#007B64] placeholder:text-black"
          />
          <Input
            type="password"
            placeholder="Password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-80 py-5 focus:ring-[#007B64] placeholder:text-black"
          ></Input>

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
              className="text-md font-semibold"
            >
              {isLogin ? 'Create Account' : 'Sign in'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
