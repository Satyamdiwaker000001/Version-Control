import { apiClient } from '@/shared/api/apiClient';

export interface Note {
  id: string;
  workspaceId: string;
  title: string;
  content: string;
  description?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  isPublic: boolean;
  versionCount: number;
  lastEditedBy?: string;
}

export interface CreateNoteInput {
  workspaceId: string;
  title: string;
  content: string;
  description?: string;
  tags?: string[];
  isPublic?: boolean;
}

export interface UpdateNoteInput {
  title?: string;
  content?: string;
  description?: string;
  tags?: string[];
  isPublic?: boolean;
}

export interface NoteVersion {
  id: string;
  noteId: string;
  content: string;
  createdBy: string;
  createdAt: string;
  changeDescription?: string;
}

export const noteService = {
  // Fetch all notes in a workspace
  async getNotes(workspaceId: string, options?: { tags?: string[]; search?: string }): Promise<Note[]> {
    const params = new URLSearchParams();
    if (options?.tags?.length) {
      params.append('tags', options.tags.join(','));
    }
    if (options?.search) {
      params.append('search', options.search);
    }
    return apiClient.get<Note[]>(`/workspaces/${workspaceId}/notes?${params}`);
  },

  // Fetch a single note
  async getNote(workspaceId: string, noteId: string): Promise<Note> {
    return apiClient.get<Note>(`/workspaces/${workspaceId}/notes/${noteId}`);
  },

  // Create a new note
  async createNote(input: CreateNoteInput): Promise<Note> {
    return apiClient.post<Note>(`/workspaces/${input.workspaceId}/notes`, {
      title: input.title,
      content: input.content,
      description: input.description,
      tags: input.tags || [],
      isPublic: input.isPublic ?? false,
    });
  },

  // Update a note
  async updateNote(workspaceId: string, noteId: string, input: UpdateNoteInput): Promise<Note> {
    return apiClient.put<Note>(`/workspaces/${workspaceId}/notes/${noteId}`, input);
  },

  // Delete a note
  async deleteNote(workspaceId: string, noteId: string): Promise<void> {
    await apiClient.delete(`/workspaces/${workspaceId}/notes/${noteId}`);
  },

  // Get note versions
  async getNoteVersions(workspaceId: string, noteId: string): Promise<NoteVersion[]> {
    return apiClient.get<NoteVersion[]>(`/workspaces/${workspaceId}/notes/${noteId}/versions`);
  },

  // Restore a note version
  async restoreNoteVersion(workspaceId: string, noteId: string, versionId: string): Promise<Note> {
    return apiClient.post<Note>(
      `/workspaces/${workspaceId}/notes/${noteId}/versions/${versionId}/restore`,
      {}
    );
  },

  // Share a note
  async shareNote(workspaceId: string, noteId: string, collaborators: string[]): Promise<Note> {
    return apiClient.post<Note>(`/workspaces/${workspaceId}/notes/${noteId}/share`, {
      collaborators,
    });
  },

  // Get note collaborators
  async getNoteCollaborators(workspaceId: string, noteId: string): Promise<any[]> {
    return apiClient.get<any[]>(`/workspaces/${workspaceId}/notes/${noteId}/collaborators`);
  },
};
