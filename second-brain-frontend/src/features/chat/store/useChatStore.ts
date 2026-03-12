import { create } from 'zustand';
import type { User } from '@/shared/types';
import { useAuthStore } from '@/features/auth/store/useAuthStore';

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
  setChatOpen: (isOpen: boolean) => void;
  setActiveChannel: (channelId: string) => void;
  sendMessage: (workspaceId: string, channelId: string, content: string) => void;
}

// Initial mock data
const MOCK_CHANNELS: Channel[] = [
  { id: 'c1', workspaceId: 'ws1', name: 'general', description: 'General discussion' },
  { id: 'c2', workspaceId: 'ws1', name: 'research', description: 'Notes and research talk' },
  { id: 'c3', workspaceId: 'ws2', name: 'project-x', description: 'Engineering team' }
];

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'm1',
    channelId: 'c3',
    workspaceId: 'ws2',
    user: { id: 'u2', email: 'sarah@example.com', name: 'Sarah', createdAt: new Date().toISOString() },
    content: 'Hey everyone, I just updated the architecture document for the new API.',
    timestamp: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: 'm2',
    channelId: 'c3',
    workspaceId: 'ws2',
    user: { id: 'u1', email: 'alex@example.com', name: 'Alex', createdAt: new Date().toISOString() },
    content: 'Thanks Sarah! I will read it over now. Did you include the D3 graph updates?',
    timestamp: new Date(Date.now() - 1800000).toISOString()
  }
];

export const useChatStore = create<ChatState>((set) => ({
  channels: MOCK_CHANNELS,
  messages: INITIAL_MESSAGES,
  activeChannelId: null,
  isChatOpen: false,
  setChatOpen: (isOpen) => set({ isChatOpen: isOpen }),
  setActiveChannel: (channelId) => set({ activeChannelId: channelId }),
  sendMessage: (workspaceId, channelId, content) => {
    const user = useAuthStore.getState().user;
    if (!user) return;
    
    const newMessage: ChatMessage = {
      id: `m_${Date.now()}`,
      workspaceId,
      channelId,
      user,
      content,
      timestamp: new Date().toISOString()
    };
    
    set((state) => ({ messages: [...state.messages, newMessage] }));
  }
}));
