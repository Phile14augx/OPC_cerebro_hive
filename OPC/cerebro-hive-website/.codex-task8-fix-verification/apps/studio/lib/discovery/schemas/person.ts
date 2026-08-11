import { SITE_URL } from '../config';

export function buildPersonSchema(opts: {
  name: string;
  jobTitle: string;
  description?: string;
  url?: string;
  image?: string;
  sameAs?: string[];
  knowsAbout?: string[];
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: opts.name,
    jobTitle: opts.jobTitle,
    worksFor: {
      '@type': 'Organization',
      name: 'CerebroHive',
      url: SITE_URL,
    },
    ...(opts.description && { description: opts.description }),
    ...(opts.url && { url: opts.url }),
    ...(opts.image && { image: { '@type': 'ImageObject', url: opts.image } }),
    ...(opts.sameAs && { sameAs: opts.sameAs }),
    ...(opts.knowsAbout && { knowsAbout: opts.knowsAbout }),
  };
}
