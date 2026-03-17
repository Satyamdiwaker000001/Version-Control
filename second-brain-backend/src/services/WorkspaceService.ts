import { v4 as uuidv4 } from 'uuid';
import { DatabaseConnection } from '@/database/DatabaseConnection';
import { logger } from '@/utils/logger';

export interface Workspace {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  description?: string;
  type: 'solo' | 'team';
  avatar_url?: string;
  created_at: Date;
  updated_at: Date;
}

export interface WorkspaceMember {
  id: string;
  workspace_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member';
  joined_at: Date;
}

export class WorkspaceService {
  private database: DatabaseConnection;

  constructor(database: DatabaseConnection) {
    this.database = database;
  }

  public async getWorkspaces(userId: string): Promise<Workspace[]> {
    const sql = `
      SELECT w.*, wm.role 
      FROM workspaces w
      JOIN workspace_members wm ON w.id = wm.workspace_id
      WHERE wm.user_id = ?
    `;
    const result = await this.database.query<Workspace & { role: string }>(sql, [userId]);
    return result.rows;
  }

  public async getWorkspaceById(userId: string, workspaceId: string): Promise<Workspace | null> {
    const sql = `
      SELECT w.*, wm.role 
      FROM workspaces w
      JOIN workspace_members wm ON w.id = wm.workspace_id
      WHERE wm.user_id = ? AND w.id = ?
    `;
    const result = await this.database.query<Workspace>(sql, [userId, workspaceId]);
    return result.rows[0] || null;
  }

  public async createWorkspace(userId: string, data: Partial<Workspace>): Promise<Workspace> {
    const workspaceId = uuidv4();
    const slug = data.slug || `${data.name?.toLowerCase().replace(/\s+/g, '-')}-${uuidv4().substring(0, 8)}`;
    
    await this.database.transaction(async (connection) => {
      // Create workspace
      await connection.query(`
        INSERT INTO workspaces (id, owner_id, name, slug, description, type, avatar_url)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        workspaceId,
        userId,
        data.name,
        slug,
        data.description || null,
        data.type || 'solo',
        data.avatar_url || null
      ]);

      // Add owner as member
      await connection.query(`
        INSERT INTO workspace_members (id, workspace_id, user_id, role)
        VALUES (?, ?, ?, ?)
      `, [uuidv4(), workspaceId, userId, 'owner']);
    });

    const workspace = await this.getWorkspaceById(userId, workspaceId);
    if (!workspace) throw new Error('Failed to create workspace');
    
    return workspace;
  }

  public async updateWorkspace(userId: string, workspaceId: string, data: Partial<Workspace>): Promise<Workspace> {
    // Check if user is admin/owner
    const member = await this.getMember(workspaceId, userId);
    if (!member || (member.role !== 'owner' && member.role !== 'admin')) {
      throw new Error('Unauthorized to update workspace');
    }

    const fields = [];
    const values = [];

    if (data.name) {
      fields.push('name = ?');
      values.push(data.name);
    }
    if (data.description !== undefined) {
      fields.push('description = ?');
      values.push(data.description);
    }
    if (data.avatar_url !== undefined) {
      fields.push('avatar_url = ?');
      values.push(data.avatar_url);
    }

    if (fields.length === 0) return (await this.getWorkspaceById(userId, workspaceId))!;

    const sql = `UPDATE workspaces SET ${fields.join(', ')} WHERE id = ?`;
    await this.database.query(sql, [...values, workspaceId]);

    return (await this.getWorkspaceById(userId, workspaceId))!;
  }

  public async getMembers(workspaceId: string): Promise<WorkspaceMember[]> {
    const sql = `
      SELECT wm.*, u.name, u.email, u.avatar_url
      FROM workspace_members wm
      JOIN users u ON wm.user_id = u.id
      WHERE wm.workspace_id = ?
    `;
    const result = await this.database.query<WorkspaceMember>(sql, [workspaceId]);
    return result.rows;
  }

  public async addMember(workspaceId: string, email: string, role: string = 'member'): Promise<void> {
    // Find user by email
    const userResult = await this.database.query('SELECT id FROM users WHERE email = ?', [email]);
    if (userResult.rows.length === 0) {
      throw new Error('User not found');
    }
    const userId = userResult.rows[0].id;

    await this.database.query(`
      INSERT INTO workspace_members (id, workspace_id, user_id, role)
      VALUES (?, ?, ?, ?)
    `, [uuidv4(), workspaceId, userId, role]);
  }

  public async removeMember(workspaceId: string, userId: string): Promise<void> {
    await this.database.query('DELETE FROM workspace_members WHERE workspace_id = ? AND user_id = ?', [workspaceId, userId]);
  }

  private async getMember(workspaceId: string, userId: string): Promise<WorkspaceMember | null> {
    const result = await this.database.query<WorkspaceMember>(
      'SELECT * FROM workspace_members WHERE workspace_id = ? AND user_id = ?',
      [workspaceId, userId]
    );
    return result.rows[0] || null;
  }
}
