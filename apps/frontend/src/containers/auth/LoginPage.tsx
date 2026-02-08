import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../components/AuthProvider';
import { Button } from '../../components/ui/button';

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
    <div style={{ padding: '2rem', maxWidth: '400px', margin: '0 auto' }}>
      <h1>{isLogin ? 'Login' : 'Signup'}</h1>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <form
        onSubmit={handleSubmit}
        style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
      >
        {!isLogin && (
          <>
            <input
              type="text"
              placeholder="First Name"
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
            <input
              type="text"
              placeholder="Last Name"
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </>
        )}
        <input
          type="email"
          placeholder="Email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <Button id="auth-submit-btn" type="submit" disabled={isLoading}>
          {isLoading ? '...' : isLogin ? 'Login' : 'Signup'}
        </Button>

        <button
          type="button"
          onClick={() => {
            setIsLogin(!isLogin);
            setError('');
          }}
          style={{
            background: 'none',
            border: 'none',
            color: 'blue',
            cursor: 'pointer',
            textDecoration: 'underline',
          }}
        >
          {isLogin ? 'Need an account?' : 'Already have one?'}
        </button>
      </form>
    </div>
  );
};
