import { create } from 'zustand';
import type { Tag } from '@/shared/types';
import { tagService } from '../services/tagService';

export interface TagState {
  tags: Tag[];
  isLoading: boolean;
  error: string | null;
  loadTags: () => Promise<void>;
  createTag: (name: string, color: string) => Promise<Tag>;
}

export const useTagStore = create<TagState>((set) => ({
  tags: [],
  isLoading: false,
  error: null,
  
  loadTags: async () => {
    set({ isLoading: true, error: null });
    try {
      const tags = await tagService.getTags();
      set({ tags, isLoading: false });
    } catch (error: unknown) {
      console.error('Failed to load tags', error);
      set({ isLoading: false, error: error instanceof Error ? error.message : 'Failed to load tags' });
    }
  },

  createTag: async (name, color) => {
    const newTag = await tagService.createTag(name, color);
    set(state => ({ tags: [...state.tags, newTag] }));
    return newTag;
  }
}));
