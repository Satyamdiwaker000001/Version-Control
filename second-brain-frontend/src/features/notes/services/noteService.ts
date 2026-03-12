import apiClient from '@/shared/api/apiClient';

export interface NoteVersion {
  id: string;
  content: string;
  createdAt: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  workspaceId: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  isPublic: boolean;
  isPinned: boolean;
  tags?: any[];
}

export interface CreateNoteInput {
  title: string;
  content: string;
  isPublic?: boolean;
  tagIds?: string[];
}

export interface UpdateNoteInput {
  title?: string;
  content?: string;
  isPublic?: boolean;
  isPinned?: boolean;
  tagIds?: string[];
}

const API_BASE = '/api/notes';

export const noteService = {
  async createNote(input: CreateNoteInput): Promise<Note> {
    const { data } = await apiClient.post<Note>(`${API_BASE}`, input);
    return data;
  },

  async listNotes(params?: { workspaceId?: string; tagId?: string; limit?: number; offset?: number }): Promise<{ notes: Note[]; total: number }> {
    const { data } = await apiClient.get<{ notes: Note[]; total: number }>(`${API_BASE}`, { params });
    return data;
  },

  async getNote(noteId: string): Promise<Note> {
    const { data } = await apiClient.get<Note>(`${API_BASE}/${noteId}`);
    return data;
  },

  async updateNote(noteId: string, input: UpdateNoteInput): Promise<Note> {
    const { data } = await apiClient.put<Note>(`${API_BASE}/${noteId}`, input);
    return data;
  },

  async deleteNote(noteId: string): Promise<void> {
    await apiClient.delete(`${API_BASE}/${noteId}`);
  },

  async getNoteVersions(noteId: string): Promise<NoteVersion[]> {
    const { data } = await apiClient.get<NoteVersion[]>(`${API_BASE}/${noteId}/versions`);
    return data;
  },

  async restoreVersion(noteId: string, versionId: string): Promise<Note> {
    const { data } = await apiClient.post<Note>(`${API_BASE}/${noteId}/versions/${versionId}/restore`);
    return data;
  },

  async linkRepository(noteId: string, repositoryId: string): Promise<Note> {
    const { data } = await apiClient.post<Note>(`${API_BASE}/${noteId}/repositories`, { repositoryId });
    return data;
  },

  async unlinkRepository(noteId: string, repositoryId: string): Promise<Note> {
    const { data } = await apiClient.delete<Note>(`${API_BASE}/${noteId}/repositories/${repositoryId}`);
    return data;
  },
};
