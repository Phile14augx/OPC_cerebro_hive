/**
 * forge-api — Express Request augmentation
 * Adds the `auth` property set by JwtGuard to all Express Request objects.
 */

import type { CerebroJWTPayload } from "@cerebro/auth";

declare global {
  namespace Express {
    interface Request {
      auth?: {
        userId:     string;
        orgId:      string | null;
        orgRole:    string | null;
        email:      string | null;
        name:       string | null;
        isAdmin:    boolean;
        authType:   "jwt";
        jwtPayload: CerebroJWTPayload;
        traceId:    string | null;
      };
    }
  }
}

export {};
