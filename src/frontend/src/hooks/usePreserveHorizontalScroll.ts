import { useRef, useCallback, useEffect } from 'react';

/**
 * Hook to preserve horizontal scroll position across re-renders and data updates.
 * Returns a ref callback to attach to the scrollable element and the current scroll position.
 */
export function usePreserveHorizontalScroll() {
  const scrollPositionRef = useRef<number>(0);
  const scrollElementRef = useRef<HTMLElement | null>(null);
  const isRestoringRef = useRef(false);

  // Callback to attach to the scrollable element
  const setScrollElement = useCallback((element: HTMLElement | null) => {
    if (element && element !== scrollElementRef.current) {
      scrollElementRef.current = element;
      
      // Restore scroll position when element is mounted/remounted
      if (scrollPositionRef.current > 0 && !isRestoringRef.current) {
        isRestoringRef.current = true;
        requestAnimationFrame(() => {
          if (scrollElementRef.current) {
            scrollElementRef.current.scrollLeft = scrollPositionRef.current;
          }
          isRestoringRef.current = false;
        });
      }

      // Listen to scroll events to capture position
      const handleScroll = () => {
        if (scrollElementRef.current && !isRestoringRef.current) {
          scrollPositionRef.current = scrollElementRef.current.scrollLeft;
        }
      };

      element.addEventListener('scroll', handleScroll, { passive: true });
      
      // Cleanup
      return () => {
        element.removeEventListener('scroll', handleScroll);
      };
    }
  }, []);

  // Restore scroll position after updates
  const restoreScrollPosition = useCallback(() => {
    if (scrollElementRef.current && scrollPositionRef.current > 0 && !isRestoringRef.current) {
      isRestoringRef.current = true;
      requestAnimationFrame(() => {
        if (scrollElementRef.current) {
          scrollElementRef.current.scrollLeft = scrollPositionRef.current;
        }
        isRestoringRef.current = false;
      });
    }
  }, []);

  return {
    setScrollElement,
    restoreScrollPosition,
    scrollPosition: scrollPositionRef.current,
  };
}
