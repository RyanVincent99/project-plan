// pages/dashboard/index.tsx
import { GetServerSideProps } from 'next'
import { getSession, useSession } from 'next-auth/react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Post } from '@/components/content/PostCard'
import { useState, useEffect, useCallback } from 'react'
import { FiLayout, FiCalendar, FiPlus } from 'react-icons/fi'
import { useRouter } from 'next/router'

// Import the new components
import CreatePostModal from '@/components/content/CreatePostModal'
import FeedView from '@/components/content/FeedView'
import CalendarView from '@/components/calendar/CalendarView'

type View = 'feed' | 'calendar'

export default function Dashboard() {
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [view, setView] = useState<View>('feed')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { data: session } = useSession()
  const router = useRouter()

  // Use useCallback to memoize fetchPosts so it can be passed as a prop
  const fetchPosts = useCallback(async () => {
    setIsLoading(true)
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || ''
    try {
      const res = await fetch(`${apiUrl}/posts`)
      if (!res.ok) throw new Error('Failed to fetch posts')
      const data: Post[] = await res.json()
      setPosts(data)
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Fetch posts on initial load
  useEffect(() => {
    if (session) { // Only fetch if user is logged in
      fetchPosts()
    }
  }, [session, fetchPosts])

  const channelFilter = Array.isArray(router.query.channel) ? router.query.channel[0] : router.query.channel;

  const filteredPosts = channelFilter
    ? posts.filter(post => post.targets.some(target => target.id === channelFilter))
    : posts;

  return (
    <DashboardLayout>
      {/* Header with View Toggle and Create Button */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center bg-gray-200 p-1 rounded-lg">
          <button
            onClick={() => setView('feed')}
            className={`flex items-center px-4 py-2 rounded-md text-sm font-medium ${
              view === 'feed' ? 'bg-white text-indigo-600 shadow' : 'text-gray-600 hover:bg-gray-300'
            } transition-all`}
          >
            <FiLayout className="w-5 h-5 mr-2" />
            Feed
          </button>
          <button
            onClick={() => setView('calendar')}
            className={`flex items-center px-4 py-2 rounded-md text-sm font-medium ${
              view === 'calendar' ? 'bg-white text-indigo-600 shadow' : 'text-gray-600 hover:bg-gray-300'
            } transition-all`}
          >
            <FiCalendar className="w-5 h-5 mr-2" />
            Calendar
          </button>
        </div>
        
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg shadow-sm hover:bg-indigo-700"
        >
          <FiPlus className="w-5 h-5 mr-1" />
          Create Post
        </button>
      </div>

      {/* Conditionally render the view */}
      <div>
        {view === 'feed' && (
          <FeedView 
            posts={filteredPosts} 
            isLoading={isLoading} 
            onRefresh={fetchPosts} 
          />
        )}
        {view === 'calendar' && (
          <CalendarView posts={posts} />
        )}
      </div>

      {/* Render the modal */}
      <CreatePostModal
        isOpen={isModalOpen}
        setIsOpen={setIsModalOpen}
        onPostCreated={fetchPosts} // Pass fetchPosts as the callback
        preselectedChannelId={channelFilter}
      />
    </DashboardLayout>
  )
}

// Keep your authentication check
export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context)
  if (!session) {
    return {
      redirect: {
        destination: '/api/auth/signin',
        permanent: false,
      },
    }
  }
  return {
    props: { session },
  }
}