import { EngineeringReviewClient } from '@cerebro/api-client';
import { cognitoProvider } from '../auth/CognitoProvider';

const baseUrl = process.env.NEXT_PUBLIC_API_URL;

if (!baseUrl) {
  throw new Error("NEXT_PUBLIC_API_URL must be configured.");
}

export const apiConfig = {
  baseUrl,
  timeoutMs: 15000,
  getToken: async () => {
    const session = await cognitoProvider.getSession();
    return session?.accessToken || null;
  }
};

export const reviewClient = new EngineeringReviewClient(apiConfig);
