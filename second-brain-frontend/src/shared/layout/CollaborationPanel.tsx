import { X, MessageSquare, Users, Activity } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/shared/utils/cn';

export interface CollaborationPanelProps {
  onClose: () => void;
}

type PanelTab = 'chat' | 'activity' | 'members';

export const CollaborationPanel = ({ onClose }: CollaborationPanelProps) => {
  const [activeTab, setActiveTab] = useState<PanelTab>('chat');

  // Mock data for collaboration
  const mockMessages = [
    {
      id: '1',
      user: { id: '1', name: 'Alex Johnson', avatar: 'AJ', color: 'bg-blue-500' },
      message: 'Great progress on the notes feature! 🎉',
      timestamp: '2 hours ago',
    },
    {
      id: '2',
      user: { id: '2', name: 'Sarah Chen', avatar: 'SC', color: 'bg-emerald-500' },
      message: 'Thanks! Just finished the tag filtering',
      timestamp: '1 hour ago',
    },
    {
      id: '3',
      user: { id: '1', name: 'Alex Johnson', avatar: 'AJ', color: 'bg-blue-500' },
      message: 'Need to discuss the graph visualization approach',
      timestamp: '30 minutes ago',
    },
  ];

  const mockActivity = [
    { id: '1', user: 'Sarah Chen', action: 'edited', target: 'System Design Notes', time: '5 min ago' },
    { id: '2', user: 'Alex Johnson', action: 'created', target: 'New Tag: sprint-planning', time: '20 min ago' },
    { id: '3', user: 'Sarah Chen', action: 'commented on', target: 'Knowledge Graph', time: '1 hour ago' },
    { id: '4', user: 'You', action: 'created', target: 'New Workspace: Project X', time: '2 hours ago' },
  ];

  const mockMembers = [
    { id: '1', name: 'Alex Johnson', status: 'online', role: 'Admin', avatar: 'AJ', color: 'bg-blue-500' },
    { id: '2', name: 'Sarah Chen', status: 'online', role: 'Member', avatar: 'SC', color: 'bg-emerald-500' },
    { id: '3', name: 'Jordan Lee', status: 'away', role: 'Member', avatar: 'JL', color: 'bg-amber-500' },
  ];

  const tabConfig = [
    { id: 'chat', label: 'Chat', icon: MessageSquare },
    { id: 'activity', label: 'Activity', icon: Activity },
    { id: 'members', label: 'Members', icon: Users },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.2 }}
      className="w-80 border-l border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex flex-col h-full"
    >
      {/* Header */}
      <div className="border-b border-zinc-200 dark:border-zinc-800 px-4 py-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold">Collaboration</h2>
        <button
          onClick={onClose}
          className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-colors"
          aria-label="Close panel"
        >
          <X size={18} />
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-zinc-200 dark:border-zinc-800 px-4 flex gap-2">
        {tabConfig.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id as PanelTab)}
            className={cn(
              'flex items-center gap-2 px-3 py-2 text-xs font-medium border-b-2 transition-colors -mb-px',
              activeTab === id
                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            )}
          >
            <Icon size={14} />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {activeTab === 'chat' && (
            <motion.div
              key="chat"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col h-full"
            >
              <div className="flex-1 space-y-4 p-4">
                {mockMessages.map((msg) => (
                  <div key={msg.id} className="group">
                    <div className="flex items-start gap-3">
                      <div
                        className={cn(
                          'w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0',
                          msg.user.color
                        )}
                      >
                        {msg.user.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2">
                          <p className="text-xs font-semibold">{msg.user.name}</p>
                          <p className="text-[10px] text-zinc-500">{msg.timestamp}</p>
                        </div>
                        <p className="text-xs text-zinc-700 dark:text-zinc-300 mt-0.5 line-clamp-3">
                          {msg.message}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-zinc-200 dark:border-zinc-800 p-3">
                <input
                  type="text"
                  placeholder="Message workspace..."
                  className="w-full text-xs px-3 py-2 rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </motion.div>
          )}

          {activeTab === 'activity' && (
            <motion.div
              key="activity"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-4"
            >
              <div className="space-y-3">
                {mockActivity.map((item) => (
                  <div key={item.id} className="flex items-start gap-3 pb-3 border-b border-zinc-200 dark:border-zinc-800 last:border-0">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0"></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs">
                        <span className="font-semibold">{item.user || 'You'}</span>
                        {' '}
                        <span className="text-zinc-600 dark:text-zinc-400">{item.action}</span>
                        {' '}
                        <span className="font-medium text-indigo-600 dark:text-indigo-400">{item.target}</span>
                      </p>
                      <p className="text-[10px] text-zinc-500 mt-1">{item.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'members' && (
            <motion.div
              key="members"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-4"
            >
              <div className="space-y-3">
                {mockMembers.map((member) => (
                  <div key={member.id} className="flex items-center gap-3 p-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors">
                    <div className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold relative',
                      member.color
                    )}>
                      {member.avatar}
                      <div
                        className={cn(
                          'absolute bottom-0 right-0 w-2 h-2 rounded-full border border-white dark:border-zinc-950',
                          member.status === 'online' ? 'bg-emerald-500' : 'bg-zinc-400'
                        )}
                      ></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold">{member.name}</p>
                      <p className="text-[10px] text-zinc-500">{member.role}</p>
                    </div>
                    <span className="text-[10px] text-zinc-500 capitalize">{member.status}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
