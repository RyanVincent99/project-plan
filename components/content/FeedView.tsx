// components/content/FeedView.tsx
import PostCard, { Post } from './PostCard'

interface Props {
  posts: Post[]
  isLoading: boolean
  onRefresh: () => void
}

export default function FeedView({ posts, isLoading, onRefresh }: Props) {
  return (
    <div className="flex flex-col space-y-4">
      {isLoading ? (
        <p className="text-gray-500 text-center">Loading posts...</p>
      ) : posts.length > 0 ? (
        posts.map((post) => (
          <PostCard 
            key={post.id} 
            post={post} 
            onPostUpdate={onRefresh} 
          />
        ))
      ) : (
        <p className="text-gray-500 text-center">No posts in this workspace yet. Let's create one!</p>
      )}
    </div>
  )
}