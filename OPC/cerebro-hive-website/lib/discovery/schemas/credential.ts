import { SITE_URL, SITE_NAME } from '../config';

export function buildCredentialSchema(opts: {
  name: string;
  courseCode: string;
  description?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'EducationalOccupationalCredential',
    name: opts.name,
    description: opts.description ?? `Professional certification awarded by ${SITE_NAME} Academy`,
    url: `${SITE_URL}/academy`,
    credentialCategory: 'certificate',
    competencyRequired: opts.courseCode,
    educationalLevel: 'Professional',
    recognizedBy: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
    },
    validFor: 'P2Y',
  };
}
