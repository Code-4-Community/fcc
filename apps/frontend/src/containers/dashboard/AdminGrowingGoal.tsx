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
    goalAmount: string;
    startDate: string;
    endDate?: string;
  }) => {
    console.log('HandleSave triggered with:', formData);

    try {
      const token = localStorage.getItem('accessToken');
      apiClient.setAuthToken(token);

      // parse of "$10,000" string to number
      const targetAmount = parseInt(formData.goalAmount.replace(/[^0-9]/g, ''));
      if (isNaN(targetAmount)) {
        throw new Error('Invalid goal amount. Please enter a number.');
      }

      const mmddyyyyRegex = /^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/;

      const parseDate = (dateStr: string | null) => {
        if (!dateStr) return null;

        const match = dateStr.match(mmddyyyyRegex);
        if (match) {
          const [_, m, d, y] = match;
          return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
        }

        throw new Error('Invalid date format. Please use MM/DD/YYYY.');
      };

      const startDate = parseDate(formData.startDate);
      const endDate = parseDate(formData.endDate || null);

      const id = data?.goal?.id || null;
      console.log('Sending update to API:', {
        id,
        targetAmount,
        title: formData.title,
        startDate,
        endDate,
      });

      await apiClient.updateGoal(id, {
        targetAmount,
        title: formData.title,
        startDate: startDate || '',
        endDate: endDate || '',
      });

      console.log('Update successful, refreshing...');
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
      onEdit={() => setIsEditing(true)}
    />
  );
};
