import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';

/**
 * Silent background retry hook for actor initialization.
 * When authenticated and actor is not available, schedules bounded retry attempts
 * with exponential backoff without showing any UI to the user.
 */
export function useSilentActorRetry(isAuthenticated: boolean) {
  const { actor, isFetching } = useActor();
  const queryClient = useQueryClient();
  const retryCountRef = useRef(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Only retry if authenticated, actor not available, and not currently fetching
    if (!isAuthenticated || actor || isFetching) {
      retryCountRef.current = 0;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      return;
    }

    // Bounded retry with exponential backoff (max 5 attempts)
    const maxRetries = 5;
    if (retryCountRef.current >= maxRetries) {
      return;
    }

    // Calculate delay: 2s, 4s, 8s, 16s, 32s (capped at 32s)
    const delay = Math.min(2000 * 2 ** retryCountRef.current, 32000);

    timeoutRef.current = setTimeout(() => {
      retryCountRef.current += 1;
      queryClient.invalidateQueries({ queryKey: ['actor'] });
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [isAuthenticated, actor, isFetching, queryClient]);
}
