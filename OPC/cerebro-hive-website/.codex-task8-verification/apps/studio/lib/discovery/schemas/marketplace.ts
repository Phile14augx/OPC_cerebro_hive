import { SITE_URL, SITE_NAME } from '../config';

// Marketplace schema architecture — page components deferred until launch
// Schema builders are defined here to support future product listings

export function buildMarketplaceCategorySchema(opts: {
  name: string;
  description: string;
  slug: string;
  numberOfItems?: number;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: opts.name,
    description: opts.description,
    url: `${SITE_URL}/marketplace/${opts.slug}`,
    numberOfItems: opts.numberOfItems ?? 0,
    provider: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
    },
  };
}

export function buildMarketplaceItemSchema(opts: {
  name: string;
  description: string;
  slug: string;
  category: string;
  price?: string;
  currency?: string;
  provider?: string;
  image?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: opts.name,
    description: opts.description,
    url: `${SITE_URL}/marketplace/${opts.category}/${opts.slug}`,
    category: opts.category,
    ...(opts.image && { image: { '@type': 'ImageObject', url: opts.image } }),
    offers: {
      '@type': 'Offer',
      ...(opts.price
        ? { price: opts.price, priceCurrency: opts.currency ?? 'USD' }
        : { description: 'Contact for pricing' }),
      availability: 'https://schema.org/InStock',
      seller: {
        '@type': 'Organization',
        name: opts.provider ?? SITE_NAME,
        url: SITE_URL,
      },
    },
    isPartOf: {
      '@type': 'WebSite',
      name: 'Hive Marketplace',
      url: `${SITE_URL}/marketplace`,
    },
  };
}
