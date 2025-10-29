import { GetServerSideProps } from 'next';
import { getSession, useSession } from 'next-auth/react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import SettingsLayout from '@/components/layout/SettingsLayout';

function AccountSettings() {
  const { data: session } = useSession();

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800">Account</h2>
        <p className="text-gray-600 mt-1">Manage your account information.</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Profile</h3>
        {session?.user && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <p className="mt-1 text-sm text-gray-900">{session.user.name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <p className="mt-1 text-sm text-gray-900">{session.user.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Profile Picture</label>
              <img src={session.user.image || '/default-avatar.png'} alt="Profile" className="mt-1 h-16 w-16 rounded-full" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AccountSettingsPage() {
  return (
    <DashboardLayout>
      <SettingsLayout>
        <AccountSettings />
      </SettingsLayout>
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
