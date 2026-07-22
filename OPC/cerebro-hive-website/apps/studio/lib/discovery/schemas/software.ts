import { SITE_URL, SITE_NAME } from '../config';

export function buildSoftwareApplicationSchema(opts: {
  name: string;
  description: string;
  slug: string;
  applicationCategory?: string;
  operatingSystem?: string;
  features?: string[];
  screenshot?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: opts.name,
    description: opts.description,
    url: `${SITE_URL}/products/${opts.slug}`,
    applicationCategory: opts.applicationCategory ?? 'BusinessApplication',
    operatingSystem: opts.operatingSystem ?? 'Web, Cloud',
    softwareVersion: '1.0',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      description: 'Contact for enterprise pricing',
    },
    author: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
    },
    ...(opts.features && { featureList: opts.features.join(', ') }),
    ...(opts.screenshot && {
      screenshot: {
        '@type': 'ImageObject',
        url: opts.screenshot,
      },
    }),
  };
}

export function buildWebApplicationSchema(opts: {
  name: string;
  description: string;
  url: string;
  features?: string[];
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: opts.name,
    description: opts.description,
    url: opts.url,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    author: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
    },
    ...(opts.features && { featureList: opts.features.join(', ') }),
  };
}
