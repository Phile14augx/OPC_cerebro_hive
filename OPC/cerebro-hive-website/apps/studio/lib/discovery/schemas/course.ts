import { SITE_URL, SITE_NAME } from '../config';

export function buildCourseSchema(opts: {
  name: string;
  description: string;
  courseCode: string;
  educationalLevel?: string;
  duration?: string;
  skills?: string[];
  instructor?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: opts.name,
    description: opts.description,
    courseCode: opts.courseCode,
    url: `${SITE_URL}/academy`,
    provider: {
      '@type': 'Organization',
      name: `${SITE_NAME} Academy`,
      sameAs: SITE_URL,
    },
    educationalLevel: opts.educationalLevel ?? 'Intermediate',
    inLanguage: 'en-US',
    isAccessibleForFree: false,
    hasCourseInstance: {
      '@type': 'CourseInstance',
      courseMode: 'online',
      courseWorkload: opts.duration ?? 'PT4H',
      instructor: {
        '@type': 'Person',
        name: opts.instructor ?? `${SITE_NAME} Expert`,
      },
    },
    teaches: opts.skills?.map(skill => ({
      '@type': 'DefinedTerm',
      name: skill,
    })),
    educationalCredentialAwarded: {
      '@type': 'EducationalOccupationalCredential',
      name: `${opts.name} Certificate`,
      credentialCategory: 'certificate',
      recognizedBy: {
        '@type': 'Organization',
        name: SITE_NAME,
      },
    },
  };
}
