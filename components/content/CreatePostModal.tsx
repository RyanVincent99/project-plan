// components/content/CreatePostModal.tsx
import { Dialog, Transition } from '@headlessui/react'
import { Fragment, useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { XMarkIcon } from '@heroicons/react/24/solid'
import ChannelSelector from './ChannelSelector' // Import the new component

interface Props {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  onPostCreated: () => void // Callback to refresh the post list
  preselectedChannelId?: string | null
}

export default function CreatePostModal({ isOpen, setIsOpen, onPostCreated, preselectedChannelId }: Props) {
  const { data: session } = useSession()
  const [content, setContent] = useState('')
  const [scheduledAt, setScheduledAt] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [targetAccountIds, setTargetAccountIds] = useState<string[]>([]) // NEW

  useEffect(() => {
    if (isOpen && preselectedChannelId) {
      setTargetAccountIds([preselectedChannelId]);
    }
  }, [isOpen, preselectedChannelId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!content || !session?.user) {
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
      const res = await fetch(`${apiUrl}/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: content,
          authorId: session.user.id,
          scheduledAt: scheduledAt ? new Date(scheduledAt).toISOString() : null,
          targetAccountIds: targetAccountIds, // Pass the selected IDs
        }),
      })

      if (res.ok) {
        onPostCreated() // Call the callback
        closeModal()
      } else {
        console.error('Failed to create post')
      }
    } catch (error) {
      console.error('Error creating post:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const closeModal = () => {
    setIsOpen(false)
    setContent('')
    setScheduledAt('')
    setTargetAccountIds([]) // Reset selected accounts
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
                  Create a New Post
                  <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </Dialog.Title>

                {/* --- ADD THE CHANNEL SELECTOR --- */}
                <div className="mt-4">
                  <ChannelSelector 
                    selectedAccountIds={targetAccountIds}
                    onChange={setTargetAccountIds}
                    showConnectionLinks={false}
                    fetchMode="all"
                  />
                </div>
                {/* ---------------------------------- */}
                
                <form onSubmit={handleSubmit} className="mt-4">
                  <div className="flex items-start space-x-3">
                    <img
                      className="h-10 w-10 rounded-full"
                      src={session?.user?.image || '/default-avatar.png'}
                      alt="User avatar"
                    />
                    <div className="w-full">
                      <textarea
                        rows={5}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        placeholder={`What's on your mind, ${session?.user?.name}?`}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label htmlFor="schedule" className="block text-sm font-medium text-gray-700">
                      Schedule (Optional)
                    </label>
                    <input
                      type="datetime-local"
                      id="schedule"
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
                      {isLoading ? 'Posting...' : 'Post'}
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