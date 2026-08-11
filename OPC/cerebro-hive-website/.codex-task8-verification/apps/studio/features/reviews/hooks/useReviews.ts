import { useQuery } from '@tanstack/react-query';
import { reviewClient } from '../../../lib/config/api';
import {
  EngineeringReviewSummaryDTO,
  FindingDetailDTO,
  EvidenceDTO,
  ContributorResultDTO
} from '@cerebro/api-client';

export const reviewKeys = {
  all: ['reviews'] as const,
  lists: () => [...reviewKeys.all, 'list'] as const,
  list: (workflowId: string) => [...reviewKeys.lists(), { workflowId }] as const,
  details: () => [...reviewKeys.all, 'detail'] as const,
  detail: (id: string) => [...reviewKeys.details(), id] as const,
  findings: (id: string) => [...reviewKeys.detail(id), 'findings'] as const,
  evidence: (reviewId: string, findingId: string) => [...reviewKeys.findings(reviewId), 'evidence', findingId] as const,
  contributors: (id: string) => [...reviewKeys.detail(id), 'contributors'] as const,
};

export function useReview(reviewId: string) {
  return useQuery<EngineeringReviewSummaryDTO>({
    queryKey: reviewKeys.detail(reviewId),
    queryFn: () => reviewClient.getReview(reviewId),
    enabled: !!reviewId,
  });
}

export function useReviewsByWorkflow(workflowId: string) {
  return useQuery<EngineeringReviewSummaryDTO[]>({
    queryKey: reviewKeys.list(workflowId),
    queryFn: () => reviewClient.getReviewsByWorkflow(workflowId),
    enabled: !!workflowId,
  });
}

export function useFindings(reviewId: string) {
  return useQuery<FindingDetailDTO[]>({
    queryKey: reviewKeys.findings(reviewId),
    queryFn: () => reviewClient.getFindings(reviewId),
    enabled: !!reviewId,
  });
}

export function useFindingDetails(reviewId: string, findingId: string) {
  return useQuery<FindingDetailDTO>({
    queryKey: [...reviewKeys.findings(reviewId), findingId],
    queryFn: () => reviewClient.getFindingDetails(reviewId, findingId),
    enabled: !!reviewId && !!findingId,
  });
}

export function useEvidence(reviewId: string, findingId: string) {
  return useQuery<EvidenceDTO[]>({
    queryKey: reviewKeys.evidence(reviewId, findingId),
    queryFn: () => reviewClient.getEvidence(reviewId, findingId),
    enabled: !!reviewId && !!findingId,
  });
}

export function useContributors(reviewId: string) {
  return useQuery<ContributorResultDTO[]>({
    queryKey: reviewKeys.contributors(reviewId),
    queryFn: () => reviewClient.getContributors(reviewId),
    enabled: !!reviewId,
  });
}
