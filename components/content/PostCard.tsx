// components/content/PostCard.tsx
import React, { useState } from 'react';

// Define the types based on what the Spring Boot API will send
type PostStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'SCHEDULED' | 'PUBLISHED';

export interface Post {
  id: string;
  content: string;
  status: PostStatus;
  createdAt: string; // This will be an ISO date string
  authorId: string;
}

interface PostCardProps {
  post: Post;
}

// Helper to get colors for different statuses
const getStatusStyles = (status: PostStatus) => {
  switch (status) {
    case 'APPROVED':
      return { bg: 'bg-green-100', text: 'text-green-800', dot: 'bg-green-500' };
    case 'PENDING_APPROVAL':
      return { bg: 'bg-yellow-100', text: 'text-yellow-800', dot: 'bg-yellow-500' };
    case 'REJECTED':
      return { bg: 'bg-red-100', text: 'text-red-800', dot: 'bg-red-500' };
    default:
      return { bg: 'bg-gray-100', text: 'text-gray-800', dot: 'bg-gray-500' };
  }
};

export default function PostCard({ post }: PostCardProps) {
  const [currentStatus, setCurrentStatus] = useState(post.status);
  const statusStyles = getStatusStyles(currentStatus);

  const handleUpdateStatus = async (newStatus: PostStatus) => {
    setCurrentStatus(newStatus); // Optimistic UI update
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';

    try {
      const response = await fetch(`${apiUrl}/posts/${post.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        setCurrentStatus(post.status); // Revert on failure
        console.error('Failed to update status');
      }
    } catch (error) {
      setCurrentStatus(post.status); // Revert on network error
      console.error('An error occurred:', error);
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden max-w-2xl mx-auto my-4">
      {/* Card Header with Status */}
      <div
        className={`flex items-center justify-between p-4 border-b border-gray-200 ${statusStyles.bg}`}
      >
        <div className="flex items-center">
          <span className={`h-2.5 w-2.5 rounded-full ${statusStyles.dot} mr-2`}></span>
          <span className={`text-sm font-semibold uppercase ${statusStyles.text}`}>
            {currentStatus.replace('_', ' ')}
          </span>
        </div>
        <div className="flex items-center">
          {/* Simplified author display */}
          <span className="text-sm text-gray-600">Author ID: {post.authorId}</span>
        </div>
      </div>

      {/* Post Content (Preview) */}
      <div className="p-6">
        <p className="text-gray-800 whitespace-pre-wrap">{post.content}</p>
      </div>

      {/* Action/Approval Bar */}
      <div className="bg-gray-50 p-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button className="flex items-center text-gray-600 hover:text-indigo-600">
              <span>Comment</span>
            </button>
          </div>
          
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
    </div>
  );
}