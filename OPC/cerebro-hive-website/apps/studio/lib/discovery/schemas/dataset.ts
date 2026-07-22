import { SITE_URL, SITE_NAME } from '../config';

export function buildDatasetSchema(opts: {
  name: string;
  description: string;
  url: string;
  keywords?: string[];
  license?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: opts.name,
    description: opts.description,
    url: opts.url,
    creator: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
    },
    ...(opts.keywords && { keywords: opts.keywords }),
    ...(opts.license && { license: opts.license }),
    inLanguage: 'en-US',
  };
}
