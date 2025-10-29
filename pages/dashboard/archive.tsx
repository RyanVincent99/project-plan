import { useState, useEffect, useCallback } from 'react';
import { getSession } from 'next-auth/react';
import { GetServerSideProps } from 'next';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Post } from '@/components/content/PostCard';
import ArchivedPostCard from '@/components/content/ArchivedPostCard';
import { useWorkspaces } from '@/contexts/WorkspaceContext';

export default function ArchivePage() {
  const [archivedPosts, setArchivedPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { currentWorkspace } = useWorkspaces();

  const fetchArchivedPosts = useCallback(async () => {
    if (!currentWorkspace) return;
    setIsLoading(true);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
    try {
      const res = await fetch(
        `${apiUrl}/posts/archived?workspaceId=${currentWorkspace.id}`
      );
      if (res.ok) {
        const data: Post[] = await res.json();
        setArchivedPosts(data);
      } else {
        console.error('Failed to fetch archived posts');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [currentWorkspace]);

  useEffect(() => {
    if (currentWorkspace) {
      fetchArchivedPosts();
    }
  }, [fetchArchivedPosts, currentWorkspace]);

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Archived Posts
      </h1>
      <div className="flex flex-col space-y-4">
        {isLoading ? (
          <p className="text-gray-500">Loading archived posts...</p>
        ) : archivedPosts.length > 0 ? (
          archivedPosts.map((post) => (
            <ArchivedPostCard
              key={post.id}
              post={post}
              onUpdate={fetchArchivedPosts}
            />
          ))
        ) : (
          <p className="text-gray-500">You have no archived posts.</p>
        )}
      </div>
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
