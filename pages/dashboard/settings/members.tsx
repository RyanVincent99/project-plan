import { useState } from 'react';
import { GetServerSideProps } from 'next';
import { getSession, useSession } from 'next-auth/react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import SettingsLayout from '@/components/layout/SettingsLayout';
import { useWorkspaces } from '@/contexts/WorkspaceContext';
import MembersList from '@/components/settings/MembersList';
import InviteMemberModal from '@/components/settings/InviteMemberModal';
import { FiPlus } from 'react-icons/fi';

export default function MembersPage() {
  const { currentUserRole, fetchWorkspaces } = useWorkspaces();
  const { data: session } = useSession();
  const [isInviteModalOpen, setInviteModalOpen] = useState(false);
  const isAdministrator = currentUserRole === 'ADMINISTRATOR';

  return (
    <DashboardLayout>
      <SettingsLayout>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">Workspace Members</h2>
            {isAdministrator && (
              <button
                onClick={() => setInviteModalOpen(true)}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700"
              >
                <FiPlus className="w-5 h-5 mr-1 -ml-1" />
                Invite Member
              </button>
            )}
          </div>
          <p className="text-sm text-gray-600 mb-6">
            Manage who has access to this workspace and what they can do.
          </p>
          <MembersList />
        </div>
      </SettingsLayout>
      <InviteMemberModal
        isOpen={isInviteModalOpen}
        setIsOpen={setInviteModalOpen}
        onMemberInvited={() => {
            fetchWorkspaces();
        }}
      />
    </DashboardLayout>
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
