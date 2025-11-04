import { createContext, useState, useEffect, useCallback, ReactNode, useContext } from 'react';
import { useSession } from 'next-auth/react';

export type UserRole = 'ADMINISTRATOR' | 'PUBLISHER' | 'USER';

export interface UserWorkspace {
  id: string;
  user: {
    id: string;
    name: string | null;
    email: string | null;
  };
  role: UserRole;
}

export interface Workspace {
  id: string;
  name: string;
  userWorkspaces: UserWorkspace[];
}

interface WorkspaceContextType {
  workspaces: Workspace[];
  currentWorkspace: Workspace | null;
  switchWorkspace: (workspaceId: string) => void;
  isLoading: boolean;
  fetchWorkspaces: () => Promise<void>;
  currentUserRole: UserWorkspace['role'] | null;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<UserWorkspace['role'] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchWorkspaces = useCallback(async () => {
    const user = session?.user;
    if (!user) {
      setWorkspaces([]);
      setCurrentWorkspace(null);
      setCurrentUserRole(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
    try {
      const params = new URLSearchParams({ userId: user.id });
      if (user.name) params.append('name', user.name);
      if (user.email) params.append('email', user.email);
      if (user.image) params.append('image', user.image);

      const res = await fetch(`${apiUrl}/workspaces?${params.toString()}`);
      if (res.ok) {
        const data: Workspace[] = await res.json();
        setWorkspaces(data);
        if (data.length > 0) {
          const savedWorkspaceId = localStorage.getItem('currentWorkspaceId');
          const savedWorkspace = data.find(ws => ws.id === savedWorkspaceId);
          const workspaceToSet = savedWorkspace || data[0];
          
          setCurrentWorkspace(workspaceToSet);
          localStorage.setItem('currentWorkspaceId', workspaceToSet.id);

          const userWorkspace = workspaceToSet.userWorkspaces.find(uw => uw.user.id === user.id);
          setCurrentUserRole(userWorkspace ? userWorkspace.role : null);

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
  }, [session]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchWorkspaces();
    } else if (status === 'unauthenticated') {
      setIsLoading(false);
      setWorkspaces([]);
      setCurrentWorkspace(null);
      setCurrentUserRole(null);
    }
  }, [status, fetchWorkspaces]);

  const switchWorkspace = (workspaceId: string) => {
    const workspace = workspaces.find(ws => ws.id === workspaceId);
    const user = session?.user;
    if (workspace && user) {
      setCurrentWorkspace(workspace);
      localStorage.setItem('currentWorkspaceId', workspaceId);
      const userWorkspace = workspace.userWorkspaces.find(uw => uw.user.id === user.id);
      setCurrentUserRole(userWorkspace ? userWorkspace.role : null);
    }
  };

  return (
    <WorkspaceContext.Provider value={{ workspaces, currentWorkspace, switchWorkspace, isLoading, fetchWorkspaces, currentUserRole }}>
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
