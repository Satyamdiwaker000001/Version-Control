import { create } from 'zustand';

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
  setActiveProject: (id: string) => void;
  addTask: (projectId: string, task: Omit<ProjectTask, 'id' | 'createdAt'>) => void;
  updateTask: (projectId: string, taskId: string, updates: Partial<ProjectTask>) => void;
}

const MOCK_PROJECTS: Project[] = [
  {
    id: 'proj1',
    workspaceId: 'ws1',
    name: 'Second Brain Platform',
    description: 'Building the core platform features and integrations.',
    tasks: [
      {
        id: 't1',
        projectId: 'proj1',
        title: 'Implement Graph Visualization',
        description: 'Create an interactive force-directed graph of note connections.',
        status: 'done',
        priority: 'high',
        createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      },
      {
        id: 't2',
        projectId: 'proj1',
        title: 'GitHub Integration API',
        description: 'Connect repositories and sync commits as note versions.',
        status: 'in-progress',
        priority: 'high',
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      },
      {
        id: 't3',
        projectId: 'proj1',
        title: 'AI-powered note suggestions',
        description: 'Use GPT to suggest backlinks and related notes.',
        status: 'todo',
        priority: 'medium',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: 't4',
        projectId: 'proj1',
        title: 'Dark / Light theme system',
        description: 'Implement a robust theme toggle with system preference detection.',
        status: 'done',
        priority: 'medium',
        createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
      },
      {
        id: 't5',
        projectId: 'proj1',
        title: 'Collaborative editing',
        description: 'Real-time multi-user editing with conflict resolution.',
        status: 'todo',
        priority: 'low',
        createdAt: new Date().toISOString(),
      },
    ],
    discussions: [
      {
        id: 'disc1',
        projectId: 'proj1',
        title: 'Architecture decisions for the graph engine',
        content: 'We need to decide between ForceGraph2D and D3 directly. I think ForceGraph2D provides a better abstraction...',
        author: 'Alex Johnson',
        replies: 5,
        tags: ['architecture', 'graph'],
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      },
      {
        id: 'disc2',
        projectId: 'proj1',
        title: 'Backend API rate limiting strategy',
        content: 'Given the GitHub API limits, should we cache aggressively or implement a queue?',
        author: 'Sarah Chen',
        replies: 3,
        tags: ['backend', 'api'],
        createdAt: new Date(Date.now() - 86400000).toISOString(),
      },
    ],
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
  },
];

export const useProjectStore = create<ProjectStore>((set) => ({
  projects: MOCK_PROJECTS,
  activeProjectId: MOCK_PROJECTS[0].id,

  setActiveProject: (id) => set({ activeProjectId: id }),

  addTask: (projectId, taskData) =>
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === projectId
          ? {
              ...p,
              tasks: [
                ...p.tasks,
                {
                  ...taskData,
                  id: `t_${Date.now()}`,
                  projectId,
                  createdAt: new Date().toISOString(),
                },
              ],
            }
          : p
      ),
    })),

  updateTask: (projectId, taskId, updates) =>
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === projectId
          ? {
              ...p,
              tasks: p.tasks.map((t) =>
                t.id === taskId ? { ...t, ...updates } : t
              ),
            }
          : p
      ),
    })),
}));
