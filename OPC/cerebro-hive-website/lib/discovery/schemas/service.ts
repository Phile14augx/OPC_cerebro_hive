import { SITE_URL, SITE_NAME } from '../config';

export function buildServiceSchema(opts: {
  name: string;
  description: string;
  serviceType: string;
  slug: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: opts.name,
    description: opts.description,
    serviceType: opts.serviceType,
    provider: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
    },
    areaServed: 'Worldwide',
    url: `${SITE_URL}/services/${opts.slug}`,
  };
}
