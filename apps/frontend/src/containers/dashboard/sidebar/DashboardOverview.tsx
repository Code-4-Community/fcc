import Sidebar from './Sidebar';
import Header from '../header/Header';
import { Outlet, useLocation } from 'react-router-dom';

const ROUTE_TITLES: Record<string, string> = {
  '/overview': 'Dashboard Overview',
  '/overview/email': 'Email Overview',
};

export default function DashboardOverview() {
  const { pathname } = useLocation();
  const title = ROUTE_TITLES[pathname] ?? 'Dashboard';

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Header title={title} />

        <Outlet />
      </div>
    </div>
  );
}
