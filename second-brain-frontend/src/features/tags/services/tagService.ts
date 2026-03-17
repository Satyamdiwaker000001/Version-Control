import apiClient from '@/shared/api/apiClient';
import type { Tag } from '@/shared/types';

export const tagService = {
  getTags: async (): Promise<Tag[]> => {
    const response = await apiClient.get('/tags');
    if (response.data.success) {
      return response.data.data;
    }
    return [];
  },

  createTag: async (name: string, color: string): Promise<Tag> => {
    const response = await apiClient.post('/tags', { name, color });
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to create tag');
  }
};
