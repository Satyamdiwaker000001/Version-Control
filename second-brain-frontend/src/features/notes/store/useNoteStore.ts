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
  getNoteVersions: (noteId: string) => NodeVersion[];
  fetchNoteHistory: (workspaceId: string, slug: string, token: string) => Promise<void>;
  togglePin: (id: string) => void;
}

// ─── Mock authors for team workspace ─────────────────────────────────────────
export const MOCK_TEAM_MEMBERS = [
  { id: 'u1', name: 'You',          color: '#8b5cf6', initials: 'Y'  },
  { id: 'u2', name: 'Alex Johnson', color: '#3b82f6', initials: 'AJ' },
  { id: 'u3', name: 'Sarah Chen',   color: '#10b981', initials: 'SC' },
];

// ─── Solo workspace notes (ws1) ───────────────────────────────────────────────
const soloNotes: Note[] = [
  {
    id: 'n1', workspaceId: 'ws1', userId: 'u1',
    title: 'Neural Networks Basics',
    content: '# Neural Networks\nA neural network is a series of algorithms that attempt to recognize underlying relationships in a set of data...',
    tags: ['machine-learning', 'draft'], backlinks: [],
    versionCount: 4, latestVersionId: 'v4', isPinned: true,
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    linkedRepositoryId: 'repo1',
  },
  {
    id: 'n2', workspaceId: 'ws1', userId: 'u1',
    title: 'Transformer Architecture',
    content: '# Transformer Architecture\nTransformers rely heavily on attention mechanisms to draw global dependencies between input and output...',
    tags: ['nlp', 'important'], backlinks: ['n1'],
    versionCount: 2, latestVersionId: 'v2', isPinned: false,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    id: 'n3', workspaceId: 'ws1', userId: 'u1',
    title: 'Research Paper Notes',
    content: '# Key Takeaways\n- Attention is all you need\n- Positional encoding is crucial\n- Multi-head attention allows parallel processing',
    tags: ['research'], backlinks: ['n2'],
    versionCount: 1, latestVersionId: 'v1', isPinned: false,
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
];

// ─── Team workspace notes (ws2) ───────────────────────────────────────────────
const teamNotes: Note[] = [
  {
    id: 'tn1', workspaceId: 'ws2', userId: 'u1',
    title: 'Q1 Research Roadmap',
    content: '# Q1 Research Roadmap\n## Objectives\n- Complete literature review on LLM fine-tuning\n- Benchmark 3 open-source models\n...',
    tags: ['roadmap', 'important'], backlinks: [],
    versionCount: 7, latestVersionId: 'tv7', isPinned: true,
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 1).toISOString(),
    linkedRepositoryId: 'repo1',
  },
  {
    id: 'tn2', workspaceId: 'ws2', userId: 'u2',
    title: 'Evaluation Framework',
    content: '# Evaluation Framework\nWe need a standardized way to measure model accuracy across tasks...',
    tags: ['framework', 'draft'], backlinks: ['tn1'],
    versionCount: 3, latestVersionId: 'tv3', isPinned: false,
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 3).toISOString(),
  },
  {
    id: 'tn3', workspaceId: 'ws2', userId: 'u3',
    title: 'Dataset Curation Guide',
    content: '# Dataset Curation\nThis guide outlines our approach to collecting, cleaning, and annotating training data...',
    tags: ['dataset', 'guide'], backlinks: ['tn1', 'tn2'],
    versionCount: 2, latestVersionId: 'tv2', isPinned: false,
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 6).toISOString(),
  },
  {
    id: 'tn4', workspaceId: 'ws2', userId: 'u2',
    title: 'Meeting Notes — Sprint 3',
    content: '# Sprint 3 Retrospective\n**Attendees:** Alex, Sarah, Dev\n\n## What went well...',
    tags: ['meetings'], backlinks: [],
    versionCount: 1, latestVersionId: 'tv1', isPinned: false,
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
];

const mockNotes: Note[] = [...soloNotes, ...teamNotes];

// ─── Team activity feed ───────────────────────────────────────────────────────
export const mockTeamActivity: TeamActivity[] = [
  { noteId: 'tn1', authorId: 'u2', authorName: 'Alex Johnson', authorColor: '#3b82f6', action: 'edited', timestamp: new Date(Date.now() - 3600000 * 1).toISOString(), commitMessage: 'Added Q2 stretch goals' },
  { noteId: 'tn4', authorId: 'u2', authorName: 'Alex Johnson', authorColor: '#3b82f6', action: 'created', timestamp: new Date(Date.now() - 3600000 * 2).toISOString() },
  { noteId: 'tn2', authorId: 'u3', authorName: 'Sarah Chen',   authorColor: '#10b981', action: 'edited', timestamp: new Date(Date.now() - 3600000 * 3).toISOString(), commitMessage: 'Revised accuracy metrics section' },
  { noteId: 'tn1', authorId: 'u1', authorName: 'You',          authorColor: '#8b5cf6', action: 'pinned', timestamp: new Date(Date.now() - 3600000 * 5).toISOString() },
  { noteId: 'tn3', authorId: 'u3', authorName: 'Sarah Chen',   authorColor: '#10b981', action: 'created', timestamp: new Date(Date.now() - 86400000 * 4).toISOString() },
];

export const useNoteStore = create<NoteState>((set, get) => ({
  notes: mockNotes,
  versions: [],
  teamActivity: mockTeamActivity,

  createNote: (noteData) => set((state) => {
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

  getNoteVersions: (noteId) => get().versions.filter(v => v.noteId === noteId),

  fetchNoteHistory: async (workspaceId, slug, token) => {
    try {
      const res = await axios.get(
        `http://localhost:3001/api/notes/${workspaceId}/${slug}/history`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const newVersions: NodeVersion[] = res.data.history.map((h: any) => ({
        id: h.sha, noteId: slug, content: '',
        timestamp: h.date, authorId: h.author, message: h.message,
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
}));
