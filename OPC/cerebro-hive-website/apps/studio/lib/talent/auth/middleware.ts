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
    // In production, we'd extract the session token from cookies/headers
    // and resolve the user profile. For the prototype, we mock an authenticated Recruiter.
    const mockUserContext = {
      userId: 'mock-user-id',
      roles: ['RECRUITER']
    };

    const isAuthorized = true; // Mocking authorization

    if (!isAuthorized) {
      return ApiUtils.unauthorized(`Insufficient permissions to perform ${action} on ${resource}`);
    }

    // Call the actual route handler if authorized
    return await handler(req, mockUserContext);
    
  } catch (error: any) {
    return ApiUtils.error("Internal Server Error during authorization", 500, error);
  }
}
