// @ts-nocheck
import { NextRequest } from 'next/server';
import { ApiUtils } from '../utils/api';

/**
 * Standard Authorization Middleware for Talent OS APIs.
 * Prevents embedding ABAC logic directly inside controllers.
 */
export async function withAuthorization(
  req: NextRequest,
  action: string,
  resource: string,
  handler: (req: NextRequest, userContext: any) => Promise<Response>
) {
  try {
    const authorization = req.headers.get('authorization');
    if (!authorization) {
      return ApiUtils.unauthorized(
        `Talent OS APIs require a Bearer token. ${action} on ${resource} was rejected because authentication is not mocked.`
      );
    }

    return ApiUtils.error(
      'Talent OS is unavailable: assessment and execution tables were dropped from the platform schema. This API will not invent results.',
      501
    );
    
  } catch (error: any) {
    return ApiUtils.error("Internal Server Error during authorization", 500, error);
  }
}
