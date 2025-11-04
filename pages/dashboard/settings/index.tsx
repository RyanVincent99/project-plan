import { useEffect } from 'react';
import { useRouter } from 'next/router';

// This page just redirects to the default settings tab.
export default function SettingsIndexPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard/settings/account');
  }, [router]);

  return null; // Or a loading spinner
}
