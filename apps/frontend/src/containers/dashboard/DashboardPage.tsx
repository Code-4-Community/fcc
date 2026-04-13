import React from 'react';
import { useAuth } from '../../components/AuthProvider';
import { Button } from '../../components/ui/button';
import { UserManagement } from './UserManagement';
import { AdminGrowingGoal } from './AdminGrowingGoal';
import { getDisplayName } from '../../utils/user';

export const DashboardPage: React.FC = () => {
  const { logout, user } = useAuth();

  const welcomeName = getDisplayName(user);

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
        }}
      >
        <h1>Dashboard</h1>
        <Button onClick={logout} variant="outline">
          Sign out
        </Button>
      </header>

      <main style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <section
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: '2rem',
          }}
        >
          <div>
            <h3>Welcome!</h3>
            <p>You are logged into the protected dashboard.</p>
          </div>
          <div style={{ width: '300px' }}>
            <AdminGrowingGoal />
          </div>
        </section>

        <UserManagement />
      </main>
    </div>
  );
};
