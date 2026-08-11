import { SITE_URL, SITE_NAME } from '../config';

export function buildProductSchema(opts: {
  name: string;
  description: string;
  slug: string;
  category?: string;
  image?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: opts.name,
    description: opts.description,
    url: `${SITE_URL}/products/${opts.slug}`,
    category: opts.category ?? 'Enterprise Software',
    brand: {
      '@type': 'Brand',
      name: SITE_NAME,
    },
    manufacturer: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
    },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      url: `${SITE_URL}/products/${opts.slug}`,
      seller: {
        '@type': 'Organization',
        name: SITE_NAME,
        url: SITE_URL,
      },
    },
    ...(opts.image && {
      image: {
        '@type': 'ImageObject',
        url: opts.image,
      },
    }),
  };
}
