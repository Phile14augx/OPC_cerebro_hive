import { SITE_URL } from '../config';

export const ROBOTS_CONFIG = {
  rules: [
    {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        '/_next/',
        '/admin/',
        '/dashboard/',
        '*.json',
      ],
    },
  ],
  sitemap: `${SITE_URL}/sitemap.xml`,
  host: SITE_URL,
};
