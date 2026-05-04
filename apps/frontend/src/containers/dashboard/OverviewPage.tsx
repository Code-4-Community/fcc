import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../components/AuthProvider';
import apiClient from '../../api/apiClient';
import DonationStatCard from './sidebar/DonationStatCard';
import { getDisplayName } from '../../utils/user';
import { PiggyBank, Clock, CalendarDays } from 'lucide-react';
import welcomeBackground from '../../assets/green-boston-background.png';
import { AdminGrowingGoal } from './AdminGrowingGoal';
import { DonorStatsChart } from '../../components/DonorStatsChart';

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

export default function OverviewPage() {
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

  const displayUserName = useMemo(() => getDisplayName(user), [user]);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);

  return (
    <div className="flex min-h-full bg-[#F5F5F5]">
      <main className="flex-1 p-5">
        <h2 className="mb-3 text-[30px] leading-9 font-semibold tracking-[-0.6px] text-black">
          Donations Raised
        </h2>

        <section className="grid grid-cols-1 items-stretch gap-4 md:grid-cols-[minmax(0,1fr)_clamp(350px,31vw,520px)]">
          <div className="flex flex-col gap-4 min-h-0">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <DonationStatCard
                Icon={PiggyBank}
                iconColor="#3D3E6E"
                bgColor="#ECECF0"
                label="Total"
                value={formatCurrency(stats.total)}
              />

              <DonationStatCard
                Icon={Clock}
                iconColor="#893C27"
                bgColor="#F3EBE9"
                label="Year-to-date"
                value={formatCurrency(stats.yearToDate)}
              />

              <DonationStatCard
                Icon={CalendarDays}
                iconColor="#C7BE3B"
                bgColor="#F4F2D8"
                label="This Month"
                value={formatCurrency(stats.monthToDate)}
              />
            </div>
            <div className="flex flex-1 flex-col min-h-0">
              <DonorStatsChart className="h-full min-h-0" />
            </div>
          </div>

          <div className="flex flex-col gap-4 min-h-0">
            <aside className="relative aspect-square overflow-hidden rounded-[10px] bg-[#409887] p-5 text-white">
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
            <AdminGrowingGoal />
          </div>
        </section>
      </main>
    </div>
  );
}
