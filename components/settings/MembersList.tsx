import { useWorkspaces, UserWorkspace } from '@/contexts/WorkspaceContext';
import { useSession } from 'next-auth/react';
import { FiTrash2 } from 'react-icons/fi';
import { UserRole } from '@/contexts/WorkspaceContext';

export default function MembersList() {
  const { currentWorkspace, currentUserRole, fetchWorkspaces } = useWorkspaces();
  const { data: session } = useSession();
  const isAdministrator = currentUserRole === 'ADMINISTRATOR';

  const handleRoleChange = async (memberUserId: string, newRole: UserRole) => {
    const user = session?.user;
    if (!currentWorkspace || !user) return;

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
    try {
      const res = await fetch(`${apiUrl}/workspaces/${currentWorkspace.id}/members/${memberUserId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole, adminUserId: user.id }),
      });

      if (res.ok) {
        fetchWorkspaces();
      } else {
        const errorData = await res.json();
        alert(errorData.message || 'Failed to update role.');
      }
    } catch (error) {
      console.error('Error updating role:', error);
      alert('An error occurred while updating the role.');
    }
  };

  const handleRemoveMember = async (memberUserId: string) => {
    const user = session?.user;
    if (!currentWorkspace || !user) return;
    if (!window.confirm('Are you sure you want to remove this member from the workspace?')) return;

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
    try {
      const res = await fetch(`${apiUrl}/workspaces/${currentWorkspace.id}/members/${memberUserId}?adminUserId=${user.id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        fetchWorkspaces();
      } else {
        const errorData = await res.json();
        alert(errorData.message || 'Failed to remove member.');
      }
    } catch (error) {
      console.error('Error removing member:', error);
      alert('An error occurred while trying to remove the member.');
    }
  };

  if (!currentWorkspace) {
    return <p>No workspace selected.</p>;
  }

  return (
    <ul className="divide-y divide-gray-200">
      {currentWorkspace.userWorkspaces.map((member: UserWorkspace) => (
        <li key={member.id} className="py-4 flex items-center justify-between">
          <div className="flex flex-col">
            <p className="text-sm font-medium text-gray-900">{member.user.name || member.user.email}</p>
            {member.user.name && <p className="text-sm text-gray-500">{member.user.email}</p>}
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={member.role}
              onChange={(e) => handleRoleChange(member.user.id, e.target.value as UserRole)}
              disabled={!isAdministrator}
              className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="ADMINISTRATOR">Administrator</option>
              <option value="PUBLISHER">Publisher</option>
              <option value="USER">User</option>
            </select>
            {isAdministrator && session?.user?.id !== member.user.id && (
              <button
                onClick={() => handleRemoveMember(member.user.id)}
                className="text-gray-500 hover:text-red-600"
                title="Remove member"
              >
                <FiTrash2 className="w-5 h-5" />
              </button>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
