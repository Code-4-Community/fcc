import React, { useState } from 'react';
import { GrowingGoal } from '../../components/GrowingGoal/GrowingGoal';
import EditDonationGoal from '../../components/DonationGoal/EditDonationGoal';
import { useActiveGoal } from '../../hooks/useActiveGoal';
import { ApiClient } from '../../api/apiClient';

const apiClient = new ApiClient();

export const AdminGrowingGoal: React.FC = () => {
  const { data, loading, error, refresh } = useActiveGoal();
  const [isEditing, setIsEditing] = useState(false);

  if (loading) {
    return <div>Loading growing goal...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  const handleSave = async (formData: {
    title: string;
    targetAmount: number;
    startDate: string;
    endDate: string;
  }) => {
    // formData is already validated and normalized by EditDonationGoal:
    // a positive integer amount and ISO (YYYY-MM-DD) dates. The `goals`
    // columns for title/startDate/endDate are nullable, but the editor
    // requires the dates and treats an empty title as a valid cleared
    // value (the backend reads it back as `title ?? ''`).
    try {
      const token = localStorage.getItem('accessToken');
      apiClient.setAuthToken(token);

      const id = data?.goal?.id || null;

      await apiClient.updateGoal(id, {
        targetAmount: formData.targetAmount,
        title: formData.title,
        startDate: formData.startDate,
        endDate: formData.endDate,
      });

      await refresh();
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to update goal:', err);
      alert(
        'Failed to update goal: ' +
          (err instanceof Error ? err.message : 'Unknown error'),
      );
    }
  };

  if (isEditing) {
    const formatToMMDDYYYY = (dateStr?: string) => {
      if (!dateStr || !dateStr.includes('-')) return dateStr || '';
      const [y, m, d] = dateStr.split('-');
      // Strip time if present
      const day = d.split('T')[0];
      return `${m}/${day}/${y}`;
    };

    return (
      <EditDonationGoal
        initialData={{
          title: data?.goal?.title || '',
          goalAmount: data?.goal?.targetAmount
            ? `$${data.goal.targetAmount.toLocaleString()}`
            : '',
          startDate: formatToMMDDYYYY(data?.goal?.startDate),
          endDate: formatToMMDDYYYY(data?.goal?.endDate),
          amountRaised: data?.amountRaised,
          targetAmount: data?.goal?.targetAmount,
        }}
        onCancel={() => setIsEditing(false)}
        onSave={handleSave}
      />
    );
  }

  if (!data?.goal) {
    return (
      <GrowingGoal
        message="Current Donation Goal"
        subMessage="No active goal period"
        total={0}
        goal={0}
        variant="admin"
        fillHeight
        onEdit={() => setIsEditing(true)}
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
      fillHeight
      onEdit={() => setIsEditing(true)}
    />
  );
};
