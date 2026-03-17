import { DatabaseConnection } from '@/database/DatabaseConnection';
import { v4 as uuidv4 } from 'uuid';

export interface UserPreferences {
  id: string;
  user_id: string;
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  email_notifications: boolean;
  push_notifications: boolean;
  auto_save_interval: number;
  tutorial_completed: boolean;
  preferences?: any;
  created_at?: Date;
  updated_at?: Date;
}

export class UserService {
  constructor(private database: DatabaseConnection) {}

  async getPreferences(userId: string): Promise<UserPreferences> {
    const query = 'SELECT * FROM user_preferences WHERE user_id = ?';
    const result = await this.database.query(query, [userId]);
    
    if (result.rows.length === 0) {
      // Return defaults if not set
      return {
        id: '',
        user_id: userId,
        theme: 'system',
        language: 'en',
        timezone: 'UTC',
        email_notifications: true,
        push_notifications: true,
        auto_save_interval: 30,
        tutorial_completed: false,
      } as UserPreferences;
    }
    
    const prefs = result.rows[0];
    return {
      ...prefs,
      tutorial_completed: !!prefs.tutorial_completed
    };
  }

  async updatePreferences(userId: string, data: Partial<UserPreferences>): Promise<UserPreferences> {
    const existing = await this.getPreferences(userId);
    
    const fields = [
      'theme', 'language', 'timezone', 'email_notifications', 
      'push_notifications', 'auto_save_interval', 'tutorial_completed', 'preferences'
    ];
    
    const updates: string[] = [];
    const params: any[] = [];
    
    for (const field of fields) {
      if ((data as any)[field] !== undefined) {
        updates.push(`${field} = ?`);
        params.push((data as any)[field]);
      }
    }
    
    if (updates.length === 0) return existing;
    
    if (existing.id) {
      // Update
      params.push(userId);
      const query = `UPDATE user_preferences SET ${updates.join(', ')} WHERE user_id = ?`;
      await this.database.query(query, params);
    } else {
      // Insert
      const id = uuidv4();
      const insertFields = ['id', 'user_id', ...updates.map(u => u.split(' = ')[0])];
      const placeholders = insertFields.map(() => '?').join(', ');
      const query = `INSERT INTO user_preferences (${insertFields.join(', ')}) VALUES (${placeholders})`;
      await this.database.query(query, [id, userId, ...params]);
    }
    
    return this.getPreferences(userId);
  }
}
