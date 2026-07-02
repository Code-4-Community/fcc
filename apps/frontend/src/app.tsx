import { useEffect } from 'react';
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from 'react-router-dom';
import './styles.css';
import apiClient from '@api/apiClient';
import NotFound from '@containers/404';
import TestimonialTester from '@containers/TestimonialTester';
import { DonationForm } from '@containers/donations/DonationForm';
import { ShadcnExample } from '@components/ShadcnExample';
import { AuthProvider } from '@components/AuthProvider';
import { ProtectedRoute } from '@components/ProtectedRoute';
import { AdminRoute } from '@components/AdminRoute';
import { LoginPage } from '@containers/auth/LoginPage';
import { ResetPasswordPage } from '@containers/auth/ResetPasswordPage';
import { ConfirmRegisteredPage } from '@containers/auth/ConfirmRegisteredPage';
import { DashboardPage } from '@containers/dashboard/DashboardPage';
import { DonorStatsChart } from '@components/DonorStatsChart';
import DashboardOverview from '@containers/dashboard/sidebar/DashboardOverview';
import DonationTrackerPage from '@containers/dashboard/donations/DonationTrackerPage';
import { EmailEditor } from './components/EmailComms/EmailEditorOverviewPage';
import { AdminGrowingGoalTester } from '@containers/dashboard/AdminGrowingGoalTester';
import OverviewPage from '@containers/dashboard/OverviewPage';
import { UserManagement } from '@containers/dashboard/UserManagement';
import Settings from '@containers/dashboard/Settings';
import Root from './containers/root';

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
    path: '/reset-password',
    element: <ResetPasswordPage />,
  },
  {
    path: '/confirm-registered',
    element: <ConfirmRegisteredPage />,
  },
  {
    path: '/dashboard',
    element: <ProtectedRoute />,
    children: [
      {
        path: '',
        element: <Navigate to="/dashboard/overview" replace />,
      },
      {
        path: '',
        element: <DashboardOverview />,
        children: [
          {
            path: 'overview',
            element: <OverviewPage />,
          },
          {
            path: 'donations',
            element: <DonationTrackerPage />,
          },
          {
            path: 'email',
            element: <EmailEditor />,
          },
          {
            path: 'approval',
            element: <UserManagement />,
          },
          {
            path: 'settings',
            element: <Settings />,
          },
        ],
      },
      {
        path: 'old',
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
      <div style={{ maxWidth: 480, margin: '2rem auto' }}>
        <DonationForm
          onSuccess={(id) => console.log('Donation successful:', id)}
          onError={(err) => console.error('Donation failed:', err)}
        />
      </div>
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
