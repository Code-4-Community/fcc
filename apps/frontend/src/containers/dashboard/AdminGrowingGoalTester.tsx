import React from 'react';
import { AdminGrowingGoal } from './AdminGrowingGoal';

export const AdminGrowingGoalTester: React.FC = () => {
  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Admin Growing Goal Tester</h1>
      <div style={{ marginTop: '2rem' }}>
        <AdminGrowingGoal />
      </div>
    </div>
  );
};
