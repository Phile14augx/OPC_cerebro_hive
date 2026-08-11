import { Prisma, PrismaClient } from '../index';
import { createInitialAgentDraft, hashAgentDefinition, type AgentDefinitionV1 } from '@cerebro/agent-registry-contracts';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Database...');

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

  const user = await prisma.user.upsert({
    where: { email: 'admin@acme.corp' },
    update: {},
    create: {
      email: 'admin@acme.corp',
      name: 'System Admin'
    }
  });

  const role = await prisma.role.create({
    data: { name: 'Admin', description: 'Administrator Role' }
  });

  // Ensure user is in tenant
  const existingMember = await prisma.tenantMember.findFirst({ where: { tenantId: tenant.id, userId: user.id }});
  if (!existingMember) {
    await prisma.tenantMember.create({
      data: { tenantId: tenant.id, userId: user.id, roleId: role.id }
    });
  }

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

  // 4. Agents (with explicit IDs if possible, or let it generate)
  const agent1 = await prisma.agent.create({
    data: {
      workspaceId: workspace.id,
      name: 'Customer Support Bot',
      description: 'Handles frontline customer queries and billing issues.',
      isActive: true,
      lifecycleStatus: 'DRAFT',
      ownerId: user.id,
      createdBy: user.id,
    }
  });

  const agent2 = await prisma.agent.create({
    data: {
      workspaceId: workspace.id,
      name: 'Code Reviewer',
      description: 'Analyzes pull requests for security flaws.',
      isActive: true,
      lifecycleStatus: 'DRAFT',
      ownerId: user.id,
      createdBy: user.id,
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
  const supportDefinition: AgentDefinitionV1 = {
    schemaVersion: 1,
    purpose: 'Resolve customer support and billing requests',
    businessFunction: 'Customer Support',
    responsibilities: ['Answer approved customer questions'],
    expectedOutputs: ['A clear and accurate support response'],
    systemInstructions: 'You are a helpful customer support bot.',
    modelConfig: { providerRef: 'provider:openai', modelRef: 'model:GPT-4o', temperature: 0.2, maxTokens: 4096 },
    capabilities: [], allowedActions: [], prohibitedActions: [], escalationRules: [],
    securityLevel: 'INTERNAL', toolPermissions: [], knowledgeSources: [],
  };
  const publishedAt = new Date();
  const av1 = await prisma.agentVersion.create({
    data: {
      agentId: agent1.id,
      workspaceId: workspace.id,
      version: 1,
      modelId: model.id,
      instructions: 'You are a helpful customer support bot.',
      definition: supportDefinition as unknown as Prisma.InputJsonValue,
      definitionSchemaVersion: 1,
      definitionHash: hashAgentDefinition(supportDefinition),
      publishedBy: user.id,
      publishedAt,
      publicationSource: 'USER',
    }
  });
  await prisma.agent.update({
    where: { id: agent1.id },
    data: { activeVersionId: av1.id, lifecycleStatus: 'PRODUCTION', statusChangedAt: publishedAt, statusChangedBy: user.id },
  });
  await prisma.agentDraft.create({
    data: {
      agentId: agent1.id, workspaceId: workspace.id, baseVersionId: av1.id,
      definition: supportDefinition as unknown as Prisma.InputJsonValue, revision: 1, validationStatus: 'VALID',
      createdBy: user.id, updatedBy: user.id,
    },
  });
  await prisma.agentDraft.create({
    data: {
      agentId: agent2.id, workspaceId: workspace.id,
      definition: createInitialAgentDraft() as unknown as Prisma.InputJsonValue, revision: 1, validationStatus: 'UNVALIDATED',
      createdBy: user.id, updatedBy: user.id,
    },
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
      startedAt: new Date(Date.now() - 50000),
      completedAt: new Date(Date.now() - 10000),
      traceId: 'tr-abc-124',
      durationMs: 4200,
      inputTokens: 1500,
      outputTokens: 300,
      costUsd: 0.015,
      model: 'GPT-4o',
      provider: 'OpenAI',
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
