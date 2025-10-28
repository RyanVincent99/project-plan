import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/solid';
import { FaFacebook, FaTwitter, FaInstagram, FaGoogle, FaYoutube, FaTiktok, FaPinterest, FaCommentDots, FaLinkedin, FaDiscord } from 'react-icons/fa';

const providers = [
  { key: 'linkedin', name: 'LinkedIn', icon: FaLinkedin },
  { key: 'discord', name: 'Discord', icon: FaDiscord },
  { key: 'facebook', name: 'Facebook', icon: FaFacebook },
  { key: 'twitter', name: 'X (Twitter)', icon: FaTwitter },
  { key: 'instagram', name: 'Instagram', icon: FaInstagram },
  { key: 'google_business', name: 'Google Business', icon: FaGoogle },
  { key: 'youtube', name: 'YouTube', icon: FaYoutube },
  { key: 'tiktok', name: 'TikTok', icon: FaTiktok },
  { key: 'pinterest', name: 'Pinterest', icon: FaPinterest },
  { key: 'threads', name: 'Threads', icon: FaCommentDots }, // Placeholder icon
];

interface Props {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onChannelCreated: () => void;
}

export default function CreateChannelModal({ isOpen, setIsOpen, onChannelCreated }: Props) {
  const [name, setName] = useState('');
  const [provider, setProvider] = useState(providers[0].key);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !provider) {
      alert('Please provide a name and select a channel type.');
      return;
    }
    setIsLoading(true);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
    try {
      const res = await fetch(`${apiUrl}/social-accounts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, provider }),
      });
      if (res.ok) {
        onChannelCreated();
        closeModal();
      } else {
        alert('Failed to create channel.');
      }
    } catch (error) {
      console.error('Error creating channel:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const closeModal = () => {
    setIsOpen(false);
    setName('');
    setProvider(providers[0].key);
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-20" onClose={closeModal}>
        <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 flex justify-between items-center">
                  Add a New Channel
                  <button onClick={closeModal} className="text-gray-400 hover:text-gray-600"><XMarkIcon className="w-6 h-6" /></button>
                </Dialog.Title>
                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                  <div>
                    <label htmlFor="channel-name" className="block text-sm font-medium text-gray-700">Channel Name</label>
                    <input type="text" id="channel-name" value={name} onChange={(e) => setName(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" placeholder="e.g., Company Blog" required />
                  </div>
                  <div>
                    <label htmlFor="channel-provider" className="block text-sm font-medium text-gray-700">Channel Type</label>
                    <select id="channel-provider" value={provider} onChange={(e) => setProvider(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
                      {providers.map(p => <option key={p.key} value={p.key}>{p.name}</option>)}
                    </select>
                  </div>
                  <div className="mt-6 flex justify-end">
                    <button type="submit" disabled={isLoading} className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50">
                      {isLoading ? 'Creating...' : 'Create Channel'}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
