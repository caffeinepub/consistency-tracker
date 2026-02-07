import { useRef, useCallback, MouseEvent } from 'react';

interface UseHorizontalDragScrollReturn {
  scrollRef: React.RefObject<HTMLDivElement | null>;
  onMouseDown: (e: MouseEvent<HTMLDivElement>) => void;
}

/**
 * Custom hook that enables pointer-based drag scrolling for horizontal overflow containers.
 * Provides mouse/trackpad-friendly interactions for desktop users.
 */
export function useHorizontalDragScroll(): UseHorizontalDragScrollReturn {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  const onMouseDown = useCallback((e: MouseEvent<HTMLDivElement>) => {
    if (!scrollRef.current) return;
    
    isDragging.current = true;
    startX.current = e.pageX - scrollRef.current.offsetLeft;
    scrollLeft.current = scrollRef.current.scrollLeft;
    
    // Prevent text selection during drag
    e.preventDefault();
  }, []);

  const onMouseMove = useCallback((e: globalThis.MouseEvent) => {
    if (!isDragging.current || !scrollRef.current) return;
    
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.5; // Scroll speed multiplier
    scrollRef.current.scrollLeft = scrollLeft.current - walk;
  }, []);

  const onMouseUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  const onMouseLeave = useCallback(() => {
    isDragging.current = false;
  }, []);

  // Attach global listeners for mouse move/up
  if (typeof window !== 'undefined') {
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  }

  // Cleanup on unmount
  if (scrollRef.current) {
    scrollRef.current.addEventListener('mouseleave', onMouseLeave);
  }

  return {
    scrollRef,
    onMouseDown,
  };
}
