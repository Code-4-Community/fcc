import React, { useEffect, useState } from 'react';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import apiClient from '../../api/apiClient';
import { useAuth } from '../../components/AuthProvider';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { ConfirmationModal } from '../../components/ConfirmationModal';

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
  const [editingUser, setEditingUser] = useState<CombinedUser | null>(null);
  const [denyingUser, setDenyingUser] = useState<CombinedUser | null>(null);
  const [verifyingUser, setVerifyingUser] = useState<CombinedUser | null>(null);
  const [modalPosition, setModalPosition] = useState<
    // eslint-disable-next-line no-restricted-globals
    { top: number; right: number } | undefined
  >(undefined);
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

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

  const handleVerify = async () => {
    if (!verifyingUser) return;
    setIsProcessing(true);
    try {
      await (apiClient as any).axiosInstance.post('/api/auth/admin-verify', {
        email: verifyingUser.email,
      });
      await fetchUsers();
      setVerifyingUser(null);
      setModalPosition(undefined);
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeny = async () => {
    if (!denyingUser) return;
    setIsProcessing(true);
    try {
      await (apiClient as any).axiosInstance.post('/api/auth/admin-deny', {
        email: denyingUser.email,
      });
      await fetchUsers();
      setDenyingUser(null);
      setModalPosition(undefined);
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEditRole = async () => {
    if (!editingUser || !editingUser.dbUser) return;

    setIsUpdatingRole(true);
    try {
      const currentStatus = editingUser.dbUser.status;
      const newStatus = currentStatus === 'ADMIN' ? 'STANDARD' : 'ADMIN';

      await apiClient.updateUserStatus(editingUser.dbUser.id, newStatus);

      await fetchUsers();
      setEditingUser(null);
    } catch (err: any) {
      alert('Error changing role: ' + err.message);
    } finally {
      setIsUpdatingRole(false);
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
      <div className="flex flex-col h-full bg-[#F5F5F5] p-8">
        <div className="flex flex-col flex-1 rounded-[24px] border border-neutral-200 bg-white/90 shadow-[0_4px_12px_rgba(15,23,42,0.08)] backdrop-blur-sm overflow-hidden">
          <div className="flex items-center justify-center flex-1">
            <p className="text-base text-[#737373]">Loading users...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col h-full bg-[#F5F5F5] p-8">
        <div className="flex flex-col flex-1 rounded-[24px] border border-neutral-200 bg-white/90 shadow-[0_4px_12px_rgba(15,23,42,0.08)] backdrop-blur-sm overflow-hidden">
          <div className="flex items-center justify-center flex-1">
            <p className="text-base text-red-500">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#F5F5F5] p-8">
      <div className="flex flex-col flex-1 rounded-[24px] border border-neutral-200 bg-white/90 shadow-[0_4px_12px_rgba(15,23,42,0.08)] backdrop-blur-sm overflow-hidden">
        {/* Table header bar */}
        <div className="flex flex-col gap-6 p-8 border-b border-[#e5e5e5]">
          <div className="flex flex-row items-center justify-between gap-4">
            {/* Search */}
            <div className="flex items-center gap-2 border border-neutral-200 rounded-full px-4 w-[400px] bg-white">
              <Search
                className="text-neutral-400 shrink-0"
                size={20}
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
                className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-base text-[#171717] leading-6 tracking-[0.07px] placeholder:text-neutral-400 h-12 px-0 bg-transparent"
              />
            </div>

            {/* Toggle */}
            <div className="flex">
              <button
                onClick={() => {
                  setActiveTab('pending');
                  setCurrentPage(1);
                }}
                className={`flex items-center justify-center px-6 py-3 text-base font-medium text-[#171717] border border-[#e5e5e5] rounded-l-lg transition-colors ${
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
                className={`flex items-center justify-center px-6 py-3 text-base font-medium text-[#171717] border border-[#e5e5e5] border-l-0 rounded-r-lg transition-colors ${
                  activeTab === 'approved' ? 'bg-[#e5e5e5]' : 'bg-white'
                }`}
              >
                Approved Users
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 px-8 overflow-y-auto min-h-0">
          <table className="w-full min-w-[700px] border-separate border-spacing-0">
            <thead className="sticky top-0 z-10 bg-white">
              {/* Header row */}
              <tr className="bg-[#f5f5f5] h-14">
                <th className="w-8 rounded-tl-lg border-b border-[#e5e5e5]"></th>
                <th className="px-4 font-normal text-base text-[#171717] tracking-[0.07px] text-left border-b border-[#e5e5e5]">
                  Username
                </th>
                <th className="px-4 font-normal text-base text-[#171717] tracking-[0.07px] text-left border-b border-[#e5e5e5]">
                  Email
                </th>
                <th className="px-4 font-normal text-base text-[#171717] tracking-[0.07px] text-left border-b border-[#e5e5e5]">
                  Role
                </th>
                <th className="px-4 font-normal text-base text-[#171717] tracking-[0.07px] text-right rounded-tr-lg border-b border-[#e5e5e5]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {/* Data rows */}
              {paginatedUsers.length > 0 ? (
                paginatedUsers.map((user, index) => (
                  <tr
                    key={user.username}
                    className={`h-[64px] border-b border-[#e5e5e5] transition-colors hover:bg-neutral-50/50 ${
                      index % 2 === 0 ? 'bg-white' : 'bg-[#fcfcfc]'
                    }`}
                  >
                    <td className="w-8 border-b border-[#e5e5e5]"></td>
                    <td className="px-4 max-w-[200px] border-b border-[#e5e5e5]">
                      <div className="text-base text-[#171717] tracking-[0.07px] truncate">
                        {user.name ?? user.username}
                      </div>
                    </td>
                    <td className="px-4 max-w-[300px] border-b border-[#e5e5e5]">
                      <div className="text-base text-[#171717] tracking-[0.07px] truncate">
                        {user.email}
                      </div>
                    </td>
                    <td className="px-4 border-b border-[#e5e5e5]">
                      <RoleBadge
                        role={user.dbUser?.status}
                        isApproved={activeTab === 'approved'}
                      />
                    </td>
                    <td className="px-4 text-right border-b border-[#e5e5e5]">
                      <div className="flex items-center justify-end gap-3 shrink-0">
                        {currentUser?.status === 'ADMIN' && (
                          <>
                            {activeTab === 'pending' ? (
                              <>
                                <Button
                                  variant="success"
                                  onClick={(e) => {
                                    const rect =
                                      e.currentTarget.getBoundingClientRect();
                                    setModalPosition({
                                      top: rect.bottom + 8,
                                      right: window.innerWidth - rect.right,
                                    });
                                    setVerifyingUser(user);
                                  }}
                                  className="rounded-[10px] px-4 py-2 h-10 text-base font-medium"
                                >
                                  Approve
                                </Button>
                                <Button
                                  variant="outline"
                                  onClick={(e) => {
                                    const rect =
                                      e.currentTarget.getBoundingClientRect();
                                    setModalPosition({
                                      top: rect.bottom + 8,
                                      right: window.innerWidth - rect.right,
                                    });
                                    setDenyingUser(user);
                                  }}
                                  className="rounded-[10px] px-4 py-2 h-10 text-base font-medium border-[#e5e5e5] text-black bg-white hover:bg-gray-50 shadow-sm"
                                >
                                  Deny
                                </Button>
                              </>
                            ) : (
                              <>
                                <Button
                                  variant="outline"
                                  onClick={(e) => {
                                    const rect =
                                      e.currentTarget.getBoundingClientRect();
                                    setModalPosition({
                                      top: rect.bottom + 8,
                                      right: window.innerWidth - rect.right,
                                    });
                                    setEditingUser(user);
                                  }}
                                  className="rounded-[10px] px-4 py-2 h-10 text-base font-medium font-['Source_Sans_Pro'] border-[#e5e5e5] text-black bg-white hover:bg-gray-50 shadow-sm"
                                >
                                  Edit Role
                                </Button>
                                <Button
                                  onClick={(e) => {
                                    const rect =
                                      e.currentTarget.getBoundingClientRect();
                                    setModalPosition({
                                      top: rect.bottom + 8,
                                      right: window.innerWidth - rect.right,
                                    });
                                    setDenyingUser(user);
                                  }}
                                  className="rounded-[10px] px-4 py-2 h-10 text-base font-medium bg-[#893C27] text-white hover:bg-[#6c2f1f] border-0"
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
                      <p className="text-base text-[#737373]">
                        No users found.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-end px-8 py-8 gap-3 border-t border-[#e5e5e5] bg-white">
            <Button
              variant="ghost"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="gap-2 px-6 h-12 text-base text-[#171717] font-medium"
            >
              <ChevronLeft size={18} />
              Previous
            </Button>

            {getPageNumbers(currentPage, totalPages).map((page, i) =>
              page === '...' ? (
                <span
                  key={`ellipsis-${i}`}
                  className="flex items-center justify-center w-10 h-10 text-base text-[#171717]"
                >
                  ···
                </span>
              ) : (
                <Button
                  key={page}
                  variant={currentPage === page ? 'outline' : 'ghost'}
                  onClick={() => setCurrentPage(page as number)}
                  className={`w-12 h-12 text-base font-medium text-[#171717] ${
                    currentPage === page
                      ? 'border-[#e5e5e5] shadow-sm bg-white'
                      : ''
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
              className="gap-2 px-6 h-12 text-base text-[#171717] font-medium"
            >
              Next
              <ChevronRight size={18} />
            </Button>
          </div>
        )}
      </div>

      {/* Modular Popups for User Actions */}
      {editingUser && (
        <ConfirmationModal
          isOpen={true}
          position={modalPosition}
          onClose={() => {
            setEditingUser(null);
            setModalPosition(undefined);
          }}
          onConfirm={handleEditRole}
          title="Edit Role"
          heading={<>Update {editingUser.name || editingUser.username} role?</>}
          description={
            <>
              By pressing Confirm, you will update{' '}
              <span className="text-[#171717]">
                {editingUser.name || editingUser.username}
              </span>{' '}
              role to{' '}
              <span className="text-[#171717]">
                {editingUser.dbUser?.status === 'ADMIN' ? 'STANDARD' : 'ADMIN'}
              </span>
              .
            </>
          }
          confirmText="Confirm"
          cancelText="Cancel"
          confirmVariant="success"
          isConfirming={isUpdatingRole}
        />
      )}

      {verifyingUser && (
        <ConfirmationModal
          isOpen={true}
          position={modalPosition}
          onClose={() => {
            setVerifyingUser(null);
            setModalPosition(undefined);
          }}
          onConfirm={handleVerify}
          title="Approve User"
          heading={<>Approve {verifyingUser.name || verifyingUser.username}?</>}
          description={
            <>
              By pressing Confirm, you will approve{' '}
              <span className="text-[#171717]">
                {verifyingUser.name || verifyingUser.username}
              </span>{' '}
              as a user. This will allow them to access the platform.
            </>
          }
          confirmText="Confirm"
          cancelText="Cancel"
          confirmVariant="success"
          isConfirming={isProcessing}
        />
      )}

      {denyingUser && (
        <ConfirmationModal
          isOpen={true}
          position={modalPosition}
          onClose={() => {
            setDenyingUser(null);
            setModalPosition(undefined);
          }}
          onConfirm={handleDeny}
          title="Delete User"
          heading={
            <>
              {activeTab === 'pending' ? 'Deny' : 'Delete'}{' '}
              {denyingUser.name || denyingUser.username}?
            </>
          }
          description={
            <>
              By pressing Confirm, you will{' '}
              <span className="text-[#171717]">
                {activeTab === 'pending' ? 'deny and remove' : 'delete'}
              </span>{' '}
              <span className="text-[#171717]">
                {denyingUser.name || denyingUser.username}
              </span>{' '}
              from the system. This action cannot be undone.
            </>
          }
          confirmText="Confirm"
          cancelText="Cancel"
          confirmVariant="success"
          isConfirming={isProcessing}
        />
      )}
    </div>
  );
};
