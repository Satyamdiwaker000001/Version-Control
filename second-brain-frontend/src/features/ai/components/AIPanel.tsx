import { useState, useRef, useEffect } from 'react';
import {
  Sparkles, RefreshCw, Network, Send, X,
  FileSearch, Lightbulb, Wand2, Link2, ChevronRight,
  Bot, MessageSquare,
} from 'lucide-react';
import { useNoteStore } from '@/features/notes/store/useNoteStore';
import { cn } from '@/shared/utils/cn';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatMessage {
  role: 'user' | 'ai';
  text: string;
}

// ─── Smart mock AI responses based on note content ───────────────────────────
function generateSummary(note: { title: string; content: string; tags: string[] }): string {
  const wordCount = note.content.split(/\s+/).filter(Boolean).length;
  const tagList = note.tags.length > 0 ? note.tags.join(', ') : 'general topics';
  return `**${note.title}** covers ${wordCount} words across ${tagList}. The document establishes core principles and foundational relationships that can serve as a reference for downstream notes and research branches. Key themes include conceptual framing, structured observations, and actionable insights drawn from primary sources.`;
}

function generateChatReply(question: string, note: { title: string; content: string }): string {
  const q = question.toLowerCase();
  if (q.includes('summar') || q.includes('about') || q.includes('what') || q.includes('overview')) {
    return `This note — **${note.title}** — ${note.content.substring(0, 120).replace(/#+\s/g, '')}... It serves as a foundational knowledge entry with structured observations.`;
  }
  if (q.includes('tag') || q.includes('label') || q.includes('categor')) {
    return `I'd recommend categorizing this note with tags like **research**, **reference**, or **deep-dive** based on its content depth and the topics it addresses.`;
  }
  if (q.includes('improve') || q.includes('better') || q.includes('refine')) {
    return `To improve this note, consider: 1) adding a **TL;DR** at the top, 2) linking related notes via backlinks, and 3) breaking long paragraphs into bullet points for faster scanning.`;
  }
  if (q.includes('link') || q.includes('connect') || q.includes('related')) {
    return `Based on the content, this note would connect well with notes on **attention mechanisms**, **research methodology**, and **model evaluation** — consider creating backlinks to those pages.`;
  }
  return `Based on **${note.title}**, here's what I can offer: the note touches on topics that benefit from further exploration. Try asking me to summarize a section, suggest improvements, or find related topics within your workspace.`;
}

function getSuggestedLinks(note: { title: string; tags: string[] }, allNotes: { id: string; title: string; tags: string[] }[]): { id: string; title: string; score: number }[] {
  return allNotes
    .filter(n => n.id !== note.title)
    .map(n => {
      const commonTags = n.tags.filter(t => note.tags.includes(t)).length;
      const score = commonTags > 0 ? 70 + commonTags * 10 : Math.floor(50 + Math.random() * 20);
      return { id: n.id, title: n.title, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
}

// ─── Tone improvement ─────────────────────────────────────────────────────────
function improveTone(content: string): string {
  return content
    .replace(/\bi think\b/gi, 'Research suggests')
    .replace(/\bmaybe\b/gi, 'It is plausible that')
    .replace(/\bstuff\b/gi, 'components')
    .replace(/\bthing(s)?\b/gi, 'element$1')
    .replace(/\bgood\b/gi, 'effective')
    .replace(/\bbad\b/gi, 'suboptimal');
}

export const AIPanel = ({ noteId }: { noteId: string }) => {
  const note = useNoteStore(state => state.notes.find(n => n.id === noteId));
  const allNotes = useNoteStore(state => state.notes);

  const [activeTab, setActiveTab] = useState<'insights' | 'ask'>('insights');

  // Insights state
  const [summary, setSummary] = useState<string | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [toneResult, setToneResult] = useState<string | null>(null);
  const [isImprovingTone, setIsImprovingTone] = useState(false);

  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Reset state when note changes
  useEffect(() => {
    setSummary(null);
    setToneResult(null);
    setMessages([]);
    setInput('');
  }, [noteId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  if (!note) return null;

  const suggestedLinks = getSuggestedLinks(note, allNotes.filter(n => n.id !== noteId));

  const handleSummarize = () => {
    if (summary) { setSummary(null); return; }
    setIsSummarizing(true);
    setTimeout(() => {
      setSummary(generateSummary(note));
      setIsSummarizing(false);
    }, 1400);
  };

  const handleImproveTone = () => {
    if (toneResult) { setToneResult(null); return; }
    setIsImprovingTone(true);
    setTimeout(() => {
      setToneResult(improveTone(note.content).substring(0, 200) + '...\n\n[Full rewrite available — click "Apply to Note"]');
      setIsImprovingTone(false);
    }, 1800);
  };

  const handleSend = () => {
    const q = input.trim();
    if (!q) return;
    setMessages(prev => [...prev, { role: 'user', text: q }]);
    setInput('');
    setIsThinking(true);
    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'ai', text: generateChatReply(q, note) }]);
      setIsThinking(false);
    }, 1200 + Math.random() * 800);
  };

  const quickPrompts = [
    { label: 'Summarize this', icon: FileSearch },
    { label: 'Improve clarity', icon: Wand2 },
    { label: 'Suggest tags', icon: Lightbulb },
    { label: 'Find related notes', icon: Link2 },
  ];

  return (
    <div className="w-64 bg-card flex flex-col h-full overflow-hidden border-t border-border">

      {/* Header */}
      <div className="px-4 pt-3 pb-0 shrink-0">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
            <Sparkles size={13} className="text-white" />
          </div>
          <h3 className="text-sm font-bold text-foreground">Knowledge Engine</h3>
          <span className="ml-auto text-[9px] font-bold uppercase tracking-widest text-muted-foreground/40">AI</span>
        </div>

        {/* Tab switcher */}
        <div className="flex rounded-lg bg-muted p-0.5 gap-0.5">
          {(['insights', 'ask'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'flex-1 flex items-center justify-center gap-1.5 text-[11px] font-bold py-1.5 rounded-md transition-all',
                activeTab === tab
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {tab === 'insights' ? <Sparkles size={11} /> : <MessageSquare size={11} />}
              {tab === 'insights' ? 'Insights' : 'Ask AI'}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <AnimatePresence mode="wait">
          {activeTab === 'insights' ? (
            <motion.div
              key="insights"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
              className="p-3 space-y-3"
            >
              {/* Auto Summary */}
              <div className="bg-background border border-border rounded-xl overflow-hidden">
                <div className="flex items-center justify-between px-3 pt-3 pb-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                    <FileSearch size={13} className="text-emerald-500" />
                    Auto Summary
                  </div>
                  <button
                    onClick={handleSummarize}
                    disabled={isSummarizing}
                    className="text-[10px] font-bold text-primary hover:text-primary/80 transition-colors"
                  >
                    {isSummarizing ? <RefreshCw size={10} className="animate-spin" /> : summary ? 'Clear' : 'Generate'}
                  </button>
                </div>

                <AnimatePresence>
                  {isSummarizing && (
                    <motion.div
                      initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
                      className="px-3 pb-3"
                    >
                      <div className="space-y-2">
                        {[70, 90, 55].map((w, i) => (
                          <div key={i} className="h-2.5 rounded-full bg-muted animate-pulse" style={{ width: `${w}%` }} />
                        ))}
                      </div>
                    </motion.div>
                  )}
                  {summary && !isSummarizing && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                      className="px-3 pb-3"
                    >
                      <p className="text-[11px] text-muted-foreground leading-relaxed">{summary}</p>
                    </motion.div>
                  )}
                  {!summary && !isSummarizing && (
                    <div className="px-3 pb-3">
                      <button
                        onClick={handleSummarize}
                        className="w-full py-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[11px] font-semibold transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Sparkles size={11} /> Generate Summary
                      </button>
                    </div>
                  )}
                </AnimatePresence>
              </div>

              {/* Tone Improvement */}
              <div className="bg-background border border-border rounded-xl overflow-hidden">
                <div className="flex items-center justify-between px-3 pt-3 pb-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                    <Wand2 size={13} className="text-violet-500" />
                    Improve Tone
                  </div>
                  {toneResult && (
                    <button onClick={() => setToneResult(null)} className="text-muted-foreground hover:text-foreground">
                      <X size={12} />
                    </button>
                  )}
                </div>
                <div className="px-3 pb-3">
                  {toneResult ? (
                    <div>
                      <p className="text-[11px] text-muted-foreground leading-relaxed bg-accent/50 p-2 rounded-lg border border-border">
                        {toneResult}
                      </p>
                      <button className="mt-2 w-full py-1.5 rounded-lg bg-violet-500/10 hover:bg-violet-500/20 text-violet-600 dark:text-violet-400 text-[11px] font-semibold transition-colors">
                        Apply to Note
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={handleImproveTone}
                      disabled={isImprovingTone}
                      className="w-full py-2 rounded-lg bg-violet-500/10 hover:bg-violet-500/20 text-violet-600 dark:text-violet-400 text-[11px] font-semibold transition-colors flex items-center justify-center gap-1.5"
                    >
                      {isImprovingTone
                        ? <><RefreshCw size={11} className="animate-spin" /> Analyzing...</>
                        : <><Wand2 size={11} /> Polish Writing Style</>
                      }
                    </button>
                  )}
                </div>
              </div>

              {/* Suggested Links */}
              <div className="bg-background border border-border rounded-xl overflow-hidden">
                <div className="px-3 pt-3 pb-2 flex items-center gap-2 text-xs font-bold text-foreground">
                  <Network size={13} className="text-blue-500" />
                  Related Notes
                </div>
                <div className="px-3 pb-3 space-y-1.5">
                  {suggestedLinks.length === 0 ? (
                    <p className="text-[11px] text-muted-foreground/50 italic">No related notes found in this workspace.</p>
                  ) : suggestedLinks.map(link => (
                    <div
                      key={link.id}
                      className="flex items-center gap-2 px-2.5 py-2 rounded-lg bg-accent/40 hover:bg-accent border border-transparent hover:border-border cursor-pointer group transition-all"
                    >
                      <Link2 size={11} className="text-muted-foreground/40 group-hover:text-primary shrink-0" />
                      <span className="text-[11px] font-medium text-foreground/80 group-hover:text-foreground truncate flex-1">
                        {link.title}
                      </span>
                      <div className="flex items-center gap-1 shrink-0">
                        <span className={cn(
                          'text-[9px] font-bold',
                          link.score >= 80 ? 'text-emerald-500' : link.score >= 65 ? 'text-amber-500' : 'text-muted-foreground/50'
                        )}>
                          {link.score}%
                        </span>
                        <ChevronRight size={10} className="text-muted-foreground/30 group-hover:text-primary transition-colors" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="ask"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
              className="flex flex-col h-full"
            >
              {/* Messages area */}
              <div className="flex-1 overflow-y-auto px-3 pt-3 pb-2 space-y-3 min-h-0" style={{ maxHeight: '280px' }}>
                {messages.length === 0 && (
                  <div className="text-center py-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 flex items-center justify-center mx-auto mb-2">
                      <Bot size={20} className="text-primary" />
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Ask anything about <span className="font-semibold text-foreground">"{note.title}"</span>
                    </p>
                    <p className="text-[10px] text-muted-foreground/50 mt-1">Summaries, improvements, connections</p>
                  </div>
                )}

                {messages.map((msg, i) => (
                  <div key={i} className={cn('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                    {msg.role === 'ai' && (
                      <div className="w-5 h-5 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shrink-0 mr-1.5 mt-0.5">
                        <Sparkles size={9} className="text-white" />
                      </div>
                    )}
                    <div className={cn(
                      'max-w-[80%] px-3 py-2 rounded-xl text-[11px] leading-relaxed',
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground rounded-br-sm'
                        : 'bg-accent text-foreground rounded-bl-sm border border-border'
                    )}>
                      {msg.text}
                    </div>
                  </div>
                ))}

                {isThinking && (
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shrink-0">
                      <Sparkles size={9} className="text-white" />
                    </div>
                    <div className="flex gap-1 px-3 py-2 bg-accent rounded-xl rounded-bl-sm border border-border">
                      {[0, 0.15, 0.3].map((d, i) => (
                        <span
                          key={i}
                          className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce"
                          style={{ animationDelay: `${d}s` }}
                        />
                      ))}
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Quick prompts */}
              {messages.length === 0 && (
                <div className="px-3 pb-2 grid grid-cols-2 gap-1.5">
                  {quickPrompts.map(prompt => (
                    <button
                      key={prompt.label}
                      onClick={() => { setInput(prompt.label); }}
                      className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg bg-accent/50 hover:bg-accent border border-border hover:border-primary/30 text-[10px] font-semibold text-foreground/70 hover:text-foreground transition-all text-left"
                    >
                      <prompt.icon size={11} className="text-primary shrink-0" />
                      {prompt.label}
                    </button>
                  ))}
                </div>
              )}

              {/* Input */}
              <div className="px-3 pb-3 pt-1 shrink-0 border-t border-border">
                <div className="flex items-end gap-2 bg-accent/50 border border-border rounded-xl px-3 py-2 focus-within:border-primary/40 focus-within:bg-background transition-all">
                  <textarea
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
                    }}
                    placeholder="Ask about this note..."
                    rows={1}
                    className="flex-1 bg-transparent text-[11px] outline-none resize-none text-foreground placeholder:text-muted-foreground/50 max-h-20"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!input.trim() || isThinking}
                    className={cn(
                      'w-6 h-6 rounded-lg flex items-center justify-center transition-all shrink-0',
                      input.trim() && !isThinking
                        ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                        : 'bg-muted text-muted-foreground/30 cursor-not-allowed'
                    )}
                  >
                    {isThinking ? <RefreshCw size={11} className="animate-spin" /> : <Send size={11} />}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
