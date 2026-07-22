import { SITE_URL, SITE_NAME } from '../config';
import { CEREBRO_ORG } from '../context/organization';

export function buildOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    legalName: CEREBRO_ORG.legalName,
    url: SITE_URL,
    logo: {
      '@type': 'ImageObject',
      url: CEREBRO_ORG.logo,
    },
    description: CEREBRO_ORG.description,
    foundingDate: String(CEREBRO_ORG.founded),
    areaServed: CEREBRO_ORG.areaServed,
    knowsAbout: [
      'Enterprise AI', 'Generative AI', 'AI Agents', 'Retrieval-Augmented Generation',
      'Large Language Models', 'Data Engineering', 'MLOps', 'AIOps',
      'AI Governance', 'Knowledge Graphs', 'Vector Databases', 'Model Context Protocol',
      'HivePulse', 'Cerebro X', 'Autonomous Transformation', 'AI Strategy',
    ],
    sameAs: Object.values(CEREBRO_ORG.social),
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      availableLanguage: 'English',
    },
    subOrganization: {
      '@type': 'EducationalOrganization',
      name: 'CerebroHive Academy',
      url: `${SITE_URL}/academy`,
    },
  };
}

export function buildWebsiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}
