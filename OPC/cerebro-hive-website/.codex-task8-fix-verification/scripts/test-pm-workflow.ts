import { PmService } from '../lib/services/pm.service';
import { prisma } from '../lib/prisma';
import { EPIC_DECOMPOSITION_PROMPT_V1 } from '../lib/agents/pm-agent/prompts/v1-epic-decomposition';

async function testPmWorkflow() {
  console.log('🚀 Starting PM Agent E2E Workflow Test...');

  try {
    // 1. Setup Test Infrastructure
    console.log('[1/4] Setting up test Organization, Workspace, and Project...');
    const org = await prisma.organization.create({
      data: { name: 'E2E Test Org', slug: `e2e-org-${Date.now()}` }
    });

    const workspace = await prisma.workspace.create({
      data: { name: 'E2E Test Workspace', slug: `e2e-ws-${Date.now()}`, organizationId: org.id }
    });

    const project = await prisma.project.create({
      data: { name: 'E2E PM Project', workspaceId: workspace.id }
    });

    // 2. Trigger the PM Agent Workflow
    console.log('[2/4] Triggering PM Agent LLM to decompose Epic...');
    const epicTitle = 'Migrate Database to PostgreSQL';
    const epicBody = 'We need to migrate our legacy MySQL database to PostgreSQL with pgvector support for our AI agents.';

    // This calls the LLM, saves the Epic, and generates Tasks
    let epic;
    if (!process.env.OPENAI_API_KEY) {
      console.log('⚠️ OPENAI_API_KEY not found. Mocking the PM Agent response...');
      const mockDecomposition = {
        riskLevel: 'medium',
        storyPoints: 13,
        labels: ['backend', 'database'],
        checklist: ['Install PostgreSQL', 'Run Prisma Migrate', 'Update Services'],
        dependencies: [],
        suggestedPhase: 'Phase 1'
      };
      
      const { PmRepository } = await import('../lib/repositories/pm.repository');
      const { AuditService } = await import('../lib/services/audit.service');
      
      // Manually run the repository method to test DB logic without hitting OpenAI
      epic = await PmRepository.createEpicFromDecomposition(
        project.id,
        epicTitle,
        epicBody,
        mockDecomposition as any
      );
      
      await AuditService.log('pm_agent.epic_decomposed', `Epic:${epic.id}`, undefined, {
        projectId: project.id,
        requestId: 'mock_req_id',
        riskLevel: mockDecomposition.riskLevel,
        storyPoints: mockDecomposition.storyPoints,
      });
    } else {
      epic = await PmService.processEpicDecomposition(
        project.id,
        epicTitle,
        epicBody,
        EPIC_DECOMPOSITION_PROMPT_V1
      );
    }

    console.log(`✅ Epic created with ID: ${epic.id} (Risk: ${epic.riskLevel}, Points: ${epic.storyPoints})`);

    // 3. Verify Database Integrity
    console.log('[3/4] Verifying Tasks are correctly generated and linked...');
    const savedEpic = await prisma.epic.findUnique({
      where: { id: epic.id },
      include: { tasks: true }
    });

    if (!savedEpic || savedEpic.tasks.length === 0) {
      throw new Error('Tasks were not generated or linked to the Epic.');
    }

    console.log(`✅ Found ${savedEpic.tasks.length} tasks linked to Epic.`);
    savedEpic.tasks.forEach(task => {
      console.log(`   - [Task] ${task.title}`);
    });

    // 4. Verify Audit Logging
    console.log('[4/4] Verifying Audit Event...');
    const auditEvent = await prisma.auditEvent.findFirst({
      where: { action: 'pm_agent.epic_decomposed', resource: `Epic:${epic.id}` }
    });

    if (!auditEvent) {
      throw new Error('Audit event was not logged.');
    }
    console.log('✅ Audit event verified.');

    console.log('\n🎉 E2E Workflow Test Passed!');
  } catch (error) {
    console.error('\n❌ E2E Workflow Test Failed:\n', error);
  } finally {
    await prisma.$disconnect();
  }
}

testPmWorkflow();
