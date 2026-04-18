import Sidebar from './Sidebar';
import Header from '../header/Header';
import { Outlet, useLocation } from 'react-router-dom';

const ROUTE_TITLES: Record<string, string> = {
  '/dashboard/overview': 'Dashboard Overview',
  '/dashboard/donations': 'Donation Tracker',
  '/dashboard/email': 'Email Communication',
  '/dashboard/approval': 'Admin Approval',
  '/dashboard/settings': 'Settings',
};

export default function DashboardOverview() {
  const { pathname } = useLocation();
  const title = ROUTE_TITLES[pathname] ?? 'Dashboard Overview';

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header title={title} />

        <div className="flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
