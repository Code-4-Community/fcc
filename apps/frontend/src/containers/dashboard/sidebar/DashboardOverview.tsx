import Sidebar from './Sidebar';
import Header from '../header/Header';
import { Outlet } from 'react-router-dom';

export default function DashboardOverview() {
  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Header />

        <Outlet />
      </div>
    </div>
  );
}
