import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FaLinkedin, FaDiscord, FaPlus, FaFacebook, FaTwitter, FaInstagram, FaGoogle, FaYoutube, FaTiktok, FaPinterest, FaCommentDots } from 'react-icons/fa';
import { FiGrid } from 'react-icons/fi';
import { useChannels } from '@/contexts/ChannelContext';

const channelIconMap: { [key: string]: React.ComponentType<any> } = {
  linkedin: FaLinkedin,
  discord: FaDiscord,
  facebook: FaFacebook,
  twitter: FaTwitter,
  instagram: FaInstagram,
  google_business: FaGoogle,
  youtube: FaYoutube,
  tiktok: FaTiktok,
  pinterest: FaPinterest,
  threads: FaCommentDots,
  default: FaPlus,
};

export default function ChannelList() {
  const { accounts, isLoading } = useChannels();
  const router = useRouter();
  const { channel: activeChannelId } = router.query;

  if (isLoading) {
    return <p className="px-3 text-sm text-gray-500">Loading...</p>;
  }

  return (
    <div className="space-y-1">
      <Link href="/dashboard">
        <a className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg ${
          !activeChannelId ? 'bg-indigo-100 text-indigo-700' : 'text-gray-700 hover:bg-gray-100'
        }`}>
          <FiGrid className="w-5 h-5 mr-3" />
          All Channels
        </a>
      </Link>

      {accounts.length > 0 ? (
        accounts.map(account => {
          const Icon = channelIconMap[account.provider] || channelIconMap.default;
          const isActive = activeChannelId === account.id;
          return (
            <Link key={account.id} href={`/dashboard?channel=${account.id}`}>
              <a className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg ${
                isActive ? 'bg-indigo-100 text-indigo-700' : 'text-gray-700 hover:bg-gray-100'
              }`}>
                <Icon className="w-5 h-5 mr-3" />
                <span className="truncate">{account.name}</span>
              </a>
            </Link>
          );
        })
      ) : (
        <p className="px-3 text-sm text-gray-500">No channels connected.</p>
      )}
    </div>
  );
}
