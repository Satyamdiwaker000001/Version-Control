import apiClient, { type ApiResponse } from '@/shared/api/apiClient';

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  type: 'solo' | 'team';
  avatar: string | null;
  description: string | null;
  githubOwner: string | null;
  createdAt: string;
  updatedAt: string;
  role?: 'owner' | 'admin' | 'member';
}

export interface WorkspaceMember {
  id: string;
  userId: string;
  workspaceId: string;
  role: 'owner' | 'admin' | 'member';
  joinedAt: string;
  user?: any;
}

export const workspaceService = {
  // Create workspace
  async createWorkspace(data: {
    name: string;
    type: 'solo' | 'team';
    description?: string;
  }): Promise<Workspace> {
    const response = await apiClient.post<ApiResponse<Workspace>>(
      '/workspaces',
      data
    );
    return response.data.data!;
  },

  // Get all workspaces
  async getWorkspaces(): Promise<Workspace[]> {
    const response = await apiClient.get<ApiResponse<Workspace[]>>(
      '/workspaces'
    );
    return response.data.data || [];
  },

  // Get single workspace
  async getWorkspace(workspaceId: string): Promise<Workspace> {
    const response = await apiClient.get<ApiResponse<Workspace>>(
      `/workspaces/${workspaceId}`
    );
    return response.data.data!;
  },

  // Update workspace
  async updateWorkspace(
    workspaceId: string,
    data: Partial<{ name: string; description: string; avatar: string }>
  ): Promise<Workspace> {
    const response = await apiClient.patch<ApiResponse<Workspace>>(
      `/workspaces/${workspaceId}`,
      data
    );
    return response.data.data!;
  },

  // Get members
  async getMembers(workspaceId: string): Promise<WorkspaceMember[]> {
    const response = await apiClient.get<ApiResponse<WorkspaceMember[]>>(
      `/workspaces/${workspaceId}/members`
    );
    return response.data.data || [];
  },

  // Add member
  async addMember(
    workspaceId: string,
    email: string,
    role?: string
  ): Promise<WorkspaceMember> {
    const response = await apiClient.post<ApiResponse<WorkspaceMember>>(
      `/workspaces/${workspaceId}/members`,
      { email, role }
    );
    return response.data.data!;
  },

  // Remove member
  async removeMember(workspaceId: string, memberId: string): Promise<void> {
    await apiClient.delete(`/workspaces/${workspaceId}/members/${memberId}`);
  },
};
