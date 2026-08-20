import {
  EngineeringReviewSummaryDTO,
  FindingDetailDTO,
  EvidenceDTO,
  ContributorResultDTO,
  FreshnessStatusDTO,
} from './dto/review';

export interface ApiClientConfig {
  baseUrl: string;
  timeoutMs?: number;
  getToken?: () => Promise<string | null>;
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Thin transport-only client for the Engineering Review API (M26.2).
 * Returns DTOs and translates HTTP errors into ApiError.
 */
export class EngineeringReviewClient {
  constructor(private readonly config: ApiClientConfig) {
    // Ensure baseUrl doesn't end with a slash for consistent URL construction
    this.config.baseUrl = config.baseUrl.replace(/\/$/, '');
  }

  private async fetch<T>(path: string, options?: RequestInit): Promise<T> {
    const url = `${this.config.baseUrl}${path}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeoutMs ?? 10000);

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options?.headers as Record<string, string>),
      };

      if (this.config.getToken) {
        const token = await this.config.getToken();
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
      }

      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers,
      });

      if (!response.ok) {
        throw new ApiError(response.status, `API request failed: ${response.statusText}`);
      }

      // 204 No Content won't have JSON body
      if (response.status === 204) {
        return {} as T;
      }

      return await response.json() as T;
    } catch (err: unknown) {
      if (err.name === 'AbortError') {
        throw new ApiError(408, 'Request timed out');
      }
      throw err;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  // ─── Reviews ────────────────────────────────────────────────────────

  async getReview(reviewId: string): Promise<EngineeringReviewSummaryDTO> {
    return this.fetch<EngineeringReviewSummaryDTO>(`/reviews/${reviewId}`);
  }

  async getReviewsByWorkflow(workflowId: string): Promise<EngineeringReviewSummaryDTO[]> {
    return this.fetch<EngineeringReviewSummaryDTO[]>(`/workflows/${workflowId}/reviews`);
  }

  async compareReviews(workflowId: string): Promise<EngineeringReviewSummaryDTO[]> {
    return this.fetch<EngineeringReviewSummaryDTO[]>(`/workflows/${workflowId}/reviews/compare`);
  }

  // ─── Drill-down ─────────────────────────────────────────────────────

  async getFindings(reviewId: string): Promise<FindingDetailDTO[]> {
    return this.fetch<FindingDetailDTO[]>(`/reviews/${reviewId}/findings`);
  }

  async getFindingDetails(reviewId: string, findingId: string): Promise<FindingDetailDTO> {
    return this.fetch<FindingDetailDTO>(`/reviews/${reviewId}/findings/${findingId}`);
  }

  async getEvidence(reviewId: string, findingId: string): Promise<EvidenceDTO[]> {
    return this.fetch<EvidenceDTO[]>(`/reviews/${reviewId}/evidence/${findingId}`);
  }

  async getContributors(reviewId: string): Promise<ContributorResultDTO[]> {
    return this.fetch<ContributorResultDTO[]>(`/reviews/${reviewId}/contributors`);
  }

  // ─── Operations ─────────────────────────────────────────────────────

  async checkFreshness(reviewId: string): Promise<FreshnessStatusDTO> {
    return this.fetch<FreshnessStatusDTO>(`/reviews/${reviewId}/freshness/check`, {
      method: 'POST',
    });
  }
}
