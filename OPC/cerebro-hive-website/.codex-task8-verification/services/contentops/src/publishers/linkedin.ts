import pRetry from "p-retry";
import type { TransformedContent } from "../transform/engine.js";
import { logger } from "../utils/logger.js";
import { requireLinkedInToken } from "../auth/token-manager.js";

const LINKEDIN_API = "https://api.linkedin.com/v2";

interface LinkedInConfig {
  accessToken: string;
  personUrn: string;
}

function getConfig(): LinkedInConfig {
  // Validates token presence and expiry — throws with clear instructions if invalid
  return requireLinkedInToken();
}

/**
 * Build the UGC Share payload for LinkedIn.
 */
function buildPayload(config: LinkedInConfig, content: TransformedContent) {
  const hashtags = content.hashtags
    .map((t) => (t.startsWith("#") ? t : `#${t}`))
    .join(" ");

  const commentary = hashtags
    ? `${content.body}\n\n${hashtags}`
    : content.body;

  return {
    author: config.personUrn,
    lifecycleState: "PUBLISHED",
    specificContent: {
      "com.linkedin.ugc.ShareContent": {
        shareCommentary: { text: commentary },
        shareMediaCategory: "NONE",
      },
    },
    visibility: {
      "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
    },
  };
}

async function postToLinkedIn(
  content: TransformedContent,
  dryRun: boolean
): Promise<string> {
  const config = getConfig();
  const payload = buildPayload(config, content);

  if (dryRun) {
    logger.info(`[DRY RUN] LinkedIn payload:\n${JSON.stringify(payload, null, 2)}`);
    return "dry-run-id";
  }

  const response = await fetch(`${LINKEDIN_API}/ugcPosts`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.accessToken}`,
      "Content-Type": "application/json",
      "X-Restli-Protocol-Version": "2.0.0",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`LinkedIn API ${response.status}: ${body}`);
  }

  const data = (await response.json()) as { id: string };
  return data.id;
}

export async function publishToLinkedIn(
  content: TransformedContent,
  dryRun = false
): Promise<{ postId: string }> {
  logger.info(`Publishing to LinkedIn${dryRun ? " (dry run)" : ""}...`);

  const postId = await pRetry(
    () => postToLinkedIn(content, dryRun),
    {
      retries: 4,
      minTimeout: 5_000,
      maxTimeout: 2 * 60 * 60 * 1000, // 2 hours max
      factor: 6, // 5s → 30s → 3m → 18m → 2h
      onFailedAttempt: (error: any) => {
        logger.warn(
          `LinkedIn publish attempt ${error.attemptNumber} failed: ${error.message}. Retrying...`
        );
      },
    }
  );

  logger.info(`LinkedIn post published — ID: ${postId}`);
  return { postId };
}
