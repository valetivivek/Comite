import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UserIcon, 
  PaperAirplaneIcon, 
  HeartIcon,
  PhotoIcon,
  FaceSmileIcon,
  ArrowUturnLeftIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { Comment } from '../types';

// Emoji picker data
const EMOJIS = ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯', '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐', '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕', '🤑', '🤠', '😈', '👿', '👹', '👺', '🤡', '💩', '👻', '💀', '☠️', '👽', '👾', '🤖', '🎃', '😺', '😸', '😹', '😻', '😼', '😽', '🙀', '😿', '😾'];

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
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

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

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newImages: string[] = [];
    
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const result = event.target?.result as string;
          newImages.push(result);
          if (newImages.length === files.length) {
            setSelectedImages(prev => [...prev, ...newImages]);
          }
        };
        reader.readAsDataURL(file);
      }
    });
  };

  // Handle emoji selection
  const handleEmojiSelect = (emoji: string) => {
    setNewComment(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  // Handle like/unlike
  const handleLike = (commentId: string) => {
    setComments(prev => prev.map(comment => {
      if (comment.id === commentId) {
        const isLiked = comment.likedBy.includes('current-user'); // In real app, use actual user ID
        return {
          ...comment,
          likes: isLiked ? comment.likes - 1 : comment.likes + 1,
          likedBy: isLiked 
            ? comment.likedBy.filter(id => id !== 'current-user')
            : [...comment.likedBy, 'current-user']
        };
      }
      return comment;
    }));
  };

  // Handle reply
  const handleReply = (parentId: string) => {
    setReplyingTo(parentId);
  };

  // Handle submit
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
      likes: 0,
      likedBy: [],
      images: selectedImages.length > 0 ? selectedImages : undefined,
      parentId: replyingTo || undefined,
    };

    if (replyingTo) {
      // Add as reply to parent comment
      setComments(prev => prev.map(parentComment => {
        if (parentComment.id === replyingTo) {
          return {
            ...parentComment,
            replies: [...(parentComment.replies || []), comment]
          };
        }
        return parentComment;
      }));
    } else {
      // Add as top-level comment
      setComments(prev => [comment, ...prev]);
    }
    
    // Clear input and state
    setNewComment('');
    setSelectedImages([]);
    setReplyingTo(null);
    
    // Save author name for future use
    if (author.trim()) {
      localStorage.setItem('comment-author', author.trim());
    }
    
    setIsSubmitting(false);
  };

  // Handle click outside emoji picker
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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
          {/* Reply indicator */}
          {replyingTo && (
            <div className="flex items-center justify-between p-3 bg-manga-surface rounded-lg border border-manga-border">
              <span className="text-sm text-manga-muted">Replying to comment</span>
              <button
                type="button"
                onClick={() => setReplyingTo(null)}
                className="text-manga-muted hover:text-manga-text"
                aria-label="Cancel reply"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>
          )}

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
            <div className="relative">
              <textarea
                id={`comment-${contextId}`}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share your thoughts..."
                rows={3}
                className="w-full px-3 py-2 pr-20 bg-manga-surface border border-manga-border rounded-lg text-manga-text placeholder-manga-muted focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                aria-label="Comment text"
              />
              
              {/* Emoji and Image buttons */}
              <div className="absolute right-2 top-2 flex gap-1">
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="p-1 text-manga-muted hover:text-manga-text transition-colors"
                  aria-label="Add emoji"
                >
                  <FaceSmileIcon className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-1 text-manga-muted hover:text-manga-text transition-colors"
                  aria-label="Add image"
                >
                  <PhotoIcon className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="hidden"
              aria-label="Upload images"
            />

            {/* Selected images preview */}
            {selectedImages.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {selectedImages.map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={image}
                      alt={`Upload ${index + 1}`}
                      className="w-16 h-16 object-cover rounded border border-manga-border"
                    />
                    <button
                      type="button"
                      onClick={() => setSelectedImages(prev => prev.filter((_, i) => i !== index))}
                      className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                      aria-label="Remove image"
                    >
                      <XMarkIcon className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Emoji picker */}
            <AnimatePresence>
              {showEmojiPicker && (
                <motion.div
                  ref={emojiPickerRef}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute z-50 mt-1 p-3 bg-manga-card border border-manga-border rounded-lg shadow-xl max-h-40 overflow-y-auto"
                >
                  <div className="grid grid-cols-8 gap-1">
                    {EMOJIS.map((emoji, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleEmojiSelect(emoji)}
                        className="p-1 hover:bg-manga-surface rounded transition-colors text-lg"
                        aria-label={`Add ${emoji} emoji`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
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
              <CommentItem
                key={comment.id}
                comment={comment}
                onLike={handleLike}
                onReply={handleReply}
                formatTimestamp={formatTimestamp}
              />
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// Individual comment component
interface CommentItemProps {
  comment: Comment;
  onLike: (commentId: string) => void;
  onReply: (parentId: string) => void;
  formatTimestamp: (timestamp: string) => string;
}

const CommentItem = ({ comment, onLike, onReply, formatTimestamp }: CommentItemProps) => {
  const isLiked = comment.likedBy.includes('current-user'); // In real app, use actual user ID

  return (
    <motion.div
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
          
          <p className="text-manga-text text-sm whitespace-pre-wrap mb-3">
            {comment.text}
          </p>

          {/* Images */}
          {comment.images && comment.images.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {comment.images.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`Comment image ${index + 1}`}
                  className="max-w-32 max-h-32 object-cover rounded border border-manga-border"
                />
              ))}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => onLike(comment.id)}
              className={`flex items-center space-x-1 text-sm transition-colors ${
                isLiked ? 'text-red-500' : 'text-manga-muted hover:text-red-500'
              }`}
              aria-label={isLiked ? 'Unlike comment' : 'Like comment'}
            >
              {isLiked ? (
                <HeartSolidIcon className="h-4 w-4" />
              ) : (
                <HeartIcon className="h-4 w-4" />
              )}
              <span>{comment.likes}</span>
            </button>
            
            <button
              onClick={() => onReply(comment.id)}
              className="flex items-center space-x-1 text-sm text-manga-muted hover:text-manga-text transition-colors"
              aria-label="Reply to comment"
            >
              <ArrowUturnLeftIcon className="h-4 w-4" />
              <span>Reply</span>
            </button>
          </div>

          {/* Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-4 ml-4 space-y-3 border-l-2 border-manga-border pl-4">
              {comment.replies.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  onLike={onLike}
                  onReply={onReply}
                  formatTimestamp={formatTimestamp}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default CommentSection;
