import { useQuery } from '@tanstack/react-query';
import { recommendationService } from './Service';
export const useRecommendations = () => useQuery({ queryKey: ['intelligence', 'recommendations'], queryFn: () => recommendationService.fetchRecommendations() });