import pRetry from "p-retry";
import type { TransformedContent } from "../transform/engine.js";
import { logger } from "../utils/logger.js";

const MEDIUM_API = "https://api.medium.com/v1";

function getConfig() {
  const integrationToken = process.env.MEDIUM_INTEGRATION_TOKEN;
  if (!integrationToken) {
    throw new Error(
      "Missing Medium credentials. Set MEDIUM_INTEGRATION_TOKEN in .env"
    );
  }
  return { integrationToken };
}

/**
 * Fetch the authenticated Medium user's ID.
 */
async function getMediumUserId(integrationToken: string): Promise<string> {
  const response = await fetch(`${MEDIUM_API}/me`, {
    headers: {
      Authorization: `Bearer ${integrationToken}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Medium /me API ${response.status}: ${body}`);
  }

  const data = (await response.json()) as { data: { id: string } };
  return data.data.id;
}

async function postToMedium(
  content: TransformedContent,
  dryRun: boolean
): Promise<string> {
  const { integrationToken } = getConfig();

  if (dryRun) {
    logger.info(`[DRY RUN] Medium post:\nTitle: ${content.title}\nBody (preview):\n${content.body.slice(0, 300)}...`);
    return "dry-run-id";
  }

  const userId = await getMediumUserId(integrationToken);

  const tags = content.hashtags.slice(0, 5); // Medium allows max 5 tags

  const payload = {
    title: content.title,
    contentFormat: "markdown",
    content: content.body,
    tags,
    publishStatus: "public",
  };

  const response = await fetch(`${MEDIUM_API}/users/${userId}/posts`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${integrationToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Medium API ${response.status}: ${body}`);
  }

  const data = (await response.json()) as { data: { id: string; url: string } };
  logger.info(`Medium post URL: ${data.data.url}`);
  return data.data.id;
}

export async function publishToMedium(
  content: TransformedContent,
  dryRun = false
): Promise<{ postId: string }> {
  logger.info(`Publishing to Medium${dryRun ? " (dry run)" : ""}...`);

  const postId = await pRetry(
    () => postToMedium(content, dryRun),
    {
      retries: 4,
      minTimeout: 5_000,
      maxTimeout: 2 * 60 * 60 * 1000,
      factor: 6,
      onFailedAttempt: (error: { attemptNumber: number; message: string }) => {
        logger.warn(
          `Medium publish attempt ${error.attemptNumber} failed: ${error.message}. Retrying...`
        );
      },
    }
  );

  logger.info(`Medium post published — ID: ${postId}`);
  return { postId };
}
