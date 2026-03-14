import { Notification, NotificationPreferences } from '@/shared/types';

const MOCK_NOTIFICATIONS: Notification[] = [
  { id: '1', type: 'comment', text: 'Alex Johnson commented on "Q1 Research Roadmap"', time: new Date(Date.now() - 3600000 * 1).toISOString(), read: false  },
  { id: '2', type: 'mention', text: 'Sarah Chen mentioned you in "Dataset Curation Guide"', time: new Date(Date.now() - 3600000 * 3).toISOString(), read: false },
  { id: '3', type: 'version', text: '"Evaluation Framework" was updated with a new commit', time: new Date(Date.now() - 86400000 * 1).toISOString(), read: true  },
  { id: '4', type: 'version', text: '"Q1 Research Roadmap" pinned by Alex Johnson', time: new Date(Date.now() - 86400000 * 2).toISOString(), read: true },
];

const DEFAULT_PREFERENCES: NotificationPreferences = {
  email: {
    dailyDigest: true,
    activityUpdates: true,
    marketing: false,
  },
  push: {
    enabled: true,
    mentions: true,
    nodeUpdates: false,
  },
  sslack: {
    enabled: false,
    channel: '',
  },
};

class NotificationService {
  private notifications = [...MOCK_NOTIFICATIONS];
  private preferences = { ...DEFAULT_PREFERENCES };

  async getNotifications(): Promise<Notification[]> {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...this.notifications]), 500);
    });
  }

  async markAsRead(id: string): Promise<void> {
    this.notifications = this.notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    );
  }

  async markAllAsRead(): Promise<void> {
    this.notifications = this.notifications.map(n => ({ ...n, read: true }));
  }

  async deleteNotification(id: string): Promise<void> {
    this.notifications = this.notifications.filter(n => n.id !== id);
  }

  async getPreferences(): Promise<NotificationPreferences> {
    return new Promise((resolve) => {
      setTimeout(() => resolve({ ...this.preferences }), 300);
    });
  }

  async updatePreferences(prefs: Partial<NotificationPreferences>): Promise<NotificationPreferences> {
    this.preferences = { ...this.preferences, ...prefs };
    return { ...this.preferences };
  }
}

export const notificationService = new NotificationService();
