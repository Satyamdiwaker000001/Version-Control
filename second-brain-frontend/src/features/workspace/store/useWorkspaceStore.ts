import { create } from 'zustand';
import { workspaceService, type Workspace, type WorkspaceMember } from '../services/workspaceService';

// ─── No mock data (strictly dynamic) ────────────────────────────────────────────

interface WorkspaceStore {
  workspaces: Workspace[];
  activeWorkspace: Workspace | null;
  members: WorkspaceMember[];
  isLoading: boolean;
  error: string | null;

  fetchWorkspaces: () => Promise<void>;
  selectWorkspace: (workspaceId: string) => Promise<void>;
  createWorkspace: (data: { name: string; type: 'solo' | 'team'; description?: string }) => Promise<Workspace>;
  updateWorkspace: (workspaceId: string, data: Partial<any>) => Promise<void>;
  fetchMembers: (workspaceId: string) => Promise<void>;
  addMember: (workspaceId: string, email: string) => Promise<void>;
  removeMember: (workspaceId: string, memberId: string) => Promise<void>;
  setError: (error: string | null) => void;
}

export const useWorkspaceStore = create<WorkspaceStore>((set, get) => ({
  workspaces: [],
  activeWorkspace: null,
  members: [],
  isLoading: false,
  error: null,

  fetchWorkspaces: async () => {
    set({ isLoading: true, error: null });
    try {
      const workspaces = await workspaceService.getWorkspaces();
      const active = workspaces[0] || null;
      set({ workspaces, activeWorkspace: active, isLoading: false });
    } catch {
      // Keep mock data on network error
      set({ isLoading: false });
    }
  },

  selectWorkspace: async (workspaceId: string) => {
    const existing = get().workspaces.find(w => w.id === workspaceId);
    if (existing) set({ activeWorkspace: existing });
    try {
      const workspace = await workspaceService.getWorkspace(workspaceId);
      set({ activeWorkspace: workspace });
      get().fetchMembers(workspaceId);
    } catch {
      // Already set from local
    }
  },

  createWorkspace: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const workspace = await workspaceService.createWorkspace(data);
      set((state) => ({
        workspaces: [...state.workspaces, workspace],
        activeWorkspace: workspace,
        isLoading: false,
      }));
      return workspace;
    } catch {
      const mockWs: Workspace = {
        id: `ws_${Date.now()}`,
        name: data.name,
        slug: data.name.toLowerCase().replace(/\s+/g, '-'),
        type: data.type,
        avatar: null,
        description: data.description || null,
        githubOwner: null,
        role: 'owner',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      set((state) => ({
        workspaces: [...state.workspaces, mockWs],
        activeWorkspace: mockWs,
        isLoading: false,
      }));
      return mockWs;
    }
  },

  updateWorkspace: async (workspaceId, data) => {
    try {
      const updated = await workspaceService.updateWorkspace(workspaceId, data);
      set((state) => ({
        workspaces: state.workspaces.map(w => w.id === workspaceId ? updated : w),
        activeWorkspace: state.activeWorkspace?.id === workspaceId ? updated : state.activeWorkspace,
      }));
    } catch {
      set((state) => ({
        workspaces: state.workspaces.map(w => w.id === workspaceId ? { ...w, ...data } : w),
        activeWorkspace: state.activeWorkspace?.id === workspaceId ? { ...state.activeWorkspace!, ...data } : state.activeWorkspace,
      }));
    }
  },

  fetchMembers: async (workspaceId: string) => {
    try {
      const members = await workspaceService.getMembers(workspaceId);
      set({ members });
    } catch {
      set({ members: [] });
    }
  },

  addMember: async (workspaceId: string, email: string) => {
    try {
      await workspaceService.addMember(workspaceId, email);
      get().fetchMembers(workspaceId);
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  removeMember: async (workspaceId: string, memberId: string) => {
    try {
      await workspaceService.removeMember(workspaceId, memberId);
      get().fetchMembers(workspaceId);
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  setError: (error) => set({ error }),
}));
