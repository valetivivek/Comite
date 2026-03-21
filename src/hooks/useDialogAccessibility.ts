import { RefObject, useEffect, useRef } from 'react';

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])'
].join(', ');

const getFocusableElements = (container: HTMLElement | null) => {
  if (!container) return [];

  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (element) => !element.hasAttribute('disabled') && element.getAttribute('aria-hidden') !== 'true'
  );
};

interface UseDialogAccessibilityOptions {
  isOpen: boolean;
  isEnabled?: boolean;
  onClose: () => void;
  containerRef: RefObject<HTMLElement | null>;
}

export const useDialogAccessibility = ({
  isOpen,
  isEnabled = true,
  onClose,
  containerRef
}: UseDialogAccessibilityOptions) => {
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!isOpen || !isEnabled) return;

    previouslyFocusedRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;

    const focusFirstElement = () => {
      const container = containerRef.current;
      if (!container) return;

      const focusableElements = getFocusableElements(container);
      if (focusableElements.length > 0) {
        focusableElements[0].focus();
      } else {
        container.focus();
      }
    };

    const animationFrame = window.requestAnimationFrame(focusFirstElement);

    const handleKeyDown = (event: KeyboardEvent) => {
      const container = containerRef.current;
      if (!container) return;

      if (event.key === 'Escape') {
        event.preventDefault();
        onCloseRef.current();
        return;
      }

      if (event.key !== 'Tab') return;

      const focusableElements = getFocusableElements(container);

      if (focusableElements.length === 0) {
        event.preventDefault();
        container.focus();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      const activeElement = document.activeElement as HTMLElement | null;

      if (event.shiftKey) {
        if (activeElement === firstElement || activeElement === container) {
          event.preventDefault();
          lastElement.focus();
        }
        return;
      }

      if (activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      document.removeEventListener('keydown', handleKeyDown);

      if (
        previouslyFocusedRef.current &&
        document.contains(previouslyFocusedRef.current)
      ) {
        previouslyFocusedRef.current.focus();
      }
    };
  }, [containerRef, isEnabled, isOpen]);
};
