import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ChannelsSettings from '@/components/settings/ChannelsSettings';
import SettingsLayout from '@/components/layout/SettingsLayout';

export default function ChannelsSettingsPage() {
  return (
    <DashboardLayout>
      <SettingsLayout>
        <ChannelsSettings />
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
