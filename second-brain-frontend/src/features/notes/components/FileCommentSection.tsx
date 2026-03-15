import { useState, useEffect, useRef } from 'react';
import { Button } from '@/shared/ui/Button';
import { MessageSquare, X, Minimize2, Maximize2 } from 'lucide-react';

interface Comment {
  id: string;
  author: {
    id: string;
    name: string;
    avatar: string;
  };
  content: string;
  timestamp: string;
}

interface FileCommentSectionProps {
  comments: Comment[];
  onAddComment: (content: string) => void;
  fileName: string;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  onClose?: () => void;
}

export const FileCommentSection = ({ 
  comments, 
  onAddComment, 
  fileName, 
  isExpanded = false,
  onToggleExpand,
  onClose
}: FileCommentSectionProps) => {
  const [newComment, setNewComment] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const handleAddComment = () => {
    if (newComment.trim()) {
      onAddComment(newComment);
      setNewComment('');
    }
  };

  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setNewComment(text);
    if (text.includes('@')) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleMentionClick = (name: string) => {
    setNewComment(prev => prev.replace(/@\w*$/, `@${name} `));
    setShowSuggestions(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAddComment();
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [suggestionsRef]);

  if (isExpanded) {
    return (
      <>
        <div className="fixed inset-0 z-[398] bg-background/60 backdrop-blur-sm" onClick={onClose} />
        <div className="fixed right-4 top-4 bottom-4 w-96 z-[401] bg-card border rounded-lg shadow-2xl flex flex-col">
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2">
              <MessageSquare size={18} className="text-primary" />
              <h3 className="font-bold">Comments - {fileName}</h3>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={onToggleExpand}
                className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"
                title="Minimize"
              >
                <Minimize2 size={14} />
              </button>
              <button
                onClick={onClose}
                className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"
                title="Close"
              >
                <X size={14} />
              </button>
            </div>
          </div>
          
          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {comments.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <MessageSquare size={32} className="mx-auto mb-2 opacity-50" />
                  <p>No comments yet. Be the first to comment!</p>
                </div>
              ) : (
                comments.map(comment => (
                  <div key={comment.id} className="flex items-start space-x-3">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center font-bold text-sm shrink-0 text-white">
                      {comment.author.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">{comment.author.name}</span>
                        <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                          {new Date(comment.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm break-words">{comment.content}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            <div className="p-4 border-t">
              <div className="relative">
                <textarea
                  value={newComment}
                  onChange={handleCommentChange}
                  onKeyPress={handleKeyPress}
                  placeholder="Add a comment... use @ to mention"
                  className="w-full p-3 border rounded-md text-sm resize-none"
                  rows={3}
                />
                {showSuggestions && (
                  <div ref={suggestionsRef} className="absolute bottom-full left-0 mb-2 w-full bg-card border rounded-md shadow-lg z-10 max-h-32 overflow-y-auto">
                    <div className="p-2 text-xs italic text-muted-foreground">No members to mention</div>
                  </div>
                )}
              </div>
              <div className="mt-2 flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Press Enter to send</span>
                <Button onClick={handleAddComment} size="sm" disabled={!newComment.trim()}>
                  Comment
                </Button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="border-l h-full flex flex-col bg-card">
      <div className="flex items-center justify-between p-3 border-b bg-accent/30">
        <div className="flex items-center gap-2">
          <MessageSquare size={16} className="text-primary" />
          <h4 className="font-bold text-sm">Comments</h4>
          <span className="bg-primary text-primary-foreground text-xs px-1.5 rounded-full">
            {comments.length}
          </span>
        </div>
        <button
          onClick={onToggleExpand}
          className="p-1 text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"
          title="Expand"
        >
          <Maximize2 size={12} />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {comments.length === 0 ? (
          <div className="text-center text-muted-foreground py-4">
            <MessageSquare size={20} className="mx-auto mb-1 opacity-50" />
            <p className="text-xs">No comments yet</p>
          </div>
        ) : (
          comments.slice(0, 3).map(comment => (
            <div key={comment.id} className="flex items-start space-x-2">
              <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center font-bold text-xs shrink-0 text-white">
                {comment.author.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs">{comment.author.name}</span>
                  <span className="text-[10px] text-muted-foreground whitespace-nowrap ml-1">
                    {new Date(comment.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-xs break-words">{comment.content}</p>
              </div>
            </div>
          ))
        )}
        {comments.length > 3 && (
          <button
            onClick={onToggleExpand}
            className="text-xs text-primary hover:underline w-full text-center"
          >
            View all {comments.length} comments →
          </button>
        )}
      </div>
      
      <div className="p-3 border-t">
        <div className="relative">
          <textarea
            value={newComment}
            onChange={handleCommentChange}
            onKeyPress={handleKeyPress}
            placeholder="Add a comment..."
            className="w-full p-2 border rounded-md text-xs resize-none"
            rows={2}
          />
          {showSuggestions && (
              <div ref={suggestionsRef} className="absolute bottom-full left-0 mb-2 w-full bg-card border rounded-md shadow-lg z-10 max-h-32 overflow-y-auto">
                <div className="p-2 text-xs italic text-muted-foreground">No members to mention</div>
              </div>
          )}
        </div>
        <div className="mt-1 flex justify-end">
          <Button onClick={handleAddComment} size="sm" disabled={!newComment.trim()}>
            Send
          </Button>
        </div>
      </div>
    </div>
  );
};
