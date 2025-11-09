import { createContext, useState, useEffect, useCallback, ReactNode, useContext } from 'react';
import { useWorkspaces } from './WorkspaceContext'; // Import the new context hook

// Define shared types here
export interface SocialAccount {
  id: number;
  provider: string;
  name: string;
}

export interface FullSocialAccount extends SocialAccount {
  status: 'CONNECTED' | 'DISCONNECTED';
}

interface ChannelContextType {
  accounts: FullSocialAccount[];
  isLoading: boolean;
  fetchAccounts: () => void;
}

const ChannelContext = createContext<ChannelContextType | undefined>(undefined);

export function ChannelProvider({ children }: { children: ReactNode }) {
  const { currentWorkspace } = useWorkspaces(); // Get current workspace
  const [accounts, setAccounts] = useState<FullSocialAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAccounts = useCallback(async () => {
    if (!currentWorkspace) {
      setAccounts([]);
      setIsLoading(false);
      return;
    }
    // We don't set loading to true here to avoid a flash on refetch
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
    try {
      const res = await fetch(`${apiUrl}/social-accounts?workspaceId=${currentWorkspace.id}`);
      if (res.ok) {
        setAccounts(await res.json());
      } else {
        setAccounts([]);
      }
    } catch (e) {
      setAccounts([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentWorkspace]); // Add currentWorkspace as a dependency

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  return (
    <ChannelContext.Provider value={{ accounts, isLoading, fetchAccounts }}>
      {children}
    </ChannelContext.Provider>
  );
}

export function useChannels() {
  const context = useContext(ChannelContext);
  if (context === undefined) {
    throw new Error('useChannels must be used within a ChannelProvider');
  }
  return context;
}
