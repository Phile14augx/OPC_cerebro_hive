import Anthropic from "@anthropic-ai/sdk";
import type { Article, Platform } from "../ingestion/schema.js";
import { logger } from "../utils/logger.js";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface TransformedContent {
  platform: Platform;
  title: string;
  body: string;
  hashtags: string[];
}

const PLATFORM_PROMPTS: Record<Platform, string> = {
  linkedin: `You are a professional LinkedIn content writer. Transform the article below into a LinkedIn post.

Rules:
- Maximum 350 words
- Hook first line (no "I" as first word — start with a strong statement, question, or insight)
- Short punchy paragraphs (1-3 sentences max)
- End with a thought-provoking question to drive comments
- Do NOT use markdown headers (##, ###)
- Use line breaks between paragraphs
- Return ONLY the post text — no preamble, no "Here is your post:"`,

  medium: `You are a skilled tech writer publishing on Medium. Transform the article below into a polished Medium post.

Rules:
- Keep the full depth of the original (aim for similar word count)
- Use clear markdown headers (## and ###)
- Add a compelling introduction paragraph before any headers
- Use bullet points and numbered lists where appropriate
- End with a clear takeaway section
- Return ONLY the article body in markdown — no preamble`,

  devto: `You are a developer writing for Dev.to. Transform the article below into a Dev.to post.

Rules:
- Developer-friendly tone, technical but accessible
- Use markdown headers, code blocks where relevant
- Include a brief intro and clear sections
- End with a call to action (follow, comment, or share)
- Return ONLY the article body in markdown — no preamble`,

  hashnode: `You are a developer writing for Hashnode. Transform the article below into a Hashnode blog post.

Rules:
- Technical and insightful tone
- Use markdown with clear structure (##, ###, bullet points)
- Include practical takeaways
- Return ONLY the article body in markdown — no preamble`,
};

export async function transformForPlatform(
  article: Article,
  platform: Platform
): Promise<TransformedContent> {
  const systemPrompt = PLATFORM_PROMPTS[platform];
  const hashtags = article.frontmatter.hashtags.map((t) => `#${t}`).join(" ");

  const userMessage = `Title: ${article.frontmatter.title}
Author: ${article.frontmatter.author}
Hashtags to include: ${hashtags || "none"}

---

${article.body}`;

  logger.info(`Transforming article for ${platform}...`);

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 4096,
    system: systemPrompt,
    messages: [{ role: "user", content: userMessage }],
  });

  const transformedBody =
    message.content[0].type === "text" ? message.content[0].text.trim() : "";

  logger.info(`Transformed for ${platform}: ${transformedBody.split(/\s+/).length} words`);

  return {
    platform,
    title: article.frontmatter.title,
    body: transformedBody,
    hashtags: article.frontmatter.hashtags,
  };
}

/**
 * Transform article for all target platforms in parallel.
 */
export async function transformAll(
  article: Article
): Promise<TransformedContent[]> {
  const results = await Promise.all(
    article.frontmatter.platforms.map((platform) =>
      transformForPlatform(article, platform)
    )
  );
  return results;
}
