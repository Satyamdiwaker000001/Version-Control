import { useState, useEffect, useRef } from 'react';
import { Link2, ExternalLink, X } from 'lucide-react';
import { Button } from '@/shared/ui/Button';

interface LinkInsertDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (url: string, text: string) => void;
  initialUrl?: string;
  initialText?: string;
}

export const LinkInsertDialog = ({ isOpen, onClose, onInsert, initialUrl = '', initialText = '' }: LinkInsertDialogProps) => {
  const [url, setUrl] = useState(initialUrl);
  const [text, setText] = useState(initialText);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setUrl(initialUrl);
      setText(initialText);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, initialUrl, initialText]);

  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      const finalUrl = url.startsWith('http') ? url : `https://${url}`;
      onInsert(finalUrl, text.trim() || finalUrl);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-background/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-card border border-border shadow-2xl rounded-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-5 py-3 border-b border-border">
          <div className="flex items-center gap-2 text-sm font-bold text-foreground">
            <Link2 size={16} className="text-primary" />
            Insert Link
          </div>
          <button onClick={onClose} className="p-1 text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors">
            <X size={16} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">URL</label>
            <input
              ref={inputRef}
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full px-3 py-2.5 rounded-xl bg-accent/50 border border-border text-sm outline-none focus:border-primary/50 transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Display Text (optional)</label>
            <input
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Link text"
              className="w-full px-3 py-2.5 rounded-xl bg-accent/50 border border-border text-sm outline-none focus:border-primary/50 transition-colors"
            />
          </div>
          <div className="flex gap-3 pt-1">
            <Button type="button" variant="ghost" className="flex-1" onClick={onClose}>Cancel</Button>
            <Button type="submit" className="flex-1 gap-2 premium-shadow" disabled={!url.trim()}>
              <ExternalLink size={14} /> Insert Link
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
