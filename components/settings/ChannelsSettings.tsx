import { useState } from 'react';
import { FaLinkedin, FaDiscord, FaPlus, FaFacebook, FaTwitter, FaInstagram, FaGoogle, FaYoutube, FaTiktok, FaPinterest, FaCommentDots } from 'react-icons/fa';
import CreateChannelModal from '@/components/settings/CreateChannelModal';
import EditChannelModal from '@/components/settings/EditChannelModal';
import { FullSocialAccount, useChannels } from '@/contexts/ChannelContext';

const channelMap: { [key: string]: { icon: React.ComponentType<any>; name: string; connectable: boolean } } = {
  linkedin: { icon: FaLinkedin, name: 'LinkedIn', connectable: true },
  discord: { icon: FaDiscord, name: 'Discord', connectable: true },
  facebook: { icon: FaFacebook, name: 'Facebook', connectable: false },
  twitter: { icon: FaTwitter, name: 'X (Twitter)', connectable: false },
  instagram: { icon: FaInstagram, name: 'Instagram', connectable: false },
  google_business: { icon: FaGoogle, name: 'Google Business', connectable: false },
  youtube: { icon: FaYoutube, name: 'YouTube', connectable: false },
  tiktok: { icon: FaTiktok, name: 'TikTok', connectable: false },
  pinterest: { icon: FaPinterest, name: 'Pinterest', connectable: false },
  threads: { icon: FaCommentDots, name: 'Threads', connectable: false },
};

export default function ChannelsSettings() {
  const { accounts, isLoading, fetchAccounts } = useChannels();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<FullSocialAccount | null>(null);

  const handleModalUpdate = () => {
    setEditingAccount(null);
    fetchAccounts();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Channels</h2>
          <p className="text-gray-600 mt-1">Manage your connected social media channels.</p>
        </div>
        <button onClick={() => setIsCreateModalOpen(true)} className="flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg shadow-sm hover:bg-indigo-700">
          <FaPlus className="w-4 h-4 mr-2" />
          Add Channel
        </button>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Channels</h3>
        {isLoading ? (
          <p>Loading...</p>
        ) : accounts.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {accounts.map(account => {
              const channel = channelMap[account.provider] || { icon: FaPlus, name: account.provider, connectable: false };
              const Icon = channel.icon;
              return (
                <li key={account.id} className="py-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <Icon className="w-6 h-6 mr-4 text-gray-600" />
                    <div>
                      <span className="font-medium text-gray-800">{account.name}</span>
                      <div className="flex items-center text-sm text-gray-500">
                        <span>{channel.name}</span>
                        <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-semibold ${account.status === 'CONNECTED' ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-800'}`}>
                          {account.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button onClick={() => setEditingAccount(account)} className="px-3 py-1 text-sm font-medium text-gray-700 bg-white rounded-md border border-gray-300 hover:bg-gray-50">Edit</button>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-gray-500 py-4">No channels have been added yet. Click "Add Channel" to get started.</p>
        )}
      </div>
      <CreateChannelModal isOpen={isCreateModalOpen} setIsOpen={setIsCreateModalOpen} onChannelCreated={fetchAccounts} />
      <EditChannelModal 
        isOpen={!!editingAccount}
        setIsOpen={() => setEditingAccount(null)}
        account={editingAccount}
        onUpdate={handleModalUpdate}
      />
    </div>
  );
}
