import { SITE_URL, SITE_NAME } from '../config';

export interface HowToStep {
  name: string;
  text: string;
  url?: string;
  image?: string;
}

export function buildHowToSchema(opts: {
  name: string;
  description: string;
  slug: string;
  steps: HowToStep[];
  totalTime?: string;
  estimatedCost?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: opts.name,
    description: opts.description,
    url: `${SITE_URL}/${opts.slug}`,
    ...(opts.totalTime && { totalTime: opts.totalTime }),
    ...(opts.estimatedCost && {
      estimatedCost: {
        '@type': 'MonetaryAmount',
        currency: 'USD',
        value: opts.estimatedCost,
      },
    }),
    step: opts.steps.map((step, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      name: step.name,
      text: step.text,
      ...(step.url && { url: step.url }),
      ...(step.image && { image: { '@type': 'ImageObject', url: step.image } }),
    })),
    author: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
    },
  };
}
