import { useQuery } from '@tanstack/react-query';
import { governanceService } from './Service';
export const useRecentEvaluations = () => useQuery({ queryKey: ['governance', 'evals'], queryFn: () => governanceService.fetchRecentEvaluations() });