import { create } from 'zustand';
import type { Note, NodeVersion } from '@/shared/types';
import apiClient from '@/shared/api/apiClient';

export interface TeamActivity {
  noteId: string;
  authorId: string;
  authorName: string;
  authorColor: string;
  action: 'created' | 'edited' | 'pinned';
  timestamp: string;
  commitMessage?: string;
}

export interface NoteState {
  notes: Note[];
  versions: NodeVersion[];
  teamActivity: TeamActivity[];
  isLoading: boolean;

  fetchNotes: (workspaceId?: string) => Promise<void>;
  createNote: (note: { title: string; content: string; workspaceId: string; tags?: string[] }) => Promise<string | null>;
  updateNote: (id: string, content: string, commitMessage: string, authorId: string) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  renameNote: (id: string, title: string) => Promise<void>;
  fetchNoteVersions: (noteId: string) => Promise<void>;
  restoreVersion: (noteId: string, versionId: string) => Promise<void>;
  togglePin: (id: string) => Promise<void>;
  addTag: (id: string, tag: string) => Promise<void>;
  removeTag: (id: string, tag: string) => Promise<void>;
}

export const useNoteStore = create<NoteState>((set, get) => ({
  notes: [],
  versions: [],
  teamActivity: [],
  isLoading: false,

  fetchNotes: async (workspaceId?: string) => {
    set({ isLoading: true });
    try {
      const res = await apiClient.get('/notes', {
        params: { workspaceId: workspaceId }
      });

      if (res.data.success && res.data.data.notes) {
        const mappedNotes = res.data.data.notes.map((n: any) => ({
          id: n.id,
          workspaceId: n.project_id || 'ws1',
          userId: n.user_id,
          title: n.title,
          content: n.content,
          tags: n.tags || [],
          backlinks: n.metadata?.backlinks || [],
          versionCount: n.version_count || 1,
          latestVersionId: n.id,
          isPinned: !!n.is_pinned,
          createdAt: n.created_at,
          updatedAt: n.updated_at,
        }));
        set({ notes: mappedNotes });
      }
    } catch (error) {
      console.error('Failed to fetch notes:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  createNote: async (noteData) => {
    try {
      const res = await apiClient.post('/notes', {
        title: noteData.title,
        content: noteData.content,
        project_id: noteData.workspaceId,
        tags: noteData.tags
      });
      if (res.data.success) {
        const n = res.data.data;
        const newNote: Note = {
          id: n.id,
          workspaceId: n.project_id || noteData.workspaceId,
          userId: n.user_id,
          title: n.title,
          content: n.content,
          tags: n.tags || [],
          backlinks: [],
          versionCount: 1,
          latestVersionId: n.id,
          isPinned: false,
          createdAt: n.created_at,
          updatedAt: n.updated_at,
        };
        set((state) => ({ notes: [newNote, ...state.notes] }));
        return newNote.id;
      }
    } catch (error) {
      console.error('Failed to create note:', error);
    }
    return null;
  },

  updateNote: async (id, content, commitMessage, _authorId) => {
    try {
      const res = await apiClient.patch(`/notes/${id}`, {
        content,
        commit_message: commitMessage
      });
      if (res.data.success) {
        const updated = res.data.data;
        set((state) => ({
          notes: state.notes.map(n =>
            n.id === id
              ? { 
                  ...n, 
                  content: updated.content, 
                  updatedAt: updated.updated_at, 
                  versionCount: (n.versionCount || 0) + (commitMessage ? 1 : 0) 
                }
              : n
          ),
        }));
      }
    } catch (error) {
      console.error('Failed to update note:', error);
      throw error;
    }
  },

  deleteNote: async (id) => {
    try {
      await apiClient.delete(`/notes/${id}`);
      set((state) => ({
        notes: state.notes.filter(n => n.id !== id)
      }));
    } catch (error) {
      console.error('Failed to delete note:', error);
    }
  },

  renameNote: async (id, title) => {
    try {
      await apiClient.patch(`/notes/${id}`, { title });
      set((state) => ({
        notes: state.notes.map(n => n.id === id ? { ...n, title, updatedAt: new Date().toISOString() } : n)
      }));
    } catch (error) {
      console.error('Failed to rename note:', error);
    }
  },

  fetchNoteVersions: async (noteId) => {
    try {
      const res = await apiClient.get(`/notes/${noteId}/versions`);
      if (res.data.success) {
        const vData = res.data.data.map((v: any) => ({
          versionId: v.id,
          noteId: v.note_id,
          content: v.content,
          createdAt: v.created_at,
          commitMessage: v.commit_message,
          author: { id: v.user_id, name: 'Author', email: '', createdAt: v.created_at }
        }));
        set({ versions: vData });
      }
    } catch (error) {
      console.error('Failed to fetch versions:', error);
    }
  },

  restoreVersion: async (noteId, versionId) => {
    try {
      const res = await apiClient.post(`/notes/${noteId}/versions/${versionId}/restore`);
      if (res.data.success) {
        const updated = res.data.data;
        set((state) => ({
          notes: state.notes.map(n =>
            n.id === noteId ? { ...n, content: updated.content, title: updated.title, updatedAt: updated.updated_at } : n
          ),
        }));
      }
    } catch (error) {
      console.error('Failed to restore version:', error);
    }
  },

  togglePin: async (id) => {
    const note = get().notes.find(n => n.id === id);
    if (!note) return;
    try {
      await apiClient.patch(`/notes/${id}`, { is_pinned: !note.isPinned });
      set((state) => ({
        notes: state.notes.map(n => n.id === id ? { ...n, isPinned: !n.isPinned } : n),
      }));
    } catch (error) {
      console.error('Failed to toggle pin:', error);
    }
  },

  addTag: async (id, tag) => {
    const note = get().notes.find(n => n.id === id);
    if (!note || note.tags.includes(tag)) return;
    
    // In this system, tags might be IDs or names. Backend note_tags uses IDs.
    // If we only have names in frontend, we might need a tag store lookup.
    // Assuming 'tag' is the name here as per current useTagStore usage.
    
    try {
      // First, get or create the tag ID
      const tagRes = await apiClient.get('/tags');
      let tagObj = tagRes.data.data.find((t: any) => t.name === tag);
      
      if (!tagObj) {
        const createRes = await apiClient.post('/tags', { name: tag });
        tagObj = createRes.data.data;
      }

      const currentTags = [...note.tags, tag];
      await apiClient.patch(`/notes/${id}`, { tags: [tagObj.id] }); // This implementation in backend REPLACES tags if provided

      set((state) => ({
        notes: state.notes.map(n => 
          n.id === id ? { ...n, tags: currentTags, updatedAt: new Date().toISOString() } : n
        ),
      }));
    } catch (error) {
      console.error('Failed to add tag:', error);
    }
  },

  removeTag: async (id, tag) => {
    const note = get().notes.find(n => n.id === id);
    if (!note) return;
    
    try {
      const remainingTags = note.tags.filter(t => t !== tag);
      // We need to send IDs to backend.
      const tagRes = await apiClient.get('/tags');
      const tagIds = tagRes.data.data
        .filter((t: any) => remainingTags.includes(t.name))
        .map((t: any) => t.id);

      await apiClient.patch(`/notes/${id}`, { tags: tagIds });

      set((state) => ({
        notes: state.notes.map(n => 
          n.id === id ? { ...n, tags: remainingTags, updatedAt: new Date().toISOString() } : n
        ),
      }));
    } catch (error) {
      console.error('Failed to remove tag:', error);
    }
  },
}));
