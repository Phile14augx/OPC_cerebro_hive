import { z } from 'zod';
import {
  ReviewStateSchema,
  ReviewOutcomeSchema,
  EngineeringReviewSummarySchema,
  FindingDetailSchema,
  EvidenceSchema,
  ContributorResultSchema,
  FreshnessStatusSchema
} from '../schema/review.schema';

export type ReviewStateDTO = z.infer<typeof ReviewStateSchema>;
export type ReviewOutcomeDTO = z.infer<typeof ReviewOutcomeSchema>;
export type EngineeringReviewSummaryDTO = z.infer<typeof EngineeringReviewSummarySchema>;
export type FindingDetailDTO = z.infer<typeof FindingDetailSchema>;
export type EvidenceDTO = z.infer<typeof EvidenceSchema>;
export type ContributorResultDTO = z.infer<typeof ContributorResultSchema>;
export type FreshnessStatusDTO = z.infer<typeof FreshnessStatusSchema>;
