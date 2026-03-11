import { useState, useRef, useEffect } from 'react';
import { Send, X, MessageSquare, Smile } from 'lucide-react';
import { useChatStore } from '../store/useChatStore';
import { useWorkspaceStore } from '@/features/workspace/store/useWorkspaceStore';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { motion, AnimatePresence } from 'framer-motion';

export const WorkspaceChat = () => {
  const { messages, isChatOpen, setChatOpen, sendMessage } = useChatStore();
  const activeWorkspace = useWorkspaceStore(state => state.activeWorkspace);
  const user = useAuthStore(state => state.user);
  
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const workspaceMessages = messages.filter(m => m.workspaceId === activeWorkspace?.id);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isChatOpen) {
      scrollToBottom();
    }
  }, [workspaceMessages, isChatOpen]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeWorkspace) return;
    
    sendMessage(activeWorkspace.id, inputText);
    setInputText('');
  };

  // Only allow chat if it's a team workspace
  if (activeWorkspace?.type !== 'team') {
    return null;
  }

  return (
    <>
      {/* Floating Chat Button */}
      {!isChatOpen && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setChatOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full shadow-lg flex items-center justify-center z-40 transition-colors group"
        >
          <MessageSquare size={24} />
          {workspaceMessages.length > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white border-2 border-white dark:border-zinc-950">
              {workspaceMessages.length}
            </span>
          )}
        </motion.button>
      )}

      {/* Chat Sidebar Drawer */}
      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full sm:w-80 bg-white dark:bg-zinc-950 border-l border-zinc-200 dark:border-zinc-800 shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="h-14 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between px-4 shrink-0 bg-zinc-50 dark:bg-zinc-900">
              <div className="flex items-center gap-2">
                <MessageSquare size={18} className="text-indigo-500" />
                <h3 className="font-semibold text-sm text-zinc-900 dark:text-white">
                  Team Chat
                </h3>
              </div>
              <button 
                onClick={() => setChatOpen(false)}
                className="p-1.5 text-zinc-500 hover:text-zinc-900 dark:hover:text-white rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {workspaceMessages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-3 opacity-60">
                  <MessageSquare size={32} className="text-zinc-400" />
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    No messages yet.<br />Start the conversation!
                  </p>
                </div>
              ) : (
                workspaceMessages.map((msg) => {
                  const isMe = msg.user.id === user?.id;
                  return (
                    <div key={msg.id} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                      {/* Avatar */}
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs shrink-0">
                        {msg.user.name?.[0] || msg.user.email[0].toUpperCase()}
                      </div>
                      
                      {/* Message Body */}
                      <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[75%]`}>
                        <div className="flex items-baseline gap-2 mb-1 hidden">
                          <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                            {isMe ? 'You' : msg.user.name}
                          </span>
                        </div>
                        <div 
                          className={`px-3 py-2 text-sm rounded-2xl ${
                            isMe 
                              ? 'bg-indigo-600 text-white rounded-tr-sm' 
                              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-tl-sm'
                          }`}
                        >
                          {msg.content}
                        </div>
                        <span className="text-[10px] text-zinc-400 mt-1 px-1">
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shrink-0">
              <form onSubmit={handleSend} className="relative flex items-center">
                <button type="button" className="absolute left-3 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">
                  <Smile size={18} />
                </button>
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Type a message..."
                  className="w-full pl-10 pr-12 py-2.5 bg-zinc-100 dark:bg-zinc-900 border border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-zinc-950 rounded-full text-sm outline-none transition-all dark:text-white placeholder:text-zinc-500"
                />
                <button 
                  type="submit"
                  disabled={!inputText.trim()}
                  className="absolute right-2 p-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-300 dark:disabled:bg-zinc-800 text-white rounded-full transition-colors disabled:cursor-not-allowed"
                >
                  <Send size={14} className="ml-0.5" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default WorkspaceChat;
