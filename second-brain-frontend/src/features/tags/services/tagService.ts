import { apiClient } from '@/shared/api/apiClient';

export interface Tag {
  id: string;
  workspaceId: string;
  name: string;
  color: string;
  description?: string;
  createdAt: string;
  createdBy: string;
  noteCount: number;
}

export interface CreateTagInput {
  workspaceId: string;
  name: string;
  color: string;
  description?: string;
}

export interface UpdateTagInput {
  name?: string;
  color?: string;
  description?: string;
}

export const tagService = {
  // Fetch all tags in a workspace
  async getTags(workspaceId: string): Promise<Tag[]> {
    return apiClient.get<Tag[]>(`/workspaces/${workspaceId}/tags`);
  },

  // Fetch a single tag
  async getTag(workspaceId: string, tagId: string): Promise<Tag> {
    return apiClient.get<Tag>(`/workspaces/${workspaceId}/tags/${tagId}`);
  },

  // Create a new tag
  async createTag(input: CreateTagInput): Promise<Tag> {
    return apiClient.post<Tag>(`/workspaces/${input.workspaceId}/tags`, {
      name: input.name,
      color: input.color,
      description: input.description,
    });
  },

  // Update a tag
  async updateTag(workspaceId: string, tagId: string, input: UpdateTagInput): Promise<Tag> {
    return apiClient.put<Tag>(`/workspaces/${workspaceId}/tags/${tagId}`, input);
  },

  // Delete a tag
  async deleteTag(workspaceId: string, tagId: string): Promise<void> {
    await apiClient.delete(`/workspaces/${workspaceId}/tags/${tagId}`);
  },

  // Get notes with a specific tag
  async getNotesByTag(workspaceId: string, tagId: string): Promise<any[]> {
    return apiClient.get<any[]>(`/workspaces/${workspaceId}/tags/${tagId}/notes`);
  },
};
