import { create } from 'zustand';
import apiClient from '@/shared/api/apiClient';
import { useWorkspaceStore } from '@/features/workspace/store/useWorkspaceStore';

export interface ProjectTask {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  assigneeId?: string;
  dueDate?: string;
  linkedNoteId?: string;
  linkedCommitSha?: string;
  createdAt: string;
}

export interface ProjectDiscussion {
  id: string;
  projectId: string;
  title: string;
  content: string;
  author: string;
  replies: number;
  tags: string[];
  createdAt: string;
}

export interface Project {
  id: string;
  workspaceId: string;
  name: string;
  description: string;
  tasks: ProjectTask[];
  discussions: ProjectDiscussion[];
  createdAt: string;
}

interface ProjectStore {
  projects: Project[];
  activeProjectId: string | null;
  isLoading: boolean;
  
  fetchProjects: () => Promise<void>;
  setActiveProject: (id: string) => void;
  addTask: (projectId: string, task: Omit<ProjectTask, 'id' | 'createdAt'>) => Promise<void>;
  updateTask: (projectId: string, taskId: string, updates: Partial<ProjectTask>) => Promise<void>;
  createProject: (name: string, description: string) => Promise<void>;
}

export const useProjectStore = create<ProjectStore>((set, get) => ({
  projects: [],
  activeProjectId: null,
  isLoading: false,

  fetchProjects: async () => {
    set({ isLoading: true });
    try {
      const res = await apiClient.get('/projects');
      if (res.data.success) {
        const mapped = res.data.data.map((p: any) => ({
          id: p.id,
          workspaceId: p.workspace_id || 'ws1',
          name: p.name,
          description: p.description || '',
          tasks: p.settings?.tasks || [],
          discussions: p.settings?.discussions || [],
          createdAt: p.created_at
        }));
        set({ projects: mapped });
        if (mapped.length > 0 && !get().activeProjectId) {
          set({ activeProjectId: mapped[0].id });
        }
      }
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  setActiveProject: (id) => set({ activeProjectId: id }),

  addTask: async (projectId, taskData) => {
    try {
      const res = await apiClient.post(`/projects/${projectId}/tasks`, taskData);
      if (res.data.success) {
        const p = res.data.data;
        const updatedProject = {
          id: p.id,
          workspaceId: p.workspace_id || 'ws1',
          name: p.name,
          description: p.description || '',
          tasks: p.settings?.tasks || [],
          discussions: p.settings?.discussions || [],
          createdAt: p.created_at
        };
        set((state) => ({
          projects: state.projects.map(pk => pk.id === projectId ? updatedProject : pk)
        }));
      }
    } catch (error) {
      console.error('Failed to add task:', error);
    }
  },

  updateTask: async (projectId, taskId, updates) => {
    try {
      const res = await apiClient.patch(`/projects/${projectId}/tasks/${taskId}`, updates);
      if (res.data.success) {
        const p = res.data.data;
        const updatedProject = {
          id: p.id,
          workspaceId: p.workspace_id || 'ws1',
          name: p.name,
          description: p.description || '',
          tasks: p.settings?.tasks || [],
          discussions: p.settings?.discussions || [],
          createdAt: p.created_at
        };
        set((state) => ({
          projects: state.projects.map(pk => pk.id === projectId ? updatedProject : pk)
        }));
      }
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  },

  createProject: async (name, description) => {
    set({ isLoading: true });
    try {
      const activeWorkspace = useWorkspaceStore.getState().activeWorkspace;
      const res = await apiClient.post('/projects', {
        name,
        description,
        workspace_id: activeWorkspace?.id || 'ws1', // Fallback for legacy
        color: '#3b82f6'
      });
      if (res.data.success) {
        const p = res.data.data;
        const newProject = {
          id: p.id,
          workspaceId: p.workspace_id || 'ws1',
          name: p.name,
          description: p.description || '',
          tasks: [],
          discussions: [],
          createdAt: p.created_at
        };
        set((state) => ({
          projects: [...state.projects, newProject],
          activeProjectId: newProject.id
        }));
      }
    } catch (error) {
      console.error('Failed to create project:', error);
    } finally {
      set({ isLoading: false });
    }
  },
}));
