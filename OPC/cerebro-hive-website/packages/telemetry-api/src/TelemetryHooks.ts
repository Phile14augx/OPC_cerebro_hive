
import { useQuery } from '@tanstack/react-query';
import { telemetryService } from './TelemetryService';

export const usePlatformHealth = () => useQuery({
  queryKey: ['telemetry', 'health'],
  queryFn: () => telemetryService.fetchHealth(),
  meta: { refreshPolicy: '1m' }
});

export const useQueueMetrics = () => useQuery({
  queryKey: ['telemetry', 'queue'],
  queryFn: () => telemetryService.fetchQueueMetrics(),
  meta: { refreshPolicy: '30s' }
});
