import { create } from 'zustand';
import type { Workspace } from '@/shared/types';

import axios from 'axios';

export interface WorkspaceState {
  workspaces: Workspace[];
  activeWorkspace: Workspace | null;
  setActiveWorkspace: (id: string) => void;
  fetchCollaborators: (workspaceId: string, token: string) => Promise<void>;
}

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  workspaces: [
    { 
      id: 'ws1', 
      name: 'Personal Vault', 
      type: 'solo',
      role: 'owner', 
      members: [
        { user: { id: 'u1', email: 'alex@example.com', name: 'Alex', createdAt: new Date().toISOString() }, role: 'owner', joinedAt: new Date().toISOString() }
      ]
    },
    { 
      id: 'ws2', 
      name: 'System Design Prep', 
      type: 'team',
      role: 'editor', 
      members: [
        { user: { id: 'u1', email: 'alex@example.com', name: 'Alex', createdAt: new Date().toISOString() }, role: 'editor', joinedAt: new Date().toISOString() },
        { user: { id: 'u2', email: 'sarah@example.com', name: 'Sarah', createdAt: new Date().toISOString() }, role: 'owner', joinedAt: new Date().toISOString() }
      ]
    },
    { 
      id: 'ws3', 
      name: 'Startup Ideas', 
      type: 'team',
      role: 'owner', 
      members: [
        { user: { id: 'u1', email: 'alex@example.com', name: 'Alex', createdAt: new Date().toISOString() }, role: 'owner', joinedAt: new Date().toISOString() },
        { user: { id: 'u3', email: 'mike@example.com', name: 'Mike', createdAt: new Date().toISOString() }, role: 'viewer', joinedAt: new Date().toISOString() }
      ]
    },
  ],
  activeWorkspace: null,
  setActiveWorkspace: (id) => set((state) => ({
    activeWorkspace: state.workspaces.find(w => w.id === id) || null
  })),
  fetchCollaborators: async (workspaceId, token) => {
    try {
      const res = await axios.get(`http://localhost:3001/api/workspaces/${workspaceId}/collaborators`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      set((state) => ({
        workspaces: state.workspaces.map(w => 
          w.id === workspaceId ? { ...w, members: res.data.members } : w
        ),
        activeWorkspace: state.activeWorkspace?.id === workspaceId 
          ? { ...state.activeWorkspace, members: res.data.members } 
          : state.activeWorkspace
      }));
    } catch (e) {
      console.error('Failed to fetch workspace collaborators', e);
    }
  }
}));
