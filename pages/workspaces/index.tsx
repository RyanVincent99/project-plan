import { GetServerSideProps } from 'next';
import { getSession, useSession } from 'next-auth/react';
import { useWorkspaces, Workspace } from '@/contexts/WorkspaceContext';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { FiPlus, FiArrowRight, FiTrash2, FiEdit2 } from 'react-icons/fi';
import RenameWorkspaceModal from '@/components/workspaces/RenameWorkspaceModal';

export default function WorkspacesPage() {
  const { data: session } = useSession();
  const { workspaces, switchWorkspace, isLoading, fetchWorkspaces } = useWorkspaces();
  const router = useRouter();
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [editingWorkspace, setEditingWorkspace] = useState<Workspace | null>(null);

  const handleSelectWorkspace = (workspaceId: string) => {
    switchWorkspace(workspaceId);
    router.push('/dashboard');
  };

  const handleDeleteWorkspace = async (workspaceId: string) => {
    if (workspaces.length <= 1) {
      alert("You cannot delete your only workspace.");
      return;
    }

    if (window.confirm("Are you sure you want to delete this workspace? This will also delete all associated posts and channels. This action cannot be undone.")) {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
      try {
        const res = await fetch(`${apiUrl}/workspaces/${workspaceId}`, {
          method: 'DELETE',
        });

        if (res.ok) {
          const user = session?.user;
          if (user) {
            await fetchWorkspaces();
          }
        } else {
          alert('Failed to delete workspace.');
        }
      } catch (error) {
        console.error('Error deleting workspace:', error);
        alert('An error occurred while deleting the workspace.');
      }
    }
  };

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = session?.user;
    if (!newWorkspaceName.trim() || !user) return;

    setIsCreating(true);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
    try {
      const res = await fetch(`${apiUrl}/workspaces`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newWorkspaceName,
          userId: user.id,
        }),
      });

      if (res.ok) {
        const newWorkspace = await res.json();
        // Refetch workspaces to update the list
        await fetchWorkspaces();
        // Switch to the new workspace and redirect
        switchWorkspace(newWorkspace.id);
        router.push('/dashboard');
      } else {
        alert('Failed to create workspace.');
      }
    } catch (error) {
      console.error('Error creating workspace:', error);
      alert('An error occurred while creating the workspace.');
    } finally {
      setIsCreating(false);
      setNewWorkspaceName('');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-lg">
        <div>
          <h2 className="text-2xl font-bold text-center text-gray-900">
            Select or Create a Workspace
          </h2>
        </div>

        {isLoading ? (
          <p className="text-center text-gray-500">Loading workspaces...</p>
        ) : (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-500">Your Workspaces</h3>
            <ul className="space-y-2">
              {workspaces.map((ws) => {
                const currentUserWorkspace = ws.userWorkspaces?.find(uw => uw.user.id === session?.user?.id);
                const isAdministrator = currentUserWorkspace?.role === 'ADMINISTRATOR';

                return (
                <li key={ws.id} className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-md">
                  <button
                    onClick={() => handleSelectWorkspace(ws.id)}
                    className="flex-grow flex items-center justify-between text-left text-gray-700 focus:outline-none group"
                  >
                    <span className="font-medium group-hover:text-indigo-600">{ws.name}</span>
                    <FiArrowRight className="w-5 h-5 text-gray-400 group-hover:text-indigo-600" />
                  </button>
                  <div className="flex items-center ml-2">
                    <button
                      onClick={() => setEditingWorkspace(ws)}
                      className="p-2 text-gray-500 rounded-full hover:bg-gray-100 hover:text-gray-700 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={!isAdministrator}
                      title={!isAdministrator ? "Only administrators can rename workspaces" : "Rename workspace"}
                    >
                      <FiEdit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteWorkspace(ws.id)}
                      className="p-2 text-gray-500 rounded-full hover:bg-red-100 hover:text-red-600 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={workspaces.length <= 1 || !isAdministrator}
                      title={workspaces.length <= 1 ? "Cannot delete your only workspace" : !isAdministrator ? "Only administrators can delete workspaces" : "Delete workspace"}
                    >
                      <FiTrash2 className="w-5 h-5" />
                    </button>
                  </div>
                </li>
                );
              })}
            </ul>
          </div>
        )}

        <div className="pt-4 border-t">
          <h3 className="text-sm font-medium text-gray-500">Create New Workspace</h3>
          <form onSubmit={handleCreateWorkspace} className="flex items-center mt-2 space-x-2">
            <input
              type="text"
              value={newWorkspaceName}
              onChange={(e) => setNewWorkspaceName(e.target.value)}
              placeholder="e.g., Marketing Team"
              className="flex-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
            />
            <button
              type="submit"
              disabled={isCreating}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              <FiPlus className="w-5 h-5 mr-1 -ml-1" />
              Create
            </button>
          </form>
        </div>
      </div>
      {editingWorkspace && (
        <RenameWorkspaceModal
          isOpen={!!editingWorkspace}
          setIsOpen={() => setEditingWorkspace(null)}
          workspace={editingWorkspace}
          onWorkspaceUpdated={() => {
            fetchWorkspaces();
          }}
        />
      )}
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);
  if (!session) {
    return {
      redirect: {
        destination: '/api/auth/signin',
        permanent: false,
      },
    };
  }
  return {
    props: { session },
  };
};
