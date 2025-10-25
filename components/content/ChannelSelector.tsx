// components/content/ChannelSelector.tsx
import { useState, useEffect } from 'react'
import { FaLinkedin, FaFacebook, FaTwitter, FaInstagram, FaTiktok, FaPlus } from 'react-icons/fa'

// Define your SocialAccount type on the frontend
export interface SocialAccount {
  id: string
  provider: string
  name: string
}

// Map provider keys to icons and colors
const channelMap = {
  linkedin: { icon: FaLinkedin, color: 'text-blue-700' },
  facebook: { icon: FaFacebook, color: 'text-blue-800' },
  twitter: { icon: FaTwitter, color: 'text-blue-400' },
  instagram: { icon: FaInstagram, color: 'text-pink-500' },
  tiktok: { icon: FaTiktok, color: 'text-black' },
}

interface Props {
  selectedAccountIds: string[]
  onChange: (selectedIds: string[]) => void
}

export default function ChannelSelector({ selectedAccountIds, onChange }: Props) {
  const [accounts, setAccounts] = useState<SocialAccount[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Fetch all connected accounts
  useEffect(() => {
    const fetchAccounts = async () => {
      setIsLoading(true)
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || ''
      try {
        // Fetch accounts from the new backend endpoint
        const res = await fetch(`${apiUrl}/social-accounts`) 
        if (res.ok) {
          const data: SocialAccount[] = await res.json()
          setAccounts(data)
        } else {
          console.error("Failed to fetch social accounts:", res.statusText)
          setAccounts([]) // Clear accounts on error
        }
      } catch (e) {
        console.error("Error fetching social accounts:", e)
        setAccounts([]) // Clear accounts on error
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchAccounts(); // Fetch accounts when the component mounts

  }, []) // Empty dependency array ensures this runs once

  const toggleAccount = (id: string) => {
    const newSelection = selectedAccountIds.includes(id)
      ? selectedAccountIds.filter(accId => accId !== id)
      : [...selectedAccountIds, id]
    onChange(newSelection)
  }

  return (
    <div className="py-2">
      <label className="block text-sm font-medium text-gray-700">Publish to:</label>
      <div className="mt-2 flex items-center space-x-2 flex-wrap gap-2"> {/* Added flex-wrap and gap */}
        {isLoading ? (
          <p className="text-sm text-gray-500">Loading channels...</p>
        ) : accounts.length > 0 ? (
          accounts.map(account => {
            // Tell TypeScript that account.provider is a key of channelMap
            const providerKey = account.provider as keyof typeof channelMap;
            
            const { icon: Icon, color } = channelMap[providerKey] || { icon: FaPlus, color: 'text-gray-400' } // Default icon
            const isSelected = selectedAccountIds.includes(account.id)
            
            return (
              <button
                key={account.id}
                type="button"
                onClick={() => toggleAccount(account.id)}
                className={`relative p-2 rounded-full transition-all ${
                  isSelected ? 'bg-indigo-100 ring-2 ring-indigo-500' : 'bg-gray-200 hover:bg-gray-300'
                }`}
                title={account.name}
              >
                <Icon className={`w-5 h-5 ${color}`} />
                {isSelected && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-indigo-600 rounded-full border-2 border-white"></div>
                )}
              </button>
            )
          })
        ) : (
          <p className="text-sm text-gray-500">No channels connected yet.</p>
        )}

        {/* Links to connect new channels */}
        <a
          href="http://localhost:8080/api/connect/linkedin"
          className="p-2 rounded-full bg-gray-100 text-blue-700 hover:bg-gray-200"
          title="Connect new LinkedIn profile"
        >
          <FaLinkedin className="w-5 h-5" />
        </a>
        {/* Uncomment or add more connection links as you implement them
        <a
          href="http://localhost:8080/api/connect/facebook"
          className="p-2 rounded-full bg-gray-100 text-blue-800 hover:bg-gray-200"
          title="Connect new Facebook page"
        >
          <FaFacebook className="w-5 h-5" />
        </a>
        */}
        <a
          href="#" // Or link to a help page?
          onClick={(e) => e.preventDefault()} // Prevent navigation for now
          className="p-2 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200"
          title="Connect another channel"
        >
           <FaPlus className="w-5 h-5" />
        </a>
      </div>
    </div>
  )
}