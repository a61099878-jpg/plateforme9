import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { usePageVisibility } from './use-page-visibility';

interface UseAutoRefreshOptions {
  queryKeys: string[][];
  intervalMs?: number;
  enabled?: boolean;
}

export function useAutoRefresh({ 
  queryKeys, 
  intervalMs = 30000, // 30 seconds by default
  enabled = true 
}: UseAutoRefreshOptions) {
  const queryClient = useQueryClient();
  const intervalRef = useRef<NodeJS.Timeout>();
  const isPageVisible = usePageVisibility();

  useEffect(() => {
    if (!enabled || !isPageVisible) {
      // Clear interval if disabled or page not visible
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = undefined;
      }
      return;
    }

    const refreshData = async () => {
      try {
        // Only refresh if page is visible
        if (isPageVisible) {
          // Invalidate and refetch all specified queries
          for (const queryKey of queryKeys) {
            await queryClient.invalidateQueries({ queryKey });
          }
        }
      } catch (error) {
        console.log('Auto-refresh failed:', error);
      }
    };

    // Set up interval for auto-refresh
    intervalRef.current = setInterval(refreshData, intervalMs);

    // Also refresh when window gains focus (user comes back to tab)
    const handleFocus = () => {
      refreshData();
    };

    window.addEventListener('focus', handleFocus);

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      window.removeEventListener('focus', handleFocus);
    };
  }, [queryClient, queryKeys, intervalMs, enabled, isPageVisible]);

  // Function to manually trigger refresh
  const refreshNow = () => {
    queryKeys.forEach(queryKey => {
      queryClient.invalidateQueries({ queryKey });
    });
  };

  return { refreshNow };
}