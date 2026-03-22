import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

export type ExpandableSearchBarProps = {
  expandDirection?: 'left' | 'right';
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  onSearch?: (query: string) => void;
  onClear?: () => void;
  className?: string;
  defaultOpen?: boolean;
  width?: number;
  children?: React.ReactNode;
};

const COLLAPSED_SIZE = 36;

export default function ExpandableSearchBar(props: ExpandableSearchBarProps) {
  const {
    expandDirection = 'left',
    placeholder = 'Search titles or authors',
    value: controlledValue,
    onChange,
    onSearch,
    onClear,
    className = '',
    defaultOpen = false,
    width = 320,
    children,
  } = props;

  const [open, setOpen] = useState(defaultOpen);
  const [internalValue, setInternalValue] = useState('');
  const containerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const value = controlledValue !== undefined ? controlledValue : internalValue;
  const setValue = (v: string) => {
    setInternalValue(v);
    onChange?.(v);
  };

  const handleClose = () => {
    setOpen(false);
    setValue('');
    onClear?.();
  };

  // Close on click outside (only if empty)
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node) && open && value === '') {
        handleClose();
      }
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [open, value]);

  // Auto-focus input when opened
  useEffect(() => {
    if (open) {
      const id = setTimeout(() => inputRef.current?.focus(), 150);
      return () => clearTimeout(id);
    }
  }, [open]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        handleClose();
      }
      if (e.key === 'Enter' && open && value.trim()) {
        onSearch?.(value);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, value, onSearch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) onSearch?.(value);
  };

  // Collapsed: just an icon button
  if (!open) {
    return (
      <div className={cn('relative', className)}>
        <button
          type="button"
          aria-label="Open search"
          onClick={() => setOpen(true)}
          className="navbar-icon-btn"
        >
          <MagnifyingGlassIcon className="h-5 w-5" />
        </button>
      </div>
    );
  }

  // Expanded: search bar
  return (
    <div
      ref={containerRef}
      className={cn('relative', className)}
    >
      <motion.form
        onSubmit={handleSubmit}
        className={cn(
          'flex items-center h-9 rounded-full bg-manga-surface/80 backdrop-blur-sm',
          'border border-manga-border/60',
          'focus-within:border-manga-accent/40',
          'transition-colors',
          expandDirection === 'left' ? 'origin-right' : 'origin-left'
        )}
        initial={{ width: COLLAPSED_SIZE, opacity: 0 }}
        animate={{ width, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        style={{ overflow: 'hidden' }}
      >
        {/* Search icon */}
        <span className="flex-shrink-0 pl-3 pr-1 text-manga-muted">
          <MagnifyingGlassIcon className="h-4 w-4" />
        </span>

        {/* Input */}
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          className="flex-1 min-w-0 bg-transparent text-sm text-manga-text placeholder:text-manga-muted/60 outline-none border-none ring-0 focus:ring-0 focus:outline-none h-full px-1 appearance-none"
          style={{ WebkitAppearance: 'none' }}
          aria-label={placeholder}
        />

        {/* Close button */}
        <button
          type="button"
          onClick={handleClose}
          className="flex-shrink-0 h-9 w-9 grid place-items-center text-manga-muted hover:text-manga-text transition-colors"
          aria-label="Close search"
        >
          <XMarkIcon className="h-4 w-4" />
        </button>
      </motion.form>

      {/* Children (search results dropdown) */}
      {children}
    </div>
  );
}
