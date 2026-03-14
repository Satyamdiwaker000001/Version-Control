import { useState, useEffect, useRef, useCallback } from 'react';
import { Users, Wifi, WifiOff, MessageSquare, Edit3, Eye } from 'lucide-react';
import { cn } from '@/shared/utils/cn';
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

interface CollaborationPanelProps {
  fileName: string;
  currentUser: User;
  onlineUsers: User[];
  messages: LiveMessage[];
  onSendMessage: (content: string) => void;
  isLiveMode: boolean;
  onToggleLiveMode: () => void;
  connectionStatus: 'connected' | 'connecting' | 'disconnected';
}

export const CollaborationPanel = ({ 
  fileName, 
  currentUser, 
  onlineUsers, 
  messages, 
  onSendMessage, 
  isLiveMode,
  onToggleLiveMode,
  connectionStatus
}: CollaborationPanelProps) => {
  const [newMessage, setNewMessage] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      onSendMessage(newMessage);
      setNewMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatMessageTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getConnectionIcon = () => {
    switch (connectionStatus) {
      case 'connected':
        return <Wifi size={14} className="text-green-500" />;
      case 'connecting':
        return <Wifi size={14} className="text-yellow-500 animate-pulse" />;
      case 'disconnected':
        return <WifiOff size={14} className="text-red-500" />;
    }
  };

  const getConnectionText = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'Live collaboration active';
      case 'connecting':
        return 'Connecting...';
      case 'disconnected':
        return 'Disconnected';
    }
  };

  if (!isLiveMode) {
    return (
      <div className="w-80 h-full border-l bg-card flex flex-col">
        <div className="p-4 border-b bg-accent/30">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-sm flex items-center gap-2">
              <Users size={16} />
              Collaboration
            </h3>
            <button
              onClick={onToggleLiveMode}
              className="px-3 py-1 bg-primary text-primary-foreground text-xs rounded-md hover:bg-primary/90 transition-colors"
            >
              Go Live
            </button>
          </div>
          <div className="text-xs text-muted-foreground">
            Enable live collaboration to work together in real-time
          </div>
        </div>
        
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
          <div className="text-center">
            <Users size={32} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">Offline Mode</p>
            <p className="text-xs">Click "Go Live" to start collaborating</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 h-full border-l bg-card flex flex-col">
      {/* Header */}
      <div className="p-3 border-b bg-accent/30">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-sm flex items-center gap-2">
            {getConnectionIcon()}
            Live Collaboration
          </h3>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 text-muted-foreground hover:text-foreground hover:bg-accent rounded transition-colors"
            title={isExpanded ? "Minimize" : "Expand"}
          >
            <MessageSquare size={14} />
          </button>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="text-xs text-muted-foreground">
            {getConnectionText()}
          </div>
          <button
            onClick={onToggleLiveMode}
            className="px-2 py-0.5 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition-colors"
          >
            End Session
          </button>
        </div>
        
        {/* Online Users */}
        <div className="mt-2">
          <div className="text-xs font-medium text-muted-foreground mb-1">
            Online ({onlineUsers.length})
          </div>
          <div className="flex flex-wrap gap-1">
            {onlineUsers.map(user => (
              <div
                key={user.id}
                className={cn(
                  "flex items-center gap-1 px-2 py-0.5 rounded-full text-xs",
                  user.id === currentUser.id 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-muted text-muted-foreground"
                )}
                title={user.name}
              >
                <div 
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: user.color }}
                />
                {user.name}
                {user.cursor && (
                  <Edit3 size={10} className="animate-pulse" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {isExpanded ? (
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground py-4">
                <MessageSquare size={20} className="mx-auto mb-1 opacity-50" />
                <p className="text-xs">No messages yet</p>
                <p className="text-xs">Start a conversation!</p>
              </div>
            ) : (
              messages.map(message => (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-2 text-xs",
                    message.userId === currentUser.id && "flex-row-reverse"
                  )}
                >
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-white font-bold shrink-0"
                    style={{ backgroundColor: message.userId === currentUser.id ? currentUser.color : 
                      onlineUsers.find(u => u.id === message.userId)?.color || '#666' }}
                  >
                    {(message.userName || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div className={cn(
                    "max-w-[70%] rounded-lg p-2",
                    message.userId === currentUser.id 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-muted"
                  )}>
                    {message.type === 'chat' && (
                      <>
                        <div className="font-medium mb-1">{message.userName}</div>
                        <div>{message.content}</div>
                        <div className="text-[10px] opacity-70 mt-1">
                          {formatMessageTime(message.timestamp)}
                        </div>
                      </>
                    )}
                    {message.type === 'edit' && (
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Edit3 size={10} />
                        <span>{message.userName} is editing</span>
                      </div>
                    )}
                    {message.type === 'join' && (
                      <div className="flex items-center gap-1 text-green-600">
                        <Users size={10} />
                        <span>{message.userName} joined</span>
                      </div>
                    )}
                    {message.type === 'leave' && (
                      <div className="flex items-center gap-1 text-red-600">
                        <Users size={10} />
                        <span>{message.userName} left</span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
        ) : (
          <div className="flex-1 p-3">
            <div className="text-center text-muted-foreground">
              <MessageSquare size={20} className="mx-auto mb-1 opacity-50" />
              <p className="text-xs">Chat collapsed</p>
              <p className="text-xs">Click message icon to expand</p>
            </div>
          </div>
        )}
      </div>

      {/* Message Input */}
      <div className="p-3 border-t">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message... (Shift+Enter for new line)"
            className="flex-1 px-2 py-1.5 text-xs border rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-primary"
            disabled={connectionStatus !== 'connected'}
          />
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || connectionStatus !== 'connected'}
            className="px-3 py-1.5 bg-primary text-primary-foreground text-xs rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Send
          </button>
        </div>
        <div className="text-[10px] text-muted-foreground mt-1">
          {connectionStatus === 'connected' ? 
            `${onlineUsers.length} users online` : 
            'Reconnecting...'
          }
        </div>
      </div>
    </div>
  );
};
