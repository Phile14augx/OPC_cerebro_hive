import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding CerebroHive Talent OS Database...');

  // 1. Core Users & Organization
  const org = await prisma.organization.upsert({
    where: { slug: 'cerebrohive-local' },
    update: {},
    create: {
      name: 'CerebroHive Local Env',
      slug: 'cerebrohive-local',
    },
  });

  const user = await prisma.user.upsert({
    where: { email: 'admin@cerebrohive.local' },
    update: {},
    create: {
      email: 'admin@cerebrohive.local',
      name: 'System Admin',
      passwordHash: 'hashed_password_mock',
    },
  });

  const recruiter = await prisma.recruiterProfile.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      title: 'Talent OS Admin',
    },
  });

  // 2. Taxonomy Versioning
  const taxonomyVersion = await prisma.taxonomyVersion.upsert({
    where: { versionLabel: 'V1.0' },
    update: {},
    create: {
      versionLabel: 'V1.0',
      description: 'Initial Engineering Taxonomy',
      isActive: true,
    },
  });

  await prisma.organizationTaxonomyAssignment.create({
    data: {
      organizationId: org.id,
      taxonomyVersionId: taxonomyVersion.id,
      effectiveFrom: new Date(),
    }
  });

  // 3. Base Taxonomy (Domains, Competencies, Capabilities)
  const domain = await prisma.skillDomain.upsert({
    where: { name: 'Software Engineering' },
    update: {},
    create: { name: 'Software Engineering', description: 'Core software development skills.' },
  });

  const compFE = await prisma.skillCompetency.upsert({
    where: { domainId_name: { domainId: domain.id, name: 'Frontend Engineering' } },
    update: {},
    create: { domainId: domain.id, name: 'Frontend Engineering' },
  });

  const compBE = await prisma.skillCompetency.upsert({
    where: { domainId_name: { domainId: domain.id, name: 'Backend Engineering' } },
    update: {},
    create: { domainId: domain.id, name: 'Backend Engineering' },
  });

  // Capabilities
  await prisma.skillCapability.upsert({
    where: { competencyId_name: { competencyId: compFE.id, name: 'React Component Lifecycle' } },
    update: {},
    create: { competencyId: compFE.id, name: 'React Component Lifecycle' },
  });

  await prisma.skillCapability.upsert({
    where: { competencyId_name: { competencyId: compBE.id, name: 'Database Schema Design' } },
    update: {},
    create: { competencyId: compBE.id, name: 'Database Schema Design' },
  });

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
