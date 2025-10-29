import { GetServerSideProps } from 'next';

export default function SettingsIndex() {
  // This component will not be rendered, as we are redirecting.
  return null;
}

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    redirect: {
      destination: '/dashboard/settings/account', // Redirect to account settings by default
      permanent: false,
    },
  };
};
