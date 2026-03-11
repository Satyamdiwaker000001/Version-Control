import { create } from 'zustand';
import type { Note, NodeVersion } from '@/shared/types';

import axios from 'axios';

export interface NoteState {
  notes: Note[];
  versions: NodeVersion[];
  
  createNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt' | 'versionCount' | 'latestVersionId'>) => void;
  updateNote: (id: string, content: string, commitMessage: string, authorId: string) => void;
  getNoteVersions: (noteId: string) => NodeVersion[];
  fetchNoteHistory: (workspaceId: string, slug: string, token: string) => Promise<void>;
  togglePin: (id: string) => void;
}

// Mock initial data
const mockNotes: Note[] = [
  {
    id: 'n1', workspaceId: 'ws1', userId: '1', title: 'Neural Networks Basics',
    content: '# Neural Networks\nA neural network is a series of algorithms...',
    tags: ['machine-learning', 'draft'], backlinks: [],
    versionCount: 4, latestVersionId: 'v4', isPinned: true,
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    linkedRepositoryId: 'repo1'
  },
  {
    id: 'n2', workspaceId: 'ws1', userId: '1', title: 'Transformer Architecture',
    content: 'Transformers rely heavily on attention mechanisms.',
    tags: ['nlp', 'important'], backlinks: ['n1'],
    versionCount: 1, latestVersionId: 'v1', isPinned: false,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  }
];

export const useNoteStore = create<NoteState>((set, get) => ({
  notes: mockNotes,
  versions: [], // Would contain actual historical snapshots
  
  createNote: (noteData) => set((state) => {
    const id = `n${Date.now()}`;
    const newNote: Note = {
      ...noteData, id, versionCount: 1, latestVersionId: `v${Date.now()}`,
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
    };
    return { notes: [newNote, ...state.notes] };
  }),
  
  updateNote: (id, content, _commitMessage, _authorId) => set((state) => {
    // In real app: create version snapshot, update note list
    return {
      notes: state.notes.map(n => n.id === id 
        ? { ...n, content, updatedAt: new Date().toISOString(), versionCount: n.versionCount + 1 }
        : n)
    };
  }),

  getNoteVersions: (noteId) => {
    return get().versions.filter(v => v.noteId === noteId);
  },
  
  fetchNoteHistory: async (workspaceId, slug, token) => {
     try {
       const res = await axios.get(`http://localhost:3001/api/notes/${workspaceId}/${slug}/history`, {
         headers: { Authorization: `Bearer ${token}` }
       });
       // Map history into NodeVersion format
       const newVersions: NodeVersion[] = res.data.history.map((h: any) => ({
         id: h.sha,
         noteId: slug,
         content: '', // Not strictly pulled in history list usually
         timestamp: h.date,
         authorId: h.author,
         message: h.message
       }));
       
       set((state) => ({
         versions: [...state.versions.filter(v => v.noteId !== slug), ...newVersions]
       }));
     } catch (e) {
       console.error('Failed to fetch note history', e);
     }
  },

  togglePin: (id) => set((state) => ({
    notes: state.notes.map(n => n.id === id ? { ...n, isPinned: !n.isPinned } : n)
  })),
}));
