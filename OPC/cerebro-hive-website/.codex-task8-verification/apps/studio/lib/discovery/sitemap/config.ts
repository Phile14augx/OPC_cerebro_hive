import { SITE_URL } from '../config';

export type ChangeFreq = 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';

export interface SitemapEntry {
  url: string;
  lastModified?: string;
  changeFrequency?: ChangeFreq;
  priority?: number;
}

export const STATIC_ROUTES: SitemapEntry[] = [
  { url: '/', changeFrequency: 'weekly', priority: 1.0 },
  { url: '/about', changeFrequency: 'monthly', priority: 0.8 },
  { url: '/contact', changeFrequency: 'monthly', priority: 0.7 },
  { url: '/services', changeFrequency: 'weekly', priority: 0.9 },
  { url: '/industries', changeFrequency: 'weekly', priority: 0.9 },
  { url: '/products', changeFrequency: 'weekly', priority: 0.9 },
  { url: '/platform', changeFrequency: 'monthly', priority: 0.8 },
  { url: '/platform/hivepulse', changeFrequency: 'monthly', priority: 0.8 },
  { url: '/platform/cerebro-x', changeFrequency: 'monthly', priority: 0.8 },
  { url: '/academy', changeFrequency: 'weekly', priority: 0.8 },
  { url: '/research', changeFrequency: 'weekly', priority: 0.7 },
  { url: '/developers', changeFrequency: 'weekly', priority: 0.7 },
  { url: '/developers/api', changeFrequency: 'weekly', priority: 0.7 },
  { url: '/developers/architecture', changeFrequency: 'monthly', priority: 0.6 },
  { url: '/developers/changelog', changeFrequency: 'weekly', priority: 0.6 },
  { url: '/developers/roadmap', changeFrequency: 'monthly', priority: 0.6 },
  { url: '/marketplace', changeFrequency: 'weekly', priority: 0.7 },
  { url: '/careers', changeFrequency: 'weekly', priority: 0.6 },
  { url: '/privacy', changeFrequency: 'yearly', priority: 0.3 },
  { url: '/terms', changeFrequency: 'yearly', priority: 0.3 },
];

export function buildSitemapEntry(path: string, entry: Partial<SitemapEntry> = {}): SitemapEntry {
  return {
    url: `${SITE_URL}${path}`,
    lastModified: new Date().toISOString().split('T')[0],
    changeFrequency: 'monthly',
    priority: 0.7,
    ...entry,
  };
}
