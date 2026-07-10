import React from 'react';
import { Outlet } from 'react-router-dom';
import { TopBar } from './TopBar';

export const Layout = () => {
  return (
    <div className="min-h-screen bg-bg flex flex-col font-mono text-fg">
      <TopBar />
      <main className="flex-1 w-full">
        <Outlet />
      </main>
    </div>
  );
};
