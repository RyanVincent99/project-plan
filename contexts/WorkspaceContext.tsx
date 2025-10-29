import { createContext, useState, useEffect, useCallback, ReactNode, useContext } from 'react';
import { useSession } from 'next-auth/react';

export interface Workspace {
  id: string;
  name: string;
}

interface WorkspaceContextType {
  workspaces: Workspace[];
  currentWorkspace: Workspace | null;
  switchWorkspace: (workspaceId: string) => void;
  isLoading: boolean;
  fetchWorkspaces: (userId: string) => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchWorkspaces = useCallback(async (userId: string) => {
    setIsLoading(true);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
    try {
      const res = await fetch(`${apiUrl}/workspaces?userId=${userId}`);
      if (res.ok) {
        const data: Workspace[] = await res.json();
        setWorkspaces(data);
        if (data.length > 0) {
          // Check local storage for a saved workspace, otherwise default to the first one
          const savedWorkspaceId = localStorage.getItem('currentWorkspaceId');
          const savedWorkspace = data.find(ws => ws.id === savedWorkspaceId);
          
          if (savedWorkspace) {
            setCurrentWorkspace(savedWorkspace);
          } else {
            setCurrentWorkspace(data[0]);
            localStorage.setItem('currentWorkspaceId', data[0].id);
          }
        } else {
            setCurrentWorkspace(null);
            localStorage.removeItem('currentWorkspaceId');
        }
      } else {
        setWorkspaces([]);
        setCurrentWorkspace(null);
      }
    } catch (e) {
      console.error("Failed to fetch workspaces", e);
      setWorkspaces([]);
      setCurrentWorkspace(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.id) {
      fetchWorkspaces(session.user.id);
    } else if (status === 'unauthenticated') {
      setIsLoading(false);
    }
  }, [session, status, fetchWorkspaces]);

  const switchWorkspace = (workspaceId: string) => {
    const workspace = workspaces.find(ws => ws.id === workspaceId);
    if (workspace) {
      setCurrentWorkspace(workspace);
      localStorage.setItem('currentWorkspaceId', workspaceId);
    }
  };

  return (
    <WorkspaceContext.Provider value={{ workspaces, currentWorkspace, switchWorkspace, isLoading, fetchWorkspaces }}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspaces() {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error('useWorkspaces must be used within a WorkspaceProvider');
  }
  return context;
}
