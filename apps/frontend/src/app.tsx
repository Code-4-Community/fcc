import { useEffect } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './styles.css';
import apiClient from '@api/apiClient';
import Root from '@containers/root';
import NotFound from '@containers/404';
import TestimonialTester from '@containers/TestimonialTester';
import { DonationForm } from '@containers/donations/DonationForm';
import { ShadcnExample } from '@components/ShadcnExample';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Root />,
    errorElement: <NotFound />,
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

  return <RouterProvider router={router} />;
};

export default App;
