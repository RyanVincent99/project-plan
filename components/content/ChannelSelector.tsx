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
        const res = await fetch(`${apiUrl}/social-accounts`) // You need to create this endpoint
        if (res.ok) {
          setAccounts(await res.json())
        }
      } catch (e) {
        console.error("Failed to fetch social accounts", e)
      } finally {
        setIsLoading(false)
      }
    }
    // fetchAccounts() // Uncomment when your endpoint is ready
    
    // FOR DEMO: Add a fake account so you can see the UI
    setAccounts([
      { id: 'fake-linkedin-id', provider: 'linkedin', name: 'Demo LinkedIn' },
      { id: 'fake-facebook-id', provider: 'facebook', name: 'Demo Facebook' },
    ])
    setIsLoading(false)

  }, [])

  const toggleAccount = (id: string) => {
    const newSelection = selectedAccountIds.includes(id)
      ? selectedAccountIds.filter(accId => accId !== id)
      : [...selectedAccountIds, id]
    onChange(newSelection)
  }

  if (isLoading) {
    return <p className="text-sm text-gray-500">Loading channels...</p>
  }

  return (
    <div className="py-2">
      <label className="block text-sm font-medium text-gray-700">Publish to:</label>
      <div className="mt-2 flex items-center space-x-2">
        {accounts.map(account => {
          // --- THIS IS THE FIX ---
          // We tell TypeScript that account.provider is a key of channelMap
          const providerKey = account.provider as keyof typeof channelMap;
          // -----------------------
          
          const { icon: Icon, color } = channelMap[providerKey] || { icon: FaPlus, color: 'text-gray-400' }
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
        })}

        {/* --- I'm using the connection links from the Facebook example --- */}
        <a
          href="http://localhost:8080/api/connect/linkedin"
          className="p-2 rounded-full bg-gray-100 text-blue-700 hover:bg-gray-200"
          title="Connect new LinkedIn profile"
        >
          <FaLinkedin className="w-5 h-5" />
        </a>
        <a
          href="http://localhost:8080/api/connect/facebook"
          className="p-2 rounded-full bg-gray-100 text-blue-800 hover:bg-gray-200"
          title="Connect new Facebook page"
        >
          <FaFacebook className="w-5 h-5" />
        </a>
      </div>
    </div>
  )
}