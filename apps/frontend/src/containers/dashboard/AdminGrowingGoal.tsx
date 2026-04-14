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

      const isoRegex = /^\d{4}-\d{2}-\d{2}$/;
      const slashRegex = /^\d{4}\/\d{2}\/\d{2}$/;

      // Validate date format (YYYY-MM-DD or YYYY/MM/DD)
      let startDate = formData.startDate || null;
      if (startDate) {
        if (!isoRegex.test(startDate) && !slashRegex.test(startDate)) {
          throw new Error(
            'Invalid Start Date format. Please use YYYY-MM-DD or YYYY/MM/DD.',
          );
        }
        if (startDate.includes('/')) {
          startDate = startDate.replace(/\//g, '-');
        }
      }

      let endDate = formData.endDate || null;
      if (endDate) {
        if (!isoRegex.test(endDate) && !slashRegex.test(endDate)) {
          throw new Error(
            'Invalid End Date format. Please use YYYY-MM-DD or YYYY/MM/DD.',
          );
        }
        if (endDate.includes('/')) {
          endDate = endDate.replace(/\//g, '-');
        }
      }

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
    return (
      <EditDonationGoal
        initialData={{
          title: data?.goal?.title || '',
          goalAmount: data?.goal?.targetAmount
            ? `$${data.goal.targetAmount.toLocaleString()}`
            : '',
          startDate: data?.goal?.startDate || '',
          endDate: data?.goal?.endDate || '',
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
