/**
 * LinkedIn token lifecycle manager.
 *
 * Reads LINKEDIN_ACCESS_TOKEN and LINKEDIN_TOKEN_EXPIRES_AT from env,
 * validates the token is present and not expired, and warns when < 7 days remain.
 */

import { logger } from "../utils/logger.js";

const WARN_DAYS_BEFORE_EXPIRY = 7;
const MS_PER_DAY = 86_400_000;

export interface TokenStatus {
  valid: boolean;
  accessToken?: string;
  personUrn?: string;
  expiresAt?: Date;
  daysRemaining?: number;
  error?: string;
}

export function getLinkedInToken(): TokenStatus {
  const accessToken = process.env.LINKEDIN_ACCESS_TOKEN;
  const personUrn = process.env.LINKEDIN_PERSON_URN;
  const expiresAtStr = process.env.LINKEDIN_TOKEN_EXPIRES_AT;

  if (!accessToken) {
    return {
      valid: false,
      error:
        "LINKEDIN_ACCESS_TOKEN is not set. Run: npx tsx src/auth/linkedin-oauth.ts",
    };
  }

  if (!personUrn) {
    return {
      valid: false,
      error:
        "LINKEDIN_PERSON_URN is not set. Run: npx tsx src/auth/linkedin-oauth.ts",
    };
  }

  if (!expiresAtStr) {
    // Token exists but no expiry recorded — allow it with a warning
    logger.warn(
      "LINKEDIN_TOKEN_EXPIRES_AT not set. Cannot verify token expiry. " +
        "Re-run the OAuth flow to record it."
    );
    return { valid: true, accessToken, personUrn };
  }

  const expiresAt = new Date(expiresAtStr);

  if (isNaN(expiresAt.getTime())) {
    logger.warn(`LINKEDIN_TOKEN_EXPIRES_AT is not a valid date: "${expiresAtStr}"`);
    return { valid: true, accessToken, personUrn };
  }

  const now = new Date();
  const msRemaining = expiresAt.getTime() - now.getTime();
  const daysRemaining = Math.floor(msRemaining / MS_PER_DAY);

  if (msRemaining <= 0) {
    return {
      valid: false,
      expiresAt,
      daysRemaining: 0,
      error: `LinkedIn token expired on ${expiresAt.toLocaleDateString()}. ` +
        "Re-authenticate: npx tsx src/auth/linkedin-oauth.ts",
    };
  }

  if (daysRemaining <= WARN_DAYS_BEFORE_EXPIRY) {
    logger.warn(
      `⚠  LinkedIn token expires in ${daysRemaining} day${daysRemaining === 1 ? "" : "s"} ` +
        `(${expiresAt.toLocaleDateString()}). ` +
        "Re-run OAuth soon: npx tsx src/auth/linkedin-oauth.ts"
    );
  } else {
    logger.info(
      `LinkedIn token valid — expires ${expiresAt.toLocaleDateString()} (${daysRemaining} days)`
    );
  }

  return { valid: true, accessToken, personUrn, expiresAt, daysRemaining };
}

/**
 * Get a valid token or throw a descriptive error.
 * Call this at the start of any LinkedIn publish operation.
 */
export function requireLinkedInToken(): { accessToken: string; personUrn: string } {
  const status = getLinkedInToken();
  if (!status.valid || !status.accessToken || !status.personUrn) {
    throw new Error(status.error ?? "LinkedIn token is invalid.");
  }
  return { accessToken: status.accessToken, personUrn: status.personUrn };
}
