import { create } from 'zustand';
import type { Tag } from '@/shared/types';
import { tagService } from '../services/tagService';

export interface TagState {
  tags: Tag[];
  isLoading: boolean;
  loadTags: () => Promise<void>;
  createTag: (name: string, color: string) => Promise<Tag>;
}

export const useTagStore = create<TagState>((set) => ({
  tags: [],
  isLoading: false,
  
  loadTags: async () => {
    set({ isLoading: true });
    try {
      const tags = await tagService.getTags();
      set({ tags, isLoading: false });
    } catch (error) {
       console.error("Failed to load tags", error);
       set({ isLoading: false });
    }
  },

  createTag: async (name, color) => {
    const newTag = await tagService.createTag(name, color);
    set(state => ({ tags: [...state.tags, newTag] }));
    return newTag;
  }
}));
