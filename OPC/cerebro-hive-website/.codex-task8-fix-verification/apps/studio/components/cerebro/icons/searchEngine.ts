import { IconMetadata } from "./IconMetadata";

export interface SearchScore {
  iconId: string;
  score: number;
  matchType: string;
}

// Weights for ranking
const WEIGHTS = {
  EXACT_MATCH: 100,
  ALIAS: 80,
  KEYWORD: 60,
  INTENT: 50,
  INDUSTRY: 40,
  CATEGORY: 30,
  PARTIAL: 10,
};

export class IconSearchEngine {
  private registry: Record<string, IconMetadata>;

  constructor(registry: Record<string, IconMetadata>) {
    this.registry = registry;
  }

  public search(query: string): IconMetadata[] {
    const q = query.toLowerCase().trim();
    if (!q) return Object.values(this.registry);

    const results: SearchScore[] = [];

    Object.values(this.registry).forEach(icon => {
      let score = 0;
      let matchType = "none";

      const name = icon.name?.toLowerCase() || icon.id.toLowerCase();
      const displayName = icon.displayName?.toLowerCase() || "";

      // 1. Exact Match
      if (name === q || displayName === q) {
        score = Math.max(score, WEIGHTS.EXACT_MATCH);
        matchType = "exact";
      } else if (name.includes(q) || displayName.includes(q)) {
        score = Math.max(score, WEIGHTS.PARTIAL);
        matchType = "partial";
      }

      // 2. Alias Match
      if (icon.aliases && icon.aliases.some(a => a.toLowerCase() === q)) {
        score = Math.max(score, WEIGHTS.ALIAS);
        matchType = "alias";
      }

      // 3. Keyword Match
      if (icon.keywords && icon.keywords.some(k => k.toLowerCase().includes(q))) {
        score = Math.max(score, WEIGHTS.KEYWORD);
        matchType = "keyword";
      }

      // 4. Intent Match
      if (icon.intent && icon.intent.some(i => i.toLowerCase().includes(q))) {
        score = Math.max(score, WEIGHTS.INTENT);
        matchType = "intent";
      }

      // 5. Industry Match
      if (icon.industries && icon.industries.some(ind => ind.toLowerCase().includes(q))) {
        score = Math.max(score, WEIGHTS.INDUSTRY);
        matchType = "industry";
      }

      // 6. Category Match
      if (icon.category.toLowerCase().includes(q) || (icon.subcategory && icon.subcategory.toLowerCase().includes(q))) {
        score = Math.max(score, WEIGHTS.CATEGORY);
        matchType = "category";
      }

      if (score > 0) {
        // Boost by searchWeight if available
        if (icon.searchWeight) {
          score += icon.searchWeight;
        }
        results.push({ iconId: icon.id, score, matchType });
      }
    });

    // Sort by score descending
    results.sort((a, b) => b.score - a.score);

    return results.map(r => Object.values(this.registry).find(i => i.id === r.iconId)!);
  }
}
