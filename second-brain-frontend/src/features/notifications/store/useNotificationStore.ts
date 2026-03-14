import { create } from 'zustand';
import { Notification, NotificationPreferences } from '@/shared/types';
import { notificationService } from '../services/notificationService';

export interface NotificationState {
  notifications: Notification[];
  preferences: NotificationPreferences | null;
  isLoading: boolean;
  unreadCount: number;

  fetchNotifications: () => Promise<void>;
  fetchPreferences: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  updatePreferences: (prefs: Partial<NotificationPreferences>) => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  preferences: null,
  isLoading: false,
  unreadCount: 0,

  fetchNotifications: async () => {
    set({ isLoading: true });
    try {
      const notifications = await notificationService.getNotifications();
      const unreadCount = notifications.filter(n => !n.read).length;
      set({ notifications, unreadCount, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
    }
  },

  fetchPreferences: async () => {
    try {
      const preferences = await notificationService.getPreferences();
      set({ preferences });
    } catch (error) {
      console.error('Failed to fetch preferences', error);
    }
  },

  markAsRead: async (id: string) => {
    // Optimistic update
    const updatedNotifications = get().notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    );
    set({ 
      notifications: updatedNotifications,
      unreadCount: updatedNotifications.filter(n => !n.read).length
    });
    
    try {
      await notificationService.markAsRead(id);
    } catch (error) {
      // Revert if failed (omitted for brevity in mock)
    }
  },

  markAllAsRead: async () => {
    const updatedNotifications = get().notifications.map(n => ({ ...n, read: true }));
    set({ notifications: updatedNotifications, unreadCount: 0 });
    
    try {
      await notificationService.markAllAsRead();
    } catch (error) {
      // Revert if failed
    }
  },

  deleteNotification: async (id: string) => {
    const updatedNotifications = get().notifications.filter(n => n.id !== id);
    set({ 
      notifications: updatedNotifications,
      unreadCount: updatedNotifications.filter(n => !n.read).length
    });
    
    try {
      await notificationService.deleteNotification(id);
    } catch (error) {
      // Revert if failed
    }
  },

  updatePreferences: async (prefs) => {
    try {
      const updatedPrefs = await notificationService.updatePreferences(prefs);
      set({ preferences: updatedPrefs });
    } catch (error) {
      console.error('Failed to update preferences', error);
    }
  },
}));
