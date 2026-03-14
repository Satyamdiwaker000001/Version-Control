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

interface LiveMessage {
  id: string;
  userId: string;
  userName: string;
  content: string;
  timestamp: string;
  type: 'chat' | 'edit' | 'join' | 'leave';
}

interface CollaborationState {
  isLiveMode: boolean;
  connectionStatus: 'connected' | 'connecting' | 'disconnected';
  onlineUsers: User[];
  messages: LiveMessage[];
  currentUser: User;
}

interface UseCollaborationProps {
  userId: string;
  userName: string;
}

// Mock WebSocket implementation - replace with real WebSocket in production

export const useCollaboration = ({ userId, userName }: UseCollaborationProps) => {
  const [state, setState] = useState<CollaborationState>({
    isLiveMode: false,
    connectionStatus: 'disconnected',
    onlineUsers: [],
    messages: [],
    currentUser: {
      id: userId,
      name: userName,
      avatar: '',
      color: '#' + Math.floor(Math.random()*16777215).toString(16),
      isOnline: true
    }
  });

  const wsRef = useRef<any>(null);

  // Simulate other users joining/leaving
  const simulateUserActivity = useCallback(() => {
    if (!state.isLiveMode) return;

    const mockUsers: User[] = [
      { id: 'user2', name: 'Alice', avatar: '', color: '#ff6b6b', isOnline: true },
      { id: 'user3', name: 'Bob', avatar: '', color: '#4ecdc4', isOnline: true },
      { id: 'user4', name: 'Carol', avatar: '', color: '#45b7d1', isOnline: false },
    ];

    // Randomly add/remove users
    const activeUsers = mockUsers.filter(() => Math.random() > 0.3);
    
    setState(prev => ({
      ...prev,
      onlineUsers: activeUsers
    }));

    // Add join/leave messages
    if (Math.random() > 0.7) {
      const user = activeUsers[Math.floor(Math.random() * activeUsers.length)];
      if (user) {
        const message: LiveMessage = {
          id: Date.now().toString(),
          userId: user.id,
          userName: user.name,
          content: '',
          timestamp: new Date().toISOString(),
          type: Math.random() > 0.5 ? 'join' : 'leave'
        };
        
        setState(prev => ({
          ...prev,
          messages: [...prev.messages, message].slice(-50) // Keep last 50 messages
        }));
      }
    }
  }, [state.isLiveMode]);

  // Initialize WebSocket connection
  const connect = useCallback(() => {
    setState(prev => ({ ...prev, connectionStatus: 'connecting' }));

    // Simulate connection delay
    setTimeout(() => {
      setState(prev => ({ 
        ...prev, 
        connectionStatus: 'connected' 
      }));
      
      toast.success('Connected to collaboration session');
      
      // Start simulating user activity
      const activityInterval = setInterval(simulateUserActivity, 5000);
      
      // Store interval for cleanup
      (window as any).collaborationInterval = activityInterval;
    }, 1000);
  }, [simulateUserActivity]);

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
