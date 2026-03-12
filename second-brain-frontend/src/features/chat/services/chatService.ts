import { apiClient } from '@/shared/api/apiClient';

export interface ChatMessage {
  id: string;
  workspaceId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
  reactions?: Record<string, string[]>;
  editedBy?: string;
}

export interface SendMessageInput {
  workspaceId: string;
  content: string;
}

export interface MessageThread {
  id: string;
  workspaceId: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  lastMessageAt: string;
  participantCount: number;
}

export const chatService = {
  // Fetch messages for a workspace
  async getMessages(workspaceId: string, limit: number = 50): Promise<ChatMessage[]> {
    return apiClient.get<ChatMessage[]>(`/workspaces/${workspaceId}/messages?limit=${limit}`);
  },

  // Send a message
  async sendMessage(input: SendMessageInput): Promise<ChatMessage> {
    return apiClient.post<ChatMessage>(`/workspaces/${input.workspaceId}/messages`, {
      content: input.content,
    });
  },

  // Edit a message
  async editMessage(workspaceId: string, messageId: string, content: string): Promise<ChatMessage> {
    return apiClient.put<ChatMessage>(
      `/workspaces/${workspaceId}/messages/${messageId}`,
      { content }
    );
  },

  // Delete a message
  async deleteMessage(workspaceId: string, messageId: string): Promise<void> {
    await apiClient.delete(`/workspaces/${workspaceId}/messages/${messageId}`);
  },

  // Add reaction to a message
  async addReaction(workspaceId: string, messageId: string, emoji: string): Promise<ChatMessage> {
    return apiClient.post<ChatMessage>(
      `/workspaces/${workspaceId}/messages/${messageId}/reactions`,
      { emoji }
    );
  },

  // Remove reaction from a message
  async removeReaction(workspaceId: string, messageId: string, emoji: string): Promise<ChatMessage> {
    return apiClient.delete<ChatMessage>(
      `/workspaces/${workspaceId}/messages/${messageId}/reactions/${emoji}`
    );
  },

  // Get message threads
  async getThreads(workspaceId: string): Promise<MessageThread[]> {
    return apiClient.get<MessageThread[]>(`/workspaces/${workspaceId}/threads`);
  },

  // Create a thread
  async createThread(workspaceId: string, title: string, messages: string[]): Promise<MessageThread> {
    return apiClient.post<MessageThread>(`/workspaces/${workspaceId}/threads`, {
      title,
      messageIds: messages,
    });
  },
};
