
import { useQuery } from '@tanstack/react-query';
import { dashboardRepository } from '../repositories/DashboardRepository';

export function useDashboardMetrics() {
  return useQuery({
    queryKey: ['dashboard_metrics'],
    queryFn: () => dashboardRepository.getMetrics(),
    meta: {
      refreshPolicy: '30s'
    }
  });
}
