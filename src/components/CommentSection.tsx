import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';

interface Comment {
  id: string;
  text: string;
  author: string;
  timestamp: string;
  avatar?: string;
}

interface CommentSectionProps {
  contextId: string; // series ID, chapter ID, or 'global' for homepage
  contextType: 'series' | 'chapter' | 'global';
  title?: string;
}

const CommentSection = ({ contextId, contextType, title = 'Comments' }: CommentSectionProps) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [author, setAuthor] = useState('Anonymous');

  // Load comments from localStorage on mount
  useEffect(() => {
    const storageKey = `comments-${contextType}-${contextId}`;
    const savedComments = localStorage.getItem(storageKey);
    if (savedComments) {
      setComments(JSON.parse(savedComments));
    }

    // Load saved author name
    const savedAuthor = localStorage.getItem('comment-author');
    if (savedAuthor) {
      setAuthor(savedAuthor);
    }
  }, [contextId, contextType]);

  // Save comments to localStorage whenever comments change
  useEffect(() => {
    const storageKey = `comments-${contextType}-${contextId}`;
    localStorage.setItem(storageKey, JSON.stringify(comments));
  }, [comments, contextId, contextType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    
    // Create new comment
    const comment: Comment = {
      id: Date.now().toString(),
      text: newComment.trim(),
      author: author.trim() || 'Anonymous',
      timestamp: new Date().toISOString(),
    };

    // Add comment to list
    setComments(prev => [comment, ...prev]);
    
    // Clear input
    setNewComment('');
    
    // Save author name for future use
    if (author.trim()) {
      localStorage.setItem('comment-author', author.trim());
    }
    
    setIsSubmitting(false);
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  return (
    <div className="mt-8 p-6 bg-manga-card rounded-lg border border-manga-border">
      <h3 className="text-xl font-semibold text-manga-text mb-6">{title}</h3>
      
      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="space-y-4">
          {/* Author Name Input */}
          <div>
            <label htmlFor={`author-${contextId}`} className="block text-sm font-medium text-manga-text mb-2">
              Your Name
            </label>
            <input
              id={`author-${contextId}`}
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Enter your name (optional)"
              className="w-full px-3 py-2 bg-manga-surface border border-manga-border rounded-lg text-manga-text placeholder-manga-muted focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              aria-label="Your name for comments"
            />
          </div>
          
          {/* Comment Text Input */}
          <div>
            <label htmlFor={`comment-${contextId}`} className="block text-sm font-medium text-manga-text mb-2">
              Add a Comment
            </label>
            <textarea
              id={`comment-${contextId}`}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Share your thoughts..."
              rows={3}
              className="w-full px-3 py-2 bg-manga-surface border border-manga-border rounded-lg text-manga-text placeholder-manga-muted focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
              aria-label="Comment text"
            />
          </div>
          
          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!newComment.trim() || isSubmitting}
              className="flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Submit comment"
            >
              {isSubmitting ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <PaperAirplaneIcon className="h-4 w-4 mr-2" />
              )}
              {isSubmitting ? 'Posting...' : 'Post Comment'}
            </button>
          </div>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-4">
        <AnimatePresence>
          {comments.length === 0 ? (
            <div className="text-center py-8 text-manga-muted">
              <UserIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No comments yet. Be the first to share your thoughts!</p>
            </div>
          ) : (
            comments.map((comment) => (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="p-4 bg-manga-surface rounded-lg border border-manga-border"
              >
                <div className="flex items-start space-x-3">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-neon-500 rounded-full flex items-center justify-center">
                      <UserIcon className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  
                  {/* Comment Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-manga-text text-sm">
                        {comment.author}
                      </span>
                      <span className="text-xs text-manga-muted">
                        {formatTimestamp(comment.timestamp)}
                      </span>
                    </div>
                    <p className="text-manga-text text-sm whitespace-pre-wrap">
                      {comment.text}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CommentSection;
