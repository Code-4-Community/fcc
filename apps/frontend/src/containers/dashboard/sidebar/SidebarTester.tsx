import { useEffect, useMemo, useState } from 'react';
import Sidebar from './Sidebar';
import Header from '../header/Header';
import { useAuth } from '../../../components/AuthProvider';
import apiClient from '../../../api/apiClient';
import DonationStatCard from './DonationStatCard';
import bankIcon from './bank.png';
import clockIcon from './clock.png';
import calendarIcon from './calendar.png';
import welcomeBackground from '../../../assets/green-boston-background.png';

type DonationStats = {
  total: number;
  yearToDate: number;
  monthToDate: number;
};

const defaultStats: DonationStats = {
  total: 0,
  yearToDate: 0,
  monthToDate: 0,
};

export default function SidebarTester() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DonationStats>(defaultStats);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await apiClient.getDonationStats();
        setStats({
          total: Number(response?.total ?? 0),
          yearToDate: Number(response?.yearToDate ?? 0),
          monthToDate: Number(response?.monthToDate ?? 0),
        });
      } catch {
        setStats(defaultStats);
      }
    };

    fetchStats();
  }, []);

  const displayUserName = useMemo(() => {
    const fullName = [user?.firstName, user?.lastName]
      .filter((part) => typeof part === 'string' && part.trim().length > 0)
      .join(' ')
      .trim();

    return (
      user?.displayName ||
      fullName ||
      user?.username ||
      user?.email ||
      user?.idUser ||
      'Username'
    );
  }, [user]);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Header />
        <main className="flex-1 bg-[#F5F5F5] p-5">
          <h2 className="mb-3 text-[30px] leading-9 font-semibold tracking-[-0.6px] text-black">
            Donations Raised
          </h2>

          <section className="grid grid-cols-1 items-start gap-4 md:grid-cols-[minmax(0,1fr)_clamp(350px,31vw,520px)]">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <DonationStatCard
                iconSrc={bankIcon}
                iconAlt="Total donations"
                label="Total"
                value={formatCurrency(stats.total)}
              />

              <DonationStatCard
                iconSrc={clockIcon}
                iconAlt="Year-to-date donations"
                label="Year-to-date"
                value={formatCurrency(stats.yearToDate)}
              />

              <DonationStatCard
                iconSrc={calendarIcon}
                iconAlt="This month donations"
                label="This Month"
                value={formatCurrency(stats.monthToDate)}
              />
            </div>

            <aside className="relative h-[350px] overflow-hidden rounded-[10px] bg-[#409887] p-5 text-white md:h-[clamp(350px,31vw,520px)]">
              <img
                src={welcomeBackground}
                alt="Boston skyline"
                className="pointer-events-none absolute inset-0 h-full w-full object-contain object-center"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(64,152,135,0.25),rgba(64,152,135,0.3))]" />
              <p className="relative text-[24px] leading-7 font-normal text-[#F0F6F5]">
                Welcome
              </p>
              <p className="relative mt-2 text-[48px] leading-[52px] font-semibold tracking-[-0.96px] text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.3)]">
                {displayUserName}
              </p>
            </aside>
          </section>
        </main>
      </div>
    </div>
  );
}
