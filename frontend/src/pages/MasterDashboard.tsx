import React, { useState } from 'react';
import { 
  useGetUsersQuery, 
  useResetUserQuotaMutation, 
  useToggleUserActiveMutation,
  useToggleUserAdminMutation,
  useGetSystemErrorsQuery,
  useUpdatePromptMutation,
  useGetPromptsQuery,
  useGetAuthorsStatsQuery
} from '../store/api/masterApi';
import { Button } from '../components/ui/Button';

type Tab = 'USERS' | 'AUTHORS' | 'LOGS' | 'PROMPTS';

export const MasterDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('USERS');

  const { data: users, isLoading: usersLoading, refetch: refetchUsers } = useGetUsersQuery();
  const { data: logs, isLoading: logsLoading } = useGetSystemErrorsQuery();
  
  const [resetQuota] = useResetUserQuotaMutation();
  const [toggleActive] = useToggleUserActiveMutation();
  const [toggleAdmin] = useToggleUserAdminMutation();
  const [updatePrompt] = useUpdatePromptMutation();
  const { data: prompts } = useGetPromptsQuery();
  const { data: authors, isLoading: authorsLoading } = useGetAuthorsStatsQuery();

  const [promptText, setPromptText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  React.useEffect(() => {
    if (prompts && prompts.length > 0) {
      setPromptText(prompts[0].promptText);
    }
  }, [prompts]);

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
    
    // Double confirmation
    const firstConfirm = window.confirm("WARNING: Are you sure you want to update the core system AI prompt? This will affect all future generations.");
    if (!firstConfirm) return;

    const secondConfirm = window.confirm("DOUBLE CONFIRMATION: Please confirm again. Incorrect system prompts can break the JSON output required by the platform.");
    if (!secondConfirm) return;

    await updatePrompt({ name: 'TECH_BLOG_PROMPT', promptText });
    alert('Configuration saved successfully.');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-zinc-900 mb-8">Master Control</h1>

      <div className="flex space-x-6 border-b border-zinc-200 mb-8">
        <button
          onClick={() => setActiveTab('USERS')}
          className={`pb-3 font-medium transition-colors ${activeTab === 'USERS' ? 'text-zinc-900 border-b-2 border-zinc-900' : 'text-zinc-500 hover:text-zinc-700'}`}
        >
          Users
        </button>
        <button
          onClick={() => setActiveTab('AUTHORS')}
          className={`pb-3 font-medium transition-colors ${activeTab === 'AUTHORS' ? 'text-zinc-900 border-b-2 border-zinc-900' : 'text-zinc-500 hover:text-zinc-700'}`}
        >
          Author Stats
        </button>
        <button
          onClick={() => setActiveTab('LOGS')}
          className={`pb-3 font-medium transition-colors ${activeTab === 'LOGS' ? 'text-zinc-900 border-b-2 border-zinc-900' : 'text-zinc-500 hover:text-zinc-700'}`}
        >
          System Logs
        </button>
        <button
          onClick={() => setActiveTab('PROMPTS')}
          className={`pb-3 font-medium transition-colors ${activeTab === 'PROMPTS' ? 'text-zinc-900 border-b-2 border-zinc-900' : 'text-zinc-500 hover:text-zinc-700'}`}
        >
          Prompts
        </button>
      </div>

      <div>
        {activeTab === 'USERS' && (
          <div className="w-full">
            <div className="mb-4">
              <input 
                type="text" 
                placeholder="Search by email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full max-w-md px-4 py-2 border border-zinc-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
              />
            </div>
            <div className="w-full overflow-x-auto">
              {usersLoading ? (
                <p className="text-zinc-500 font-mono">Loading user data...</p>
              ) : (
                <table className="w-full text-left text-sm text-zinc-900">
                  <thead>
                    <tr className="border-b border-zinc-200">
                      <th className="pb-3 font-medium">Email</th>
                      <th className="pb-3 font-medium">Role</th>
                      <th className="pb-3 font-medium">Generations</th>
                      <th className="pb-3 font-medium">Status</th>
                      <th className="pb-3 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users?.filter(u => u.email.toLowerCase().includes(searchQuery.toLowerCase())).map((user) => (
                      <tr key={user.id} className="border-b border-zinc-100 last:border-0 hover:bg-zinc-50/50 transition-colors">
                      <td className="py-4">{user.email}</td>
                      <td className="py-4">
                        <span className="font-mono text-xs px-2 py-1 bg-zinc-100 text-zinc-800 rounded">
                          {user.role}
                        </span>
                      </td>
                      <td className="py-4 font-mono">
                        {user.generationsCount} / 5
                      </td>
                      <td className="py-4">
                        <span className={`px-2.5 py-1 text-xs font-medium rounded ${user.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                          {user.isActive ? 'Active' : 'Banned'}
                        </span>
                      </td>
                      <td className="py-4 text-right space-x-2">
                        <button 
                          onClick={() => handleResetQuota(user.id)}
                          className="text-xs font-medium px-3 py-1.5 border border-zinc-200 rounded text-zinc-700 hover:bg-zinc-50 active:scale-95 transition-transform whitespace-nowrap"
                        >
                          Reset
                        </button>
                        <button 
                          onClick={() => handleToggleActive(user.id)}
                          className="text-xs font-medium px-3 py-1.5 border border-zinc-200 rounded text-zinc-700 hover:bg-zinc-50 active:scale-95 transition-transform whitespace-nowrap"
                        >
                          {user.isActive ? 'Ban' : 'Unban'}
                        </button>
                        {user.role !== 'MASTER_ADMIN' && (
                          <button 
                            onClick={() => handleToggleAdmin(user.id)}
                            className="text-xs font-medium px-3 py-1.5 border border-zinc-200 rounded text-emerald-700 hover:bg-emerald-50 active:scale-95 transition-transform whitespace-nowrap"
                          >
                            {user.role === 'ADMIN' ? 'Demote' : 'Make Admin'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            </div>
          </div>
        )}

        {activeTab === 'AUTHORS' && (
          <div className="w-full overflow-x-auto">
            {authorsLoading ? (
              <p className="text-zinc-500 font-mono">Loading author stats...</p>
            ) : (
              <table className="w-full text-left text-sm text-zinc-900">
                <thead>
                  <tr className="border-b border-zinc-200">
                    <th className="pb-3 font-medium">Email</th>
                    <th className="pb-3 font-medium">Username</th>
                    <th className="pb-3 font-medium">Published Blogs</th>
                    <th className="pb-3 font-medium">Total Views</th>
                  </tr>
                </thead>
                <tbody>
                  {authors?.map((author) => (
                    <tr key={author.userId} className="border-b border-zinc-100 last:border-0 hover:bg-zinc-50/50 transition-colors">
                      <td className="py-4">{author.email}</td>
                      <td className="py-4 text-zinc-500">{author.username || 'N/A'}</td>
                      <td className="py-4 font-mono font-medium">{author.totalBlogs}</td>
                      <td className="py-4 font-mono font-medium">{author.totalViews}</td>
                    </tr>
                  ))}
                  {authors?.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-zinc-500">No authors found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === 'LOGS' && (
          <div className="w-full">
            {logsLoading ? (
              <p className="text-zinc-500 font-mono">Loading system logs...</p>
            ) : (
              <div className="bg-zinc-950 rounded p-6 overflow-x-auto">
                {logs?.length === 0 && <p className="text-zinc-500 font-mono text-sm">No errors recorded.</p>}
                {logs?.map((log) => (
                  <div key={log.id} className="mb-4 last:mb-0 border-b border-zinc-800 pb-4 last:border-0">
                    <div className="flex items-center gap-4 mb-2">
                      <span className="font-mono text-xs text-zinc-500">{new Date(log.createdAt).toISOString()}</span>
                      <span className="font-mono text-xs text-red-400 bg-red-400/10 px-2 py-0.5 rounded">{log.endpoint}</span>
                    </div>
                    <pre className="font-mono text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed">
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
            <p className="text-sm text-zinc-500 mb-4">Edit the global system prompt used by the AI engine.</p>
            <textarea
              className="w-full min-h-[400px] p-6 border border-zinc-200 rounded font-mono text-sm leading-relaxed text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 resize-y mb-6"
              placeholder="Enter system prompt here..."
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
            />
            <button 
              onClick={handleSavePrompt}
              className="px-6 py-3 bg-zinc-900 text-white font-medium rounded hover:bg-zinc-800 active:scale-95 transition-all"
            >
              Save Configuration
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
