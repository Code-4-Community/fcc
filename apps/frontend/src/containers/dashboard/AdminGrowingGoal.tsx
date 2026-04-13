import React from 'react';
import { GrowingGoal } from '../../components/GrowingGoal/GrowingGoal';
import { useActiveGoal } from '../../hooks/useActiveGoal';

export const AdminGrowingGoal: React.FC = () => {
  const { data, loading, error } = useActiveGoal();

  if (loading) {
    return <div>Loading growing goal...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!data?.goal) {
    return (
      <GrowingGoal
        message="Current Donation Goal"
        subMessage="No active goal period"
        total={0}
        goal={0}
        variant="admin"
      />
    );
  }

  return (
    <GrowingGoal
      message="Current Donation Goal"
      subMessage={data.goal.dateRangeLabel}
      total={data.amountRaised}
      goal={data.goal.targetAmount}
      variant="admin"
    />
  );
};
