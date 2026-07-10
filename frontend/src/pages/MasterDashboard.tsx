import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  useGetUsersQuery, 
  useResetUserQuotaMutation, 
  useToggleUserActiveMutation,
  useToggleUserAdminMutation,
  useGetSystemErrorsQuery,
  useUpdatePromptMutation,
  useGetPromptsQuery,
  useGetAuthorsStatsQuery,
  useGetAllBlogsQuery,
  useToggleStaffPickMutation,
  useDeleteBlogMutation,
  useGetSystemSettingsQuery,
  useUpdateSettingMutation,
  useGetSystemStatsQuery,
  useGetAiHealthQuery
} from '../store/api/masterApi';
import { Button, Table, Tabs, RoleBadge, Progress, StatusBadge, Input, Field } from '../components/tui/Primitives';

type Tab = 'OVERVIEW' | 'USERS' | 'AUTHORS' | 'BLOGS' | 'LOGS' | 'PROMPTS' | 'SETTINGS';

export const MasterDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('OVERVIEW');

  const { data: users, isLoading: usersLoading, refetch: refetchUsers } = useGetUsersQuery();
  const { data: logs, isLoading: logsLoading } = useGetSystemErrorsQuery();
  
  const [resetQuota] = useResetUserQuotaMutation();
  const [toggleActive] = useToggleUserActiveMutation();
  const [toggleAdmin] = useToggleUserAdminMutation();
  const [updatePrompt] = useUpdatePromptMutation();
  const { data: prompts } = useGetPromptsQuery();
  const { data: authors, isLoading: authorsLoading } = useGetAuthorsStatsQuery();
  const { data: blogsData, isLoading: blogsLoading, refetch: refetchBlogs } = useGetAllBlogsQuery({ page: 0, size: 50 });
  const [toggleStaffPick] = useToggleStaffPickMutation();
  const [deleteBlog] = useDeleteBlogMutation();
  
  const { data: settings } = useGetSystemSettingsQuery();
  const [updateSetting] = useUpdateSettingMutation();

  const [promptText, setPromptText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [userLimit, setUserLimit] = useState('');
  const [adminLimit, setAdminLimit] = useState('');
  const [maintenanceMode, setMaintenanceMode] = useState('false');
  const [systemAnnouncement, setSystemAnnouncement] = useState('');

  const { data: stats, isLoading: statsLoading } = useGetSystemStatsQuery();
  const { data: aiHealth, isLoading: aiHealthLoading } = useGetAiHealthQuery();
  
  React.useEffect(() => {
    if (prompts && prompts.length > 0) {
      setPromptText(prompts[0].promptText);
    }
  }, [prompts]);

  React.useEffect(() => {
    if (settings) {
      const userL = settings.find(s => s.settingKey === 'USER_GENERATION_LIMIT')?.settingValue;
      const adminL = settings.find(s => s.settingKey === 'ADMIN_GENERATION_LIMIT')?.settingValue;
      const mm = settings.find(s => s.settingKey === 'MAINTENANCE_MODE')?.settingValue;
      const sa = settings.find(s => s.settingKey === 'SYSTEM_ANNOUNCEMENT_TEXT')?.settingValue;
      if (userL) setUserLimit(userL);
      if (adminL) setAdminLimit(adminL);
      if (mm) setMaintenanceMode(mm);
      if (sa) setSystemAnnouncement(sa);
    }
  }, [settings]);

  const handleResetQuota = async (id: string) => {
    await resetQuota(id);
    refetchUsers();
  };

  const handleToggleActive = async (id: string) => {
    await toggleActive(id);
    refetchUsers();
  };

  const handleToggleAdmin = async (id: string) => {
    await toggleAdmin(id);
    refetchUsers();
  };

  const handleSavePrompt = async () => {
    if (!promptText.trim()) return;
    
    const firstConfirm = window.confirm("WARNING: Are you sure you want to update the core system AI prompt? This will affect all future generations.");
    if (!firstConfirm) return;

    const secondConfirm = window.confirm("DOUBLE CONFIRMATION: Please confirm again. Incorrect system prompts can break the JSON output required by the platform.");
    if (!secondConfirm) return;

    await updatePrompt({ name: 'TECH_BLOG_PROMPT', promptText });
    alert('Configuration saved successfully.');
  };

  const handleUpdateLimit = async (key: string, value: string) => {
    if (!value || isNaN(Number(value))) {
      alert("Please enter a valid number");
      return;
    }
    await updateSetting({ key, settingValue: value });
    alert(`${key} updated successfully`);
  };

  const userColumns = ["Email", "Role", "Generations", "Status", "Actions"];
  const authorColumns = ["Email", "Username", "Published Blogs", "Total Views"];
  const blogColumns = ["Title", "Author", "Status", "Views", "Created At", "Actions"];

  const handleToggleStaffPick = async (id: string, currentStatus: boolean) => {
    await toggleStaffPick({ id, isStaffPick: !currentStatus });
    refetchBlogs();
  };

  const handleDeleteBlog = async (id: string) => {
    if (window.confirm("Are you sure you want to completely delete this blog? This action cannot be undone.")) {
      await deleteBlog(id);
      refetchBlogs();
    }
  };

  const renderUserRow = (user: any) => {
    const limit = user.role === 'ADMIN' ? Number(adminLimit || 30) : Number(userLimit || 6);
    return (
    <>
      <td className="px-4 py-3">{user.email}</td>
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

  const renderAuthorRow = (author: any) => (
    <>
      <td className="px-4 py-3">{author.email}</td>
      <td className="px-4 py-3 text-secondary">{author.username || 'N/A'}</td>
      <td className="px-4 py-3">{author.totalBlogs}</td>
      <td className="px-4 py-3">{author.totalViews}</td>
    </>
  );

  const renderBlogRow = (blog: any) => (
    <>
      <td className="px-4 py-3 min-w-[200px]">
        <div className="font-bold">{blog.title}</div>
        <div className="text-[10px] text-secondary truncate max-w-[300px]">{blog.slug}</div>
      </td>
      <td className="px-4 py-3 text-secondary">{blog.authorEmail}</td>
      <td className="px-4 py-3">
        <StatusBadge status={blog.status === 'PUBLISHED' ? 'SUCCESS' : blog.status === 'FAILED' ? 'ERROR' : 'WARNING'}>
          {blog.status}
        </StatusBadge>
      </td>
      <td className="px-4 py-3 text-secondary">{blog.viewCount || 0}</td>
      <td className="px-4 py-3 text-secondary text-xs">{new Date(blog.createdAt).toLocaleDateString()}</td>
      <td className="px-4 py-3 flex gap-2">
        <Button 
          variant="ghost" 
          onClick={() => navigate(`/blog/${blog.slug}`)}
          className="text-[10px] px-2 py-1 h-auto"
          disabled={blog.status !== 'PUBLISHED'}
        >
          View
        </Button>
        <Button 
          variant={blog.isStaffPick ? "accent" : "ghost"} 
          onClick={() => handleToggleStaffPick(blog.id, blog.isStaffPick)} 
          className="text-[10px] px-2 py-1 h-auto"
          disabled={blog.status !== 'PUBLISHED'}
        >
          {blog.isStaffPick ? 'Unpick' : 'Pick'}
        </Button>
        <Button 
          variant="danger" 
          onClick={() => handleDeleteBlog(blog.id)} 
          className="text-[10px] px-2 py-1 h-auto"
        >
          Delete
        </Button>
      </td>
    </>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 font-mono text-sm [--tw-accent:theme(colors.role-master)]">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-fg uppercase tracking-widest mb-1">Master Control</h1>
        <p className="text-secondary text-xs uppercase tracking-widest">Platform Administration</p>
      </div>

      <Tabs 
        tabs={['OVERVIEW', 'USERS', 'AUTHORS', 'BLOGS', 'LOGS', 'PROMPTS', 'SETTINGS']} 
        activeTab={activeTab} 
        onTabChange={(tab: Tab) => setActiveTab(tab)} 
      />

      <div>
        {activeTab === 'OVERVIEW' && (
          <div className="w-full">
            {statsLoading || aiHealthLoading ? (
              <p className="text-secondary uppercase tracking-widest text-xs">Loading overview data...</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-surface border border-border p-6 flex flex-col justify-between">
                  <h3 className="text-xs uppercase tracking-widest text-secondary mb-2">Total Users</h3>
                  <span className="text-3xl font-bold text-fg">{stats?.totalUsers || 0}</span>
                </div>
                <div className="bg-surface border border-border p-6 flex flex-col justify-between">
                  <h3 className="text-xs uppercase tracking-widest text-secondary mb-2">Total Blogs</h3>
                  <span className="text-3xl font-bold text-fg">{stats?.totalBlogs || 0}</span>
                </div>
                <div className="bg-surface border border-border p-6 flex flex-col justify-between">
                  <h3 className="text-xs uppercase tracking-widest text-secondary mb-2">Total Generations</h3>
                  <span className="text-3xl font-bold text-fg">{stats?.totalGenerations || 0}</span>
                </div>
                <div className="bg-surface border border-border p-6 flex flex-col justify-between">
                  <h3 className="text-xs uppercase tracking-widest text-secondary mb-2">AI Service Status</h3>
                  {aiHealth?.status === 'ok' ? (
                    <span className="text-xl font-bold text-success border border-success px-2 py-1 inline-block text-center w-fit">ONLINE</span>
                  ) : (
                    <span className="text-xl font-bold text-danger border border-danger px-2 py-1 inline-block text-center w-fit">OFFLINE</span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'USERS' && (
          <div className="w-full">
            <div className="mb-6 max-w-md">
              <Input 
                placeholder="Search by email..."
                value={searchQuery}
                onChange={(e: any) => setSearchQuery(e.target.value)}
              />
            </div>
            {usersLoading ? (
              <p className="text-secondary uppercase tracking-widest text-xs">Loading user data...</p>
            ) : (
              <Table 
                columns={userColumns} 
                data={users?.filter(u => u.email.toLowerCase().includes(searchQuery.toLowerCase())) || []} 
                renderRow={renderUserRow} 
              />
            )}
          </div>
        )}

        {activeTab === 'AUTHORS' && (
          <div className="w-full">
            {authorsLoading ? (
              <p className="text-secondary uppercase tracking-widest text-xs">Loading author stats...</p>
            ) : (
              <Table columns={authorColumns} data={authors || []} renderRow={renderAuthorRow} />
            )}
          </div>
        )}

        {activeTab === 'BLOGS' && (
          <div className="w-full">
            {blogsLoading ? (
              <p className="text-secondary uppercase tracking-widest text-xs">Loading blogs...</p>
            ) : (
              <Table columns={blogColumns} data={blogsData?.content || []} renderRow={renderBlogRow} />
            )}
          </div>
        )}

        {activeTab === 'LOGS' && (
          <div className="w-full">
            {logsLoading ? (
              <p className="text-secondary uppercase tracking-widest text-xs">Loading system logs...</p>
            ) : (
              <div className="bg-surface border border-border p-4">
                {logs?.length === 0 && <p className="text-secondary text-xs uppercase tracking-widest">No errors recorded.</p>}
                {logs?.map((log) => (
                  <div key={log.id} className="mb-6 last:mb-0 border-b border-border pb-6 last:border-0 last:pb-0">
                    <div className="flex items-center gap-4 mb-3">
                      <span className="text-xs text-secondary">{new Date(log.createdAt).toISOString()}</span>
                      <span className="text-xs text-danger border border-danger px-1">{log.endpoint}</span>
                    </div>
                    <pre className="text-xs text-fg whitespace-pre-wrap leading-relaxed">
                      {log.errorMessage}
                    </pre>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'PROMPTS' && (
          <div className="w-full max-w-4xl">
            <Field label="System Prompt Configuration">
              <textarea
                className="tui-input min-h-[400px] resize-y mb-4"
                placeholder="Enter system prompt here..."
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
              />
            </Field>
            <Button variant="danger" onClick={handleSavePrompt} icon="!">
              Save Configuration
            </Button>
          </div>
        )}

        {activeTab === 'SETTINGS' && (
          <div className="w-full max-w-xl">
            <div className="bg-surface border border-border p-6 mb-6">
              <h2 className="text-md font-bold mb-4 uppercase tracking-widest text-fg">Generation Limits</h2>
              <p className="text-xs text-secondary mb-6">Control how many drafts normal users and authors (publishers) can generate.</p>
              
              <div className="space-y-6">
                <div className="flex gap-4 items-end">
                  <div className="flex-1">
                    <Field label="Normal User Limit">
                      <Input 
                        type="number" 
                        value={userLimit} 
                        onChange={(e: any) => setUserLimit(e.target.value)} 
                        placeholder="e.g. 6"
                      />
                    </Field>
                  </div>
                  <Button variant="accent" onClick={() => handleUpdateLimit('USER_GENERATION_LIMIT', userLimit)}>
                    Update User Limit
                  </Button>
                </div>

                <div className="flex gap-4 items-end">
                  <div className="flex-1">
                    <Field label="Author / Publisher Limit">
                      <Input 
                        type="number" 
                        value={adminLimit} 
                        onChange={(e: any) => setAdminLimit(e.target.value)} 
                        placeholder="e.g. 30"
                      />
                    </Field>
                  </div>
                  <Button variant="accent" onClick={() => handleUpdateLimit('ADMIN_GENERATION_LIMIT', adminLimit)}>
                    Update Author Limit
                  </Button>
                </div>
              </div>
            </div>

            <div className="bg-surface border border-border p-6 mb-6">
              <h2 className="text-md font-bold mb-4 uppercase tracking-widest text-fg">System Controls</h2>
              
              <div className="space-y-6">
                <div className="flex gap-4 items-end">
                  <div className="flex-1">
                    <Field label="Maintenance Mode (true/false)">
                      <Input 
                        type="text" 
                        value={maintenanceMode} 
                        onChange={(e: any) => setMaintenanceMode(e.target.value)} 
                        placeholder="true or false"
                      />
                    </Field>
                  </div>
                  <Button variant={maintenanceMode === 'true' ? 'danger' : 'accent'} onClick={() => handleUpdateLimit('MAINTENANCE_MODE', maintenanceMode)}>
                    Update
                  </Button>
                </div>

                <div className="flex gap-4 items-end">
                  <div className="flex-1">
                    <Field label="System Announcement Text (leave blank to clear)">
                      <Input 
                        type="text" 
                        value={systemAnnouncement} 
                        onChange={(e: any) => setSystemAnnouncement(e.target.value)} 
                        placeholder="Announcement message..."
                      />
                    </Field>
                  </div>
                  <Button variant="accent" onClick={() => handleUpdateLimit('SYSTEM_ANNOUNCEMENT_TEXT', systemAnnouncement)}>
                    Update
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
