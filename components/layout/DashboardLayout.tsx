// components/layout/DashboardLayout.tsx
import React, { ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FiGrid, FiArchive, FiSettings } from 'react-icons/fi';
import ChannelList from './ChannelList';
import WorkspaceSwitcher from './WorkspaceSwitcher';

interface Props {
  children: ReactNode;
}

export default function DashboardLayout({ children }: Props) {
  const router = useRouter();
  const currentPath = router.pathname;

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b">
          <WorkspaceSwitcher />
        </div>
        <div className="flex-1 overflow-y-auto">
          <nav className="p-4">
            <Link href="/dashboard">
              <a className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg ${
                currentPath === '/dashboard' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-700 hover:bg-gray-100'
              }`}>
                <FiGrid className="w-5 h-5 mr-3" />
                Dashboard
              </a>
            </Link>
            <Link href="/dashboard/archive">
              <a className={`flex items-center px-3 py-2 mt-2 text-sm font-medium rounded-lg ${
                currentPath === '/dashboard/archive' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-700 hover:bg-gray-100'
              }`}>
                <FiArchive className="w-5 h-5 mr-3" />
                Archive
              </a>
            </Link>
          </nav>

          <div className="mt-4 px-4">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Channels</h2>
            <div className="mt-2">
              <ChannelList />
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-gray-200">
          <Link href="/dashboard/settings/channels">
            <a className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg ${
              currentPath.startsWith('/dashboard/settings') ? 'bg-indigo-100 text-indigo-700' : 'text-gray-700 hover:bg-gray-100'
            }`}>
              <FiSettings className="w-5 h-5 mr-3" />
              Settings
            </a>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <div className="flex-1">
              {/* Search Bar or other header items */}
            </div>
            <div className="flex items-center">
              {/* User profile dropdown (from Next-Auth) */}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}