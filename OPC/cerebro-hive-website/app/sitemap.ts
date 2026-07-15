import { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://cerebro-hive.com";
  const now = new Date().toISOString();

  return [
    { url: baseUrl, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/services`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${baseUrl}/services/ai-consulting`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/services/ai-automation`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/services/data-engineering`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/services/ai-development`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/services/corporate-training`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/industries`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/company`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/academy`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/academy/courses`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/academy/learning-paths`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/research`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/insights`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/case-studies`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/resources`, lastModified: now, changeFrequency: "weekly", priority: 0.6 },
    { url: `${baseUrl}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/careers`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/community`, lastModified: now, changeFrequency: "weekly", priority: 0.6 },
    { url: `${baseUrl}/tools/ai-readiness`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/tools/solution-finder`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/legal/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/legal/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/legal/security`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/legal/ai-ethics`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];
}
