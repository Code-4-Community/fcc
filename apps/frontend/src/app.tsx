import { useEffect } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './styles.css';
import apiClient from '@api/apiClient';
import Root from '@containers/root';
import NotFound from '@containers/404';
import TestimonialTester from '@containers/TestimonialTester';
import { DonationForm } from '@containers/donations/DonationForm';
import { ShadcnExample } from '@components/ShadcnExample';
import { AuthProvider } from '@components/AuthProvider';
import { ProtectedRoute } from '@components/ProtectedRoute';
import { AdminRoute } from '@components/AdminRoute';
import { LoginPage } from '@containers/auth/LoginPage';
import { ConfirmSentEmailPage } from '@containers/auth/ConfirmSentEmailPage';
import { ConfirmRegisteredPage } from '@containers/auth/ConfirmRegisteredPage';
import { DashboardPage } from '@containers/dashboard/DashboardPage';
import { DonorStatsChart } from '@components/DonorStatsChart';
import DashboardOverview from '@containers/dashboard/sidebar/DashboardOverview';
import { EmailEditor } from './components/EmailComms/EmailEditor';
import { AdminGrowingGoalTester } from '@containers/dashboard/AdminGrowingGoalTester';
import OverviewPage from '@containers/dashboard/OverviewPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Root />,
    errorElement: <NotFound />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/confirm-sent-email',
    element: <ConfirmSentEmailPage />,
  },
  {
    path: '/confirm-registered',
    element: <ConfirmRegisteredPage />,
  },
  {
    path: '/overview',
    // element: <ProtectedRoute />,
    children: [
      {
        element: <DashboardOverview />,
        children: [
          {
            path: '',
            element: <OverviewPage />,
          },
          {
            path: 'email',
            element: <EmailEditor />,
          },
        ],
      },
    ],
  },
  {
    path: '/dashboard',
    element: <ProtectedRoute />,
    children: [
      {
        path: '',
        element: <DashboardPage />,
      },
    ],
  },
  {
    path: '/test',
    element: <TestimonialTester />,
  },
  {
    path: '/shadcn-example',
    element: <ShadcnExample />,
  },
  {
    path: '/admin-growing-goal-test',
    element: <AdminGrowingGoalTester />,
  },
  {
    path: '/chart',
    element: <AdminRoute />,
    children: [
      {
        path: '',
        element: <DonorStatsChart />,
      },
    ],
  },
  {
    path: '/donate',
    element: (
      <DonationForm
        onSuccess={(id) => console.log('Donation successful:', id)}
        onError={(err) => console.error('Donation failed:', err)}
      />
    ),
  },
]);

export const App: React.FC = () => {
  useEffect(() => {
    apiClient.getHello().then((res) => console.log(res));
  }, []);

  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
};

export default App;
