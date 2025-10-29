// pages/index.tsx
import { useSession, signIn } from 'next-auth/react';
import Link from 'next/link';

export default function Home() {
  const { data: session, status } = useSession();
  const loading = status === 'loading';

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2 bg-gray-100">
      <main className="flex flex-col items-center justify-center w-full flex-1 px-20 text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900">
          Welcome to your Content Scheduler
        </h1>

        <p className="mt-3 text-lg md:text-2xl text-gray-700">
          Sign in to manage your content.
        </p>

        <div className="mt-8">
          {loading && (
            <p className="text-gray-500">Loading...</p>
          )}

          {!session && !loading && (
            <button
              onClick={() => signIn()}
              className="px-6 py-3 text-lg font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Sign In
            </button>
          )}

          {session && (
            <Link href="/workspaces">
              <a className="px-6 py-3 text-lg font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2">
                Go to Workspaces
              </a>
            </Link>
          )}
        </div>
      </main>
    </div>
  );
}