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
    <div className="w-full">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-[#171717]">
          {activeTab === 'pending' ? 'Pending Approval' : 'Approved Users'}
        </h1>
        <p className="text-sm text-[#737373] mt-1">
          {activeTab === 'pending'
            ? 'Showing user accounts awaiting approval for admin or standard roles.'
            : 'Showing approved user accounts for admin or standard roles.'}
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-[#e5e5e5] w-full overflow-hidden">
        {/* Table header bar */}
        <div className="flex items-center justify-between px-4 py-4">
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
                paginatedUsers.map((user, index) => (
                  <tr
                    key={user.username}
                    className={`h-[44px] border-b border-[#e5e5e5] ${
                      index % 2 === 0 ? 'bg-white' : 'bg-[#fcfcfc]'
                    }`}
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
                                  onClick={(e) => {
                                    const rect =
                                      e.currentTarget.getBoundingClientRect();
                                    setModalPosition({
                                      top: rect.bottom + 8,
                                      right: window.innerWidth - rect.right,
                                    });
                                    setVerifyingUser(user);
                                  }}
                                  className="rounded-[10px] px-3 py-1 h-auto text-sm leading-6"
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
                                  className="rounded-[10px] px-3 py-1 h-auto text-sm leading-6 border-[#e5e5e5] text-black bg-white hover:bg-gray-50 shadow-sm"
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
                                  className="rounded-[10px] px-3 py-1 h-auto text-sm leading-6 font-['Source_Sans_Pro'] border-[#e5e5e5] text-black bg-white hover:bg-gray-50 shadow-sm"
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
                                  className="rounded-[10px] px-3 py-1 h-auto text-sm leading-6 bg-[#893C27] text-white hover:bg-[#6c2f1f] border-0 outline-none"
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
