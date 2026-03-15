import { DatabaseConnection } from '@/database/DatabaseConnection';
import { logger } from '@/utils/logger';
import { v4 as uuidv4 } from 'uuid';

export interface Tag {
  id: string;
  user_id: string;
  name: string;
  color: string;
  description?: string;
  created_at?: Date;
}

export class TagService {
  constructor(private database: DatabaseConnection) {}

  async getTags(userId: string): Promise<Tag[]> {
    const query = 'SELECT * FROM tags WHERE user_id = ? ORDER BY name ASC';
    const result = await this.database.query(query, [userId]);
    return result.rows;
  }

  async getTagById(userId: string, tagId: string): Promise<Tag | null> {
    const query = 'SELECT * FROM tags WHERE user_id = ? AND id = ?';
    const result = await this.database.query(query, [userId, tagId]);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  async createTag(userId: string, data: Partial<Tag>): Promise<Tag> {
    const id = uuidv4();
    const { name, color, description } = data;
    
    const query = `
      INSERT INTO tags (id, user_id, name, color, description)
      VALUES (?, ?, ?, ?, ?)
    `;
    
    await this.database.query(query, [
      id,
      userId,
      name,
      color || '#6B7280',
      description || null
    ]);

    const createdTag = await this.getTagById(userId, id);
    if (!createdTag) throw new Error('Failed to create tag');
    
    return createdTag;
  }

  async updateTag(userId: string, tagId: string, data: Partial<Tag>): Promise<Tag> {
    const { name, color, description } = data;
    
    const updates: string[] = [];
    const params: any[] = [];

    if (name !== undefined) {
      updates.push('name = ?');
      params.push(name);
    }
    if (color !== undefined) {
      updates.push('color = ?');
      params.push(color);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      params.push(description);
    }

    if (updates.length === 0) {
      const existing = await this.getTagById(userId, tagId);
      if (!existing) throw new Error('Tag not found');
      return existing;
    }

    params.push(userId, tagId);
    const query = `UPDATE tags SET ${updates.join(', ')} WHERE user_id = ? AND id = ?`;
    
    await this.database.query(query, params);
    
    const updatedTag = await this.getTagById(userId, tagId);
    if (!updatedTag) throw new Error('Tag not found after update');
    
    return updatedTag;
  }

  async deleteTag(userId: string, tagId: string): Promise<void> {
    const query = 'DELETE FROM tags WHERE user_id = ? AND id = ?';
    await this.database.query(query, [userId, tagId]);
  }
}
