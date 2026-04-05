import React, { useEffect, useState } from 'react';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import apiClient from '../../api/apiClient';
import { useAuth } from '../../components/AuthProvider';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';

interface CombinedUser {
  username: string;
  name?: string;
  status: string;
  email: string;
  dbUser: {
    id: number;
    status: string;
    firstName: string;
    lastName: string;
  } | null;
}

const ROWS_PER_PAGE = 13;

function RoleBadge({
  role,
  isApproved,
}: {
  role: string | null | undefined;
  isApproved?: boolean;
}) {
  if (!role) {
    if (isApproved) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm leading-6 whitespace-nowrap bg-gray-100 text-gray-500 italic">
          Not Found
        </span>
      );
    }
    return null;
  }
  const isAdmin = role === 'ADMIN';
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-sm leading-6 whitespace-nowrap ${
        isAdmin ? 'bg-[#ddd889] text-black' : 'bg-[#e5e5e5] text-black'
      }`}
    >
      {isAdmin ? 'Admin' : 'Standard'}
    </span>
  );
}

function getPageNumbers(current: number, total: number): (number | '...')[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const pages: (number | '...')[] = [1, 2, 3, 4];
  pages.push('...');
  pages.push(total);
  return pages;
}

export const UserManagement: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<CombinedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'pending' | 'approved'>('pending');
  const [currentPage, setCurrentPage] = useState(1);

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

  const handleDeny = async (email: string) => {
    try {
      await (apiClient as any).axiosInstance.post('/api/auth/admin-deny', {
        email,
      });
      fetchUsers();
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  const filteredUsers = users
    .filter((u) =>
      activeTab === 'pending'
        ? u.status !== 'CONFIRMED'
        : u.status === 'CONFIRMED',
    )
    .filter(
      (u) =>
        !searchQuery ||
        u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchQuery.toLowerCase()),
    );

  const totalPages = Math.max(
    1,
    Math.ceil(filteredUsers.length / ROWS_PER_PAGE),
  );
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * ROWS_PER_PAGE,
    currentPage * ROWS_PER_PAGE,
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 bg-white rounded-xl">
        <p className="text-sm text-[#737373]">Loading users...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 bg-white rounded-xl">
        <p className="text-sm text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-t-xl w-full">
      {/* Table header bar */}
      <div className="flex items-end justify-between px-4 pt-4 pb-2 rounded-tl-xl rounded-tr-xl">
        {/* Search */}
        <div className="flex items-center gap-1 border border-[rgba(1,1,46,0.08)] rounded-lg px-[10px] w-[310px] bg-white">
          <Search
            className="text-[#737373] shrink-0"
            size={16}
            strokeWidth={1.5}
          />
          <Input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-sm text-[#737373] leading-6 tracking-[0.07px] placeholder:text-[#737373] h-auto py-[10px] px-0 bg-transparent"
          />
        </div>

        {/* Toggle */}
        <div className="flex h-10">
          <button
            onClick={() => {
              setActiveTab('pending');
              setCurrentPage(1);
            }}
            className={`flex items-center justify-center px-4 py-2 text-sm leading-6 text-[#171717] border border-[#e5e5e5] rounded-l-lg transition-colors ${
              activeTab === 'pending' ? 'bg-[#e5e5e5]' : 'bg-white'
            }`}
          >
            Pending Approval
          </button>
          <button
            onClick={() => {
              setActiveTab('approved');
              setCurrentPage(1);
            }}
            className={`flex items-center justify-center px-4 py-2 text-sm leading-6 text-[#171717] border border-[#e5e5e5] border-l-0 rounded-r-lg transition-colors ${
              activeTab === 'approved' ? 'bg-[#e5e5e5]' : 'bg-white'
            }`}
          >
            Approved Users
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="px-4 overflow-x-auto pb-4">
        <table className="w-full min-w-[700px] border-collapse">
          <thead>
            {/* Header row */}
            <tr className="bg-[#f5f5f5] h-11">
              <th className="w-8 rounded-tl-lg"></th>
              <th className="px-2 font-normal text-sm text-[#171717] tracking-[0.07px] text-left">
                Username
              </th>
              <th className="px-2 font-normal text-sm text-[#171717] tracking-[0.07px] text-left">
                Email
              </th>
              <th className="px-2 font-normal text-sm text-[#171717] tracking-[0.07px] text-left">
                Role
              </th>
              <th className="px-2 font-normal text-sm text-[#171717] tracking-[0.07px] text-right rounded-tr-lg">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {/* Data rows */}
            {paginatedUsers.length > 0 ? (
              paginatedUsers.map((user) => (
                <tr
                  key={user.username}
                  className="h-[44px] bg-white border-b border-[#e5e5e5]"
                >
                  <td className="w-8"></td>
                  <td className="px-2 max-w-[150px]">
                    <div className="text-sm text-[#171717] tracking-[0.07px] truncate">
                      {user.name ?? user.username}
                    </div>
                  </td>
                  <td className="px-2 max-w-[250px]">
                    <div className="text-sm text-[#171717] tracking-[0.07px] truncate">
                      {user.email}
                    </div>
                  </td>
                  <td className="px-2">
                    <RoleBadge
                      role={user.dbUser?.status}
                      isApproved={activeTab === 'approved'}
                    />
                  </td>
                  <td className="px-2 text-right">
                    <div className="flex items-center justify-end gap-2 shrink-0">
                      {currentUser?.status === 'ADMIN' && (
                        <>
                          {activeTab === 'pending' ? (
                            <>
                              <Button
                                variant="success"
                                onClick={() => handleVerify(user.email)}
                                className="rounded-[10px] px-3 py-1 h-auto text-sm leading-6"
                              >
                                Approve
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => handleDeny(user.email)}
                                className="rounded-[10px] px-3 py-1 h-auto text-sm leading-6 border-[#e5e5e5] text-black bg-white hover:bg-gray-50"
                              >
                                Deny
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                variant="outline"
                                className="rounded-[10px] px-3 py-1 h-auto text-sm leading-6 font-['Source_Sans_Pro'] border-[#e5e5e5] text-black bg-white hover:bg-gray-50"
                              >
                                Edit Role
                              </Button>
                              <Button
                                onClick={() => handleDeny(user.email)}
                                className="rounded-[10px] px-3 py-1 h-auto text-sm leading-6 bg-[#893C27] text-white hover:bg-[#6c2f1f] border-0"
                              >
                                Delete User
                              </Button>
                            </>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5}>
                  <div className="flex items-center justify-center h-48">
                    <p className="text-sm text-[#737373]">No users found.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-end px-4 py-3 gap-2">
          <Button
            variant="ghost"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="gap-2 px-4 py-[7.5px] h-auto text-base text-[#171717]"
          >
            <ChevronLeft size={13} />
            Previous
          </Button>

          {getPageNumbers(currentPage, totalPages).map((page, i) =>
            page === '...' ? (
              <span
                key={`ellipsis-${i}`}
                className="flex items-center justify-center w-9 h-9 text-base text-[#171717] select-none"
              >
                ···
              </span>
            ) : (
              <Button
                key={page}
                variant={currentPage === page ? 'outline' : 'ghost'}
                onClick={() => setCurrentPage(page as number)}
                className={`w-[34px] min-h-9 h-auto py-[7.5px] text-base text-[#171717] ${
                  currentPage === page ? 'border-[#e5e5e5] shadow-sm' : ''
                }`}
              >
                {page}
              </Button>
            ),
          )}

          <Button
            variant="ghost"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="gap-2 px-4 py-[7.5px] h-auto text-base text-[#171717]"
          >
            Next
            <ChevronRight size={13} />
          </Button>
        </div>
      )}
    </div>
  );
};
