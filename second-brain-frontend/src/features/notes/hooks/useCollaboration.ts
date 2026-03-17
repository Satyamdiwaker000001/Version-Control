import { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'sonner';

interface User {
  id: string;
  name: string;
  avatar: string;
  color: string;
  cursor?: { row: number; col: number };
  isOnline: boolean;
}
}

interface CollaborationState {
  isConnected: boolean;
  isLiveMode: boolean;
  connectedUsers: User[];
  currentUser: User;
  messages: LiveMessage[];
  isTyping: boolean;
  typingUsers: User[];
}

interface LiveMessage {
  id: string;
  userId: string;
  userName: string;
  content: string;
  timestamp: string;
  type: 'join' | 'leave' | 'chat' | 'edit';
}

interface UseCollaborationProps {
  noteId: string;
  userId: string;
  userName: string;
}

export const useCollaboration = ({ noteId, userId, userName }: UseCollaborationProps) => {
  const [state, setState] = useState<CollaborationState>({
    isConnected: false,
    isLiveMode: false,
    connectedUsers: [],
    currentUser: { id: userId, name: userName, color: '#6366f1' },
    messages: [],
    isTyping: false,
    typingUsers: [],
  });

  const wsRef = useRef<any>(null);

  // Disconnect from collaboration
  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    // Clear activity simulation
    if ((window as any).collaborationInterval) {
      clearInterval((window as any).collaborationInterval);
    }

    setState(prev => ({
      ...prev,
      isLiveMode: false,
      connectionStatus: 'disconnected',
      onlineUsers: [],
      messages: []
    }));
    
    toast.info('Disconnected from collaboration session');
  }, []);

  // Toggle live mode
  const toggleLiveMode = useCallback(() => {
    if (state.isLiveMode) {
      disconnect();
    } else {
      setState(prev => ({ ...prev, isLiveMode: true }));
      connect();
    }
  }, [state.isLiveMode, connect, disconnect]);

  // Send a message
  const sendMessage = useCallback((content: string) => {
    const message: LiveMessage = {
      id: Date.now().toString(),
      userId: state.currentUser.id,
      userName: state.currentUser.name,
      content,
      timestamp: new Date().toISOString(),
      type: 'chat'
    };

    setState(prev => ({
      ...prev,
      messages: [...prev.messages, message].slice(-50)
    }));

    // In real implementation, send via WebSocket
    // wsRef.current?.send(JSON.stringify(message));
  }, [state.currentUser]);

  // Send cursor position
  const sendCursorPosition = useCallback((row: number, col: number) => {
    if (!state.isLiveMode || state.connectionStatus !== 'connected') return;

    setState(prev => ({
      ...prev,
      currentUser: {
        ...prev.currentUser,
        cursor: { row, col }
      }
    }));

    // Broadcast cursor position
    // In real implementation: wsRef.current?.send(JSON.stringify({
    //   type: 'cursor',
    //   userId: state.currentUser.id,
    //   row,
    //   col
    // }));
  }, [state.isLiveMode, state.connectionStatus, state.currentUser]);

  // Send cell edit notification
  const sendCellEdit = useCallback((row: number, col: number, _value: string) => {
    if (!state.isLiveMode || state.connectionStatus !== 'connected') return;

    const editMessage: LiveMessage = {
      id: Date.now().toString(),
      userId: state.currentUser.id,
      userName: state.currentUser.name,
      content: `Editing cell (${row + 1}, ${col + 1})`,
      timestamp: new Date().toISOString(),
      type: 'edit'
    };

    setState(prev => ({
      ...prev,
      messages: [...prev.messages, editMessage].slice(-50)
    }));

    // Broadcast edit
    // In real implementation: wsRef.current?.send(JSON.stringify({
    //   type: 'cellEdit',
    //   userId: state.currentUser.id,
    //   row,
    //   col,
    //   value
    // }));
  }, [state.isLiveMode, state.connectionStatus, state.currentUser]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    ...state,
    toggleLiveMode,
    sendMessage,
    sendCursorPosition,
    sendCellEdit,
    connect,
    disconnect
  };
};
