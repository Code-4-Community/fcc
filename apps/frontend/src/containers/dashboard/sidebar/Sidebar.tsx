'use client';

import { Link } from 'react-router-dom';

import FCCLogo from './FCCLogo.svg';
import FCCText from './FCC.svg';

import DashboardOverviewIcon from './DashboardOverview.svg';
import DonationTrackerIcon from './DonationTracker.svg';
import EmailCommunicationIcon from './EmailCommunication.svg';
import AdminApprovalIcon from './AdminApproval.svg';
import SettingsIcon from './Settings.svg';

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

type NavItem = {
  label: string;
  href: string;
  icon: string;
};

const navItems: NavItem[] = [
  {
    label: 'Dashboard Overview',
    href: '/dashboard',
    icon: DashboardOverviewIcon,
  },
  {
    label: 'Donation Tracker',
    href: '/dashboard/donations',
    icon: DonationTrackerIcon,
  },
  {
    label: 'Email Communication',
    href: '/dashboard/email',
    icon: EmailCommunicationIcon,
  },
  {
    label: 'Admin Approval',
    href: '/dashboard/approval',
    icon: AdminApprovalIcon,
  },
  {
    label: 'Settings',
    href: '/dashboard/settings',
    icon: SettingsIcon,
  },
];

type SidebarProps = {
  activeItem?: string;
  className?: string;
};

export default function Sidebar({
  activeItem = 'Dashboard Overview',
  className,
}: SidebarProps) {
  return (
    <aside
      className={cn(
        'flex w-[236px] flex-col border-r border-neutral-200 bg-neutral-50',
        className,
      )}
    >
      {/*Top Logo Section */}
      <div className="flex h-[103px] w-full items-center gap-[11px] px-[22px] py-[9px]">
        <img src={FCCLogo} alt="FCC Logo" className="w-[56px] shrink-0" />
        <img
          src={FCCText}
          alt="Fenway Community Center"
          className="w-[125px]"
        />
      </div>

      {/*Navigation */}
      <nav className="flex w-full flex-col gap-0.05 px-4 pt-8">
        {navItems.map((item) => {
          const isActive = item.label === activeItem;

          return (
            <Link
              key={item.label}
              to={item.href}
              className={cn(
                'flex h-11 w-full items-center gap-3 rounded-md px-3 text-[14px] font-semibold leading-6 transition-colors',
                isActive
                  ? 'bg-emerald-700 text-white'
                  : 'text-neutral-700 hover:bg-neutral-100',
              )}
            >
              <img
                src={item.icon}
                alt={item.label}
                className="h-4 w-4 shrink-0"
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
