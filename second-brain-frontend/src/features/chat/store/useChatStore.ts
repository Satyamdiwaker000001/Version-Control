import { create } from 'zustand';
import type { User } from '@/shared/types';
import apiClient from '@/shared/api/apiClient';

export interface Channel {
  id: string;
  workspaceId: string;
  name: string;
  description?: string;
}

export interface ChatMessage {
  id: string;
  channelId: string;
  workspaceId: string;
  user: User;
  content: string;
  timestamp: string;
}

interface ChatState {
  channels: Channel[];
  messages: ChatMessage[];
  activeChannelId: string | null;
  isChatOpen: boolean;
  isLoading: boolean;
  
  setChatOpen: (isOpen: boolean) => void;
  setActiveChannel: (channelId: string) => void;
  fetchChannels: (workspaceId: string) => Promise<void>;
  fetchMessages: (channelId: string) => Promise<void>;
  sendMessage: (workspaceId: string, channelId: string, content: string) => Promise<void>;
  createChannel: (workspaceId: string, name: string, description?: string) => Promise<void>;
}

export const useChatStore = create<ChatState>((set, get) => ({
  channels: [],
  messages: [],
  activeChannelId: null,
  isChatOpen: false,
  isLoading: false,

  setChatOpen: (isOpen) => set({ isChatOpen: isOpen }),
  
  setActiveChannel: (channelId) => {
    set({ activeChannelId: channelId });
    if (channelId) {
      get().fetchMessages(channelId);
    }
  },

  fetchChannels: async (workspaceId) => {
    set({ isLoading: true });
    try {
      const res = await apiClient.get('/chats', { params: { workspaceId } });
      if (res.data.success) {
        const mapped = res.data.data.map((c: any) => ({
          id: c.id,
          workspaceId: c.workspace_id,
          name: c.name,
          description: c.description
        }));
        set({ channels: mapped });
        if (mapped.length > 0 && !get().activeChannelId) {
          get().setActiveChannel(mapped[0].id);
        }
      }
    } catch (error) {
      console.error('Failed to fetch channels:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  fetchMessages: async (channelId) => {
    try {
      const res = await apiClient.get(`/chats/${channelId}`);
      if (res.data.success) {
        const mapped = res.data.data.map((m: any) => ({
          id: m.id,
          channelId: m.channel_id,
          workspaceId: '', // Would need to fetch from channel
          user: m.user || { id: m.user_id, name: 'User', email: '' },
          content: m.content,
          timestamp: m.created_at
        }));
        set({ messages: mapped });
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  },

  sendMessage: async (workspaceId, channelId, content) => {
    try {
      const res = await apiClient.post(`/chats/${channelId}/messages`, { content });
      if (res.data.success) {
        const m = res.data.data;
        const newMessage: ChatMessage = {
          id: m.id,
          workspaceId,
          channelId,
          user: m.user || { id: m.user_id, name: 'You', email: '' },
          content: m.content,
          timestamp: m.created_at
        };
        set((state) => ({ messages: [...state.messages, newMessage] }));
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  },

  createChannel: async (workspaceId, name, description) => {
    try {
      const res = await apiClient.post('/chats', { workspaceId, name, description });
      if (res.data.success) {
        const c = res.data.data;
        const newChannel: Channel = {
          id: c.id,
          workspaceId: c.workspace_id,
          name: c.name,
          description: c.description
        };
        set((state) => ({ 
          channels: [...state.channels, newChannel],
          activeChannelId: newChannel.id
        }));
        get().setActiveChannel(newChannel.id);
      }
    } catch (error) {
      console.error('Failed to create channel:', error);
    }
  }
}));
