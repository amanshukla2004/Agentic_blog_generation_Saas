import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  useGetSystemSettingsQuery,
  useGetSystemStatsQuery,
  useGetStatsTrendsQuery,
  useGetAiHealthQuery
} from '../store/api/masterApi';
import { Tabs } from '../components/tui/Primitives';

import { UsersTab } from './admin/UsersTab';
import { AuthorsTab } from './admin/AuthorsTab';
import { BlogsTab } from './admin/BlogsTab';
import { ReviewsTab } from './admin/ReviewsTab';
import { LogsTab } from './admin/LogsTab';
import { PromptsTab } from './admin/PromptsTab';
import { SettingsTab } from './admin/SettingsTab';

type Tab = 'OVERVIEW' | 'USERS' | 'AUTHORS' | 'BLOGS' | 'REVIEWS' | 'LOGS' | 'PROMPTS' | 'SETTINGS';

export const MasterDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('OVERVIEW');
  
  const { data: stats, isLoading: statsLoading } = useGetSystemStatsQuery();
  const { data: trends, isLoading: trendsLoading } = useGetStatsTrendsQuery();
  const { data: aiHealth, isLoading: aiHealthLoading } = useGetAiHealthQuery();

  const getSparkline = (data?: number[]) => {
    if (!data || data.length === 0) return '';
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min;
    const blocks = [' ', '▂', '▃', '▄', '▅', '▆', '▇', '█'];
    
    return data.map(n => {
      if (range === 0) return blocks[0];
      const index = Math.round(((n - min) / range) * (blocks.length - 1));
      return blocks[index];
    }).join('');
  };
  const { data: settings } = useGetSystemSettingsQuery();

  const [userLimit, setUserLimit] = useState('');
  const [adminLimit, setAdminLimit] = useState('');

  useEffect(() => {
    if (settings) {
      const userL = settings.find((s: any) => s.settingKey === 'USER_GENERATION_LIMIT')?.settingValue;
      const adminL = settings.find((s: any) => s.settingKey === 'ADMIN_GENERATION_LIMIT')?.settingValue;
      if (userL) setUserLimit(userL);
      if (adminL) setAdminLimit(adminL);
    }
  }, [settings]);

  const tabs: Tab[] = [
    'OVERVIEW',
    'USERS',
    'AUTHORS',
    'BLOGS',
    'REVIEWS',
    'LOGS',
    'PROMPTS',
    'SETTINGS'
  ];

  return (
    <div className="flex flex-col min-h-screen bg-bg">
      <div className="p-8">
        <div className="flex justify-between items-end mb-8 border-b border-border pb-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tighter text-fg mb-1">MASTER_ADMIN_TERMINAL</h1>
            <p className="text-secondary font-mono text-xs uppercase tracking-widest">System Control & Moderation Interface</p>
          </div>
        </div>

        <Tabs tabs={tabs} activeTab={activeTab} onTabChange={(id: any) => setActiveTab(id as Tab)} />

        <div className="mt-8 border border-border p-6 bg-surface/30">
          
          {activeTab === 'OVERVIEW' && (
            <div className="w-full">
              <h2 className="text-md font-bold mb-6 uppercase tracking-widest text-fg">System Health Overview</h2>
              {statsLoading || aiHealthLoading || trendsLoading ? (
                <p className="text-secondary uppercase tracking-widest text-xs">Polling system status...</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 font-mono">
                  <div className="bg-surface border border-border p-6 flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xs uppercase tracking-widest text-secondary">Total Users</h3>
                      <span className="text-accent tracking-[2px]">{getSparkline(trends?.users)}</span>
                    </div>
                    <span className="text-3xl font-bold text-primary">{stats?.totalUsers || 0}</span>
                  </div>
                  <div className="bg-surface border border-border p-6 flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xs uppercase tracking-widest text-secondary">Total Blogs</h3>
                      <span className="text-accent tracking-[2px]">{getSparkline(trends?.blogs)}</span>
                    </div>
                    <span className="text-3xl font-bold text-primary">{stats?.totalBlogs || 0}</span>
                  </div>
                  <div className="bg-surface border border-border p-6 flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xs uppercase tracking-widest text-secondary">Generations</h3>
                    </div>
                    <span className="text-3xl font-bold text-primary">{stats?.totalGenerations || 0}</span>
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

          {activeTab === 'USERS' && <UsersTab userLimit={userLimit} adminLimit={adminLimit} />}
          {activeTab === 'AUTHORS' && <AuthorsTab />}
          {activeTab === 'BLOGS' && <BlogsTab />}
          {activeTab === 'REVIEWS' && <ReviewsTab />}
          {activeTab === 'LOGS' && <LogsTab />}
          {activeTab === 'PROMPTS' && <PromptsTab />}
          {activeTab === 'SETTINGS' && <SettingsTab />}

        </div>
      </div>
    </div>
  );
};
