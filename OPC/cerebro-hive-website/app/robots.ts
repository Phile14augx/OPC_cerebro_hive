import { MetadataRoute } from 'next';

export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/private/', '/api/', '/_next/'],
    },
    sitemap: 'https://cerebro-hive.com/sitemap.xml',
  };
}
