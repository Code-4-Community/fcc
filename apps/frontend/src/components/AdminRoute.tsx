import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthProvider';

export const AdminRoute: React.FC = () => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return <div>Loading authentication...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.status !== 'ADMIN' && user?.status !== 'STANDARD') {
    console.log('[AdminRoute] blocked, user:', user);
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};
