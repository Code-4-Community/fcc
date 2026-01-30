import React, { useEffect, useState } from 'react';
import apiClient from '../../api/apiClient';
import { Button } from '../../components/ui/button';
import { useAuth } from '../../components/AuthProvider';

interface CombinedUser {
  username: string;
  status: string;
  email: string;
  dbUser: {
    id: number;
    status: string;
    firstName: string;
    lastName: string;
  } | null;
}

export const UserManagement: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<CombinedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await (apiClient as any).axiosInstance.get('/api/auth/users');
      setUsers(res.data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleVerify = async (email: string) => {
    try {
      await (apiClient as any).axiosInstance.post('/api/auth/admin-verify', {
        email,
      });
      fetchUsers();
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  if (loading) return <p>Loading users...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div>
      <h2>Users</h2>
      <table border={1} style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>Email</th>
            <th>Status</th>
            <th>Role</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.username}>
              <td style={{ padding: '5px' }}>{user.email}</td>
              <td style={{ padding: '5px' }}>{user.status}</td>
              <td style={{ padding: '5px' }}>
                {user.dbUser?.status || 'none'}
              </td>
              <td style={{ padding: '5px' }}>
                {currentUser?.status === 'ADMIN' &&
                  user.status !== 'CONFIRMED' && (
                    <Button onClick={() => handleVerify(user.email)}>
                      Verify
                    </Button>
                  )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
