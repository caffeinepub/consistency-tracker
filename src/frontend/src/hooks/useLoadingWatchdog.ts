import { useEffect, useRef } from 'react';

interface UseLoadingWatchdogOptions {
  isLoading: boolean;
  timeoutMs?: number;
  onTimeout: () => void;
  enabled?: boolean;
}

export function useLoadingWatchdog({
  isLoading,
  timeoutMs = 5000,
  onTimeout,
  enabled = true,
}: UseLoadingWatchdogOptions) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasTriggeredRef = useRef(false);

  useEffect(() => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    // Reset trigger flag when loading state changes
    if (!isLoading) {
      hasTriggeredRef.current = false;
      return;
    }

    // Only start watchdog if enabled and loading
    if (!enabled || !isLoading || hasTriggeredRef.current) {
      return;
    }

    // Start timeout
    timeoutRef.current = setTimeout(() => {
      if (!hasTriggeredRef.current) {
        hasTriggeredRef.current = true;
        onTimeout();
      }
    }, timeoutMs);

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [isLoading, timeoutMs, onTimeout, enabled]);
}
