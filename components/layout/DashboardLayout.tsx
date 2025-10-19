// components/layout/DashboardLayout.tsx
import React, { ReactNode } from 'react';
// import { FiHome, FiCalendar, FiPlusSquare } from 'react-icons/fi'; // Example icons

interface Props {
  children: ReactNode;
}

export default function DashboardLayout({ children }: Props) {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 bg-white border-r border-gray-200">
        <div className="p-4">
          <h1 className="text-2xl font-bold text-indigo-600">Scheduler</h1>
        </div>
        <nav className="p-2">
          <h2 className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Workspaces
          </h2>
          <a
            href="#"
            className="block px-4 py-2 mt-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg"
          >
            Client A
          </a>
          <a
            href="#"
            className="block px-4 py-2 mt-2 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded-lg"
          >
            Client B
          </a>
          {/* ... more navigation ... */}
        </nav>
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