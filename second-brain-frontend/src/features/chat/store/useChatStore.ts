import { create } from 'zustand';
import type { User } from '@/shared/types';
import { useAuthStore } from '@/features/auth/store/useAuthStore';

export interface ChatMessage {
  id: string;
  workspaceId: string;
  user: User;
  content: string;
  timestamp: string;
}

interface ChatState {
  messages: ChatMessage[];
  isChatOpen: boolean;
  setChatOpen: (isOpen: boolean) => void;
  sendMessage: (workspaceId: string, content: string) => void;
}

// Initial mock data
const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'm1',
    workspaceId: 'ws2',
    user: { id: 'u2', email: 'sarah@example.com', name: 'Sarah', createdAt: new Date().toISOString() },
    content: 'Hey everyone, I just updated the architecture document for the new API.',
    timestamp: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: 'm2',
    workspaceId: 'ws2',
    user: { id: 'u1', email: 'alex@example.com', name: 'Alex', createdAt: new Date().toISOString() },
    content: 'Thanks Sarah! I will read it over now. Did you include the D3 graph updates?',
    timestamp: new Date(Date.now() - 1800000).toISOString()
  }
];

export const useChatStore = create<ChatState>((set) => ({
  messages: INITIAL_MESSAGES,
  isChatOpen: false,
  setChatOpen: (isOpen) => set({ isChatOpen: isOpen }),
  sendMessage: (workspaceId, content) => {
    const user = useAuthStore.getState().user;
    if (!user) return;
    
    const newMessage: ChatMessage = {
      id: `m_${Date.now()}`,
      workspaceId,
      user,
      content,
      timestamp: new Date().toISOString()
    };
    
    set((state) => ({ messages: [...state.messages, newMessage] }));
  }
}));
