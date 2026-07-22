import { z } from "zod";

export const PlatformSchema = z.enum([
  "linkedin",
  "medium",
  "devto",
  "hashnode",
]);

export type Platform = z.infer<typeof PlatformSchema>;

export const FrontmatterSchema = z.object({
  title: z.string().min(1, "title is required"),
  author: z.string().default("Philemon V"),
  date: z
    .string()
    .or(z.date())
    .transform((v) => (typeof v === "string" ? v : v.toISOString().split("T")[0])),
  platforms: z.array(PlatformSchema).min(1, "at least one platform required"),
  schedule: z
    .record(z.string(), z.string())
    .optional()
    .default({}),
  cover: z.string().optional(),
  hashtags: z.array(z.string()).default([]),
  status: z.enum(["publish", "draft", "skip"]).default("publish"),
  canonical_url: z.string().url().optional(),
});

export type Frontmatter = z.infer<typeof FrontmatterSchema>;

export interface Article {
  filePath: string;
  frontmatter: Frontmatter;
  body: string;      // raw markdown body (no frontmatter)
  wordCount: number;
  detectedAt: Date;
}
