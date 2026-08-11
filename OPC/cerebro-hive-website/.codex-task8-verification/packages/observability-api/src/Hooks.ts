import { useQuery } from '@tanstack/react-query';
import { observabilityService } from './Service';
export const useRecentTraces = () => useQuery({ queryKey: ['observability', 'traces'], queryFn: () => observabilityService.fetchRecentTraces() });