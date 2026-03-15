import { DatabaseConnection } from '@/database/DatabaseConnection';
import { v4 as uuidv4 } from 'uuid';

export interface AnalyticsEvent {
  id: string;
  user_id: string;
  event_type: string;
  event_data: any;
  ip_address?: string;
  user_agent?: string;
  created_at?: Date;
}

export class AnalyticsService {
  constructor(private database: DatabaseConnection) {}

  async trackEvent(userId: string, data: Partial<AnalyticsEvent>): Promise<void> {
    const id = uuidv4();
    const { event_type, event_data, ip_address, user_agent } = data;
    
    const query = `
      INSERT INTO analytics_events (id, user_id, event_type, event_data, ip_address, user_agent)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    await this.database.query(query, [
      id,
      userId,
      event_type,
      event_data ? JSON.stringify(event_data) : null,
      ip_address || null,
      user_agent || null
    ]);
  }

  async getDashboardStats(userId: string): Promise<any> {
    const [notesCount, projectsCount, tagsCount] = await Promise.all([
      this.database.query('SELECT COUNT(*) as count FROM notes WHERE user_id = ?', [userId]),
      this.database.query('SELECT COUNT(*) as count FROM projects WHERE user_id = ?', [userId]),
      this.database.query('SELECT COUNT(*) as count FROM tags WHERE user_id = ?', [userId])
    ]);

    const recentNotes = await this.database.query(
      'SELECT id, title, updated_at FROM notes WHERE user_id = ? ORDER BY updated_at DESC LIMIT 5',
      [userId]
    );

    const activityByDay = await this.database.query(
      `SELECT DATE(created_at) as date, COUNT(*) as count 
       FROM analytics_events 
       WHERE user_id = ? AND created_at > DATE_SUB(NOW(), INTERVAL 30 DAY)
       GROUP BY DATE(created_at)
       ORDER BY date ASC`,
      [userId]
    );

    return {
      total_notes: notesCount.rows[0].count,
      total_projects: projectsCount.rows[0].count,
      total_tags: tagsCount.rows[0].count,
      recent_notes: recentNotes.rows,
      activity_data: activityByDay.rows
    };
  }
}
