import { EngineeringReviewClient } from '@cerebro/api-client';

export const apiConfig = {
  // Use the env var if available, fallback to the deployed API endpoint from verification
  baseUrl: process.env.NEXT_PUBLIC_API_URL || 'https://vtbrbb44kd.execute-api.ap-south-1.amazonaws.com/v1',
  timeoutMs: 15000,
};

export const reviewClient = new EngineeringReviewClient(apiConfig);
