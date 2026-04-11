import React, { useEffect, useState } from 'react';
import { GrowingGoal } from '../../components/GrowingGoal/GrowingGoal';

type ActiveGoalResponse = {
  goal: {
    id: number;
    targetAmount: number;
    startDate: string;
    endDate: string;
    dateRangeLabel: string;
  } | null;
  amountRaised: number;
  progressPercent: number;
};

export const AdminGrowingGoal: React.FC = () => {
  const [data, setData] = useState<ActiveGoalResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchActiveGoal = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem('token');

        const response = await fetch('/api/donations/goal/active', {
          headers: token
            ? {
                Authorization: `Bearer ${token}`,
              }
            : undefined,
        });

        if (!response.ok) {
          throw new Error('Failed to fetch active goal');
        }

        const result: ActiveGoalResponse = await response.json();
        setData(result);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to fetch active goal',
        );
      } finally {
        setLoading(false);
      }
    };

    fetchActiveGoal();
  }, []);

  if (loading) {
    return <div>Loading growing goal...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!data?.goal) {
    return <GrowingGoal message="Growing Goal" total={0} goal={0} />;
  }

  return (
    <GrowingGoal
      message={data.goal.dateRangeLabel}
      total={data.amountRaised}
      goal={data.goal.targetAmount}
    />
  );
};
