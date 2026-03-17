import { Notification, NotificationPreferences } from '@/shared/types';
import apiClient from '@/shared/api/apiClient';
import type { ApiResponse } from '@/shared/api/apiClient';

class NotificationService {
  
  async getNotifications(): Promise<Notification[]> {
    try {
      const response = await apiClient.get<ApiResponse<Notification[]>>('/notifications');
      return response.data.success ? response.data.data : [];
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      return [];
    }
  }

  async markAsRead(id: string): Promise<void> {
    try {
      await apiClient.patch(`/notifications/${id}/read`);
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }

  async getPreferences(): Promise<NotificationPreferences> {
    try {
      const response = await apiClient.get<ApiResponse<NotificationPreferences>>('/notifications/preferences');
      return response.data.success ? response.data.data : {
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
    } catch (error) {
      console.error('Failed to fetch notification preferences:', error);
      return {
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
    }
  }

  async updatePreferences(preferences: Partial<NotificationPreferences>): Promise<void> {
    try {
      await apiClient.patch('/notifications/preferences', preferences);
    } catch (error) {
      console.error('Failed to update notification preferences:', error);
    }
  }
}

export const notificationService = new NotificationService();
