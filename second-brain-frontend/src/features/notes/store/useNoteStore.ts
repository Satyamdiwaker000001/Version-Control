import { create } from 'zustand';
import type { Note, NodeVersion } from '@/shared/types';
import { noteService } from '../services/noteService';

export interface NoteState {
  notes: Note[];
  versions: NodeVersion[];
  isLoading: boolean;
  error: string | null;
  
  fetchNotes: (workspaceId: string, token: string) => Promise<void>;
  createNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt' | 'versionCount' | 'latestVersionId'>, token: string) => Promise<void>;
  updateNote: (id: string, content: string, commitMessage: string, authorId: string, token: string) => Promise<void>;
  getNoteVersions: (noteId: string) => NodeVersion[];
  fetchNoteHistory: (workspaceId: string, slug: string, token: string) => Promise<void>;
  togglePin: (id: string, token: string) => Promise<void>;
}

export const useNoteStore = create<NoteState>((set, get) => ({
  notes: [],
  versions: [],
  isLoading: false,
  error: null,
  
  fetchNotes: async (workspaceId, token) => {
    set({ isLoading: true, error: null });
    try {
      const notes = await noteService.getNotes(workspaceId, token);
      set({ notes, isLoading: false });
    } catch (error: unknown) {
      set({ error: error instanceof Error ? error.message : 'Failed to fetch notes', isLoading: false });
    }
  },

  createNote: async (noteData, token) => {
    set({ isLoading: true, error: null });
    try {
      const newNote = await noteService.createNote(noteData, token);
      set((state) => ({ notes: [newNote, ...state.notes], isLoading: false }));
    } catch (error: unknown) {
      set({ error: error instanceof Error ? error.message : 'Failed to create note', isLoading: false });
    }
  },
  
  updateNote: async (id, content, commitMessage, authorId, token) => {
    set({ isLoading: true, error: null });
    try {
      const updatedNote = await noteService.updateNote(id, { content, commitMessage, authorId }, token);
      set((state) => ({
        notes: state.notes.map(n => n.id === id ? updatedNote : n),
        isLoading: false
      }));
    } catch (error: unknown) {
      set({ error: error instanceof Error ? error.message : 'Failed to update note', isLoading: false });
    }
  },

  getNoteVersions: (noteId) => {
    return get().versions.filter(v => v.noteId === noteId);
  },
  
  fetchNoteHistory: async (workspaceId, slug, token) => {
    set({ isLoading: true, error: null });
    try {
      const newVersions = await noteService.getNoteHistory(workspaceId, slug, token);
      set((state) => ({
        versions: [...state.versions.filter(v => v.noteId !== slug), ...newVersions],
        isLoading: false
      }));
    } catch (error: unknown) {
      set({ error: error instanceof Error ? error.message : 'Failed to fetch note history', isLoading: false });
    }
  },

  togglePin: async (id, token) => {
    const note = get().notes.find(n => n.id === id);
    if (!note) return;
    
    try {
      await noteService.updateNote(id, { isPinned: !note.isPinned }, token);
      set((state) => ({
        notes: state.notes.map(n => n.id === id ? { ...n, isPinned: !n.isPinned } : n)
      }));
    } catch (error: unknown) {
      set({ error: error instanceof Error ? error.message : 'Failed to toggle pin' });
    }
  },
}));

