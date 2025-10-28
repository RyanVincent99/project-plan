import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/solid';
import { FullSocialAccount } from '@/contexts/ChannelContext';

interface Props {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  account: FullSocialAccount | null;
  onUpdate: () => void;
}

export default function EditChannelModal({ isOpen, setIsOpen, account, onUpdate }: Props) {
  const [name, setName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const backendBase = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080';
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';

  useEffect(() => {
    if (account) {
      setName(account.name);
    }
  }, [account]);

  if (!account) return null;

  const closeModal = () => setIsOpen(false);

  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || name.trim() === '' || name === account.name) return;
    setIsProcessing(true);
    await fetch(`${apiUrl}/social-accounts/${account.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    onUpdate();
    setIsProcessing(false);
  };

  const handleDisconnect = async () => {
    if (window.confirm('Are you sure you want to disconnect this account?')) {
      setIsProcessing(true);
      await fetch(`${apiUrl}/social-accounts/${account.id}/disconnect`, { method: 'PUT' });
      onUpdate();
      setIsProcessing(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to permanently delete this channel? This action cannot be undone.')) {
      setIsProcessing(true);
      try {
        const response = await fetch(`${apiUrl}/social-accounts/${account.id}`, { method: 'DELETE' });
        if (response.ok) {
          onUpdate();
        } else {
          const errorData = await response.json().catch(() => ({ message: 'Failed to delete channel.' }));
          alert(`Error: ${errorData.message}`);
        }
      } catch (error) {
        console.error('Error deleting channel:', error);
        alert('An error occurred while deleting the channel. See the console for details.');
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const connectUrl = `${backendBase}/connect/${account.provider}/${account.id}`;

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
                  Edit Channel
                  <button onClick={closeModal} className="text-gray-400 hover:text-gray-600"><XMarkIcon className="w-6 h-6" /></button>
                </Dialog.Title>
                
                <form onSubmit={handleSaveName} className="mt-4 space-y-4">
                  <div>
                    <label htmlFor="channel-name" className="block text-sm font-medium text-gray-700">Channel Name</label>
                    <div className="flex items-center space-x-2">
                      <input type="text" id="channel-name" value={name} onChange={(e) => setName(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" required />
                      <button type="submit" disabled={isProcessing || name === account.name} className="mt-1 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md shadow-sm hover:bg-indigo-700 disabled:opacity-50">Save</button>
                    </div>
                  </div>
                </form>

                <div className="mt-6 border-t pt-4">
                  <h4 className="text-sm font-medium text-gray-700">Connection</h4>
                  {account.status === 'CONNECTED' ? (
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-sm text-gray-600">Account is connected.</p>
                      <div className="flex space-x-2">
                        <a href={connectUrl} className="px-3 py-1 text-sm font-medium text-gray-700 bg-white rounded-md border border-gray-300 hover:bg-gray-50">Change</a>
                        <button onClick={handleDisconnect} disabled={isProcessing} className="px-3 py-1 text-sm font-medium text-orange-600 bg-orange-100 rounded-md hover:bg-orange-200">Disconnect</button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-sm text-gray-600">Account is not connected.</p>
                      <a href={connectUrl} className="px-3 py-1 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700">Connect</a>
                    </div>
                  )}
                </div>

                <div className="mt-6 border-t pt-4">
                  <h4 className="text-sm font-medium text-gray-700">Danger Zone</h4>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-sm text-gray-600">Permanently delete this channel.</p>
                    <button onClick={handleDelete} disabled={isProcessing} className="px-3 py-1 text-sm font-medium text-red-600 bg-red-100 rounded-md hover:bg-red-200">Delete Channel</button>
                  </div>
                </div>

              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
