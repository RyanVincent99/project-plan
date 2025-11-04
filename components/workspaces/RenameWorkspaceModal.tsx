import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/solid';
import { useSession } from 'next-auth/react';
import { Workspace } from '@/contexts/WorkspaceContext';

interface Props {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  workspace: Workspace;
  onWorkspaceUpdated: () => void;
}

export default function RenameWorkspaceModal({ isOpen, setIsOpen, workspace, onWorkspaceUpdated }: Props) {
  const { data: session } = useSession();
  const [name, setName] = useState(workspace.name);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setName(workspace.name);
  }, [workspace]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = session?.user;
    if (!name.trim() || !user) {
      alert('Workspace name cannot be empty.');
      return;
    }
    setIsLoading(true);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
    try {
      const res = await fetch(`${apiUrl}/workspaces/${workspace.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, userId: user.id }),
      });
      if (res.ok) {
        onWorkspaceUpdated();
        closeModal();
      } else {
        alert('Failed to rename workspace. You may not have permission.');
      }
    } catch (error) {
      console.error('Error renaming workspace:', error);
      alert('An error occurred while renaming the workspace.');
    } finally {
      setIsLoading(false);
    }
  };

  const closeModal = () => {
    setIsOpen(false);
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
                  Rename Workspace
                  <button onClick={closeModal} className="text-gray-400 hover:text-gray-600"><XMarkIcon className="w-6 h-6" /></button>
                </Dialog.Title>
                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                  <div>
                    <label htmlFor="workspace-name" className="block text-sm font-medium text-gray-700">Workspace Name</label>
                    <input type="text" id="workspace-name" value={name} onChange={(e) => setName(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" required />
                  </div>
                  <div className="mt-6 flex justify-end space-x-2">
                    <button type="button" onClick={closeModal} className="inline-flex justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                      Cancel
                    </button>
                    <button type="submit" disabled={isLoading} className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50">
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
  );
}
