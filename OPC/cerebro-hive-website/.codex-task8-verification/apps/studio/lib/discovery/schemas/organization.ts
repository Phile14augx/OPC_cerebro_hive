import { SITE_URL, SITE_NAME } from '../config';
import { CEREBRO_ORG } from '../context/organization';

export function buildOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    legalName: CEREBRO_ORG.legalName,
    alternateName: 'CerebroHive OPC',
    url: SITE_URL,
    logo: {
      '@type': 'ImageObject',
      url: CEREBRO_ORG.logo,
    },
    description: CEREBRO_ORG.description,
    disambiguatingDescription:
      `${CEREBRO_ORG.legalName} is an enterprise AI consulting and platform company headquartered in ${CEREBRO_ORG.headquarters}, operating exclusively at ${SITE_URL}. It is not affiliated with any other company using a similar name in any other country or industry.`,
    foundingDate: String(CEREBRO_ORG.founded),
    foundingLocation: CEREBRO_ORG.headquarters,
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
