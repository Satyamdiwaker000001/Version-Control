import { create } from 'zustand';
import type { Note, NodeVersion } from '@/shared/types';
import axios from 'axios';

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

  createNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt' | 'versionCount' | 'latestVersionId'>) => void;
  updateNote: (id: string, content: string, commitMessage: string, authorId: string) => void;
  deleteNote: (id: string) => void;
  renameNote: (id: string, title: string) => void;
  getNoteVersions: (noteId: string) => NodeVersion[];
  fetchNotes: (workspaceId?: string) => Promise<void>;
  fetchNoteHistory: (workspaceId: string, slug: string, token: string) => Promise<void>;
  togglePin: (id: string) => void;
  addTag: (id: string, tag: string) => void;
  removeTag: (id: string, tag: string) => void;
}

// ─── No mock data (strictly dynamic) ────────────────────────────────────────────

export const useNoteStore = create<NoteState>((set, get) => ({
  notes: [],
  versions: [],
  teamActivity: [],

  fetchNotes: async (workspaceId?: string) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const res = await axios.get('http://localhost:3001/api/notes', {
        headers: { Authorization: `Bearer ${token}` },
        params: { projectId: workspaceId }
      });

      if (res.data.success && res.data.data.notes) {
        const mappedNotes = res.data.data.notes.map((n: any) => ({
          id: n.id,
          workspaceId: n.project_id || 'ws1', // Fallback or map project_id
          userId: n.user_id,
          title: n.title,
          content: n.content,
          tags: n.tags || [],
          backlinks: [], // Backend doesn't support yet
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
    }
  },

  createNote: (noteData) => set((state) => {
    // ... existing logic but likely needs update to call API
    // For now keeping it for local optimism
    const id = `n${Date.now()}`;
    const newNote: Note = {
      ...noteData, id,
      versionCount: 1, latestVersionId: `v${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return { notes: [newNote, ...state.notes] };
  }),

  updateNote: (id, content, _commitMessage, _authorId) => set((state) => ({
    notes: state.notes.map(n =>
      n.id === id
        ? { ...n, content, updatedAt: new Date().toISOString(), versionCount: n.versionCount + 1 }
        : n
    ),
  })),

  deleteNote: (id) => set((state) => ({
    notes: state.notes.filter(n => n.id !== id)
  })),

  renameNote: (id, title) => set((state) => ({
    notes: state.notes.map(n => n.id === id ? { ...n, title, updatedAt: new Date().toISOString() } : n)
  })),

  getNoteVersions: (noteId) => get().versions.filter(v => v.noteId === noteId),

  fetchNoteHistory: async (workspaceId, slug, token) => {
    try {
      const res = await axios.get(
        `http://localhost:3001/api/notes/${workspaceId}/${slug}/history`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const newVersions: NodeVersion[] = res.data.history.map((h: any) => ({
        versionId: h.sha, noteId: slug, content: '',
        createdAt: h.date, author: { id: h.author, name: h.author, email: '', createdAt: h.date }, 
        commitMessage: h.message,
      }));
      set((state) => ({
        versions: [...state.versions.filter(v => v.noteId !== slug), ...newVersions],
      }));
    } catch (e) {
      console.error('Failed to fetch note history', e);
    }
  },

  togglePin: (id) => set((state) => ({
    notes: state.notes.map(n => n.id === id ? { ...n, isPinned: !n.isPinned } : n),
  })),

  addTag: (id, tag) => set((state) => ({
    notes: state.notes.map(n => 
      n.id === id && !n.tags.includes(tag) 
        ? { ...n, tags: [...n.tags, tag], updatedAt: new Date().toISOString() } 
        : n
    ),
  })),

  removeTag: (id, tag) => set((state) => ({
    notes: state.notes.map(n => 
      n.id === id 
        ? { ...n, tags: n.tags.filter(t => t !== tag), updatedAt: new Date().toISOString() } 
        : n
    ),
  })),
}));
