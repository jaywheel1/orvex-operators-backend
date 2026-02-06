import { useEffect, useRef } from 'react';

interface KeyboardNavigationOptions {
  onEnter?: () => void;
  onEscape?: () => void;
  onArrowDown?: () => void;
  onArrowUp?: () => void;
  onSearch?: (query: string) => void;
}

export function useKeyboardNavigation(options: KeyboardNavigationOptions) {
  const focusableElementsRef = useRef<HTMLElement[]>([]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Handle Escape
      if (e.key === 'Escape' && options.onEscape) {
        e.preventDefault();
        options.onEscape();
      }

      // Handle Enter
      if (e.key === 'Enter' && options.onEnter) {
        const activeElement = document.activeElement as HTMLElement;
        if (activeElement?.tagName === 'BUTTON' || activeElement?.tagName === 'A') {
          e.preventDefault();
          options.onEnter();
        }
      }

      // Handle Arrow Down
      if (e.key === 'ArrowDown' && options.onArrowDown) {
        e.preventDefault();
        options.onArrowDown();
      }

      // Handle Arrow Up
      if (e.key === 'ArrowUp' && options.onArrowUp) {
        e.preventDefault();
        options.onArrowUp();
      }

      // Handle Cmd/Ctrl + K for search focus
      if ((e.ctrlKey || e.metaKey) && e.key === 'k' && options.onSearch) {
        e.preventDefault();
        const searchInput = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [options]);

  const updateFocusableElements = (container: HTMLElement | null) => {
    if (!container) return;

    focusableElementsRef.current = Array.from(
      container.querySelectorAll('button, a, [tabindex]:not([tabindex="-1"])')
    ) as HTMLElement[];
  };

  const focusFirst = () => {
    focusableElementsRef.current[0]?.focus();
  };

  const focusNext = () => {
    const activeIndex = focusableElementsRef.current.indexOf(document.activeElement as HTMLElement);
    const nextIndex = (activeIndex + 1) % focusableElementsRef.current.length;
    focusableElementsRef.current[nextIndex]?.focus();
  };

  const focusPrevious = () => {
    const activeIndex = focusableElementsRef.current.indexOf(document.activeElement as HTMLElement);
    const prevIndex = activeIndex === 0 ? focusableElementsRef.current.length - 1 : activeIndex - 1;
    focusableElementsRef.current[prevIndex]?.focus();
  };

  return {
    updateFocusableElements,
    focusFirst,
    focusNext,
    focusPrevious,
  };
}
