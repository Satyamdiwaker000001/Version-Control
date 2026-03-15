import { DatabaseConnection } from '@/database/DatabaseConnection';
import { v4 as uuidv4 } from 'uuid';

export interface Project {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  color: string;
  is_public: boolean;
  settings?: any;
  created_at?: Date;
  updated_at?: Date;
}

export class ProjectService {
  constructor(private database: DatabaseConnection) {}

  async getProjects(userId: string): Promise<Project[]> {
    const query = 'SELECT * FROM projects WHERE user_id = ? ORDER BY created_at DESC';
    const result = await this.database.query(query, [userId]);
    return result.rows;
  }

  async getProjectById(userId: string, projectId: string): Promise<Project | null> {
    const query = 'SELECT * FROM projects WHERE user_id = ? AND id = ?';
    const result = await this.database.query(query, [userId, projectId]);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  async createProject(userId: string, data: Partial<Project>): Promise<Project> {
    const id = uuidv4();
    const { name, description, color, is_public, settings } = data;
    
    const query = `
      INSERT INTO projects (id, user_id, name, description, color, is_public, settings)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    await this.database.query(query, [
      id,
      userId,
      name,
      description || null,
      color || '#3B82F6',
      is_public || false,
      settings ? JSON.stringify(settings) : null
    ]);

    const createdProject = await this.getProjectById(userId, id);
    if (!createdProject) throw new Error('Failed to create project');
    
    return createdProject;
  }

  async updateProject(userId: string, projectId: string, data: Partial<Project>): Promise<Project> {
    const { name, description, color, is_public, settings } = data;
    
    const updates: string[] = [];
    const params: any[] = [];

    if (name !== undefined) {
      updates.push('name = ?');
      params.push(name);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      params.push(description);
    }
    if (color !== undefined) {
      updates.push('color = ?');
      params.push(color);
    }
    if (is_public !== undefined) {
      updates.push('is_public = ?');
      params.push(is_public);
    }
    if (settings !== undefined) {
      updates.push('settings = ?');
      params.push(JSON.stringify(settings));
    }

    if (updates.length === 0) {
      const existing = await this.getProjectById(userId, projectId);
      if (!existing) throw new Error('Project not found');
      return existing;
    }

    params.push(userId, projectId);
    const query = `UPDATE projects SET ${updates.join(', ')} WHERE user_id = ? AND id = ?`;
    
    await this.database.query(query, params);
    
    const updatedProject = await this.getProjectById(userId, projectId);
    if (!updatedProject) throw new Error('Project not found after update');
    
    return updatedProject;
  }

  async deleteProject(userId: string, projectId: string): Promise<void> {
    const query = 'DELETE FROM projects WHERE user_id = ? AND id = ?';
    await this.database.query(query, [userId, projectId]);
  }
}
