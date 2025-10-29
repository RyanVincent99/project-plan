import { Dialog, Transition } from '@headlessui/react'
import { Fragment, useState, useEffect } from 'react'
import { XMarkIcon } from '@heroicons/react/24/solid'
import ChannelSelector from './ChannelSelector'
import { Post } from './PostCard'

interface Props {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  post: Post
  onPostUpdated: () => void
}

export default function EditPostModal({ isOpen, setIsOpen, post, onPostUpdated }: Props) {
  const [content, setContent] = useState('')
  const [targetAccountIds, setTargetAccountIds] = useState<string[]>([])
  const [scheduledAt, setScheduledAt] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (post) {
      setContent(post.content)
      setTargetAccountIds(post.targets.map(t => t.id))
      if (post.scheduledAt) {
        // Format UTC date from DB to local datetime-local string
        const date = new Date(post.scheduledAt);
        const timezoneOffset = date.getTimezoneOffset() * 60000;
        const localISOTime = new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 16);
        setScheduledAt(localISOTime);
      } else {
        setScheduledAt('');
      }
    }
  }, [post, isOpen]) // Reset when post changes or modal opens

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!content) {
      alert("Please write some content.")
      return
    }
    if (targetAccountIds.length === 0) {
      alert("Please select at least one channel to post to.")
      return
    }

    setIsLoading(true)
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || ''
    
    try {
      const res = await fetch(`${apiUrl}/posts/${post.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: content,
          targetAccountIds: targetAccountIds,
          scheduledAt: scheduledAt ? new Date(scheduledAt).toISOString() : null,
        }),
      })

      if (res.ok) {
        onPostUpdated()
        closeModal()
      } else {
        const errorData = await res.json().catch(() => ({ message: 'Failed to update post.' }));
        alert(`Error: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error updating post:', error)
      alert('An error occurred while updating the post.');
    } finally {
      setIsLoading(false)
    }
  }

  const closeModal = () => {
    setIsOpen(false)
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={closeModal}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900 flex justify-between items-center"
                >
                  Edit Post
                  <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </Dialog.Title>

                <div className="mt-4">
                  <ChannelSelector 
                    selectedAccountIds={targetAccountIds}
                    onChange={setTargetAccountIds}
                    showConnectionLinks={false}
                    fetchMode="all"
                  />
                </div>
                
                <form onSubmit={handleSubmit} className="mt-4">
                  <div className="w-full">
                    <textarea
                      rows={5}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      placeholder="What's on your mind?"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      required
                    />
                  </div>

                  <div className="mt-4">
                    <label htmlFor="schedule-edit" className="block text-sm font-medium text-gray-700">
                      Schedule (Optional)
                    </label>
                    <input
                      type="datetime-local"
                      id="schedule-edit"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      value={scheduledAt}
                      onChange={(e) => setScheduledAt(e.target.value)}
                    />
                  </div>

                  <div className="mt-6 flex justify-end">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
                    >
                      {isLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
