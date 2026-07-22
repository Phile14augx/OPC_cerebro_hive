import { MetadataRoute } from "next";
import { sitemapSections } from "@/lib/data/sitemap";

export const dynamic = "force-static";

const baseUrl = "https://cerebropchive.org";

// Per-path overrides; everything else gets sensible defaults.
const overrides: Record<
  string,
  { changeFrequency?: MetadataRoute.Sitemap[number]["changeFrequency"]; priority?: number }
> = {
  "/": { changeFrequency: "weekly", priority: 1 },
  "/platform": { priority: 0.9 },
  "/products": { priority: 0.9 },
  "/services": { priority: 0.9 },
  "/industries": { priority: 0.8 },
  "/academy": { changeFrequency: "weekly", priority: 0.8 },
  "/research": { changeFrequency: "weekly", priority: 0.7 },
  "/insights": { changeFrequency: "weekly", priority: 0.7 },
  "/resources": { changeFrequency: "weekly", priority: 0.6 },
  "/resources/blog": { changeFrequency: "weekly", priority: 0.6 },
  "/contact": { priority: 0.8 },
  "/community": { changeFrequency: "weekly", priority: 0.6 },
  "/status": { changeFrequency: "weekly", priority: 0.4 },
  "/developers/changelog": { changeFrequency: "weekly", priority: 0.5 },
  "/legal/privacy": { changeFrequency: "yearly", priority: 0.3 },
  "/legal/terms": { changeFrequency: "yearly", priority: 0.3 },
  "/legal/security": { changeFrequency: "yearly", priority: 0.3 },
  "/legal/ai-ethics": { changeFrequency: "yearly", priority: 0.3 },
};

// Pages that shouldn't be indexed (gated / account areas).
const excluded = new Set(["/client-portal"]);

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date().toISOString();

  const paths = new Set<string>(["/", "/sitemap"]);
  for (const section of sitemapSections) {
    for (const link of section.links) {
      if (!excluded.has(link.href) && !link.href.includes("#")) {
        paths.add(link.href);
      }
    }
  }

  return [...paths].map((path) => ({
    url: path === "/" ? baseUrl : `${baseUrl}${path}`,
    lastModified: now,
    changeFrequency: overrides[path]?.changeFrequency ?? "monthly",
    priority:
      overrides[path]?.priority ??
      (path.split("/").filter(Boolean).length > 1 ? 0.6 : 0.7),
  }));
}
