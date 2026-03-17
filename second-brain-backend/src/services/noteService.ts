import { DatabaseConnection } from '@/database/DatabaseConnection';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '@/utils/logger';

export interface Note {
  id: string;
  user_id: string;
  project_id?: string;
  workspace_id?: string;
  title: string;
  content: string;
  content_type: 'markdown' | 'rich_text' | 'code';
  metadata?: any;
  is_public: boolean;
  is_archived: boolean;
  is_favorite: boolean;
  word_count: number;
  reading_time_minutes: number;
  created_at?: Date;
  updated_at?: Date;
  tags?: string[]; // Tag IDs
}

export interface NoteVersion {
  id: string;
  note_id: string;
  user_id: string;
  title: string;
  content: string;
  commit_message?: string;
  created_at?: Date;
}

export interface NoteUpdateData {
  title?: string;
  content?: string;
  content_type?: 'markdown' | 'rich_text' | 'code';
  is_public?: boolean;
  is_archived?: boolean;
  is_favorite?: boolean;
  project_id?: string;
  workspace_id?: string;
  tags?: string[];
  metadata?: any;
  commit_message?: string;
}

export class NoteService {
  constructor(private database: DatabaseConnection) {}

  async getNotes(userId: string, filters: any = {}): Promise<Note[]> {
    let query = 'SELECT n.* FROM notes n WHERE n.user_id = ?';
    const params: any[] = [userId];

    if (filters.projectId) {
      query += ' AND n.project_id = ?';
      params.push(filters.projectId);
    }

    if (filters.workspaceId) {
      query += ' AND n.workspace_id = ?';
      params.push(filters.workspaceId);
    }

    if (filters.isFavorite !== undefined) {
      query += ' AND n.is_favorite = ?';
      params.push(filters.isFavorite);
    }

    if (filters.isArchived !== undefined) {
      query += ' AND n.is_archived = ?';
      params.push(filters.isArchived);
    }

    if (filters.tagId) {
      query += ' AND EXISTS (SELECT 1 FROM note_tags nt WHERE nt.note_id = n.id AND nt.tag_id = ?)';
      params.push(filters.tagId);
    }

    query += ' ORDER BY n.updated_at DESC';
    
    const result = await this.database.query(query, params);
    
    // Fetch tags for each note
    const notes = result.rows;
    for (const note of notes) {
      const tagsResult = await this.database.query(
        'SELECT tag_id FROM note_tags WHERE note_id = ?',
        [note.id]
      );
      note.tags = tagsResult.rows.map((row: any) => row.tag_id);
    }

    return notes;
  }

  async getNoteById(userId: string, noteId: string): Promise<Note | null> {
    const query = 'SELECT * FROM notes WHERE user_id = ? AND id = ?';
    const result = await this.database.query(query, [userId, noteId]);
    
    if (result.rows.length === 0) return null;
    
    const note = result.rows[0];
    const tagsResult = await this.database.query(
      'SELECT tag_id FROM note_tags WHERE note_id = ?',
      [note.id]
    );
    note.tags = tagsResult.rows.map((row: any) => row.tag_id);
    
    return note;
  }

  async createNote(userId: string, data: Partial<Note>): Promise<Note> {
    const id = uuidv4();
    const {
      project_id,
      workspace_id,
      title,
      content,
      content_type,
      metadata,
      is_public,
      is_archived,
      is_favorite,
      tags
    } = data;

    const word_count = content ? content.trim().split(/\s+/).length : 0;
    const reading_time_minutes = Math.max(1, Math.ceil(word_count / 200));

    await this.database.transaction(async (connection) => {
      const query = `
        INSERT INTO notes (
          id, user_id, project_id, workspace_id, title, content, content_type, 
          metadata, is_public, is_archived, is_favorite, 
          word_count, reading_time_minutes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      await connection.execute(query, [
        id,
        userId,
        project_id || null,
        workspace_id || null,
        title || 'Untitled',
        content || '',
        content_type || 'markdown',
        metadata ? JSON.stringify(metadata) : null,
        is_public || false,
        is_archived || false,
        is_favorite || false,
        word_count,
        reading_time_minutes
      ]);

      if (tags && tags.length > 0) {
        for (const tagId of tags) {
          await connection.execute(
            'INSERT INTO note_tags (id, note_id, tag_id) VALUES (?, ?, ?)',
            [uuidv4(), id, tagId]
          );
        }
      }
    });

    const createdNote = await this.getNoteById(userId, id);
    if (!createdNote) throw new Error('Failed to create note');
    
    return createdNote;
  }

  async updateNote(userId: string, noteId: string, data: NoteUpdateData): Promise<Note> {
    const {
      project_id,
      title,
      content,
      content_type,
      metadata,
      is_public,
      is_archived,
      is_favorite,
      tags
    } = data;

    await this.database.transaction(async (connection) => {
      const updates: string[] = [];
      const params: any[] = [];

      if (project_id !== undefined) {
        updates.push('project_id = ?');
        params.push(project_id);
      }
      if (workspace_id !== undefined) {
        updates.push('workspace_id = ?');
        params.push(workspace_id);
      }
      if (title !== undefined) {
        updates.push('title = ?');
        params.push(title);
      }
      if (content !== undefined) {
        updates.push('content = ?');
        params.push(content);
        const word_count = content.trim().split(/\s+/).length;
        const reading_time_minutes = Math.max(1, Math.ceil(word_count / 200));
        updates.push('word_count = ?', 'reading_time_minutes = ?');
        params.push(word_count, reading_time_minutes);
      }
      if (content_type !== undefined) {
        updates.push('content_type = ?');
        params.push(content_type);
      }
      if (metadata !== undefined) {
        updates.push('metadata = ?');
        params.push(JSON.stringify(metadata));
      }
      if (is_public !== undefined) {
        updates.push('is_public = ?');
        params.push(is_public);
      }
      if (is_archived !== undefined) {
        updates.push('is_archived = ?');
        params.push(is_archived);
      }
      if (is_favorite !== undefined) {
        updates.push('is_favorite = ?');
        params.push(is_favorite);
      }

      if (updates.length > 0) {
        params.push(userId, noteId);
        const query = `UPDATE notes SET ${updates.join(', ')} WHERE user_id = ? AND id = ?`;
        await connection.execute(query, params);
      }

      if (tags !== undefined) {
        // Remove existing tags
        await connection.execute('DELETE FROM note_tags WHERE note_id = ?', [noteId]);
        
        // Add new tags
        if (tags.length > 0) {
          for (const tagId of tags) {
            await connection.execute(
              'INSERT INTO note_tags (id, note_id, tag_id) VALUES (?, ?, ?)',
              [uuidv4(), noteId, tagId]
            );
          }
        }
      }
    });

    // Create a version if commit_message is provided
    if (data.commit_message) {
      await this.createVersion(userId, noteId, data.commit_message);
    }

    const updatedNote = await this.getNoteById(userId, noteId);
    if (!updatedNote) throw new Error('Note not found after update');
    
    return updatedNote;
  }

  async deleteNote(userId: string, noteId: string): Promise<void> {
    const query = 'DELETE FROM notes WHERE user_id = ? AND id = ?';
    await this.database.query(query, [userId, noteId]);
  }

  // --- Versioning ---

  async createVersion(userId: string, noteId: string, commitMessage: string): Promise<void> {
    const note = await this.getNoteById(userId, noteId);
    if (!note) throw new Error('Note not found');

    const query = `
      INSERT INTO note_versions (id, note_id, user_id, title, content, commit_message)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    await this.database.query(query, [
      uuidv4(),
      noteId,
      userId,
      note.title,
      note.content,
      commitMessage
    ]);
  }

  async getNoteVersions(userId: string, noteId: string): Promise<NoteVersion[]> {
    const query = 'SELECT * FROM note_versions WHERE user_id = ? AND note_id = ? ORDER BY created_at DESC';
    const result = await this.database.query(query, [userId, noteId]);
    return result.rows;
  }

  async restoreVersion(userId: string, noteId: string, versionId: string): Promise<Note> {
    const query = 'SELECT * FROM note_versions WHERE user_id = ? AND note_id = ? AND id = ?';
    const result = await this.database.query(query, [userId, noteId, versionId]);
    
    if (result.rows.length === 0) throw new Error('Version not found');
    const version = result.rows[0];

    return await this.updateNote(userId, noteId, {
      title: version.title,
      content: version.content,
      commit_message: `Restored from version ${versionId}`
    });
  }

  // --- Repository Linking ---

  async linkRepository(userId: string, noteId: string, repositoryId: string): Promise<void> {
    // Check if repo exists and belongs to user
    const repoQuery = 'SELECT * FROM github_repositories WHERE user_id = ? AND id = ?';
    const repoResult = await this.database.query(repoQuery, [userId, repositoryId]);
    if (repoResult.rows.length === 0) throw new Error('Repository not found');

    // Link repo id to note (we can use project_id or a specific column if we added it, 
    // but the schema suggests notes are linked to commits via note_commits.
    // For now, let's assume linking a repo means we might want to store it in metadata or a new column.)
    // However, the frontend call is linkRepository(noteId, repositoryId).
    
    const note = await this.getNoteById(userId, noteId);
    if (!note) throw new Error('Note not found');

    const metadata = note.metadata || {};
    metadata.linked_repository_id = repositoryId;

    await this.updateNote(userId, noteId, { metadata });
  }

  async unlinkRepository(userId: string, noteId: string, repositoryId: string): Promise<void> {
    const note = await this.getNoteById(userId, noteId);
    if (!note) throw new Error('Note not found');

    const metadata = note.metadata || {};
    if (metadata.linked_repository_id === repositoryId) {
      delete metadata.linked_repository_id;
    }

    await this.updateNote(userId, noteId, { metadata });
  }
}
