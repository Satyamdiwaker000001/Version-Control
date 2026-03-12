import { createContext, useContext, useMemo } from 'react';
import type { ReactNode } from 'react';

import { useWorkspaceStore } from '@/features/workspace/store/useWorkspaceStore';
import type { Workspace } from '@/shared/types';

interface WorkspaceContextValue {
  workspaces: Workspace[];
  activeWorkspace: Workspace | null;
  setActiveWorkspace: (id: string) => void;
  fetchCollaborators: (workspaceId: string, token: string) => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextValue | undefined>(undefined);

interface WorkspaceProviderProps {
  children: ReactNode;
}

export const WorkspaceProvider = ({ children }: WorkspaceProviderProps) => {
  const workspaces = useWorkspaceStore((s) => s.workspaces);
  const activeWorkspace = useWorkspaceStore((s) => s.activeWorkspace ?? s.workspaces[0] ?? null);
  const setActiveWorkspace = useWorkspaceStore((s) => s.setActiveWorkspace);
  const fetchCollaborators = useWorkspaceStore((s) => s.fetchCollaborators);

  const value = useMemo<WorkspaceContextValue>(
    () => ({ workspaces, activeWorkspace, setActiveWorkspace, fetchCollaborators }),
    [workspaces, activeWorkspace, setActiveWorkspace, fetchCollaborators],
  );

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useWorkspaceContext = () => {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) {
    throw new Error('useWorkspaceContext must be used within a WorkspaceProvider');
  }
  return ctx;
};