import React, { createContext, useContext, useEffect, useState } from 'react';
import apiClient, {
  SignInRequest,
  SignUpRequest,
  AuthResponse,
} from '../api/apiClient';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: any; // Ideally a User type
  login: (data: SignInRequest) => Promise<void>;
  signup: (data: SignUpRequest) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [user, setUser] = useState<any>(null);

  const fetchUserProfile = async () => {
    try {
      const res = await (apiClient as any).axiosInstance.get('/api/auth/me');
      setUser(res.data);
      setIsAuthenticated(true);
    } catch (err) {
      console.error('Failed to fetch user profile:', err);
      // If error occurs, clear everything
      localStorage.removeItem('accessToken');
      localStorage.removeItem('idToken');
      localStorage.removeItem('refreshToken');
      apiClient.setAuthToken(null);
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      apiClient.setAuthToken(accessToken);
      fetchUserProfile().finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (data: SignInRequest) => {
    const response: AuthResponse = await apiClient.signin(data);
    await handleAuthResponse(response);
  };

  const signup = async (data: SignUpRequest) => {
    await apiClient.signup(data);
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('idToken');
    localStorage.removeItem('refreshToken');
    apiClient.setAuthToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  const handleAuthResponse = async (response: AuthResponse) => {
    const { accessToken, idToken, refreshToken } = response;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('idToken', idToken);
    localStorage.setItem('refreshToken', refreshToken);

    apiClient.setAuthToken(accessToken);
    await fetchUserProfile();
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, isLoading, user, login, signup, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
