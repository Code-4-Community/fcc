import { useEffect } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import apiClient from '@api/apiClient';
import Root from '@containers/root';
import NotFound from '@containers/404';
import Test from '@containers/test';
import { DonationForm } from '@containers/donations/DonationForm';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Root />,
    errorElement: <NotFound />,
  },
  {
    path: '/test',
    element: <Test />,
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
