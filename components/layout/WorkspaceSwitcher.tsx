import { useWorkspaces } from '@/contexts/WorkspaceContext';
import { FiBriefcase, FiSettings } from 'react-icons/fi';
import Link from 'next/link';

export default function WorkspaceSwitcher() {
  const { workspaces, currentWorkspace, switchWorkspace, isLoading } = useWorkspaces();

  if (isLoading) {
    return <div className="text-sm text-gray-500">Loading...</div>;
  }

  if (!currentWorkspace) {
    return <div className="text-sm text-red-500">No workspace found.</div>;
  }

  return (
    <div className="flex items-center space-x-2">
      <FiBriefcase className="w-5 h-5 text-gray-500 flex-shrink-0" />
      <div className="relative flex-grow">
        <select
          value={currentWorkspace.id}
          onChange={(e) => switchWorkspace(e.target.value)}
          className="w-full text-sm font-medium bg-transparent border-none rounded-md focus:ring-0 pr-8 appearance-none"
          aria-label="Select workspace"
        >
          {workspaces.map((ws) => (
            <option key={ws.id} value={ws.id}>
              {ws.name}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2 text-gray-400">
          <svg className="w-4 h-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
            <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
          </svg>
        </div>
      </div>
      <Link href="/workspaces">
        <a className="p-1 text-gray-400 rounded-full hover:bg-gray-100 hover:text-gray-600 flex-shrink-0" title="Manage workspaces">
          <FiSettings className="w-4 h-4" />
        </a>
      </Link>
    </div>
  );
}
