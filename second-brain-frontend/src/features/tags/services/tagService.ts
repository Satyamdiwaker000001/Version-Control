import type { Tag } from '@/shared/types';

const MOCK_TAGS: Tag[] = [
  { id: 't1', name: 'Machine Learning', color: '#10b981' }, // emarald
  { id: 't2', name: 'NLP', color: '#3b82f6' }, // blue
  { id: 't3', name: 'Important', color: '#ef4444' }, // red
  { id: 't4', name: 'Draft', color: '#f59e0b' }, // amber
  { id: 't5', name: 'Architecture', color: '#6366f1' }, // indigo
];

export const tagService = {
  getTags: async (): Promise<Tag[]> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...MOCK_TAGS]), 400);
    });
  },

  createTag: async (name: string, color: string): Promise<Tag> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newTag: Tag = {
          id: `t${Date.now()}`,
          name,
          color
        };
        resolve(newTag);
      }, 500);
    });
  }
};
