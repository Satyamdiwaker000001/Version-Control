import { v4 as uuidv4 } from 'uuid';
import { DatabaseConnection } from '@/database/DatabaseConnection';
import { logger } from '@/utils/logger';

export interface Channel {
  id: string;
  workspace_id: string;
  name: string;
  description?: string;
  type: 'text' | 'voice' | 'announcement';
  created_at: Date;
  updated_at: Date;
}

export interface Message {
  id: string;
  channel_id: string;
  user_id: string | null;
  content: string;
  is_system: boolean;
  created_at: Date;
  user_name?: string;
  user_avatar?: string;
}

export class ChatService {
  private database: DatabaseConnection;

  constructor(database: DatabaseConnection) {
    this.database = database;
  }

  public async getChannels(workspaceId: string): Promise<Channel[]> {
    const result = await this.database.query<Channel>(
      'SELECT * FROM channels WHERE workspace_id = ? ORDER BY name',
      [workspaceId]
    );
    return result.rows;
  }

  public async createChannel(workspaceId: string, data: Partial<Channel>): Promise<Channel> {
    const channelId = uuidv4();
    await this.database.query(`
      INSERT INTO channels (id, workspace_id, name, description, type)
      VALUES (?, ?, ?, ?, ?)
    `, [
      channelId,
      workspaceId,
      data.name,
      data.description || null,
      data.type || 'text'
    ]);

    const result = await this.database.query<Channel>('SELECT * FROM channels WHERE id = ?', [channelId]);
    const channel = result.rows[0];
    if (!channel) throw new Error('Channel creation failed');
    return channel;
  }

  public async getMessages(channelId: string, limit: number = 50, offset: number = 0): Promise<Message[]> {
    const sql = `
      SELECT m.*, u.name as user_name, u.avatar_url as user_avatar
      FROM messages m
      LEFT JOIN users u ON m.user_id = u.id
      WHERE m.channel_id = ?
      ORDER BY m.created_at DESC
      LIMIT ? OFFSET ?
    `;
    const result = await this.database.query<Message>(sql, [channelId, limit, offset]);
    return result.rows.reverse(); // Newest last for frontend
  }

  public async sendMessage(channelId: string, userId: string | null, content: string, isSystem: boolean = false): Promise<Message> {
    const messageId = uuidv4();
    await this.database.query(`
      INSERT INTO messages (id, channel_id, user_id, content, is_system)
      VALUES (?, ?, ?, ?, ?)
    `, [messageId, channelId, userId, content, isSystem]);

    const sql = `
      SELECT m.*, u.name as user_name, u.avatar_url as user_avatar
      FROM messages m
      LEFT JOIN users u ON m.user_id = u.id
      WHERE m.id = ?
    `;
    const result = await this.database.query<Message>(sql, [messageId]);
    const message = result.rows[0];
    if (!message) throw new Error('Message creation failed');
    return message;
  }

  public async deleteChannel(channelId: string): Promise<void> {
    await this.database.query('DELETE FROM channels WHERE id = ?', [channelId]);
  }
}
