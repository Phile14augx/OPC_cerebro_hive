import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { FrontmatterSchema, type Article } from "./schema.js";
import { logger } from "../utils/logger.js";

/**
 * Parse a Markdown file into a structured Article.
 * Throws if frontmatter is missing required fields.
 */
export async function parseArticle(filePath: string): Promise<Article> {
  const raw = await fs.readFile(filePath, "utf-8");

  const { data, content } = matter(raw);

  const parseResult = FrontmatterSchema.safeParse(data);
  if (!parseResult.success) {
    const issues = parseResult.error.issues
      .map((i) => `  • ${i.path.join(".")}: ${i.message}`)
      .join("\n");
    throw new Error(`Invalid frontmatter in ${path.basename(filePath)}:\n${issues}`);
  }

  const frontmatter = parseResult.data;

  if (frontmatter.status === "skip") {
    throw new Error(`Article has status: skip — ignoring`);
  }

  const body = content.trim();
  const wordCount = body.split(/\s+/).filter(Boolean).length;

  logger.info(`Parsed article: "${frontmatter.title}" (${wordCount} words) → [${frontmatter.platforms.join(", ")}]`);

  return {
    filePath,
    frontmatter,
    body,
    wordCount,
    detectedAt: new Date(),
  };
}
