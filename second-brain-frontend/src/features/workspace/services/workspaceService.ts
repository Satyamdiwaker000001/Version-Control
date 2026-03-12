import { apiClient } from '@/shared/api/apiClient';
import type { Workspace } from '@/shared/types';

export interface CreateWorkspaceInput {
  name: string;
  description?: string;
  type: 'personal' | 'team';
}

export interface UpdateWorkspaceInput {
  name?: string;
  description?: string;
}

export interface WorkspaceMember {
  id: string;
  userId: string;
  name: string;
  email: string;
  role: 'admin' | 'member' | 'viewer';
  joinedAt: string;
}

export const workspaceService = {
  // Fetch all workspaces for the current user
  async getWorkspaces(): Promise<Workspace[]> {
    return apiClient.get<Workspace[]>('/workspaces');
  },

  // Fetch a single workspace by ID
  async getWorkspace(id: string): Promise<Workspace> {
    return apiClient.get<Workspace>(`/workspaces/${id}`);
  },

  // Create a new workspace
  async createWorkspace(input: CreateWorkspaceInput): Promise<Workspace> {
    return apiClient.post<Workspace>('/workspaces', input);
  },

  // Update a workspace
  async updateWorkspace(id: string, input: UpdateWorkspaceInput): Promise<Workspace> {
    return apiClient.put<Workspace>(`/workspaces/${id}`, input);
  },

  // Delete a workspace
  async deleteWorkspace(id: string): Promise<void> {
    await apiClient.delete(`/workspaces/${id}`);
  },

  // Get workspace members
  async getMembers(workspaceId: string): Promise<WorkspaceMember[]> {
    return apiClient.get<WorkspaceMember[]>(`/workspaces/${workspaceId}/members`);
  },

  // Invite a member to workspace
  async inviteMember(workspaceId: string, email: string, role: string): Promise<WorkspaceMember> {
    return apiClient.post<WorkspaceMember>(`/workspaces/${workspaceId}/members`, { email, role });
  },

  // Update member role
  async updateMemberRole(workspaceId: string, userId: string, role: string): Promise<WorkspaceMember> {
    return apiClient.put<WorkspaceMember>(
      `/workspaces/${workspaceId}/members/${userId}`,
      { role }
    );
  },

  // Remove a member from workspace
  async removeMember(workspaceId: string, userId: string): Promise<void> {
    await apiClient.delete(`/workspaces/${workspaceId}/members/${userId}`);
  },

  // Leave a workspace
  async leaveWorkspace(workspaceId: string): Promise<void> {
    await apiClient.post(`/workspaces/${workspaceId}/leave`, {});
  },
};
