import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

/**
 * Central refresh coordinator for dashboard queries.
 *
 * Individual dashboard hooks (e.g. useDashboardMetrics) tag their query with
 * `meta: { refreshPolicy }` instead of managing their own interval/polling logic.
 * Mounting this hook once (e.g. at the dashboard shell level, see
 * apps/pulse/app/page.tsx) sets up one interval per known refresh tier and
 * invalidates every query tagged with that tier, so refresh cadence is a
 * single, centrally-owned concern rather than duplicated per-widget.
 *
 * 'manual' and 'background' are intentionally not handled here: 'manual'
 * means the user/UI explicitly triggers a refetch, and 'background' is
 * reserved for a future push/subscription-based mechanism rather than polling.
 */
const POLL_INTERVALS_MS: Record<'30s' | '1m', number> = {
  '30s': 30_000,
  '1m': 60_000,
};

export function useDashboardRefreshCoordinator(): void {
  const queryClient = useQueryClient();

  useEffect(() => {
    const timers = (Object.entries(POLL_INTERVALS_MS) as [keyof typeof POLL_INTERVALS_MS, number][]).map(
      ([refreshPolicy, intervalMs]) =>
        setInterval(() => {
          queryClient.invalidateQueries({
            predicate: (query) => query.meta?.['refreshPolicy'] === refreshPolicy,
          });
        }, intervalMs)
    );

    return () => {
      timers.forEach(clearInterval);
    };
  }, [queryClient]);
}
