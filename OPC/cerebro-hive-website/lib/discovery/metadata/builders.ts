import type { Metadata } from 'next';
import { SITE_URL, SITE_NAME, TITLE_TEMPLATE } from '../config';

export function buildPageMetadata(opts: {
  title: string;
  description: string;
  path: string;
  ogImage?: string;
  ogType?: 'website' | 'article' | 'profile';
  keywords?: string[];
  noIndex?: boolean;
}): Metadata {
  const url = `${SITE_URL}${opts.path}`;
  const image = opts.ogImage ?? `${SITE_URL}/opengraph-image`;

  return {
    title: opts.title,
    description: opts.description,
    ...(opts.keywords && { keywords: opts.keywords }),
    alternates: { canonical: url },
    openGraph: {
      title: opts.title,
      description: opts.description,
      url,
      siteName: SITE_NAME,
      type: opts.ogType ?? 'website',
      images: [{ url: image, width: 1200, height: 630, alt: opts.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: opts.title,
      description: opts.description,
      images: [image],
    },
    ...(opts.noIndex && { robots: { index: false, follow: false } }),
  };
}

export function buildServiceMetadata(opts: {
  title: string;
  description: string;
  slug: string;
  keywords?: string[];
}): Metadata {
  return buildPageMetadata({
    ...opts,
    path: `/services/${opts.slug}`,
    ogImage: `${SITE_URL}/opengraph-image/services`,
  });
}

export function buildIndustryMetadata(opts: {
  title: string;
  description: string;
  slug: string;
  keywords?: string[];
}): Metadata {
  return buildPageMetadata({
    ...opts,
    path: `/industries/${opts.slug}`,
    ogImage: `${SITE_URL}/opengraph-image/industries`,
  });
}

export function buildProductMetadata(opts: {
  title: string;
  description: string;
  slug: string;
  keywords?: string[];
}): Metadata {
  return buildPageMetadata({
    ...opts,
    path: `/products/${opts.slug}`,
    ogImage: `${SITE_URL}/opengraph-image/products`,
  });
}

export function buildAcademyMetadata(opts: {
  title: string;
  description: string;
  keywords?: string[];
}): Metadata {
  return buildPageMetadata({
    ...opts,
    path: '/academy',
    ogImage: `${SITE_URL}/opengraph-image/academy`,
  });
}

export function buildResearchMetadata(opts: {
  title: string;
  description: string;
  slug: string;
  datePublished?: string;
  keywords?: string[];
}): Metadata {
  return buildPageMetadata({
    ...opts,
    path: `/research/${opts.slug}`,
    ogType: 'article',
    ogImage: `${SITE_URL}/opengraph-image/research`,
  });
}
