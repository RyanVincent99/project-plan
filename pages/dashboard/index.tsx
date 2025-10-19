// pages/dashboard/index.tsx
import DashboardLayout from '@/components/layout/DashboardLayout';
import PostCard, { Post } from '@/components/content/PostCard';
import { useState, useEffect } from 'react';

// NOTE: We have removed getSession and GetServerSideProps
// so this page is no longer protected.

export default function Dashboard() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // This hook runs on the client-side after the page loads
  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
      
      try {
        const res = await fetch(`${apiUrl}/posts`);
        if (!res.ok) {
          throw new Error('Failed to fetch posts');
        }
        const data: Post[] = await res.json();
        setPosts(data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, []); // The empty array means this effect runs once when the page mounts

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Content Feed 📝</h1>
        <button className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg shadow-sm hover:bg-indigo-700">
          Create Post
        </button>
      </div>

      <div className="flex flex-col space-y-4">
        {isLoading ? (
          <p className="text-gray-500">Loading posts...</p>
        ) : posts.length > 0 ? (
          posts.map((post) => <PostCard key={post.id} post={post} />)
        ) : (
          <p className="text-gray-500">No posts in this workspace yet. Let's create one!</p>
        )}
      </div>
    </DashboardLayout>
  );
}

/*
// We are temporarily commenting out the authentication check

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
    props: {
      session,
    },
  };
};
*/