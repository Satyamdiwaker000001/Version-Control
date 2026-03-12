import { createContext, useContext, useMemo } from 'react';
import type { ReactNode } from 'react';

import { useNoteStore } from '@/features/notes/store/useNoteStore';
import type { Note, NodeVersion } from '@/shared/types';

interface NotesContextValue {
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

const NotesContext = createContext<NotesContextValue | undefined>(undefined);

interface NotesProviderProps {
  children: ReactNode;
}

export const NotesProvider = ({ children }: NotesProviderProps) => {
  const notes = useNoteStore((s) => s.notes);
  const versions = useNoteStore((s) => s.versions);
  const isLoading = useNoteStore((s) => s.isLoading);
  const error = useNoteStore((s) => s.error);
  const fetchNotes = useNoteStore((s) => s.fetchNotes);
  const createNote = useNoteStore((s) => s.createNote);
  const updateNote = useNoteStore((s) => s.updateNote);
  const getNoteVersions = useNoteStore((s) => s.getNoteVersions);
  const fetchNoteHistory = useNoteStore((s) => s.fetchNoteHistory);
  const togglePin = useNoteStore((s) => s.togglePin);

  const value = useMemo<NotesContextValue>(
    () => ({
      notes,
      versions,
      isLoading,
      error,
      fetchNotes,
      createNote,
      updateNote,
      getNoteVersions,
      fetchNoteHistory,
      togglePin,
    }),
    [notes, versions, isLoading, error, fetchNotes, createNote, updateNote, getNoteVersions, fetchNoteHistory, togglePin],
  );

  return <NotesContext.Provider value={value}>{children}</NotesContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useNotesContext = () => {
  const ctx = useContext(NotesContext);
  if (!ctx) {
    throw new Error('useNotesContext must be used within a NotesProvider');
  }
  return ctx;
};