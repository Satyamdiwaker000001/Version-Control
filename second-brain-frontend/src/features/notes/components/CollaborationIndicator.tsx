import { useState, useEffect, useRef } from 'react';
import { Users, Wifi, WifiOff, Eye, Edit3 } from 'lucide-react';
import { cn } from '@/shared/utils/cn';

interface UserActivity {
  userId: string;
  userName: string;
  action: 'typing' | 'editing' | 'viewing' | 'idle';
  timestamp: string;
  position?: { line: number; column: number };
  content?: string;
}

interface GlobalCollaborationState {
  isActive: boolean;
  currentUser: {
    id: string;
    name: string;
    color: string;
  };
  activities: UserActivity[];
  connectedUsers: Array<{
    id: string;
    name: string;
    color: string;
    isTyping: boolean;
  }>;
}

interface CollaborationIndicatorProps {
  fileName: string;
  isLiveMode: boolean;
  onToggleLiveMode: () => void;
}

export const CollaborationIndicator = ({ 
  fileName, 
  isLiveMode, 
  onToggleLiveMode 
}: CollaborationIndicatorProps) => {
  const [globalState, setGlobalState] = useState<GlobalCollaborationState>({
    isActive: false,
    currentUser: {
      id: 'current-user',
      name: 'You',
      color: '#3b82f6'
    },
    activities: [],
    connectedUsers: []
  });

  // Mock WebSocket for real-time collaboration
  const wsRef = useRef<any>(null);

  useEffect(() => {
    if (isLiveMode) {
      // Simulate connection to collaboration server
      const connect = () => {
        setGlobalState(prev => ({
          ...prev,
          isActive: true,
          connectedUsers: [
            {
              id: 'user2',
              name: 'Alice',
              color: '#ff6b6b',
              isTyping: Math.random() > 0.7
            },
            {
              id: 'user3', 
              name: 'Bob',
              color: '#4ecdc4',
              isTyping: false
            }
          ]
        }));

        // Simulate receiving activities
        const simulateActivities = () => {
          const actions: UserActivity['action'][] = ['typing', 'editing', 'viewing', 'idle'];
          const randomAction = actions[Math.floor(Math.random() * actions.length)];
          
          const activity: UserActivity = {
            userId: Math.random() > 0.5 ? 'user2' : 'user3',
            userName: Math.random() > 0.5 ? 'Alice' : 'Bob',
            action: randomAction,
            timestamp: new Date().toISOString(),
            position: randomAction === 'editing' ? {
              line: Math.floor(Math.random() * 10) + 1,
              column: Math.floor(Math.random() * 5) + 1
            } : undefined,
            content: randomAction === 'editing' ? 'Editing cell content...' : undefined
          };

          setGlobalState(prev => ({
            ...prev,
            activities: [...prev.activities.slice(-20), activity] // Keep last 20 activities
          }));
        };

        // Start activity simulation
        const activityInterval = setInterval(simulateActivities, 3000);
        
        return () => {
          clearInterval(activityInterval);
          setGlobalState(prev => ({
            ...prev,
            isActive: false,
            activities: [],
            connectedUsers: []
          }));
        };
      };

      connect();
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (globalState.isActive) {
        setGlobalState(prev => ({
          ...prev,
          isActive: false,
          activities: [],
          connectedUsers: []
        }));
      }
    };
  }, [isLiveMode]);

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getActionIcon = (action: UserActivity['action']) => {
    switch (action) {
      case 'typing':
        return <Edit3 size={12} className="animate-pulse" />;
      case 'editing':
        return <Edit3 size={12} />;
      case 'viewing':
        return <Eye size={12} />;
      case 'idle':
        return <Users size={12} />;
      default:
        return <Users size={12} />;
    }
  };

  const getActionText = (action: UserActivity['action']) => {
    switch (action) {
      case 'typing':
        return 'is typing...';
      case 'editing':
        return 'is editing';
      case 'viewing':
        return 'is viewing';
      case 'idle':
        return 'is idle';
      default:
        return '';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-[500] w-80 bg-card border border-border rounded-lg shadow-2xl">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {globalState.isActive ? (
              <Wifi size={16} className="text-green-500" />
            ) : (
              <WifiOff size={16} className="text-gray-500" />
            )}
            <div>
              <h3 className="font-bold text-sm">{fileName}</h3>
              <p className="text-xs text-muted-foreground">
                {globalState.isActive ? 'Live Collaboration' : 'Offline'}
              </p>
            </div>
          </div>
          <button
            onClick={onToggleLiveMode}
            className={cn(
              "px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
              globalState.isActive 
                ? "bg-red-500 hover:bg-red-600 text-white" 
                : "bg-green-500 hover:bg-green-600 text-white"
            )}
          >
            {globalState.isActive ? 'End Session' : 'Go Live'}
          </button>
        </div>
      </div>

      {/* Connected Users */}
      <div className="p-4 border-b border-border">
        <div className="text-sm font-medium mb-2">Connected Users ({globalState.connectedUsers.length})</div>
        <div className="space-y-2">
          {globalState.connectedUsers.map(user => (
            <div key={user.id} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
              <div 
                className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                style={{ backgroundColor: user.color }}
              >
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="font-medium text-sm">{user.name}</div>
                {user.isTyping && (
                  <div className="text-xs text-muted-foreground animate-pulse">
                    typing...
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Activity Feed */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="text-sm font-medium mb-3">Recent Activity</div>
        <div className="space-y-2">
          {globalState.activities.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <Users size={24} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">No activity yet</p>
              <p className="text-xs">Start collaborating to see activity</p>
            </div>
          ) : (
            globalState.activities.map((activity, index) => (
              <div
                key={`${activity.userId}-${activity.timestamp}-${index}`}
                className="flex items-start gap-2 p-2 rounded-lg bg-muted/30"
              >
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                  style={{ 
                    backgroundColor: activity.userId === globalState.currentUser.id 
                      ? globalState.currentUser.color 
                      : globalState.connectedUsers.find(u => u.id === activity.userId)?.color || '#666' 
                  }}
                >
                  {activity.userName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1 mb-1">
                    {getActionIcon(activity.action)}
                    <span className="text-sm font-medium">
                      {activity.userName} {getActionText(activity.action)}
                    </span>
                  </div>
                  {activity.content && (
                    <div className="text-xs text-muted-foreground bg-accent/50 rounded px-2 py-1">
                      {activity.content}
                    </div>
                  )}
                  {activity.position && (
                    <div className="text-xs text-muted-foreground">
                      Cell ({activity.position.line}, {activity.position.column})
                    </div>
                  )}
                  <div className="text-xs text-muted-foreground">
                    {formatTime(activity.timestamp)}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
