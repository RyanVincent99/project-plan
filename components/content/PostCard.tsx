// components/content/PostCard.tsx
import React, { useState } from 'react'
import { useSession } from 'next-auth/react'
import { FiMessageCircle, FiSend } from 'react-icons/fi'

// New Comment interface
export interface Comment {
  id: string
  text: string
  authorId: string
  createdAt: string
  // You can add author name/image if you fetch user data by authorId
}

export interface Post {
  id: string
  content: string
  status: 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'SCHEDULED' | 'PUBLISHED'
  createdAt: string
  authorId: string
  scheduledAt?: string // Make scheduledAt optional
  comments: Comment[] // Add comments array
}

interface PostCardProps {
  post: Post
  onCommentPosted: () => void // Callback to refresh posts
}

const getStatusStyles = (status: Post['status']) => {
  switch (status) {
    case 'APPROVED':
      return { bg: 'bg-green-100', text: 'text-green-800', dot: 'bg-green-500' };
    case 'PENDING_APPROVAL':
      return { bg: 'bg-yellow-100', text: 'text-yellow-800', dot: 'bg-yellow-500' };
    case 'REJECTED':
      return { bg: 'bg-red-100', text: 'text-red-800', dot: 'bg-red-500' };
    case 'SCHEDULED':
      return { bg: 'bg-blue-100', text: 'text-blue-800', dot: 'bg-blue-500' };
    default:
      return { bg: 'bg-gray-100', text: 'text-gray-800', dot: 'bg-gray-500' };
  }
};

export default function PostCard({ post, onCommentPosted }: PostCardProps) {
  const { data: session } = useSession()
  const [currentStatus, setCurrentStatus] = useState(post.status)
  const [showComments, setShowComments] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [isCommenting, setIsCommenting] = useState(false)
  const statusStyles = getStatusStyles(currentStatus)
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || ''

  const handleUpdateStatus = async (newStatus: Post['status']) => {
    // ... (keep your existing handleUpdateStatus function)
    setCurrentStatus(newStatus); 
    try {
      const response = await fetch(`${apiUrl}/posts/${post.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!response.ok) setCurrentStatus(post.status);
    } catch (error) {
      setCurrentStatus(post.status);
    }
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment || !session?.user) return
    setIsCommenting(true)

    try {
      const res = await fetch(`${apiUrl}/posts/${post.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: newComment,
          authorId: session.user.id,
        }),
      })
      if (res.ok) {
        setNewComment('')
        onCommentPosted() // Refresh the whole post list to get new comment
      }
    } catch (error) {
      console.error('Failed to post comment:', error)
    } finally {
      setIsCommenting(false)
    }
  }

  return (
    <div className="bg-white shadow-lg rounded-2xl overflow-hidden max-w-2xl mx-auto my-4">
      {/* Card Header */}
      <div className={`flex items-center justify-between p-4 border-b border-gray-200 ${statusStyles.bg}`}>
        <div className="flex items-center">
          <span className={`h-2.5 w-2.5 rounded-full ${statusStyles.dot} mr-2`}></span>
          <span className={`text-sm font-semibold uppercase ${statusStyles.text}`}>
            {currentStatus.replace('_', ' ')}
          </span>
          {post.scheduledAt && (
            <span className="ml-3 text-sm text-gray-600">
              | Scheduled for: {new Date(post.scheduledAt).toLocaleString()}
            </span>
          )}
        </div>
        <div className="flex items-center">
          <span className="text-sm text-gray-600 mr-2">Author ID: {post.authorId}</span>
          {/* You would fetch user data by authorId to show image/name */}
        </div>
      </div>

      {/* Post Content */}
      <div className="p-6">
        <p className="text-gray-800 whitespace-pre-wrap">{post.content}</p>
      </div>

      {/* Action/Approval Bar */}
      <div className="bg-gray-50 p-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center text-gray-600 hover:text-indigo-600"
            >
              <FiMessageCircle className="w-5 h-5 mr-1" />
              <span>{post.comments.length} Comments</span>
            </button>
          </div>
          
          {/* Approval Buttons */}
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => handleUpdateStatus('REJECTED')}
              className="px-3 py-1.5 text-sm font-medium text-red-700 bg-red-100 rounded-md hover:bg-red-200 disabled:opacity-50"
              disabled={currentStatus === 'REJECTED'}
            >
              Reject
            </button>
            <button 
              onClick={() => handleUpdateStatus('APPROVED')}
              className="px-3 py-1.5 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50"
              disabled={currentStatus === 'APPROVED'}
            >
              Approve
            </button>
          </div>
        </div>
      </div>

      {/* Comment Section (Collapsible) */}
      {showComments && (
        <div className="p-6 border-t border-gray-200">
          {/* List of comments */}
          <div className="flex flex-col space-y-4 max-h-60 overflow-y-auto pr-2">
            {post.comments.length > 0 ? (
              post.comments.map((comment) => (
                <div key={comment.id} className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    {/* Placeholder for commentor avatar */}
                    <div className="w-8 h-8 rounded-full bg-gray-300"></div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      Author ID: {comment.authorId}
                    </p>
                    <p className="text-sm text-gray-700">{comment.text}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">Be the first to comment!</p>
            )}
          </div>
          
          {/* New comment form */}
          <form onSubmit={handlePostComment} className="mt-6 flex items-center space-x-3">
            <img
              className="h-8 w-8 rounded-full"
              src={session?.user?.image || '/default-avatar.png'}
              alt="User avatar"
            />
            <input
              type="text"
              className="flex-1 rounded-full border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="Write a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              required
            />
            <button
              type="submit"
              disabled={isCommenting}
              className="inline-flex items-center justify-center p-2 rounded-full text-indigo-600 hover:bg-indigo-100 disabled:opacity-50"
            >
              <FiSend className="w-5 h-5" />
            </button>
          </form>
        </div>
      )}
    </div>
  )
}