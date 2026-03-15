import { useState, useEffect, useRef } from 'react';
import { Button } from '@/shared/ui/Button';

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

interface CommentSectionProps {
  comments: Comment[];
  onAddComment: (content: string) => void;
}

export const CommentSection = ({ comments, onAddComment }: CommentSectionProps) => {
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

  return (
    <div className="p-4 border-l h-full flex flex-col">
      <h4 className="text-lg font-bold mb-4">Comments</h4>
      <div className="space-y-4 flex-1 overflow-y-auto">
        {comments.map(comment => (
          <div key={comment.id} className="flex items-start space-x-3">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center font-bold text-sm text-white">
              {comment.author.name.charAt(0)}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold">{comment.author.name}</span>
                <span className="text-xs text-muted-foreground">{new Date(comment.timestamp).toLocaleTimeString()}</span>
              </div>
              <p className="text-sm">{comment.content}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 relative">
        <textarea
          value={newComment}
          onChange={handleCommentChange}
          placeholder="Add a comment... use @ to mention"
          className="w-full p-2 border rounded-md text-sm"
          rows={2}
        />
        {showSuggestions && (
          <div ref={suggestionsRef} className="absolute bottom-full left-0 mb-2 w-full bg-card border rounded-md shadow-lg z-10">
            <div className="p-2 text-xs italic text-muted-foreground">No members to mention</div>
          </div>
        )}
        <div className="mt-2 flex justify-end">
          <Button onClick={handleAddComment} size="sm">Comment</Button>
        </div>
      </div>
    </div>
  );
};
