import { useState } from 'react';
import { Post } from './PostCard';
import { FiRotateCcw, FiTrash2 } from 'react-icons/fi';

interface ArchivedPostCardProps {
  post: Post;
  onUpdate: () => void; // Callback to refresh the list
}

export default function ArchivedPostCard({ post, onUpdate }: ArchivedPostCardProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';

  const handleRestore = async () => {
    setIsProcessing(true);
    try {
      const response = await fetch(`${apiUrl}/posts/${post.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'PUBLISHED' }), // Restore to PUBLISHED status
      });
      if (response.ok) {
        onUpdate();
      } else {
        alert('Failed to restore post.');
      }
    } catch (error) {
      console.error('Error restoring post:', error);
      alert('An error occurred while restoring the post.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to permanently delete this post?')) {
      setIsProcessing(true);
      try {
        const response = await fetch(`${apiUrl}/posts/${post.id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          onUpdate();
        } else {
          alert('Failed to delete post.');
        }
      } catch (error) {
        console.error('Error deleting post:', error);
        alert('An error occurred while deleting the post.');
      } finally {
        setIsProcessing(false);
      }
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-4 flex items-center justify-between">
      <div className="flex-1">
        <p className="text-gray-800 truncate">{post.content}</p>
        <p className="text-xs text-gray-500 mt-1">
          Archived on: {new Date(post.createdAt).toLocaleDateString()}
        </p>
      </div>
      <div className="flex items-center space-x-2 ml-4">
        <button
          onClick={handleRestore}
          disabled={isProcessing}
          className="flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50"
          title="Restore Post"
        >
          <FiRotateCcw className="w-4 h-4 mr-1" />
          Restore
        </button>
        <button
          onClick={handleDelete}
          disabled={isProcessing}
          className="flex items-center px-3 py-1.5 text-sm font-medium text-red-700 bg-red-100 rounded-md hover:bg-red-200 disabled:opacity-50"
          title="Delete Permanently"
        >
          <FiTrash2 className="w-4 h-4 mr-1" />
          Delete
        </button>
      </div>
    </div>
  );
}
