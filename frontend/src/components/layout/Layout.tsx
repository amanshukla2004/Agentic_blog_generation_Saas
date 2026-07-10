import React from 'react';
import { Outlet } from 'react-router-dom';
import { TopBar } from './TopBar';
import { useGetPublicSettingsQuery } from '../../store/api/publicApi';

export const Layout = () => {
  const { data: settings } = useGetPublicSettingsQuery();

  return (
    <div className="min-h-screen bg-bg flex flex-col font-mono text-fg">
      {settings?.systemAnnouncementText && (
        <div className="w-full bg-accent text-bg text-center py-1.5 px-4 text-[10px] font-bold tracking-widest sticky top-0 z-[100] uppercase">
          {settings.systemAnnouncementText}
        </div>
      )}
      <TopBar />
      <main className="flex-1 w-full">
        <Outlet />
      </main>
    </div>
  );
};
