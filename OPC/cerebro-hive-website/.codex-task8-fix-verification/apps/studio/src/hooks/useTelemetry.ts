import { useQuery } from '@tanstack/react-query';
import { TelemetryClient } from '@cerebro/sdk';

const telemetryClient = new TelemetryClient('http://localhost:3000'); // Mocked URL for now

export function useTelemetryOverview() {
  return useQuery({
    queryKey: ['telemetry', 'overview'],
    queryFn: () => telemetryClient.getOverview(),
    refetchInterval: 5000, // Live updates
  });
}

export function useTraces() {
  return useQuery({
    queryKey: ['telemetry', 'traces'],
    queryFn: () => telemetryClient.listTraces(),
    refetchInterval: 10000,
  });
}

export function useTraceDetails(traceId: string | null) {
  return useQuery({
    queryKey: ['telemetry', 'traces', traceId],
    queryFn: () => telemetryClient.getTraceDetails(traceId!),
    enabled: !!traceId,
  });
}
