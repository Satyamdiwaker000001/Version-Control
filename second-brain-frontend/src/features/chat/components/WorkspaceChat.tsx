import { useState, useRef, useEffect, useMemo } from 'react';
import { Send, X, MessageSquare, Smile, Hash, Users, Plus, Star, Menu } from 'lucide-react';
import { toast } from 'sonner';
import { useChatStore } from '../store/useChatStore';
import { useWorkspaceStore } from '@/features/workspace/store/useWorkspaceStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/shared/ui/Button';
import { cn } from '@/shared/utils/cn';

export const WorkspaceChat = () => {
  const { messages, channels, activeChannelId, setActiveChannel, isChatOpen, setChatOpen, sendMessage, createChannel } = useChatStore();
  const activeWorkspace = useWorkspaceStore(state => state.activeWorkspace);
  
  const [inputText, setInputText] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleCreateChannel = () => {
    if (!activeWorkspace) return;
    const name = prompt('Enter channel name:');
    if (name) {
      createChannel(activeWorkspace.id, name.toLowerCase().replace(/\s+/g, '-'));
      toast.success(`Channel #${name} created`);
    }
  };

  const workspaceChannels = useMemo(() => 
    channels.filter(c => c.workspaceId === activeWorkspace?.id),
    [channels, activeWorkspace]
  );

  const activeChannel = useMemo(() => 
    workspaceChannels.find(c => c.id === activeChannelId) || workspaceChannels[0],
    [workspaceChannels, activeChannelId]
  );

  useEffect(() => {
    if (activeChannel && !activeChannelId) {
      setActiveChannel(activeChannel.id);
    }
  }, [activeChannel, activeChannelId, setActiveChannel]);

  const activeMessages = useMemo(() => 
    messages.filter(m => m.channelId === activeChannel?.id),
    [messages, activeChannel]
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isChatOpen) {
      scrollToBottom();
    }
  }, [activeMessages, isChatOpen]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeWorkspace || !activeChannel) return;
    
    sendMessage(activeWorkspace.id, activeChannel.id, inputText);
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
          className="fixed bottom-6 right-6 w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-2xl flex items-center justify-center z-40 transition-all premium-shadow group"
        >
          <MessageSquare size={24} />
          {activeMessages.length > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground border-2 border-background">
              {activeMessages.length}
            </span>
          )}
        </motion.button>
      )}

      {/* Chat Application Layout */}
      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            initial={{ y: 20, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 20, opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-6 right-6 bottom-6 left-6 sm:left-auto sm:w-[800px] glass border border-border rounded-2xl shadow-2xl z-50 flex overflow-hidden premium-shadow"
          >
            {/* Slack-style Sidebar */}
            <div className={cn(
              "w-64 bg-zinc-900 dark:bg-zinc-950 text-zinc-400 border-r border-border flex flex-col transition-all duration-300",
              !sidebarOpen && "w-0 overflow-hidden"
            )}>
              <div className="h-14 flex items-center justify-between px-4 border-b border-white/5 bg-white/5">
                <span className="text-white font-bold text-sm tracking-tight truncate">{activeWorkspace.name}</span>
                <span className="p-1 hover:bg-white/10 rounded cursor-pointer"><Star size={14} /></span>
              </div>
              
              <div className="flex-1 overflow-y-auto py-4 space-y-6">
                <div>
                  <div className="px-4 mb-2 flex items-center justify-between group">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Channels</span>
                    <Plus 
                      size={14} 
                      onClick={handleCreateChannel}
                      className="hover:text-white cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity" 
                    />
                  </div>
                  <div className="space-y-0.5">
                    {workspaceChannels.map(channel => (
                      <div 
                        key={channel.id}
                        onClick={() => setActiveChannel(channel.id)}
                        className={cn(
                          "px-4 py-1.5 flex items-center gap-2 cursor-pointer transition-colors text-sm",
                          activeChannelId === channel.id 
                            ? "bg-primary text-primary-foreground font-semibold" 
                            : "hover:bg-white/5 hover:text-white"
                        )}
                      >
                        <Hash size={16} className={activeChannelId === channel.id ? "text-primary-foreground" : "text-zinc-500"} />
                        <span>{channel.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="px-4 mb-2 flex items-center justify-between group">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Direct Messages</span>
                    <Plus size={14} className="hover:text-white cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="space-y-0.5 px-4">
                    <div className="flex items-center gap-2 py-1 hover:text-white cursor-pointer text-sm">
                      <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                      <span>Alex (you)</span>
                    </div>
                    <div className="flex items-center gap-2 py-1 hover:text-white cursor-pointer text-sm">
                      <div className="w-2 h-2 rounded-full bg-zinc-600"></div>
                      <span>Sarah</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Messaging Area */}
            <div className="flex-1 flex flex-col bg-background relative">
              {/* Header */}
              <div className="h-14 border-b border-border flex items-center justify-between px-6 shrink-0 bg-background/50 backdrop-blur-sm z-10">
                <div className="flex items-center gap-3">
                  <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1.5 hover:bg-accent rounded-md sm:hidden">
                    <Menu size={18} />
                  </button>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5">
                      <Hash size={18} className="text-muted-foreground" />
                      <h3 className="font-bold text-sm text-foreground">
                        {activeChannel?.name || 'select-channel'}
                      </h3>
                    </div>
                    <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{activeChannel?.description}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="hidden sm:flex -space-x-2">
                    {[1, 2].map(i => (
                      <div key={i} className="w-6 h-6 rounded border-2 border-background bg-zinc-800 text-[10px] flex items-center justify-center font-bold text-white uppercase">
                        {i === 1 ? 'A' : 'S'}
                      </div>
                    ))}
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setChatOpen(false)} className="rounded-full">
                    <X size={20} />
                  </Button>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {activeMessages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-40">
                    <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center">
                      <MessageSquare size={32} className="text-primary" />
                    </div>
                    <p className="text-sm font-medium">
                      This is the beginning of the <span className="text-primary font-bold">#{activeChannel?.name}</span> channel.<br />
                    </p>
                  </div>
                ) : (
                  activeMessages.map((msg, i) => {
                    const nextMsg = activeMessages[i + 1];
                    const isGrouped = nextMsg && nextMsg.user.id === msg.user.id && 
                                     (new Date(nextMsg.timestamp).getTime() - new Date(msg.timestamp).getTime()) < 60000;
                    
                    return (
                      <div key={msg.id} className={cn("group flex gap-4 hover:bg-accent/30 -mx-6 px-6 py-1 transition-colors", !isGrouped && "mt-1")}>
                        {/* Avatar Column */}
                        <div className="w-10 flex flex-col items-center pt-0.5">
                           {!isGrouped ? (
                             <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0 border border-primary/20">
                               {msg.user.name?.[0] || 'U'}
                             </div>
                           ) : (
                             <span className="text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                               {new Date(msg.timestamp).getHours()}:{new Date(msg.timestamp).getMinutes()}
                             </span>
                           )}
                        </div>
                        
                        {/* Message Content */}
                        <div className="flex-1 min-w-0">
                          {!isGrouped && (
                            <div className="flex items-baseline gap-2 mb-0.5">
                              <span className="font-extrabold text-sm text-foreground hover:underline cursor-pointer tracking-tight">
                                {msg.user.name || msg.user.email}
                              </span>
                              <span className="text-[10px] font-bold text-muted-foreground uppercase">
                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          )}
                          <p className="text-sm text-foreground leading-relaxed break-words">
                            {msg.content}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Slack-style Message Input */}
              <div className="px-6 pb-6 pt-2">
                <form onSubmit={handleSend} className="relative group">
                   <div className="border border-border rounded-xl bg-accent/20 focus-within:bg-background focus-within:border-primary/50 focus-within:ring-4 focus-within:ring-primary/10 transition-all overflow-hidden flex flex-col">
                      <div className="flex-1 flex items-start px-2 py-2">
                        <textarea
                          rows={2}
                          value={inputText}
                          onChange={(e) => setInputText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSend(e as any);
                            }
                          }}
                          placeholder={`Message #${activeChannel?.name || 'channel'}`}
                          className="w-full bg-transparent border-none focus:ring-0 text-sm py-2 px-3 resize-none outline-none placeholder:text-muted-foreground placeholder:font-medium"
                        />
                      </div>
                      <div className="h-10 px-2 flex items-center justify-between border-t border-border/50 bg-accent/5">
                        <div className="flex items-center gap-1">
                           <button type="button" className="p-1.5 hover:bg-accent rounded text-muted-foreground"><Smile size={18} /></button>
                           <button type="button" className="p-1.5 hover:bg-accent rounded text-muted-foreground"><Plus size={18} /></button>
                           <div className="w-px h-4 bg-border mx-1"></div>
                           <button type="button" className="p-1.5 hover:bg-accent rounded text-muted-foreground"><Users size={18} /></button>
                        </div>
                        <Button 
                          type="submit" 
                          size="sm"
                          disabled={!inputText.trim()}
                          className="h-7 w-7 p-0 rounded bg-primary hover:bg-primary/90"
                        >
                          <Send size={14} />
                        </Button>
                      </div>
                   </div>
                </form>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default WorkspaceChat;
