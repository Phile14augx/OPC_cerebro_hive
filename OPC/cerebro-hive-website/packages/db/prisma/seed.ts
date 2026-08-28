import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { PrismaClient } from '../src/generated/client';
import {
  TALENT_PERMISSION_TUPLES,
  TALENT_PERMISSIONS_BY_ROLE,
  TALENT_ROLE_KEYS,
  type TalentRoleKey,
} from '../src/auth/talent-permissions';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding Database...');

  const canonicalRoles: ReadonlyArray<{
    key: TalentRoleKey;
    name: string;
    description: string;
  }> = [
    { key: TALENT_ROLE_KEYS.OWNER, name: 'Owner', description: 'Tenant owner' },
    { key: TALENT_ROLE_KEYS.ADMIN, name: 'Admin', description: 'Administrator' },
    { key: TALENT_ROLE_KEYS.RECRUITER, name: 'Recruiter', description: 'Talent recruiter' },
    { key: TALENT_ROLE_KEYS.CANDIDATE, name: 'Candidate', description: 'Talent candidate' },
  ];
  const roleIds = new Map<TalentRoleKey, string>();

  await prisma.$transaction(async tx => {
    for (const definition of canonicalRoles) {
      const role = await tx.role.upsert({
        where: { key: definition.key },
        update: {
          name: definition.name,
          description: definition.description,
        },
        create: definition,
      });
      roleIds.set(definition.key, role.id);
    }

    const talentResources = [
      ...new Set(TALENT_PERMISSION_TUPLES.map(({ resource }) => resource)),
    ];
    await tx.permission.deleteMany({
      where: { resource: { in: talentResources } },
    });

    for (const definition of canonicalRoles) {
      const roleId = roleIds.get(definition.key);
      if (!roleId) {
        throw new Error(`Canonical role ${definition.key} was not persisted`);
      }

      for (const permission of TALENT_PERMISSIONS_BY_ROLE[definition.key]) {
        await tx.permission.upsert({
          where: {
            roleId_action_resource: {
              roleId,
              action: permission.action,
              resource: permission.resource,
            },
          },
          update: {},
          create: {
            roleId,
            action: permission.action,
            resource: permission.resource,
          },
        });
      }
    }
  });

  const adminRoleId = roleIds.get(TALENT_ROLE_KEYS.ADMIN);
  if (!adminRoleId) {
    throw new Error('Canonical ADMIN role was not persisted');
  }

  // 1. Tenant & User
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'acme-corp' },
    update: {},
    create: {
      name: 'Acme Corporation',
      slug: 'acme-corp',
      billingPlan: 'enterprise'
    }
  });
  if (!tenant) throw new Error('No tenant');

  const user = await prisma.user.upsert({
    where: { email: 'admin@acme.corp' },
    update: {},
    create: {
      email: 'admin@acme.corp',
      name: 'System Admin'
    }
  });
  if (!user) throw new Error('No user');

  // Ensure user is in tenant
  await prisma.tenantMember.upsert({
    where: { tenantId_userId: { tenantId: tenant.id, userId: user.id } },
    update: { roleId: adminRoleId },
    create: { tenantId: tenant.id, userId: user.id, roleId: adminRoleId },
  });

  // 2. Workspace
  const workspace = await prisma.workspace.upsert({
    where: { slug: 'default-workspace' },
    update: {},
    create: {
      name: 'Default Workspace',
      slug: 'default-workspace',
      tenantId: tenant.id
    }
  });
  if (!workspace) throw new Error('No workspace');

  console.log(`Tenant: ${tenant.id}`);
  console.log(`Workspace: ${workspace.id}`);

  // 3. Project
  const project = await prisma.project.create({
    data: {
      workspaceId: workspace.id,
      name: 'Customer Support Portal',
      description: 'Main AI Customer Support App',
      forgeStatus: 'completed'
    }
  });
  if (!project) throw new Error('No project');

  // 4. Agents (with explicit IDs if possible, or let it generate)
  const agent1 = await prisma.agent.create({
    data: {
      workspaceId: workspace.id,
      name: 'Customer Support Bot',
      description: 'Handles frontline customer queries and billing issues.',
      isActive: true
    }
  });

  const agent2 = await prisma.agent.create({
    data: {
      workspaceId: workspace.id,
      name: 'Code Reviewer',
      description: 'Analyzes pull requests for security flaws.',
      isActive: true
    }
  });

  // Create a model first
  const provider = await prisma.aIProvider.create({
    data: { name: 'OpenAI' }
  });

  const model = await prisma.aIModel.create({
    data: {
      name: 'GPT-4o',
      providerId: provider.id,
      versions: {
        create: {
          version: '2024-05-13'
        }
      }
    }
  });

  // Add agent versions
  const av1 = await prisma.agentVersion.create({
    data: {
      agentId: agent1.id,
      version: 1,
      modelId: model.id,
      instructions: 'You are a helpful customer support bot.',
    }
  });

  // 5. Workflows
  const workflowTemplate = await prisma.workflowTemplate.create({
    data: {
      name: 'Standard Issue Resolution',
      definition: {}
    }
  });

  const workflow = await prisma.workflow.create({
    data: {
      workspaceId: workspace.id,
      name: 'Customer Onboarding',
      templateId: workflowTemplate.id
    }
  });

  const wv1 = await prisma.workflowVersion.create({
    data: {
      workflowId: workflow.id,
      version: 1
    }
  });

  // 6. Workflow Executions & Agent Executions (Pseudo Traces)
  const wfExec = await prisma.workflowExecution.create({
    data: {
      workflowId: workflow.id,
      status: 'COMPLETED',
      startedAt: new Date(Date.now() - 60000),
      completedAt: new Date(Date.now() - 5000)
    }
  });

  const wfRun = await prisma.workflowRun.create({
    data: {
      workflowExecutionId: wfExec.id,
      status: 'COMPLETED'
    }
  });

  const node = await prisma.workflowNode.create({
    data: {
      workflowVersionId: wv1.id,
      name: 'Extract Data',
      type: 'agent'
    }
  });

  await prisma.workflowStepExecution.create({
    data: {
      runId: wfRun.id,
      nodeId: node.id,
      status: 'COMPLETED',
      startedAt: new Date(Date.now() - 50000),
      completedAt: new Date(Date.now() - 10000),
      logs: { durationMs: 40000 }
    }
  });

  await prisma.agentExecution.create({
    data: {
      agentId: agent1.id,
      agentVersionId: av1.id,
      status: 'SUCCESS',
      provider: 'anthropic',
      model: 'claude-3-5-sonnet',
      startedAt: new Date(Date.now() - 50000),
      completedAt: new Date(Date.now() - 10000),
      durationMs: 4200,
      inputTokens: 1500,
      outputTokens: 300,
      costUsd: 0.015,
      traceId: 'tr-abc-124',
    }
  });

  console.log('Seeding Completed successfully!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
