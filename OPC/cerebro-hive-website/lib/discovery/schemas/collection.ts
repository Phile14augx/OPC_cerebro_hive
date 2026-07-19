import { SITE_URL, SITE_NAME } from '../config';

export function buildCollectionPageSchema(opts: {
  name: string;
  description: string;
  url: string;
  items?: Array<{ name: string; url: string; description?: string }>;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: opts.name,
    description: opts.description,
    url: opts.url,
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
    },
    inLanguage: 'en-US',
    ...(opts.items && {
      hasPart: opts.items.map(item => ({
        '@type': 'WebPage',
        name: item.name,
        url: item.url,
        ...(item.description && { description: item.description }),
      })),
    }),
  };
}
