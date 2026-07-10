import React from 'react';
import { Outlet } from 'react-router-dom';
import { TopBar } from './TopBar';

export const Layout = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col font-sans text-zinc-900">
      <TopBar />
      <main className="flex-1 w-full">
        <Outlet />
      </main>
    </div>
  );
};
