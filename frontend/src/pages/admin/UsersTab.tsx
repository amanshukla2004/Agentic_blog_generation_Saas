import React, { useState } from 'react';
import { 
  useGetUsersQuery, 
  useResetUserQuotaMutation, 
  useToggleUserActiveMutation,
  useToggleUserAdminMutation 
} from '../../store/api/masterApi';
import { Button, Table, RoleBadge, Progress, StatusBadge, Input, TuiPagination, TuiShimmer } from '../../components/tui/Primitives';

export const UsersTab: React.FC<{ userLimit: string, adminLimit: string }> = ({ userLimit, adminLimit }) => {
  const [page, setPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Use a debounced value or just search on enter, but for TUI simplicity we can just search on type
  // In a real app we'd debounce this.
  const { data: usersData, isLoading: usersLoading, refetch } = useGetUsersQuery({ 
    page, 
    size: 15, 
    search: searchQuery 
  });

  const [resetQuota] = useResetUserQuotaMutation();
  const [toggleActive] = useToggleUserActiveMutation();
  const [toggleAdmin] = useToggleUserAdminMutation();

  const handleResetQuota = async (id: string) => {
    await resetQuota(id);
    refetch();
  };

  const handleToggleActive = async (id: string) => {
    await toggleActive(id);
    refetch();
  };

  const handleToggleAdmin = async (id: string) => {
    await toggleAdmin(id);
    refetch();
  };

  const userColumns = ["Email", "Role", "Generations", "Status", "Actions"];

  const renderUserRow = (user: any) => {
    const limit = user.role === 'ADMIN' ? Number(adminLimit || 30) : Number(userLimit || 6);
    return (
      <>
        <td className="px-4 py-3 text-fg">{user.email}</td>
        <td className="px-4 py-3"><RoleBadge role={user.role} /></td>
        <td className="px-4 py-3 min-w-[120px]">
          <div className="flex justify-between text-[10px] mb-1">
            <span>{user.generationsCount} / {limit}</span>
            {user.generationsCount >= limit && <span className="text-danger">QUOTA EXCEEDED</span>}
          </div>
          <Progress value={user.generationsCount} max={limit} />
        </td>
        <td className="px-4 py-3">
          <StatusBadge status={user.isActive ? 'SUCCESS' : 'ERROR'}>
            {user.isActive ? 'ACTIVE' : 'BANNED'}
          </StatusBadge>
        </td>
        <td className="px-4 py-3 flex gap-2 flex-wrap">
          <Button variant="ghost" onClick={() => handleResetQuota(user.id)} className="text-[10px] px-2 py-1 h-auto">Reset</Button>
          {user.role !== 'MASTER_ADMIN' && (
            <>
              <Button variant="accent" onClick={() => handleToggleAdmin(user.id)} className="text-[10px] px-2 py-1 h-auto">
                {user.role === 'ADMIN' ? 'Make User' : 'Make Author'}
              </Button>
              <Button variant="danger" onClick={() => handleToggleActive(user.id)} className="text-[10px] px-2 py-1 h-auto">
                {user.isActive ? 'Ban' : 'Unban'}
              </Button>
            </>
          )}
        </td>
      </>
    );
  };

  return (
    <div className="w-full font-mono text-sm">
      <div className="mb-6 max-w-md">
        <Input 
          placeholder="Search by email (server-side)..."
          value={searchQuery}
          onChange={(e: any) => {
            setSearchQuery(e.target.value);
            setPage(0); // reset page on new search
          }}
        />
      </div>
      
      {usersLoading ? (
        <div className="py-8">
          <TuiShimmer width={60} />
          <p className="text-secondary mt-2 text-xs uppercase tracking-widest">Querying User Database...</p>
        </div>
      ) : (
        <>
          <Table 
            columns={userColumns} 
            data={usersData?.content || []} 
            renderRow={renderUserRow} 
          />
          {usersData && usersData.totalPages > 1 && (
            <div className="mt-4 flex justify-end">
              <TuiPagination 
                currentPage={usersData.number} 
                totalPages={usersData.totalPages} 
                onPageChange={(p: number) => setPage(p)} 
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};
