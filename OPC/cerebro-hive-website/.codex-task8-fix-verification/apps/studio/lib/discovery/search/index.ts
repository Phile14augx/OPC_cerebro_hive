import { SITE_URL } from '../config';

export interface SearchableItem {
  title: string;
  description: string;
  url: string;
  type: 'service' | 'industry' | 'product' | 'academy' | 'research' | 'guide' | 'page';
  tags?: string[];
}

// Lightweight in-memory search index — populated from data layer at build time
export function buildSearchIndex(items: SearchableItem[]) {
  return items.map(item => ({
    ...item,
    url: item.url.startsWith('http') ? item.url : `${SITE_URL}${item.url}`,
    searchText: [item.title, item.description, ...(item.tags ?? [])].join(' ').toLowerCase(),
  }));
}

export function searchItems(index: ReturnType<typeof buildSearchIndex>, query: string) {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  return index
    .filter(item => item.searchText.includes(q))
    .sort((a, b) => {
      const aTitle = a.title.toLowerCase().includes(q) ? 0 : 1;
      const bTitle = b.title.toLowerCase().includes(q) ? 0 : 1;
      return aTitle - bTitle;
    });
}
