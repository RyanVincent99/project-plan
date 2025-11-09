// pages/dashboard/settings/linkedin-callback.tsx
import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function LinkedInCallback() {
  const router = useRouter();

  useEffect(() => {
    const { access_token, refresh_token, socialAccountId } = router.query;

    if (access_token && socialAccountId) {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
      fetch(`${apiUrl}/social-accounts/${socialAccountId}/connect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken: access_token, refreshToken: refresh_token }),
      })
      .then(res => {
        if (res.ok) {
          // Redirect back to the channels settings page after a successful connection
          router.push('/dashboard/settings/channels');
        } else {
          // Handle errors, maybe show a notification to the user
          console.error("Failed to connect LinkedIn account");
          router.push('/dashboard/settings/channels?error=linkedin_connection_failed');
        }
      });
    }
  }, [router.query]);

  return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-lg text-gray-600">Connecting your LinkedIn account, please wait...</p>
    </div>
  );
}
