import { SITE_URL, SITE_NAME } from '../config';

interface ArticleOpts {
  title: string;
  description: string;
  slug: string;
  datePublished: string;
  dateModified?: string;
  author?: string;
  image?: string;
  section?: string;
  keywords?: string[];
}

export function buildArticleSchema(opts: ArticleOpts) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: opts.title,
    description: opts.description,
    url: `${SITE_URL}/research/${opts.slug}`,
    datePublished: opts.datePublished,
    dateModified: opts.dateModified ?? opts.datePublished,
    author: {
      '@type': 'Organization',
      name: opts.author ?? SITE_NAME,
      url: SITE_URL,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/logo.png`,
      },
    },
    ...(opts.image && { image: { '@type': 'ImageObject', url: opts.image } }),
    ...(opts.section && { articleSection: opts.section }),
    ...(opts.keywords && { keywords: opts.keywords.join(', ') }),
    inLanguage: 'en-US',
    isPartOf: {
      '@type': 'WebSite',
      name: SITE_NAME,
      url: SITE_URL,
    },
  };
}

export function buildTechArticleSchema(opts: ArticleOpts & {
  dependencies?: string;
  proficiencyLevel?: string;
}) {
  return {
    ...buildArticleSchema({ ...opts, slug: `developer/${opts.slug}` }),
    '@type': 'TechArticle',
    ...(opts.dependencies && { dependencies: opts.dependencies }),
    proficiencyLevel: opts.proficiencyLevel ?? 'Expert',
  };
}
